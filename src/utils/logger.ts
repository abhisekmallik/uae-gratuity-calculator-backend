import { Request } from "express";

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  format: "json" | "text";
}

export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;

  private constructor() {
    this.config = {
      level: this.getLogLevel(),
      enableConsole: this.shouldEnableConsole(),
      enableFile: false, // Can be extended later
      format: "text",
    };
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case "ERROR":
        return LogLevel.ERROR;
      case "WARN":
        return LogLevel.WARN;
      case "INFO":
        return LogLevel.INFO;
      case "DEBUG":
        return LogLevel.DEBUG;
      default:
        return process.env.NODE_ENV === "production"
          ? LogLevel.ERROR
          : LogLevel.DEBUG;
    }
  }

  private shouldEnableConsole(): boolean {
    if (process.env.ENABLE_CONSOLE_LOGGING !== undefined) {
      return process.env.ENABLE_CONSOLE_LOGGING === "true";
    }
    // Disable console logging in production by default, enable in development/test
    return process.env.NODE_ENV !== "production";
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level && this.config.enableConsole;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    meta?: any
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, meta);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.log(formattedMessage);
        break;
    }
  }

  public error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, "error", message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, "warn", message, meta);
  }

  public info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, "info", message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, "debug", message, meta);
  }

  // Helper method for HTTP request logging
  public logRequest(req: Request, message: string, meta?: any): void {
    const requestMeta = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      ...meta,
    };
    this.info(message, requestMeta);
  }

  // Helper method for logging errors with stack traces
  public logError(error: Error | unknown, message?: string, meta?: any): void {
    const errorMeta = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...meta,
    };
    this.error(message || "An error occurred", errorMeta);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
