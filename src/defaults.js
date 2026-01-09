export const defaultChartofAccounts = {
  Code: "",
  AccountGroups: [{ Group: "", From: "", To: "" }],
  Status: "Draft",
};

export const defaultGroupChartofAccounts = {
  Code: "",
  AccountGroups: [{ Group: "", From: "", To: "" }],
  Status: "Draft",
};

export const defaultGroupGeneralLedger = {
  ChartofAccounts: "",
  GeneralLedger: "",
  Group: "",
  LedgerType: "Balance Sheet",
  Description: "",
  Status: "Draft",
};

export const defaultIncomeTaxCode = {
  Code: "",
  Taxation: [
    {
      YearFrom: "",
      YearTo: "",
      ExemptionLimit: 0,
      StandardDeductionSalary: 0,
      Cess: 0,
      SlabRate: [{ From: 0, To: 0, Rate: 0 }],
      Surcharge: [{ Threshold: 0, Rate: 0 }],
      CalculateMarginalReliefOnExemption: true,
      CalculateMarginalReliefOnSurcharge: true,
    },
  ],
};
