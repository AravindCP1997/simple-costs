export const defaultChartofAccounts = {
  Code: "",
  Level: "Company",
  AccountGroups: [{ Group: "", From: "", To: "" }],
  Status: "Draft",
};

export const defaultFinancialStatementStructure = {
  Chart: "",
  Code: "",
  Description: "",
  Hierarchy: [
    {
      name: "Assets",
      altName: "Assets",
      presentations: [],
      subgroups: [],
    },
    {
      name: "Equity and Liabilities",
      altName: "Equity and Liabilities",
      presentations: [],
      subgroups: [],
    },
    {
      name: "Net Profit",
      altName: "Net Profit",
    },
    {
      name: "Net Loss",
      altName: "Net Loss",
    },
  ],
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

export const defaultInterestCode = {
  Code: "",
  Description: "",
  Compounding: "Daily",
  DaysinYear: 360,
  Status: "Draft",
};

export const defaultPaymentTerms = {
  Code: "",
  Description: "",
  Discount: [{ PaymentInDays: "", Discount: "" }],
  DueWithinDays: 0,
  Status: "Draft",
};
