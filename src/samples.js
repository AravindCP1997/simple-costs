export const sampleChartOfAccounts = {
  Code: "ABCD",
  Level: "Company",
  AccountGroups: [
    { Group: "Asset", From: 1, To: 99 },
    { Group: "Equity", From: 100, To: 199 },
    { Group: "Liability", From: 200, To: 299 },
    { Group: "Income", From: 300, To: 399 },
    { Group: "Expense", From: 400, To: 499 },
  ],
  Status: "Draft",
};

export const sampleFinancialStatementStructure = {
  Chart: "",
  Code: "SFSC",
  Description: "Sample FS Structure",
  Hierarchy: [
    {
      name: "Assets",
      altName: "Assets",
      presentations: [],
      subgroups: [
        {
          name: "Non-Current Assets",
          subgroups: [],
          presentations: [
            {
              name: "Property, Plant and Equipment",
              ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
            },
            {
              name: "Intangible Assets",
              ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
            },
            {
              name: "Investments",
              ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
            },
          ],
        },
        {
          name: "Current Assets",
          subgroups: [],
          presentations: [
            {
              name: "Inventories",
              ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
            },
            {
              name: "Cash and Cash Equivalents",
              ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
            },
            {
              name: "Trade Receivables",
              ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
            },
          ],
        },
      ],
    },
    {
      name: "Equity and Liabilities",
      altName: "Equity and Liabilities",
      presentations: [],
      subgroups: [
        {
          name: "Equity",
          subgroups: [],
          presentations: [
            {
              name: "Share Capital",
              ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
            },
            {
              name: "Other Equity",
              ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
            },
          ],
        },
        {
          name: "Liabilities",
          presentations: [],
          subgroups: [
            {
              name: "Non-Current Liabilities",
              subgroups: [],
              presentations: [
                {
                  name: "Long-term Borrowings",
                  ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
                },
                {
                  name: "Lease Liabilities",
                  ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
                },
              ],
            },
            {
              name: "Current Liabilities",
              subgroups: [],
              presentations: [
                {
                  name: "Short-term Borrowings",
                  ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
                },
                {
                  name: "Trade Payables",
                  ledgers: [{ From: "", To: "", Debit: "", Credit: "" }],
                },
              ],
            },
          ],
        },
      ],
    },
    { name: "Net Profit", altName: "Net Profit" },
    { name: "Net Loss", altName: "Net Loss" },
  ],
  Status: "Draft",
};

export const sampleGroupChartOfAccounts = {
  Code: "GABCD",
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
  Status: "Draft",
};

export const sampleInterestCode = {
  Code: "ABC",
  Description: "Sample Interest Code",
  Compounding: "Daily",
  DaysinYear: 360,
  Status: "Draft",
};
