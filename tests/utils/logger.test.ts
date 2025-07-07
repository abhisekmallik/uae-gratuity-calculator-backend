import { Logger, LogLevel } from "../../src/utils/logger";

// Mock console methods
const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe("Logger", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
    // Mock console methods
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    // Restore original environment and console
    process.env = originalEnv;
    Object.assign(console, originalConsole);
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.LOG_LEVEL;
    delete process.env.ENABLE_CONSOLE_LOGGING;
    delete process.env.NODE_ENV;

    // Reset the singleton instance to ensure fresh configuration for each test
    (Logger as any).instance = undefined;
  });

  describe("getInstance", () => {
    test("should return singleton instance", () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();
      expect(logger1).toBe(logger2);
    });
  });

  describe("log levels", () => {
    test("should log all levels in development", () => {
      process.env.NODE_ENV = "development";
      const logger = Logger.getInstance();

      logger.error("Error message");
      logger.warn("Warning message");
      logger.info("Info message");
      logger.debug("Debug message");

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.log).toHaveBeenCalledTimes(1);
    });

    test("should only log errors in production", () => {
      process.env.NODE_ENV = "production";
      process.env.ENABLE_CONSOLE_LOGGING = "true"; // Explicitly enable console logging for this test
      const logger = Logger.getInstance();

      logger.error("Error message");
      logger.warn("Warning message");
      logger.info("Info message");
      logger.debug("Debug message");

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    test("should respect LOG_LEVEL environment variable", () => {
      process.env.LOG_LEVEL = "WARN";
      process.env.ENABLE_CONSOLE_LOGGING = "true";
      const logger = Logger.getInstance();

      logger.error("Error message");
      logger.warn("Warning message");
      logger.info("Info message");
      logger.debug("Debug message");

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    test("should respect DEBUG log level", () => {
      process.env.LOG_LEVEL = "DEBUG";
      process.env.ENABLE_CONSOLE_LOGGING = "true";
      const logger = Logger.getInstance();

      logger.error("Error message");
      logger.warn("Warning message");
      logger.info("Info message");
      logger.debug("Debug message");

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.log).toHaveBeenCalledTimes(1);
    });

    test("should respect INFO log level", () => {
      process.env.LOG_LEVEL = "INFO";
      process.env.ENABLE_CONSOLE_LOGGING = "true";
      const logger = Logger.getInstance();

      logger.error("Error message");
      logger.warn("Warning message");
      logger.info("Info message");
      logger.debug("Debug message");

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    test("should default to DEBUG in non-production environment with invalid log level", () => {
      process.env.NODE_ENV = "development";
      process.env.LOG_LEVEL = "INVALID_LEVEL";
      process.env.ENABLE_CONSOLE_LOGGING = "true";
      const logger = Logger.getInstance();

      logger.error("Error message");
      logger.warn("Warning message");
      logger.info("Info message");
      logger.debug("Debug message");

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.log).toHaveBeenCalledTimes(1);
    });

    test("should default to ERROR in production environment with invalid log level", () => {
      process.env.NODE_ENV = "production";
      process.env.LOG_LEVEL = "INVALID_LEVEL";
      process.env.ENABLE_CONSOLE_LOGGING = "true";
      const logger = Logger.getInstance();

      logger.error("Error message");
      logger.warn("Warning message");
      logger.info("Info message");
      logger.debug("Debug message");

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    test("should disable logging when ENABLE_CONSOLE_LOGGING is false", () => {
      process.env.ENABLE_CONSOLE_LOGGING = "false";
      const logger = Logger.getInstance();

      logger.error("Error message");
      logger.warn("Warning message");
      logger.info("Info message");
      logger.debug("Debug message");

      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    test("should disable logging by default in production", () => {
      process.env.NODE_ENV = "production";
      // Don't set ENABLE_CONSOLE_LOGGING - should default to false in production
      const logger = Logger.getInstance();

      logger.error("Error message");
      logger.warn("Warning message");
      logger.info("Info message");
      logger.debug("Debug message");

      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.log).not.toHaveBeenCalled();
    });
  });

  describe("message formatting", () => {
    test("should format messages with timestamp and metadata", () => {
      process.env.NODE_ENV = "development";
      const logger = Logger.getInstance();

      logger.info("Test message", { key: "value" });

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: Test message \| {"key":"value"}$/
        )
      );
    });

    test("should format messages without metadata", () => {
      process.env.NODE_ENV = "development";
      const logger = Logger.getInstance();

      logger.info("Simple message");

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: Simple message$/
        )
      );
    });
  });

  describe("helper methods", () => {
    test("should log request information", () => {
      process.env.NODE_ENV = "development";
      const logger = Logger.getInstance();

      const mockReq = {
        method: "POST",
        url: "/api/test",
        ip: "127.0.0.1",
        get: jest.fn().mockReturnValue("test-agent"),
      } as any;

      logger.logRequest(mockReq, "Request received");

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining("Request received")
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining("POST")
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining("/api/test")
      );
    });

    test("should log error with stack trace", () => {
      process.env.NODE_ENV = "development";
      const logger = Logger.getInstance();

      const error = new Error("Test error");
      logger.logError(error, "Custom error message");

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining("Custom error message")
      );
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining("Test error")
      );
    });

    test("should handle non-Error objects", () => {
      process.env.NODE_ENV = "development";
      const logger = Logger.getInstance();

      logger.logError("String error", "Custom message");

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining("Custom message")
      );
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining("String error")
      );
    });

    test("should handle Error objects without stack trace", () => {
      process.env.NODE_ENV = "development";
      const logger = Logger.getInstance();

      const errorWithoutStack = new Error("Test error");
      // Remove stack trace to test the undefined case
      delete (errorWithoutStack as any).stack;

      logger.logError(errorWithoutStack, "Error without stack");

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining("Error without stack")
      );
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining("Test error")
      );
    });

    test("should handle logError without message parameter", () => {
      process.env.NODE_ENV = "development";
      const logger = Logger.getInstance();

      const error = new Error("Test error with stack");
      logger.logError(error); // No message parameter

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining("An error occurred")
      );
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining("Test error with stack")
      );
    });
  });
});
