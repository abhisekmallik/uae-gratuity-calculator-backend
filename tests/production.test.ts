import request from "supertest";
import app from "../src/index";

describe("Production Environment Tests", () => {
  const originalEnv = process.env;

  beforeAll(() => {
    // Set production environment variables
    process.env.NODE_ENV = "production";
    process.env.LOG_LEVEL = "ERROR";
    process.env.ENABLE_CONSOLE_LOGGING = "false";
    process.env.PORT = "3000";
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Health Check in Production", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/eosb/health");

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: "OK",
        },
        message: "Service is healthy",
      });
    });
  });

  describe("EOSB Calculation in Production", () => {
    it("should calculate EOSB correctly", async () => {
      const testData = {
        basicSalary: 10000,
        allowances: 0,
        terminationType: "resignation",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gratuityAmount).toBe(35000);
    });
  });

  describe("Configuration in Production", () => {
    it("should return configuration data", async () => {
      const response = await request(app).get("/api/eosb/config");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("terminationTypes");
      expect(response.body.data).toHaveProperty("contractTypes");
      expect(response.body.data).toHaveProperty("calculationRules");
    });
  });

  describe("Error Handling in Production", () => {
    it("should handle validation errors properly", async () => {
      const invalidData = {
        basicSalary: -1000, // Invalid negative salary
        terminationType: "invalid",
        isUnlimitedContract: "not-boolean",
      };

      const response = await request(app)
        .post("/api/eosb/calculate")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("CORS in Production", () => {
    it("should include CORS headers", async () => {
      const response = await request(app).get("/api/eosb/health");

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });
});
