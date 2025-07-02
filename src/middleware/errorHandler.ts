import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../types";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Unhandled error:", error);

  // Handle JSON parsing errors
  if ((error && error.type === "entity.parse.failed") || error instanceof SyntaxError) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Invalid JSON",
      message: "Request body contains invalid JSON",
    };
    res.status(400).json(response);
    return;
  }

  // Handle validation errors
  if (error && error.name === "ValidationError") {
    const response: ApiResponse<null> = {
      success: false,
      error: "Validation Error",
      message: error.message,
    };
    res.status(400).json(response);
    return;
  }

  // Default error response
  const response: ApiResponse<null> = {
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : (error && error.message) ? error.message : (typeof error === 'string' ? error : undefined),
  };

  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse<null> = {
    success: false,
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
  };

  res.status(404).json(response);
};
