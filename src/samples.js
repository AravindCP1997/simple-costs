export const sampleChartOfAccounts = {
  Code: "ABCD",
  AccountGroups: [
    { Group: "Asset", From: 1, To: 99 },
    { Group: "Equity", From: 100, To: 199 },
    { Group: "Liability", From: 200, To: 299 },
    { Group: "Income", From: 300, To: 399 },
    { Group: "Expense", From: 400, To: 499 },
  ],
  Status: "Draft",
};

export const sampleIncomeTaxCode = {
  Code: "115BAC",
  Taxation: [
    {
      YearFrom: 2024,
      YearTo: 2024,
      ExemptionLimit: 700000,
      StandardDeductionSalary: 75000,
      Cess: 4,
      CalculateMarginalReliefOnExemption: true,
      CalculateMarginalReliefOnSurcharge: true,
      SlabRate: [
        { From: 0, To: 300000, Rate: 0 },
        { From: 300001, To: 700000, Rate: 5 },
        { From: 700001, To: 1000000, Rate: 10 },
        { From: 1000001, To: 1200000, Rate: 15 },
        { From: 1200001, To: 1500000, Rate: 20 },
        { From: 1500001, To: 9999999999, Rate: 30 },
      ],
      Surcharge: [
        { Threshold: 5000000, Rate: 10 },
        { Threshold: 10000000, Rate: 15 },
        { Threshold: 20000000, Rate: 25 },
      ],
    },
    {
      YearFrom: 2025,
      YearTo: 2025,
      ExemptionLimit: 1200000,
      StandardDeductionSalary: 75000,
      Cess: 4,
      CalculateMarginalReliefOnExemption: true,
      CalculateMarginalReliefOnSurcharge: true,
      SlabRate: [
        { From: 0, To: 400000, Rate: 0 },
        { From: 400001, To: 800000, Rate: 5 },
        { From: 800001, To: 1200000, Rate: 10 },
        { From: 1200001, To: 1600000, Rate: 15 },
        { From: 1600001, To: 2000000, Rate: 20 },
        { From: 2000001, To: 2400000, Rate: 25 },
        { From: 2400001, To: 9999999999, Rate: 30 },
      ],
      Surcharge: [
        { Threshold: 5000000, Rate: 10 },
        { Threshold: 10000000, Rate: 15 },
        { Threshold: 20000000, Rate: 25 },
      ],
    },
  ],
};

export const sampleInterestCode = {
  Code: "ABC",
  Description: "Sample Interest Code",
  Compounding: "Daily",
  DaysinYear: 360,
};
