export interface EmployeeData {
  basicSalary: number;
  allowances?: number;
  terminationType:
    | "resignation"
    | "termination"
    | "retirement"
    | "death"
    | "disability";
  isUnlimitedContract: boolean;
  lastWorkingDay: string;
  joiningDate: string;
}

export interface EOSBCalculationResult {
  totalServiceYears: number;
  totalServiceMonths: number;
  totalServiceDays: number;
  basicSalaryAmount: number;
  totalSalary: number;
  eligibleYears: number;
  gratuityAmount: number;
  breakdown: {
    firstFiveYears: {
      years: number;
      rate: number;
      amount: number;
    };
    additionalYears: {
      years: number;
      rate: number;
      amount: number;
    };
  };
  isEligible: boolean;
  reason?: string;
}

export interface ConfigurationData {
  terminationTypes: Array<{
    value: string;
    label: string;
    labelAr: string;
  }>;
  contractTypes: Array<{
    value: boolean;
    label: string;
    labelAr: string;
  }>;
  calculationRules: {
    minimumServiceDays: number;
    firstFiveYearsRate: number;
    additionalYearsRate: number;
    resignationPenalty: {
      lessThanOneYear: number;
      lessThanThreeYears: number;
      lessThanFiveYears: number;
      fiveYearsOrMore: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
