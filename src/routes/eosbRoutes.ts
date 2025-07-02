import { Router } from "express";
import { EOSBController } from "../controllers/eosbController";
import {
  handleValidationErrors,
  validateEmployeeData,
} from "../middleware/validation";

const router = Router();

/**
 * @swagger
 * /api/eosb/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API service is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/HealthCheck'
 *             example:
 *               success: true
 *               data:
 *                 status: "OK"
 *                 timestamp: "2025-07-02T10:30:00.000Z"
 *               message: "Service is healthy"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/health", EOSBController.healthCheck);

/**
 * @swagger
 * /api/eosb/config:
 *   get:
 *     summary: Get configuration data
 *     description: Retrieve dropdown values and calculation rules for the frontend
 *     tags: [Configuration]
 *     responses:
 *       200:
 *         description: Configuration data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ConfigurationData'
 *             example:
 *               success: true
 *               data:
 *                 terminationTypes:
 *                   - value: "resignation"
 *                     label: "Resignation"
 *                     labelAr: "استقالة"
 *                   - value: "termination"
 *                     label: "Termination by Employer"
 *                     labelAr: "إنهاء من صاحب العمل"
 *                 contractTypes:
 *                   - value: true
 *                     label: "Unlimited Contract"
 *                     labelAr: "عقد غير محدود المدة"
 *                   - value: false
 *                     label: "Limited Contract"
 *                     labelAr: "عقد محدود المدة"
 *                 calculationRules:
 *                   minimumServiceDays: 365
 *                   firstFiveYearsRate: 0.057534246575342465
 *                   additionalYearsRate: 0.08219178082191781
 *               message: "Configuration data retrieved successfully"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/config", EOSBController.getConfiguration);

/**
 * @swagger
 * /api/eosb/calculate:
 *   post:
 *     summary: Calculate End of Service Benefits (EOSB)
 *     description: |
 *       Calculate EOSB according to UAE Labor Law Article 132 using the corrected formula:
 *       **Gratuity = (Monthly Salary ÷ 30) × Eligible Days**
 *
 *       ### Calculation Rules:
 *       - **First 5 years**: 21 days per year
 *       - **After 5 years**: 30 days per year
 *       - **Minimum service**: 1 year (365 days)
 *
 *       ### Resignation Penalties (Unlimited Contracts Only):
 *       - **< 1 year**: No gratuity
 *       - **1-3 years**: 1/3 of calculated gratuity
 *       - **3-5 years**: 2/3 of calculated gratuity
 *       - **5+ years**: Full gratuity
 *     tags: [EOSB Calculation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeData'
 *           examples:
 *             resignation_5_years:
 *               summary: Resignation after 5 years (unlimited contract)
 *               value:
 *                 basicSalary: 10000
 *                 allowances: 0
 *                 terminationType: "resignation"
 *                 isUnlimitedContract: true
 *                 joiningDate: "2020-01-01"
 *                 lastWorkingDay: "2025-01-01"
 *             termination_7_years:
 *               summary: Termination after 7 years (unlimited contract)
 *               value:
 *                 basicSalary: 15000
 *                 allowances: 3000
 *                 terminationType: "termination"
 *                 isUnlimitedContract: true
 *                 joiningDate: "2018-06-15"
 *                 lastWorkingDay: "2025-06-15"
 *             resignation_2_years:
 *               summary: Resignation after 2 years (unlimited contract - penalty applies)
 *               value:
 *                 basicSalary: 8000
 *                 allowances: 1000
 *                 terminationType: "resignation"
 *                 isUnlimitedContract: true
 *                 joiningDate: "2023-01-01"
 *                 lastWorkingDay: "2025-01-01"
 *             limited_contract:
 *               summary: Limited contract (no penalties)
 *               value:
 *                 basicSalary: 12000
 *                 allowances: 2000
 *                 terminationType: "resignation"
 *                 isUnlimitedContract: false
 *                 joiningDate: "2022-01-01"
 *                 lastWorkingDay: "2025-01-01"
 *     responses:
 *       200:
 *         description: EOSB calculation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EOSBCalculationResult'
 *             examples:
 *               successful_calculation:
 *                 summary: Successful EOSB calculation
 *                 value:
 *                   success: true
 *                   data:
 *                     totalServiceYears: 5
 *                     totalServiceMonths: 0
 *                     totalServiceDays: 0
 *                     basicSalaryAmount: 10000
 *                     totalSalary: 10000
 *                     eligibleYears: 5.0
 *                     gratuityAmount: 35000
 *                     breakdown:
 *                       firstFiveYears:
 *                         years: 5
 *                         rate: 21
 *                         amount: 35000
 *                       additionalYears:
 *                         years: 0
 *                         rate: 30
 *                         amount: 0
 *                     isEligible: true
 *                   message: "EOSB calculation completed successfully"
 *               ineligible_employee:
 *                 summary: Employee not eligible for gratuity
 *                 value:
 *                   success: true
 *                   data:
 *                     totalServiceYears: 0
 *                     totalServiceMonths: 8
 *                     totalServiceDays: 15
 *                     basicSalaryAmount: 10000
 *                     totalSalary: 10000
 *                     eligibleYears: 0
 *                     gratuityAmount: 0
 *                     breakdown:
 *                       firstFiveYears:
 *                         years: 0
 *                         rate: 0
 *                         amount: 0
 *                       additionalYears:
 *                         years: 0
 *                         rate: 0
 *                         amount: 0
 *                     isEligible: false
 *                     reason: "Minimum service period of 1 year not completed"
 *                   message: "EOSB calculation completed successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               validation_error:
 *                 summary: Input validation failed
 *                 value:
 *                   success: false
 *                   error: "Validation failed"
 *                   message: "Basic salary must be a positive number, Last working day must be after joining date"
 *               invalid_termination_type:
 *                 summary: Invalid termination type
 *                 value:
 *                   success: false
 *                   error: "Validation failed"
 *                   message: "Invalid termination type"
 *               future_last_working_day:
 *                 summary: Future last working day
 *                 value:
 *                   success: false
 *                   error: "Validation failed"
 *                   message: "Last working day cannot be in the future"
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Too many requests"
 *               message: "Rate limit exceeded. Please try again later."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Internal server error"
 *               message: "Failed to calculate EOSB"
 */
router.post(
  "/calculate",
  validateEmployeeData,
  handleValidationErrors,
  EOSBController.calculateEOSB
);

export default router;
