import { EmployeeData, EOSBCalculationResult } from "../types";

export class EOSBCalculator {
  private static readonly MINIMUM_SERVICE_DAYS = 365; // 1 year minimum service
  private static readonly FIRST_FIVE_YEARS_DAYS = 21; // 21 days per year for first 5 years
  private static readonly ADDITIONAL_YEARS_DAYS = 30; // 30 days per year after 5 years
  private static readonly WORKING_DAYS_PER_MONTH = 30;
  private static readonly DAYS_PER_YEAR = 365;

  /**
   * Calculate total service period in years, months, and days with accurate precision
   */
  private static calculateServicePeriod(
    joiningDate: string,
    lastWorkingDay: string
  ) {
    const start = new Date(joiningDate);
    const end = new Date(lastWorkingDay);

    // Calculate total days
    const totalDays = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Use a simpler, more accurate method for calculating years, months, days
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    // Adjust if day is negative
    if (days < 0) {
      months--;
      const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += lastMonth.getDate();
    }

    // Adjust if month is negative
    if (months < 0) {
      years--;
      months += 12;
    }

    return { totalDays, years, months, days };
  }

  /**
   * Calculate gratuity based on UAE Labor Law Article 132
   * Formula: (Monthly Salary / 30) × Eligible Days
   * First 5 years: 21 days per year
   * After 5 years: 30 days per year
   */
  private static calculateGratuity(
    monthlySalary: number,
    serviceYears: number,
    terminationType: string,
    isUnlimitedContract: boolean
  ) {
    const dailyWage = monthlySalary / this.WORKING_DAYS_PER_MONTH;

    // Calculate eligible gratuity days
    let eligibleDays = 0;
    let firstFiveYearsDays = 0;
    let additionalYearsDays = 0;

    // First 5 years: 21 days per year
    const firstFiveYears = Math.min(serviceYears, 5);
    firstFiveYearsDays = firstFiveYears * this.FIRST_FIVE_YEARS_DAYS;
    eligibleDays += firstFiveYearsDays;

    // Additional years after 5: 30 days per year
    if (serviceYears > 5) {
      const additionalYears = serviceYears - 5;
      additionalYearsDays = additionalYears * this.ADDITIONAL_YEARS_DAYS;
      eligibleDays += additionalYearsDays;
    }

    // Calculate gratuity amounts
    const firstFiveYearsAmount = firstFiveYearsDays * dailyWage;
    const additionalYearsAmount = additionalYearsDays * dailyWage;
    let totalGratuityAmount = firstFiveYearsAmount + additionalYearsAmount;

    // Apply resignation penalties for unlimited contracts only
    if (terminationType === "resignation" && isUnlimitedContract) {
      if (serviceYears < 1) {
        totalGratuityAmount = 0; // No gratuity for less than 1 year
      } else if (serviceYears >= 1 && serviceYears < 3) {
        totalGratuityAmount = totalGratuityAmount * (1 / 3); // 1/3 of gratuity
      } else if (serviceYears >= 3 && serviceYears < 5) {
        totalGratuityAmount = totalGratuityAmount * (2 / 3); // 2/3 of gratuity
      }
      // Full gratuity for 5+ years of service
    }

    return {
      gratuityAmount: Math.round(totalGratuityAmount * 100) / 100,
      eligibleDays,
      breakdown: {
        firstFiveYears: {
          years: firstFiveYears,
          rate: this.FIRST_FIVE_YEARS_DAYS,
          amount: Math.round(firstFiveYearsAmount * 100) / 100,
        },
        additionalYears: {
          years: serviceYears > 5 ? serviceYears - 5 : 0,
          rate: this.ADDITIONAL_YEARS_DAYS,
          amount: Math.round(additionalYearsAmount * 100) / 100,
        },
      },
    };
  }

  /**
   * Main calculation method
   */
  public static calculate(employeeData: EmployeeData): EOSBCalculationResult {
    const {
      joiningDate,
      lastWorkingDay,
      basicSalary,
      terminationType,
      isUnlimitedContract,
    } = employeeData;

    const servicePeriod = this.calculateServicePeriod(
      joiningDate,
      lastWorkingDay
    );

    // Calculate total monthly salary for EOSB (basic salary is typically used)
    // Note: Some employers may include certain allowances in EOSB calculation
    // This should be clarified based on the employment contract
    const monthlySalary = basicSalary;

    // Check eligibility (minimum 1 year service)
    const isEligible = servicePeriod.totalDays >= this.MINIMUM_SERVICE_DAYS;

    if (!isEligible) {
      return {
        totalServiceYears: servicePeriod.years,
        totalServiceMonths: servicePeriod.months,
        totalServiceDays: servicePeriod.days,
        basicSalaryAmount: basicSalary,
        totalSalary: monthlySalary,
        eligibleYears: 0,
        gratuityAmount: 0,
        breakdown: {
          firstFiveYears: { years: 0, rate: 0, amount: 0 },
          additionalYears: { years: 0, rate: 0, amount: 0 },
        },
        isEligible: false,
        reason: "Minimum service period of 1 year not completed",
      };
    }

    const eligibleYears =
      servicePeriod.years +
      servicePeriod.months / 12 +
      servicePeriod.days / 365;

    const gratuityCalculation = this.calculateGratuity(
      monthlySalary,
      eligibleYears,
      terminationType,
      isUnlimitedContract
    );

    return {
      totalServiceYears: servicePeriod.years,
      totalServiceMonths: servicePeriod.months,
      totalServiceDays: servicePeriod.days,
      basicSalaryAmount: basicSalary,
      totalSalary: monthlySalary,
      eligibleYears: Math.round(eligibleYears * 100) / 100,
      gratuityAmount: gratuityCalculation.gratuityAmount,
      breakdown: gratuityCalculation.breakdown,
      isEligible: true,
    };
  }
}
