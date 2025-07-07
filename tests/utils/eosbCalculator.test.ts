import { EmployeeData } from "../../src/types";
import { EOSBCalculator } from "../../src/utils/eosbCalculator";

describe("EOSBCalculator", () => {
  describe("Basic Calculation Tests", () => {
    test("should calculate EOSB for basic scenario", () => {
      const employeeData: EmployeeData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const result = EOSBCalculator.calculate(employeeData);

      expect(result.totalServiceYears).toBe(5);
      expect(result.isEligible).toBe(true);
      expect(result.gratuityAmount).toBeGreaterThan(0);
    });
  });
});
