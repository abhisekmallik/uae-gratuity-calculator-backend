import { Request, Response } from "express";
import {
  ApiResponse,
  ConfigurationData,
  EmployeeData,
  EOSBCalculationResult,
} from "../types";
import { appConfiguration } from "../utils/configuration";
import { EOSBCalculator } from "../utils/eosbCalculator";

export class EOSBController {
  /**
   * Calculate EOSB based on employee data
   */
  public static async calculateEOSB(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const employeeData: EmployeeData = req.body;

      const result = EOSBCalculator.calculate(employeeData);

      const response: ApiResponse<EOSBCalculationResult> = {
        success: true,
        data: result,
        message: "EOSB calculation completed successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error calculating EOSB:", error);

      const response: ApiResponse<null> = {
        success: false,
        error: "Internal server error",
        message: "Failed to calculate EOSB",
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get configuration data for dropdowns and rules
   */
  public static async getConfiguration(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const response: ApiResponse<ConfigurationData> = {
        success: true,
        data: appConfiguration,
        message: "Configuration data retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error getting configuration:", error);

      const response: ApiResponse<null> = {
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve configuration data",
      };

      res.status(500).json(response);
    }
  }

  /**
   * Health check endpoint
   */
  public static async healthCheck(req: Request, res: Response): Promise<void> {
    const response: ApiResponse<{ status: string; timestamp: string }> = {
      success: true,
      data: {
        status: "OK",
        timestamp: new Date().toISOString(),
      },
      message: "Service is healthy",
    };

    res.status(200).json(response);
  }
}
