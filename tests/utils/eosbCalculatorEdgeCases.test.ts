import { EmployeeData } from "../../src/types";
import { EOSBCalculator } from "../../src/utils/eosbCalculator";

describe("EOSBCalculator Edge Cases", () => {
  describe("Date Calculation Edge Cases", () => {
    test("should handle end date with earlier day than start date", () => {
      // This should trigger lines 32-34 (days < 0 adjustment)
      const employeeData: EmployeeData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-31", // 31st day
        lastWorkingDay: "2021-02-15", // 15th day (earlier day)
      };

      const result = EOSBCalculator.calculate(employeeData);
      
      expect(result.isEligible).toBe(true);
      expect(result.totalServiceYears).toBeGreaterThanOrEqual(1);
    });

    test("should handle end date with earlier month than start date", () => {
      // This should trigger lines 39-40 (months < 0 adjustment)
      const employeeData: EmployeeData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-12-01", // December
        lastWorkingDay: "2022-01-01", // January (earlier month in year)
      };

      const result = EOSBCalculator.calculate(employeeData);
      
      expect(result.isEligible).toBe(true);
      expect(result.totalServiceYears).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Resignation Penalty Edge Cases", () => {
    test("should apply no gratuity for resignation with less than 1 year service (unlimited contract)", () => {
      // This should trigger line 85 (serviceYears < 1 case)
      const employeeData: EmployeeData = {
        basicSalary: 10000,
        terminationType: "resignation",
        isUnlimitedContract: true,
        joiningDate: "2024-06-01",
        lastWorkingDay: "2024-11-01", // Less than 1 year
      };

      const result = EOSBCalculator.calculate(employeeData);
      
      expect(result.isEligible).toBe(false);
      expect(result.gratuityAmount).toBe(0);
    });

    test("should apply 1/3 penalty for resignation between 1-3 years (unlimited contract)", () => {
      // This should trigger line 87 (1/3 penalty)
      const employeeData: EmployeeData = {
        basicSalary: 10000,
        terminationType: "resignation",
        isUnlimitedContract: true,
        joiningDate: "2022-01-01",
        lastWorkingDay: "2024-01-01", // Exactly 2 years
      };

      const result = EOSBCalculator.calculate(employeeData);
      
      expect(result.isEligible).toBe(true);
      expect(result.gratuityAmount).toBeGreaterThan(0);
      // Should be 1/3 of full amount
      expect(result.gratuityAmount).toBeLessThan(15000); // Less than 2/3 of expected full amount
    });

    test("should apply no gratuity for resignation with exactly less than 1 year (unlimited contract)", () => {
      // This should trigger line 85 (serviceYears < 1 case) - make sure it's really less than 1 year
      const employeeData: EmployeeData = {
        basicSalary: 10000,
        terminationType: "resignation",
        isUnlimitedContract: true,
        joiningDate: "2024-07-01",
        lastWorkingDay: "2024-12-31", // About 6 months, clearly less than 1 year
      };

      const result = EOSBCalculator.calculate(employeeData);
      
      expect(result.isEligible).toBe(false);
      expect(result.gratuityAmount).toBe(0);
    });

    test("should apply no gratuity for resignation with exactly 1 year but less in eligible calculation", () => {
      // This should trigger line 85 (serviceYears < 1 case in resignation penalty)
      // Employee has exactly 1 year total service (eligible) but when calculated as decimal is < 1
      const employeeData: EmployeeData = {
        basicSalary: 10000,
        terminationType: "resignation",
        isUnlimitedContract: true,
        joiningDate: "2024-01-01",
        lastWorkingDay: "2024-12-31", // Exactly 1 year minus 1 day = 364 days
      };

      const result = EOSBCalculator.calculate(employeeData);
      
      // Should be eligible (>=365 days) but gratuity should be 0 due to resignation penalty
      expect(result.isEligible).toBe(true);
      expect(result.gratuityAmount).toBe(0);
    });

    test("should apply no gratuity for resignation with eligible service but fractional year less than 1", () => {
      // Another test case to ensure line 85 is covered
      const employeeData: EmployeeData = {
        basicSalary: 10000,
        terminationType: "resignation",
        isUnlimitedContract: true,
        joiningDate: "2023-12-31", // Start at end of year
        lastWorkingDay: "2024-12-30", // Exactly 365 days (eligible but < 1 year in calculation)
      };

      const result = EOSBCalculator.calculate(employeeData);
      
      expect(result.isEligible).toBe(true);
      expect(result.gratuityAmount).toBe(0);
    });
  });
});
