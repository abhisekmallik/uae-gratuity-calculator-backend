import { ConfigurationData } from "../types";

export const appConfiguration: ConfigurationData = {
  terminationTypes: [
    {
      value: "resignation",
      label: "Resignation",
      labelAr: "استقالة",
    },
    {
      value: "termination",
      label: "Termination by Employer",
      labelAr: "إنهاء من صاحب العمل",
    },
    {
      value: "retirement",
      label: "Retirement",
      labelAr: "تقاعد",
    },
    {
      value: "death",
      label: "Death",
      labelAr: "وفاة",
    },
    {
      value: "disability",
      label: "Disability",
      labelAr: "إعاقة",
    },
  ],
  contractTypes: [
    {
      value: true,
      label: "Unlimited Contract",
      labelAr: "عقد غير محدود المدة",
    },
    {
      value: false,
      label: "Limited Contract",
      labelAr: "عقد محدود المدة",
    },
  ],
  calculationRules: {
    minimumServiceDays: 365,
    firstFiveYearsRate: 21 / 365,
    additionalYearsRate: 30 / 365,
    resignationPenalty: {
      lessThanOneYear: 0,
      lessThanThreeYears: 1 / 3,
      lessThanFiveYears: 2 / 3,
      fiveYearsOrMore: 1,
    },
  },
};
