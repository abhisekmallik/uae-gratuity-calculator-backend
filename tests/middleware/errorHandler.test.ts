import { NextFunction, Request, Response } from "express";
import {
  errorHandler,
  notFoundHandler,
} from "../../src/middleware/errorHandler";
import { logger } from "../../src/utils/logger";

// Mock the logger
jest.mock("../../src/utils/logger");

describe("Error Handler Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockLogger: jest.Mocked<typeof logger>;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();

    mockRequest = {
      method: "POST",
      url: "/api/test",
      ip: "127.0.0.1",
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    mockNext = jest.fn();

    // Mock logger
    mockLogger = logger as jest.Mocked<typeof logger>;
    mockLogger.logError = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("errorHandler", () => {
    test("should handle JSON parsing errors", () => {
      const jsonError = {
        type: "entity.parse.failed",
        message: "Invalid JSON",
        statusCode: 400,
      };

      errorHandler(
        jsonError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLogger.logError).toHaveBeenCalledWith(
        jsonError,
        "Unhandled error",
        {
          method: mockRequest.method,
          url: mockRequest.url,
          ip: mockRequest.ip,
        }
      );
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Invalid JSON",
        message: "Request body contains invalid JSON",
      });
    });

    test("should handle SyntaxError", () => {
      const syntaxError = new SyntaxError("Unexpected token");

      errorHandler(
        syntaxError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Invalid JSON",
        message: "Request body contains invalid JSON",
      });
    });

    test("should handle ValidationError", () => {
      const validationError = {
        name: "ValidationError",
        message: "Field is required",
      };

      errorHandler(
        validationError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Validation Error",
        message: "Field is required",
      });
    });

    test("should handle generic errors in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const genericError = new Error("Something went wrong");

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
        message: "Something went wrong",
      });

      process.env.NODE_ENV = originalEnv;
    });

    test("should handle generic errors in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const genericError = new Error("Something went wrong");

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
        message: "Something went wrong",
      });

      process.env.NODE_ENV = originalEnv;
    });

    test("should handle errors without message property", () => {
      const errorWithoutMessage = {
        type: "some.other.error",
      };

      errorHandler(
        errorWithoutMessage,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : undefined,
      });
    });

    test("should handle null/undefined errors", () => {
      errorHandler(
        null,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : undefined,
      });
    });

    test("should handle string errors", () => {
      const stringError = "String error message";

      errorHandler(
        stringError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : stringError,
      });
    });

    test("should handle errors with custom status codes", () => {
      const customError = {
        statusCode: 403,
        message: "Forbidden",
        name: "ForbiddenError",
      };

      errorHandler(
        customError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : "Forbidden",
      });
    });
  });

  describe("notFoundHandler", () => {
    test("should handle GET request to unknown route", () => {
      mockRequest = {
        method: "GET",
        path: "/unknown/route",
      };

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Not found",
        message: "Route GET /unknown/route not found",
      });
    });

    test("should handle POST request to unknown route", () => {
      mockRequest = {
        method: "POST",
        path: "/api/unknown",
      };

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Not found",
        message: "Route POST /api/unknown not found",
      });
    });

    test("should handle requests with special characters in path", () => {
      mockRequest = {
        method: "PUT",
        path: "/api/test%20path",
      };

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Not found",
        message: "Route PUT /api/test%20path not found",
      });
    });

    test("should handle requests without method or path", () => {
      mockRequest = {};

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Not found",
        message: "Route undefined undefined not found",
      });
    });
  });
});
