import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  handleValidationErrors,
  validateEmployeeData,
} from "../../src/middleware/validation";

// Mock express-validator
jest.mock("express-validator", () => ({
  body: jest.fn(() => ({
    isFloat: jest.fn(() => ({ withMessage: jest.fn(() => ({})) })),
    optional: jest.fn(() => ({
      isFloat: jest.fn(() => ({ withMessage: jest.fn(() => ({})) })),
    })),
    isIn: jest.fn(() => ({ withMessage: jest.fn(() => ({})) })),
    isBoolean: jest.fn(() => ({ withMessage: jest.fn(() => ({})) })),
    isISO8601: jest.fn(() => ({
      withMessage: jest.fn(() => ({ custom: jest.fn(() => ({})) })),
    })),
    custom: jest.fn(() => ({})),
  })),
  validationResult: jest.fn(),
}));

const mockedValidationResult = validationResult as jest.MockedFunction<
  typeof validationResult
>;

describe("Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("validateEmployeeData", () => {
    test("should be an array of validation rules", () => {
      expect(Array.isArray(validateEmployeeData)).toBe(true);
      expect(validateEmployeeData.length).toBeGreaterThan(0);
    });
  });

  describe("handleValidationErrors", () => {
    test("should call next() when there are no validation errors", () => {
      mockedValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      } as any);

      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    test("should return 400 error when there are validation errors", () => {
      const mockErrors = [
        { msg: "Basic salary must be a positive number" },
        { msg: "Invalid termination type" },
      ];

      mockedValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      } as any);

      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Validation failed",
        message:
          "Basic salary must be a positive number, Invalid termination type",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should handle single validation error", () => {
      const mockErrors = [
        { msg: "Last working day must be after joining date" },
      ];

      mockedValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      } as any);

      handleValidationErrors(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Validation failed",
        message: "Last working day must be after joining date",
      });
    });
  });
});
