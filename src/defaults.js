export const defaultChartofAccounts = {
  Code: "",
  Level: "Company",
  AccountGroups: [{ Group: "", From: "", To: "" }],
  Status: "Ready",
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
  Status: "Ready",
};

export const defaultGroupGeneralLedger = {
  ChartofAccounts: "",
  GeneralLedger: "",
  Group: "",
  LedgerType: "Balance Sheet",
  Description: "",
  Status: "Ready",
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
  Status: "Ready",
};

export const defaultPaymentTerms = {
  Code: "",
  Description: "",
  Discount: [{ PaymentInDays: "", Discount: "" }],
  DueWithinDays: 0,
  Status: "Ready",
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
    { Item: "Asset Development Order", From: 100000 },
    { Item: "Bank Account", From: 100000 },
    { Item: "Customer", From: 100000 },
    { Item: "Employee", From: 100000 },
    { Item: "Maintenance Order", From: 100000 },
    { Item: "Material", From: 100000 },
    { Item: "Process Order", From: 100000 },
    { Item: "Production Order", From: 100000 },
    { Item: "Purchase Order", From: 100000 },
    { Item: "Sale Order", From: 100000 },
    { Item: "Service", From: 100000 },
    { Item: "Stock Transport Order", From: 100000 },
    { Item: "Vendor", From: 100000 },
  ],
  Status: "Ready",
};

export const defaultProfitCenter = {
  Company: "",
  Code: "",
  Description: "",
  Segment: "",
  Status: "Ready",
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
  Status: "Ready",
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
  Status: "Ready",
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
  DateofCapitalisation: "",
  Method: "Straight Line",
  Rate: "",
  UsefulLife: 1,
  SalvageValue: 0,
  OrgAssignment: [{ From: "", To: "", Type: "CostCenter", Assignment: "" }],
};

export const defaultAssetDevelopmentOrder = {
  Company: "",
  Code: "",
  Description: "",
  ProfitCenterCode: "",
};

export const defaultWageType = {
  Company: "",
  Code: "",
  Description: "",
  Type: "Emolument",
  Nature: "Variable",
  GL: "",
  Taxable: true,
};

export const defaultEmployee = {
  Company: "",
  Code: "",
  EmployeeGroupCode: "",
  Name: "",
  Address: "",
  PostalCode: "",
  State: "Kerala",
  Country: "India",
  Email: "",
  Phone: "",
  DOB: "",
  DOJ: "",
  DOS: "",
  Position: [{ From: "", To: "", Position: "" }],
  OrgAssignment: [{ From: "", To: "", Type: "CostCenter", Assignment: "" }],
  OneTimeWages: [{ WT: "", Date: "", Amount: "" }],
  VariableWages: [{ WT: "", From: "", To: "", Amount: "" }],
  FixedWages: [{ WT: "", From: "", To: "", Amount: "" }],
  TIN: "",
  TaxCode: [{ From: "", To: "", Code: "" }],
  Additions: [{ Year: "", Description: "", Amount: "" }],
  Deductions: [{ Year: "", Description: "", Amount: "" }],
  BankAccounts: [{ Bank: "", SWIFT: "", Account: "", Confirm: "" }],
  Status: "Working",
};

export const defaultMaterialGroup = {
  Company: "",
  Code: "",
  Description: "",
  GLMat: "",
  GLCoS: "",
  GLRev: "",
  GLWriteDown: "",
};

export const defaultMaterial = {
  Company: "",
  Code: "",
  Description: "",
  MaterialGroupCode: "",
  Unit: "",
};

export const defaultServiceGroup = {
  Company: "",
  Code: "",
  Description: "",
  GLExp: "",
  GLRev: "",
};

export const defaultService = {
  Company: "",
  Code: "",
  Description: "",
  ServiceGroupCode: "",
  Unit: "",
};

export const defaultEmployeeGroup = {
  Company: "",
  Code: "",
  Description: "",
  GL: "",
};

export const defaultCustomerGroup = {
  Company: "",
  Code: "",
  Description: "",
  GL: "",
};

export const defaultVendorGroup = {
  Company: "",
  Code: "",
  Description: "",
  GL: "",
};

export const defaultWithholdingTax = {
  Company: "",
  Code: "",
  Description: "",
  ExemptionT: 0,
  ExemptionA: 0,
  Accounting: [{ GL: "", Rate: "" }],
};

export const defaultBusinessTaxCode = {
  Company: "",
  Code: "",
  Description: "",
  Accounting: [{ BP: "", TType: "All", GL: "", Type: "Debit", Rate: 0 }],
};

export const defaultVendor = {
  Company: "",
  Code: "",
  VendorGroupCode: "",
  Name: "",
  Address: "",
  PostalCode: "",
  Country: "",
  State: "",
  Email: "",
  Phone: "",
  CTIN: "",
  BTIN: "",
  CIN: "",
  BankAccounts: [{ Bank: "", SWIFT: "", Account: "", Confirm: "" }],
  Withholding: [{ Code: "", Exemption: 0, Remarks: "", Active: true }],
  GroupKeys: [""],
};

export const defaultCustomer = {
  Company: "",
  Code: "",
  CustomerGroupCode: "",
  Name: "",
  Address: "",
  PostalCode: "",
  Country: "",
  State: "",
  Email: "",
  Phone: "",
  CTIN: "",
  BTIN: "",
  CIN: "",
  BankAccounts: [{ Bank: "", SWIFT: "", Account: "", Confirm: "" }],
  Withholding: [{ Code: "", Exemption: 0, Remarks: "", Active: true }],
  GroupKeys: [""],
};

export const defaultBankAccount = {
  Company: "",
  Code: "",
  Bank: "",
  Address: "",
  PostalCode: "",
  Country: "",
  State: "",
  Email: "",
  Phone: "",
  CompanyName: "",
  SWIFT: "",
  Account: "",
  Confirm: "",
  GL: "",
  PC: "",
  GroupKeys: [""],
};

export const defaultVirtualAccount = {
  Company: "",
  Code: "",
  Account: "",
  VAN: "",
  Credit: "Customer",
  CreditAccount: "",
  ProfitCenter: "",
};
