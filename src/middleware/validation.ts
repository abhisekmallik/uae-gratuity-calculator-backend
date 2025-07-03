import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ApiResponse } from "../types";

export const validateEmployeeData = [
  body("basicSalary")
    .isFloat({ min: 0 })
    .withMessage("Basic salary must be a positive number"),

  body("allowances")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Allowances must be a positive number"),

  body("terminationType")
    .isIn(["resignation", "termination", "retirement", "death", "disability"])
    .withMessage("Invalid termination type"),

  body("isUnlimitedContract")
    .isBoolean()
    .withMessage("Contract type must be boolean"),

  body("joiningDate")
    .isISO8601()
    .withMessage("Joining date must be a valid date"),

  body("lastWorkingDay")
    .isISO8601()
    .withMessage("Last working day must be a valid date")
    .custom((value, { req }) => {
      const joiningDate = new Date(req.body.joiningDate);
      const lastWorkingDay = new Date(value);

      if (lastWorkingDay <= joiningDate) {
        throw new Error("Last working day must be after joining date");
      }

      return true;
    }),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Validation failed",
      message: errors
        .array()
        .map((err) => err.msg)
        .join(", "),
    };

    res.status(400).json(response);
    return;
  }

  next();
};
