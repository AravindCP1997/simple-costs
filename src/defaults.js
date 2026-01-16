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

export const defaultCompany = {
  Code: "",
  Name: "",
  Address: "",
  Country: "",
  State: "",
  PostalCode: "",
  Email: "",
  Phone: "",
  CIN: "",
  CTIN: "",
  ChartofAccounts: "",
  GroupChartofAccounts: "",
  Currency: "",
  StartingYear: "",
  FYBeginning: "04",
  Numbering: [
    { Item: "Asset", From: 100000 },
    { Item: "Asset Group", From: 100000 },
    { Item: "Material", From: 100000 },
    { Item: "Material Group", From: 100000 },
    { Item: "Service", From: 100000 },
    { Item: "Service Group", From: 100000 },
  ],
  Status: "",
};

export const defaultProfitCenter = {
  Company: "",
  Code: "",
  Description: "",
  Segment: "",
  Status: "Draft",
};

export const defaultGeneralLedger = {
  Company: "",
  Code: "",
  Description: "",
  Group: "",
  Type: "Balance Sheet",
  CostElement: false,
  RestrictManual: false,
  Currency: "",
  PostForex: false,
  PostInterest: false,
  InterestCode: "",
  Status: "Draft",
};

export const defaultBusinessPlace = {
  Company: "",
  Code: "",
  Description: "",
  Address: "",
  PostalCode: "",
  Country: "",
  State: "",
  Email: "",
  Phone: "",
  BTIN: "",
  Status: "Draft",
};

export const defaultCostCenter = {
  Company: "",
  Code: "",
  Description: "",
  ProfitCenter: "",
  BusinessPlace: "",
  Status: "Draft",
};

export const defaultLocation = {
  Company: "",
  Code: "",
  Description: "",
  ProfitCenter: "",
  BusinessPlace: "",
  Status: "Draft",
};

export const defaultPlant = {
  Company: "",
  Code: "",
  Description: "",
  ProfitCenter: "",
  BusinessPlace: "",
  Status: "Draft",
};

export const defaultRevenueCenter = {
  Company: "",
  Code: "",
  Description: "",
  ProfitCenter: "",
  BusinessPlace: "",
  Status: "Draft",
};

export const defaultAssetGroup = {
  Company: "",
  Code: "",
  Description: "",
  Depreciable: true,
  GLAsset: "",
  GLDep: "",
  GLAccDep: "",
  GLLossRet: "",
  GLLossDisp: "",
  GLGainDisp: "",
  Status: "",
};

export const defaultAsset = {
  Company: "",
  Code: "",
  Description: "",
  AssetGroupCode: "",
  Depreciable: true,
  DateofCapitalisation: "",
  Method: "SLM",
  Rate: "",
  UsefulLife: 0,
  SalvageValue: 0,
  OrgAssignment: [{ From: "", To: "", Type: "CostCenter", Assignment: "" }],
};
