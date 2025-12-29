import { Window } from "./UserInterface";

const codes = [
  { code: "home", screen: <Home />, window: null },
  {
    code: "sc",
    screen: <Window />,
    window: <Scratch />,
    name: "Scratch",
    group: "Record",
    subgroup: "Scratch",
  },
  {
    code: "casset",
    screen: <Window />,
    window: <CreateAsset />,
    name: "Create Asset",
    group: "Control",
    subgroup: "Asset",
  },
  {
    code: "coa",
    screen: <Window />,
    window: <ManageChartOfAccounts />,
    name: "Chart of Accounts",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "fs",
    screen: <Window />,
    window: <ManageFinancialStatementsCode />,
    name: "Financial Statements",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "citc",
    screen: <Window />,
    window: <CreateIncomeTaxCode />,
    name: "Create Income Tax Code",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "mitc",
    screen: <Window />,
    window: <ManageIncomeTaxCode />,
    name: "Manage Income Tax Code",
    group: "Control",
    subgroup: "Global",
  },

  {
    code: "simtax",
    screen: <Window />,
    window: <IncomeTaxSimulate />,
    name: "Remuneration Tax Simulator",
    group: "Application",
    subgroup: "Application",
  },
  {
    code: "json",
    screen: <Window />,
    window: <JSONEditor initial={[["Aravind"]]} />,
    name: "JSON Editor",
    group: "Application",
    subgroup: "Application",
  },
];

export default codes;
