import { Request, Response } from "express";
import { EOSBController } from "../../src/controllers/eosbController";
import { appConfiguration } from "../../src/utils/configuration";
import { EOSBCalculator } from "../../src/utils/eosbCalculator";
import { logger } from "../../src/utils/logger";

// Mock the dependencies
jest.mock("../../src/utils/eosbCalculator");
jest.mock("../../src/utils/configuration");
jest.mock("../../src/utils/logger");

describe("EOSBController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockLogger: jest.Mocked<typeof logger>;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    // Mock logger
    mockLogger = logger as jest.Mocked<typeof logger>;
    mockLogger.info = jest.fn();
    mockLogger.logRequest = jest.fn();
    mockLogger.logError = jest.fn();
    mockLogger.error = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("calculateEOSB", () => {
    test("should successfully calculate EOSB", async () => {
      const mockEmployeeData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      const mockResult = {
        totalServiceYears: 5,
        totalServiceMonths: 0,
        totalServiceDays: 0,
        basicSalaryAmount: 10000,
        totalSalary: 10000,
        eligibleYears: 5,
        gratuityAmount: 35000,
        breakdown: {
          firstFiveYears: { years: 5, rate: 21, amount: 35000 },
          additionalYears: { years: 0, rate: 30, amount: 0 },
        },
        isEligible: true,
      };

      mockRequest = {
        body: mockEmployeeData,
        method: "POST",
        url: "/api/eosb/calculate",
        ip: "127.0.0.1",
        get: jest.fn().mockReturnValue("test-user-agent"),
      };

      (EOSBCalculator.calculate as jest.Mock).mockReturnValue(mockResult);

      await EOSBController.calculateEOSB(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogger.logRequest).toHaveBeenCalledWith(
        mockRequest,
        "Received employee data for EOSB calculation",
        { employeeData: mockEmployeeData }
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "EOSB calculation completed successfully",
        {
          result: {
            gratuityAmount: mockResult.gratuityAmount,
            totalServiceYears: mockResult.totalServiceYears,
            isEligible: mockResult.isEligible,
          },
        }
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: "EOSB calculation completed successfully",
      });
    });

    test("should handle calculator error", async () => {
      const mockEmployeeData = {
        basicSalary: 10000,
        terminationType: "termination",
        isUnlimitedContract: true,
        joiningDate: "2020-01-01",
        lastWorkingDay: "2025-01-01",
      };

      mockRequest = {
        body: mockEmployeeData,
        method: "POST",
        url: "/api/eosb/calculate",
        ip: "127.0.0.1",
        get: jest.fn().mockReturnValue("test-user-agent"),
      };

      (EOSBCalculator.calculate as jest.Mock).mockImplementation(() => {
        throw new Error("Calculator error");
      });

      await EOSBController.calculateEOSB(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogger.logError).toHaveBeenCalledWith(
        expect.any(Error),
        "Error calculating EOSB",
        { employeeData: mockEmployeeData }
      );
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
        message: "Failed to calculate EOSB",
      });
    });

    test("should handle unexpected error types", async () => {
      mockRequest = {
        body: {},
      };

      (EOSBCalculator.calculate as jest.Mock).mockImplementation(() => {
        throw "String error"; // Non-Error object
      });

      await EOSBController.calculateEOSB(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
        message: "Failed to calculate EOSB",
      });
    });
  });

  describe("getConfiguration", () => {
    test("should successfully return configuration", async () => {
      const mockConfig = {
        terminationTypes: [],
        contractTypes: [],
        calculationRules: {},
      };

      (appConfiguration as any) = mockConfig;

      mockRequest = {
        method: "GET",
        url: "/api/eosb/config",
        ip: "127.0.0.1",
        get: jest.fn().mockReturnValue("test-user-agent"),
      };

      await EOSBController.getConfiguration(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogger.logRequest).toHaveBeenCalledWith(
        mockRequest,
        "Configuration data requested"
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConfig,
        message: "Configuration data retrieved successfully",
      });
    });

    test("should handle configuration error", async () => {
      mockRequest = {
        method: "GET",
        url: "/api/eosb/config",
        ip: "127.0.0.1",
        get: jest.fn().mockReturnValue("test-user-agent"),
      };

      // Mock appConfiguration to throw an error when accessed
      Object.defineProperty(
        require("../../src/utils/configuration"),
        "appConfiguration",
        {
          get: () => {
            throw new Error("Configuration error");
          },
          configurable: true,
        }
      );

      await EOSBController.getConfiguration(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogger.logError).toHaveBeenCalledWith(
        expect.any(Error),
        "Error getting configuration"
      );
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve configuration data",
      });
    });
  });

  describe("healthCheck", () => {
    test("should return health status", async () => {
      mockRequest = {};

      await EOSBController.healthCheck(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          status: "OK",
          timestamp: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
          ),
        },
        message: "Service is healthy",
      });
    });
  });
});
