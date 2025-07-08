import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "UAE EOSB Calculator API",
      version: "1.0.0",
      description: `
        A comprehensive RESTful API for calculating End of Service Benefits (EOSB) 
        according to UAE Labor Law Article 132.
        
        ## Features
        - ✅ Accurate EOSB calculations with corrected formula
        - ✅ Proper daily wage calculation: (Monthly Salary ÷ 30) × Eligible Days
        - ✅ Precise service period calculation using calendar dates
        - ✅ Resignation penalties for unlimited contracts only
        - ✅ Input validation and error handling
        - ✅ Configuration API for frontend integration
        
        ## Calculation Formula
        **Gratuity = (Monthly Salary ÷ 30) × Eligible Days**
        
        ### Eligible Days:
        - First 5 years: 21 days per year
        - After 5 years: 30 days per year
        
        ### Resignation Penalties (Unlimited Contracts Only):
        - < 1 year: No gratuity
        - 1-3 years: 1/3 of calculated gratuity
        - 3-5 years: 2/3 of calculated gratuity
        - 5+ years: Full gratuity
      `,
      contact: {
        name: "UAE EOSB Calculator Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
      {
        url: "https://uae-gratuity-calculator-backend.vercel.app",
        description: "Production server",
      },
    ],
    components: {
      schemas: {
        EmployeeData: {
          type: "object",
          required: [
            "basicSalary",
            "terminationType",
            "isUnlimitedContract",
            "joiningDate",
            "lastWorkingDay",
          ],
          properties: {
            basicSalary: {
              type: "number",
              minimum: 0,
              description: "Monthly basic salary in AED",
              example: 10000,
            },
            allowances: {
              type: "number",
              minimum: 0,
              description: "Monthly allowances in AED (optional)",
              example: 2000,
            },
            terminationType: {
              type: "string",
              enum: [
                "resignation",
                "termination",
                "retirement",
                "death",
                "disability",
              ],
              description: "Type of employment termination",
              example: "resignation",
            },
            isUnlimitedContract: {
              type: "boolean",
              description:
                "Whether the contract is unlimited (true) or limited (false)",
              example: true,
            },
            joiningDate: {
              type: "string",
              format: "date",
              description: "Employee joining date (ISO 8601 format)",
              example: "2020-01-01",
            },
            lastWorkingDay: {
              type: "string",
              format: "date",
              description: "Last working day (ISO 8601 format)",
              example: "2025-01-01",
            },
          },
        },
        EOSBCalculationResult: {
          type: "object",
          properties: {
            totalServiceYears: {
              type: "number",
              description: "Total complete years of service",
              example: 5,
            },
            totalServiceMonths: {
              type: "number",
              description: "Remaining months after complete years",
              example: 0,
            },
            totalServiceDays: {
              type: "number",
              description: "Remaining days after complete years and months",
              example: 0,
            },
            basicSalaryAmount: {
              type: "number",
              description: "Monthly basic salary amount",
              example: 10000,
            },
            totalSalary: {
              type: "number",
              description: "Total monthly salary used for calculation",
              example: 10000,
            },
            eligibleYears: {
              type: "number",
              description:
                "Total eligible years for gratuity (including fractional years)",
              example: 5.0,
            },
            gratuityAmount: {
              type: "number",
              description: "Final calculated gratuity amount in AED",
              example: 35000,
            },
            breakdown: {
              type: "object",
              properties: {
                firstFiveYears: {
                  type: "object",
                  properties: {
                    years: {
                      type: "number",
                      description: "Years counted in first 5 years calculation",
                      example: 5,
                    },
                    rate: {
                      type: "number",
                      description: "Days per year rate for first 5 years",
                      example: 21,
                    },
                    amount: {
                      type: "number",
                      description: "Gratuity amount for first 5 years",
                      example: 35000,
                    },
                  },
                },
                additionalYears: {
                  type: "object",
                  properties: {
                    years: {
                      type: "number",
                      description: "Years beyond 5 years",
                      example: 0,
                    },
                    rate: {
                      type: "number",
                      description: "Days per year rate for years beyond 5",
                      example: 30,
                    },
                    amount: {
                      type: "number",
                      description: "Gratuity amount for years beyond 5",
                      example: 0,
                    },
                  },
                },
              },
            },
            isEligible: {
              type: "boolean",
              description: "Whether the employee is eligible for gratuity",
              example: true,
            },
            reason: {
              type: "string",
              description: "Reason for ineligibility (if applicable)",
              example: "Minimum service period of 1 year not completed",
            },
          },
        },
        ConfigurationData: {
          type: "object",
          properties: {
            terminationTypes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  value: {
                    type: "string",
                    example: "resignation",
                  },
                  label: {
                    type: "string",
                    example: "Resignation",
                  },
                  labelAr: {
                    type: "string",
                    example: "استقالة",
                  },
                },
              },
            },
            contractTypes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  value: {
                    type: "boolean",
                    example: true,
                  },
                  label: {
                    type: "string",
                    example: "Unlimited Contract",
                  },
                  labelAr: {
                    type: "string",
                    example: "عقد غير محدود المدة",
                  },
                },
              },
            },
            calculationRules: {
              type: "object",
              properties: {
                minimumServiceDays: {
                  type: "number",
                  example: 365,
                },
                firstFiveYearsRate: {
                  type: "number",
                  example: 0.057534246575342465,
                },
                additionalYearsRate: {
                  type: "number",
                  example: 0.08219178082191781,
                },
                resignationPenalty: {
                  type: "object",
                  properties: {
                    lessThanOneYear: {
                      type: "number",
                      example: 0,
                    },
                    lessThanThreeYears: {
                      type: "number",
                      example: 0.3333333333333333,
                    },
                    lessThanFiveYears: {
                      type: "number",
                      example: 0.6666666666666666,
                    },
                    fiveYearsOrMore: {
                      type: "number",
                      example: 1,
                    },
                  },
                },
              },
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Whether the request was successful",
              example: true,
            },
            data: {
              description: "Response data (varies by endpoint)",
            },
            message: {
              type: "string",
              description: "Human-readable message about the result",
              example: "EOSB calculation completed successfully",
            },
            error: {
              type: "string",
              description: "Error message (only present when success is false)",
              example: "Validation failed",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              example: "Validation failed",
            },
            message: {
              type: "string",
              example:
                "Basic salary must be a positive number, Last working day must be after joining date",
            },
          },
        },
        HealthCheck: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "OK",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2025-07-02T10:30:00.000Z",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Health",
        description: "Health check endpoints",
      },
      {
        name: "Configuration",
        description: "Configuration data endpoints",
      },
      {
        name: "EOSB Calculation",
        description: "End of Service Benefits calculation endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "UAE EOSB Calculator API Documentation",
      swaggerOptions: {
        url: "/api-docs.json",
      },
    })
  );

  // JSON endpoint for API specs
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.send(specs);
  });
};

export { specs as swaggerSpecs };
