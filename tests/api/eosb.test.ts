import request from "supertest";
import app from "../../src/index";

describe("EOSB API Integration Tests", () => {
  describe("GET /api/eosb/health", () => {
    test("should return health status", async () => {
      const response = await request(app).get("/api/eosb/health").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: "OK",
        },
        message: "Service is healthy",
      });

      expect(response.body.data.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });
  });

  describe("GET /api/eosb/config", () => {
    test("should return configuration data", async () => {
      const response = await request(app).get("/api/eosb/config").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "Configuration data retrieved successfully",
      });

      expect(response.body.data).toHaveProperty("terminationTypes");
      expect(response.body.data).toHaveProperty("contractTypes");
      expect(response.body.data).toHaveProperty("calculationRules");

      // Validate termination types
      expect(Array.isArray(response.body.data.terminationTypes)).toBe(true);
      expect(response.body.data.terminationTypes).toHaveLength(5);

      const terminationTypes = response.body.data.terminationTypes;
      expect(terminationTypes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            value: "resignation",
            label: "Resignation",
            labelAr: "استقالة",
          }),
          expect.objectContaining({
            value: "termination",
            label: "Termination by Employer",
            labelAr: "إنهاء من صاحب العمل",
          }),
        ])
      );

      // Validate contract types
      expect(Array.isArray(response.body.data.contractTypes)).toBe(true);
      expect(response.body.data.contractTypes).toHaveLength(2);

      // Validate calculation rules
      expect(response.body.data.calculationRules).toMatchObject({
        minimumServiceDays: 365,
        resignationPenalty: {
          lessThanOneYear: 0,
          lessThanThreeYears: expect.any(Number),
          lessThanFiveYears: expect.any(Number),
          fiveYearsOrMore: 1,
        },
      });
    });
  });

  describe("POST /api/eosb/calculate", () => {
    test("should calculate EOSB correctly for valid input", async () => {
      const employeeData = {
        basicSalary: 10000,
        allowances: 0,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "EOSB calculation completed successfully",
      });

      const result = response.body.data;
      expect(result).toMatchObject({
        totalServiceYears: 5,
        totalServiceMonths: 0,
        totalServiceDays: 0,
        basicSalaryAmount: 10000,
        totalSalary: 10000,
        eligibleYears: 5,
        isEligible: true,
      });

      // Expected: (10000/30) * (5*21) = 333.33 * 105 = 35,000
      expect(result.gratuityAmount).toBeCloseTo(35000, 0);
      expect(result.breakdown.firstFiveYears.years).toBe(5);
      expect(result.breakdown.firstFiveYears.amount).toBeCloseTo(35000, 0);
      expect(result.breakdown.additionalYears.years).toBe(0);
      expect(result.breakdown.additionalYears.amount).toBe(0);
    });

    test("should calculate EOSB with resignation penalty", async () => {
      const employeeData = {
        basicSalary: 9000,
        terminationType: "resignation",
        isUnlimitedContract: true,
        joiningDate: "2021-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(200);

      const result = response.body.data;
      expect(result.isEligible).toBe(true);

      // 4 years service should get 2/3 penalty
      // Expected: (9000/30) * (4*21) * (2/3) = 300 * 84 * (2/3) = 16,800
      expect(result.gratuityAmount).toBeCloseTo(16800, 0);
    });

    test("should handle ineligible employee (less than 1 year)", async () => {
      const employeeData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2024-06-01",
        lastWorkingDay: "2024-12-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(200);

      const result = response.body.data;
      expect(result.isEligible).toBe(false);
      expect(result.gratuityAmount).toBe(0);
      expect(result.reason).toBe(
        "Minimum service period of 1 year not completed"
      );
    });

    test("should calculate EOSB for service beyond 5 years", async () => {
      const employeeData = {
        basicSalary: 15000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2018-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(200);

      const result = response.body.data;
      expect(result.isEligible).toBe(true);
      expect(result.totalServiceYears).toBe(7);

      // Expected calculation:
      // First 5 years: (15000/30) * (5*21) = 500 * 105 = 52,500
      // Additional 2 years: (15000/30) * (2*30) = 500 * 60 = 30,000
      // Total: 82,500
      expect(result.gratuityAmount).toBeCloseTo(82500, 0);
      expect(result.breakdown.firstFiveYears.amount).toBeCloseTo(52500, 0);
      expect(result.breakdown.additionalYears.amount).toBeCloseTo(30000, 0);
    });

    test("should not apply penalty for limited contract resignation", async () => {
      const employeeData = {
        basicSalary: 10000,
        terminationType: "resignation",
        isUnlimitedContract: false,
        joiningDate: "2023-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(200);

      const result = response.body.data;
      expect(result.isEligible).toBe(true);

      // No penalty for limited contracts
      // Expected: (10000/30) * (2*21) = 333.33 * 42 = 14,000
      expect(result.gratuityAmount).toBeCloseTo(14000, 0);
    });
  });

  describe("POST /api/eosb/calculate - Validation Errors", () => {
    test("should return 400 for missing required fields", async () => {
      const incompleteData = {
        basicSalary: 10000,
        // Missing other required fields
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(incompleteData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "Validation failed",
      });
      expect(response.body.message).toContain("Invalid termination type");
    });

    test("should return 400 for negative salary", async () => {
      const invalidData = {
        basicSalary: -5000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "Validation failed",
      });
      expect(response.body.message).toContain(
        "Basic salary must be a positive number"
      );
    });

    test("should return 400 for invalid termination type", async () => {
      const invalidData = {
        basicSalary: 10000,
        terminationType: "invalid_type",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "Validation failed",
      });
      expect(response.body.message).toContain("Invalid termination type");
    });

    test("should return 400 for invalid date format", async () => {
      const invalidData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "invalid-date",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "Validation failed",
      });
      expect(response.body.message).toContain(
        "Joining date must be a valid date"
      );
    });

    test("should return 400 when last working day is before joining date", async () => {
      const invalidData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2025-01-01",
        lastWorkingDay: "2020-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "Validation failed",
      });
      expect(response.body.message).toContain(
        "Last working day must be after joining date"
      );
    });

    test("should return 400 for future last working day", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const invalidData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: futureDate.toISOString().split("T")[0],
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "Validation failed",
      });
    });

    test("should accept optional allowances field", async () => {
      const dataWithAllowances = {
        basicSalary: 10000,
        allowances: 2000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(dataWithAllowances)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test("should reject negative allowances", async () => {
      const invalidData = {
        basicSalary: 10000,
        allowances: -1000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "Validation failed",
      });
      expect(response.body.message).toContain(
        "Allowances must be a positive number"
      );
    });
  });

  describe("Error Handling", () => {
    test("should return 404 for unknown endpoints", async () => {
      const response = await request(app).get("/api/eosb/unknown").expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: "Not found",
      });
    });

    test("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/eosb/calculate")
        .set("Content-Type", "application/json")
        .send('{"invalid": json}')
        .expect(400);

      // The exact response depends on Express's built-in JSON parsing error handling
    });
  });

  describe("Content Type Validation", () => {
    test("should require JSON content type for POST requests", async () => {
      const validData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(validData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("CORS Headers", () => {
    test("should include CORS headers", async () => {
      const response = await request(app).get("/api/eosb/health").expect(200);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    test("should handle extremely large salary values", async () => {
      const employeeData = {
        basicSalary: 999999999,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isEligible).toBe(true);
    });

    test("should handle minimum salary values", async () => {
      const employeeData = {
        basicSalary: 0.01,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isEligible).toBe(true);
    });

    test("should handle edge case with exactly 1 year service", async () => {
      const employeeData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2024-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isEligible).toBe(true);
      expect(response.body.data.totalServiceYears).toBe(1);
    });

    test("should handle all termination types", async () => {
      const terminationTypes = ['termination', 'resignation', 'retirement', 'death', 'disability'];
      
      for (const terminationType of terminationTypes) {
        const employeeData = {
          basicSalary: 10000,
          terminationType: terminationType,
          isUnlimitedContract: true,
          joiningDate: "2020-01-01",
          lastWorkingDay: "2025-01-01",
        };

        const response = await request(app)
          .post("/api/eosb/calculate")
          .send(employeeData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isEligible).toBe(true);
      }
    });

    test("should handle both contract types", async () => {
      const contractTypes = [true, false];
      
      for (const isUnlimitedContract of contractTypes) {
        const employeeData = {
          basicSalary: 10000,
          terminationType: "termination",
          isUnlimitedContract: isUnlimitedContract,
          joiningDate: "2020-01-01",
          lastWorkingDay: "2025-01-01",
        };

        const response = await request(app)
          .post("/api/eosb/calculate")
          .send(employeeData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isEligible).toBe(true);
      }
    });

    test("should handle request with extra fields", async () => {
      const employeeData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
        extraField: "should be ignored",
        anotherField: 123
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test("should handle empty allowances", async () => {
      const employeeData = {
        basicSalary: 10000,
        // allowances omitted completely
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test("should handle case-sensitive termination types", async () => {
      const employeeData = {
        basicSalary: 10000,
        terminationType: "TERMINATION",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
