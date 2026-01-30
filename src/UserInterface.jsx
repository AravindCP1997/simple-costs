import { useEffect, useRef, useState } from "react";
import { useInterface, WindowContext, useWindowType } from "./useInterface";
import {
  RightFlex,
  DistributedRow,
  Button,
  ConditionalButton,
  Overlay,
  Flex,
  CenterFlex,
  TopFlex,
  DisplayArea,
  WindowContent,
  WindowTitle,
  Label,
  Input,
  Option,
  Radio,
  AutoSuggestInput,
  CoveredRow,
  Conditional,
  Row,
} from "./Components";
import Draggable from "react-draggable";
import { FocusTrap } from "focus-trap-react";
import {
  FaArrowsAlt,
  FaSearch,
  FaHome,
  FaArrowRight,
  FaChild,
  FaTimes,
  FaPowerOff,
} from "react-icons/fa";
import { ListItems, ListUniqueItems, clickButton, logout } from "./functions";
import { Scratch } from "./App";
import { JSONEditor } from "./Transactions/JsonEditor";

import {
  CreateIncomeTaxCode,
  ManageIncomeTaxCode,
  IncomeTaxSimulate,
} from "./Transactions/IncomeTaxCode";

import {
  CreateChartofAccounts,
  ManageChartofAccounts,
} from "./Transactions/ChartofAccounts";
import {
  CreateInterestCode,
  ManageInterestCode,
} from "./Transactions/InterestCode";
import {
  CreateGroupGeneralLedger,
  ManageGroupGeneralLedger,
} from "./Transactions/GroupGeneralLedger";
import {
  CreateFinancialStatementStructure,
  ManageFinancialStatementStructure,
} from "./Transactions/FinancialStatementStructure";
import {
  CreatePaymentTerms,
  ManagePaymentTerms,
} from "./Transactions/PaymentTerms";
import { TableHSN } from "./Transactions/HSN";
import { TableCurrencies } from "./Transactions/Currencies";
import { TableSegments } from "./Transactions/Segments";
import { TableUnits } from "./Transactions/Units";
import { CreateCompany, ManageCompany } from "./Transactions/Company";
import { ManageOpenPeriods } from "./Transactions/OpenPeriods";
import {
  CreateProfitCenter,
  ManageProfitCenter,
} from "./Transactions/ProfitCenter";
import {
  CreateGeneralLedger,
  ManageGeneralLedger,
} from "./Transactions/GeneralLedger";
import {
  CreateBusinessPlace,
  ManageBusinessPlace,
} from "./Transactions/BusinessPlace";
import { CreateCostCenter, ManageCostCenter } from "./Transactions/CostCenter";
import { CreateLocation, ManageLocation } from "./Transactions/Location";
import { CreatePlant, ManagePlant } from "./Transactions/Plant";
import {
  CreateRevenueCenter,
  ManageRevenueCenter,
} from "./Transactions/RevenueCenter";
import { CreateAssetGroup, ManageAssetGroup } from "./Transactions/AssetGroup";
import { CreateAsset, ManageAsset } from "./Transactions/Asset";
import {
  CreateAssetDevelopmentOrder,
  ManageAssetDevelopmentOrder,
} from "./Transactions/AssetDevelopmentOrder";
import { CreateWageType, ManageWageType } from "./Transactions/WageTypes";
import { CreateEmployee, ManageEmployee } from "./Transactions/Employee";
import { ManageHolidays } from "./Transactions/Holidays";
import { ManageAttendance } from "./Transactions/Attendance";
import {
  CreateMaterialGroup,
  ManageMaterialGroup,
} from "./Transactions/MaterialGroup";
import {
  CreateServiceGroup,
  ManageServiceGroup,
} from "./Transactions/ServiceGroup";
import { CreateMaterial, ManageMaterial } from "./Transactions/Material";
import { CreateService, ManageService } from "./Transactions/Service";
import {
  CreateEmployeeGroup,
  ManageEmployeeGroup,
} from "./Transactions/EmployeeGroup";
import {
  CreateCustomerGroup,
  ManageCustomerGroup,
} from "./Transactions/CustomerGroup";
import {
  CreateVendorGroup,
  ManageVendorGroup,
} from "./Transactions/VendorGroup";
import {
  CreateWithholdingTax,
  ManageWithholdingTax,
} from "./Transactions/WithholdingTax";
import {
  CreateBusinessTaxCode,
  ManageBusinessTaxCode,
} from "./Transactions/BusinessTaxCode";
import { ManageExchangeRates } from "./Transactions/ExchangeRates";
import { CreateCustomer, ManageCustomer } from "./Transactions/Customer";
import { CreateVendor, ManageVendor } from "./Transactions/Vendor";
import {
  CreateBankAccount,
  ManageBankAccount,
} from "./Transactions/BankAccount";
import {
  CreateVirtualAccount,
  ManageVirtualAccount,
} from "./Transactions/VirtualAccount";
import { FaGear, FaUser } from "react-icons/fa6";
import { ManageLedgerAssignment } from "./Transactions/LedgerAssignment";
import { CreatePurchaseOrder } from "./Transactions/PurchaseOrder";
import { PurchaseOrder } from "./classes";
import { createPortal } from "react-dom";
import { CreateSaleOrder } from "./Transactions/SaleOrder";
import { CreateProductionOrder } from "./Transactions/ProductionOrder";
import { CreateProcessOrder } from "./Transactions/ProcessOrder";
import { CreateMaintenanceOrder } from "./Transactions/MaintenanceOrder";
import { CreateStockTransportOrder } from "./Transactions/StockTransportOrder";
import { Authentication } from "./Transactions/Authentication";
import { QueryMaterialMovements } from "./Transactions/MaterialMovements";
import { QueryMaterialDocument } from "./Transactions/MaterialDocument";
import { QueryAccountingDocument } from "./Transactions/AccountingDocument";
import { ConsignmentInwardsOriginPO } from "./Transactions/Material/M01";

const codes = [
  {
    code: "test",
    screen: <Window />,
    window: <Scratch />,
    name: "Test",
    group: "System",
    subgroup: "General",
  },
  {
    code: "accs",
    screen: <Window />,
    window: <Accessibility />,
    name: "Accessibility",
    group: "System",
    subgroup: "General",
  },
  {
    code: "ccoa",
    screen: <Window />,
    window: <CreateChartofAccounts />,
    name: "Create Chart of Accounts",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "mcoa",
    screen: <Window />,
    window: <ManageChartofAccounts />,
    name: "Manage Chart of Accounts",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "cfsc",
    screen: <Window />,
    window: <CreateFinancialStatementStructure />,
    name: "Create Financial Statement Structure",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "mfsc",
    screen: <Window />,
    window: <ManageFinancialStatementStructure />,
    name: "Manage Financial Statement Structure",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "cggl",
    screen: <Window />,
    window: <CreateGroupGeneralLedger />,
    name: "Create Group General Ledger",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "mggl",
    screen: <Window />,
    window: <ManageGroupGeneralLedger />,
    name: "Manage Group General Ledger",
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
    code: "cinc",
    screen: <Window />,
    window: <CreateInterestCode />,
    name: "Create Interest Code",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "minc",
    screen: <Window />,
    window: <ManageInterestCode />,
    name: "Manage Interest Code",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "cpt",
    screen: <Window />,
    window: <CreatePaymentTerms />,
    name: "Create Payment Terms",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "mpt",
    screen: <Window />,
    window: <ManagePaymentTerms />,
    name: "Manage Payment Terms",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "cur",
    screen: <Window />,
    window: <TableCurrencies />,
    name: "Table Currencies",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "hsn",
    screen: <Window />,
    window: <TableHSN />,
    name: "Table HSN",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "seg",
    screen: <Window />,
    window: <TableSegments />,
    name: "Table Segments",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "unit",
    screen: <Window />,
    window: <TableUnits />,
    name: "Table Units",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "ccom",
    screen: <Window />,
    window: <CreateCompany />,
    name: "Create Company",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "mcom",
    screen: <Window />,
    window: <ManageCompany />,
    name: "Manage Company",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "cbp",
    screen: <Window />,
    window: <CreateBusinessPlace />,
    name: "Create Business Place",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "mbp",
    screen: <Window />,
    window: <ManageBusinessPlace />,
    name: "Manage Business Place",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "cpc",
    screen: <Window />,
    window: <CreateProfitCenter />,
    name: "Create Profit Center",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "mpc",
    screen: <Window />,
    window: <ManageProfitCenter />,
    name: "Manage Profit Center",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "ccc",
    screen: <Window />,
    window: <CreateCostCenter />,
    name: "Create Cost Center",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "mcc",
    screen: <Window />,
    window: <ManageCostCenter />,
    name: "Manage Cost Center",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "cloc",
    screen: <Window />,
    window: <CreateLocation />,
    name: "Create Location",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "mloc",
    screen: <Window />,
    window: <ManageLocation />,
    name: "Manage Location",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "cplt",
    screen: <Window />,
    window: <CreatePlant />,
    name: "Create Plant",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "mplt",
    screen: <Window />,
    window: <ManagePlant />,
    name: "Manage Plant",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "crc",
    screen: <Window />,
    window: <CreateRevenueCenter />,
    name: "Create Revenue Center",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "mrc",
    screen: <Window />,
    window: <ManageRevenueCenter />,
    name: "Manage Revenue Center",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "sop",
    screen: <Window />,
    window: <ManageOpenPeriods />,
    name: "Set Open Periods",
    group: "Control",
    subgroup: "Company",
  },
  {
    code: "cgl",
    screen: <Window />,
    window: <CreateGeneralLedger />,
    name: "Create General Ledger",
    group: "Control",
    subgroup: "Financial Accounting",
  },
  {
    code: "mgl",
    screen: <Window />,
    window: <ManageGeneralLedger />,
    name: "Manage General Ledger",
    group: "Control",
    subgroup: "Financial Accounting",
  },
  {
    code: "lst",
    screen: <Window />,
    window: <ManageLedgerAssignment />,
    name: "Ledger Assignment",
    group: "Control",
    subgroup: "Financial Accounting",
  },
  {
    code: "cag",
    screen: <Window />,
    window: <CreateAssetGroup />,
    name: "Create Asset Group",
    group: "Control",
    subgroup: "Asset Accounting",
  },
  {
    code: "mag",
    screen: <Window />,
    window: <ManageAssetGroup />,
    name: "Manage Asset Group",
    group: "Control",
    subgroup: "Asset Accounting",
  },
  {
    code: "cast",
    screen: <Window />,
    window: <CreateAsset />,
    name: "Create Asset",
    group: "Control",
    subgroup: "Asset Accounting",
  },
  {
    code: "mast",
    screen: <Window />,
    window: <ManageAsset />,
    name: "Manage Asset",
    group: "Control",
    subgroup: "Asset Accounting",
  },
  {
    code: "cado",
    screen: <Window />,
    window: <CreateAssetDevelopmentOrder />,
    name: "Create Asset Development Order",
    group: "Control",
    subgroup: "Asset Accounting",
  },
  {
    code: "mado",
    screen: <Window />,
    window: <ManageAssetDevelopmentOrder />,
    name: "Manage Asset Development Order",
    group: "Control",
    subgroup: "Asset Accounting",
  },
  {
    code: "cwt",
    screen: <Window />,
    window: <CreateWageType />,
    name: "Create Wage Type",
    group: "Control",
    subgroup: "Human Resources",
  },
  {
    code: "mwt",
    screen: <Window />,
    window: <ManageWageType />,
    name: "Manage Wage Type",
    group: "Control",
    subgroup: "Human Resources",
  },
  {
    code: "ceg",
    screen: <Window />,
    window: <CreateEmployeeGroup />,
    name: "Create Employee Group",
    group: "Control",
    subgroup: "Human Resources",
  },
  {
    code: "meg",
    screen: <Window />,
    window: <ManageEmployeeGroup />,
    name: "Manage Employee Group",
    group: "Control",
    subgroup: "Human Resources",
  },
  {
    code: "cemp",
    screen: <Window />,
    window: <CreateEmployee />,
    name: "Create Employee",
    group: "Control",
    subgroup: "Human Resources",
  },
  {
    code: "memp",
    screen: <Window />,
    window: <ManageEmployee />,
    name: "Manage Employee",
    group: "Control",
    subgroup: "Human Resources",
  },
  {
    code: "holi",
    screen: <Window />,
    window: <ManageHolidays />,
    name: "Holidays",
    group: "Control",
    subgroup: "Human Resources",
  },
  {
    code: "cmg",
    screen: <Window />,
    window: <CreateMaterialGroup />,
    name: "Create Material Group",
    group: "Control",
    subgroup: "Materials and Services",
  },
  {
    code: "mmg",
    screen: <Window />,
    window: <ManageMaterialGroup />,
    name: "Manage Material Group",
    group: "Control",
    subgroup: "Materials and Services",
  },
  {
    code: "csg",
    screen: <Window />,
    window: <CreateServiceGroup />,
    name: "Create Service Group",
    group: "Control",
    subgroup: "Materials and Services",
  },
  {
    code: "msg",
    screen: <Window />,
    window: <ManageServiceGroup />,
    name: "Manage Service Group",
    group: "Control",
    subgroup: "Materials and Services",
  },
  {
    code: "cmat",
    screen: <Window />,
    window: <CreateMaterial />,
    name: "Create Material",
    group: "Control",
    subgroup: "Materials and Services",
  },
  {
    code: "mmat",
    screen: <Window />,
    window: <ManageMaterial />,
    name: "Manage Material",
    group: "Control",
    subgroup: "Materials and Services",
  },
  {
    code: "cser",
    screen: <Window />,
    window: <CreateService />,
    name: "Create Service",
    group: "Control",
    subgroup: "Materials and Services",
  },
  {
    code: "mser",
    screen: <Window />,
    window: <ManageService />,
    name: "Manage Service",
    group: "Control",
    subgroup: "Materials and Services",
  },
  {
    code: "ccg",
    screen: <Window />,
    window: <CreateCustomerGroup />,
    name: "Create Customer Group",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "mcg",
    screen: <Window />,
    window: <ManageCustomerGroup />,
    name: "Manage Customer Group",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "cvg",
    screen: <Window />,
    window: <CreateVendorGroup />,
    name: "Create Vendor Group",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "mvg",
    screen: <Window />,
    window: <ManageVendorGroup />,
    name: "Manage Vendor Group",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "ccus",
    screen: <Window />,
    window: <CreateCustomer />,
    name: "Create Customer",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "mcus",
    screen: <Window />,
    window: <ManageCustomer />,
    name: "Manage Customer",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "cven",
    screen: <Window />,
    window: <CreateVendor />,
    name: "Create Vendor",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "mven",
    screen: <Window />,
    window: <ManageVendor />,
    name: "Manage Vendor",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "cbk",
    screen: <Window />,
    window: <CreateBankAccount />,
    name: "Create Bank Account",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "mbk",
    screen: <Window />,
    window: <ManageBankAccount />,
    name: "Manage Bank Account",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "cvan",
    screen: <Window />,
    window: <CreateVirtualAccount />,
    name: "Create Virtual Account",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "mvan",
    screen: <Window />,
    window: <ManageVirtualAccount />,
    name: "Manage Virtual Account",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "cbtc",
    screen: <Window />,
    window: <CreateBusinessTaxCode />,
    name: "Create Business Tax Code",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "mbtc",
    screen: <Window />,
    window: <ManageBusinessTaxCode />,
    name: "Manage Business Tax Code",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "cwht",
    screen: <Window />,
    window: <CreateWithholdingTax />,
    name: "Create Withholding Tax",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "mwht",
    screen: <Window />,
    window: <ManageWithholdingTax />,
    name: "Manage Withholding Tax",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "exr",
    screen: <Window />,
    window: <ManageExchangeRates />,
    name: "Exchange Rates",
    group: "Control",
    subgroup: "Payables and Receivables",
  },
  {
    code: "po",
    screen: <Window />,
    window: <CreatePurchaseOrder />,
    name: "Purchase Order",
    group: "Control",
    subgroup: "Controlling",
  },
  {
    code: "so",
    screen: <Window />,
    window: <CreateSaleOrder />,
    name: "Sale Order",
    group: "Control",
    subgroup: "Controlling",
  },
  {
    code: "prod",
    screen: <Window />,
    window: <CreateProductionOrder />,
    name: "Production Order",
    group: "Control",
    subgroup: "Controlling",
  },
  {
    code: "proc",
    screen: <Window />,
    window: <CreateProcessOrder />,
    name: "Process Order",
    group: "Control",
    subgroup: "Controlling",
  },
  {
    code: "mo",
    screen: <Window />,
    window: <CreateMaintenanceOrder />,
    name: "Maintenance Order",
    group: "Control",
    subgroup: "Controlling",
  },
  {
    code: "sto",
    screen: <Window />,
    window: <CreateStockTransportOrder />,
    name: "Stock Transport Order",
    group: "Control",
    subgroup: "Controlling",
  },
  {
    code: "atc",
    screen: <Window />,
    window: <ManageAttendance />,
    name: "Attendance",
    group: "Record",
    subgroup: "Human Resources",
  },
  {
    code: "m01",
    screen: <Window />,
    window: <ConsignmentInwardsOriginPO />,
    name: "Consignment Inwards Origin - PO",
    group: "Record",
    subgroup: "Materials and Services",
  },
  {
    code: "vmd",
    screen: <Window />,
    window: <QueryMaterialDocument />,
    name: "View Material Document",
    group: "Report",
    subgroup: "Materials and Services",
  },
  {
    code: "mms",
    screen: <Window />,
    window: <QueryMaterialMovements />,
    name: "Material Movements",
    group: "Report",
    subgroup: "Materials and Services",
  },
  {
    code: "vad",
    screen: <Window />,
    window: <QueryAccountingDocument />,
    name: "View Accounting Document",
    group: "Report",
    subgroup: "Financial Accounting",
  },
  {
    code: "simtax",
    screen: <Window />,
    window: <IncomeTaxSimulate />,
    name: "Income Tax Simulation",
    group: "Report",
    subgroup: "Application",
  },
  {
    code: "json",
    screen: <Window />,
    window: <JSONEditor />,
    name: "JSON Editor",
    group: "Report",
    subgroup: "Application",
  },
];

export function Window() {
  const {
    window: { visible, content },
    closeWindow,
    addRef,
  } = useInterface();

  if (!visible) {
    return null;
  }

  const style = {
    width: "min(100%, 1200px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    color: "inherit",
    height: "100%",
    overflow: "auto",
  };

  return (
    <WindowContext.Provider value="static">
      <div style={style}>{content}</div>
    </WindowContext.Provider>
  );
}

function FloatingWindow() {
  const {
    floatingwindow: { visible, window },
    closeFloat,
  } = useInterface();

  const nodeRef = useRef(null);

  const style = {
    position: "fixed",
    zIndex: 999,
    top: "10%",
    maxHeight: "80%",
    padding: "10px",
    background: "var(--bluet)",
    boxShadow: "0px 2px 10px -5px black",
    color: "white",
    width: "min(90%,480px)",
    borderRadius: "15px",
    gap: "10px",
    backdropFilter: "blur(30px)",
    display: "flex",
    flexDirection: "column",
    margin: "10px",
  };

  const contentStyle = {
    padding: "10px",
    resize: "vertical",
    overflow: "auto",
  };

  if (!visible) return null;

  return (
    <WindowContext.Provider value="float">
      <Draggable nodeRef={nodeRef} handle=".drag">
        <div style={style} ref={nodeRef}>
          <div>
            <Row cn="floatTopbar" borderBottom="none">
              <button className="drag">
                <FaArrowsAlt />
              </button>
              <button onClick={() => closeFloat()}>
                <FaTimes />
              </button>
            </Row>
          </div>
          <div style={contentStyle} className="floatingWindowContent">
            {window}
          </div>
        </div>
      </Draggable>
    </WindowContext.Provider>
  );
}

function Alert() {
  const {
    alert: { visible, message, type },
    closeAlert,
    accessibility: { Font },
  } = useInterface();

  if (!visible) return null;

  const style = {
    position: "fixed",
    zIndex: "1050",
    maxHeight: "60%",
    padding: "20px",
    background: "var(--whitet)",
    border: "5px solid var(--whitet)",
    color: "var(--blue)",
    boxShadow: "0px 2px 10px -5px gray",
    width: "min(90%,480px)",
    borderRadius: "15px",
    gap: "20px",
    backdropFilter: "blur(30px)",
    display: "flex",
    flexDirection: "column",
    fontFamily: Font,
  };

  return createPortal(
    <Overlay onClick={() => closeAlert()}>
      <div style={style}>
        <h3 style={{ margin: "0", textAlign: "center" }}>{type}</h3>
        <p style={{ margin: "0", textAlign: "center" }}>{message}</p>
        <CenterFlex>
          <Button name="OK" functionsArray={[() => closeAlert()]} />
        </CenterFlex>
      </div>
    </Overlay>,
    document.body,
  );
}

function Confirm() {
  const {
    confirm: { visible, message, onCancel, onConfirm },
    closeConfirm,
  } = useInterface();

  if (!visible) return null;

  const style = {
    position: "fixed",
    zIndex: "1010",
    maxHeight: "60%",
    padding: "20px",
    background: "var(--whitet)",
    border: "5px solid var(--whitet)",
    color: "var(--blue)",
    boxShadow: "0px 2px 10px -5px gray",
    width: "min(90%,480px)",
    borderRadius: "15px",
    gap: "20px",
    backdropFilter: "blur(30px)",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <Overlay>
      <FocusTrap
        focusTrapOptions={{
          escapeDeactivates: false,
          clickOutsideDeactivates: false,
        }}
      >
        <div style={style}>
          <h3 style={{ margin: "0", textAlign: "center" }}>Are you sure?</h3>
          <p style={{ margin: "0", textAlign: "center" }}>{message}</p>
          <CenterFlex>
            <Button
              name="Cancel"
              functionsArray={[...onCancel, () => closeConfirm()]}
            />
            <Button
              name="Confirm"
              functionsArray={[...onConfirm, () => closeConfirm()]}
            />
          </CenterFlex>
        </div>
      </FocusTrap>
    </Overlay>
  );
}

function Prompt() {
  const {
    prompt: { visible, content },
  } = useInterface();

  const style = {
    position: "fixed",
    zIndex: "800",
    bottom: "20%",
    maxHeight: "60%",
    padding: "20px",
    background: "var(--whitet)",
    border: "5px solid var(--whitet)",
    color: "var(--blue)",
    boxShadow: "0px 2px 10px -5px gray",
    width: "min(90%,480px)",
    borderRadius: "15px",
    gap: "20px",
    backdropFilter: "blur(30px)",
    display: "flex",
    flexDirection: "column",
  };

  if (!visible) return null;
  return (
    <Overlay>
      <FocusTrap
        focusTrapOptions={{
          escapeDeactivates: false,
          clickOutsideDeactivates: false,
        }}
      >
        <div style={style}>{content}</div>
      </FocusTrap>
    </Overlay>
  );
}

function SearchBar() {
  const { showAlert, setscreen, addRef, openWindow, openFloat } =
    useInterface();
  const [code, setcode] = useState("");

  const go = (windowcode) => {
    const result = codes.find((item) => item.code === windowcode.toLowerCase());
    if (result) {
      openWindow(result.window);
    } else {
      showAlert(
        "The code entered is not yet configured. Please retry!",
        "Error",
      );
    }
    setcode("");
  };

  const overlayStyle = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };

  const style = {
    padding: "10px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "100%",
    gap: "10px",
    overflow: "visible",
    border: "2px solid var(--bluet)",
    background: "var(--bluet)",
    borderTop: "none",
    borderBottomLeftRadius: "15px",
    borderBottomRightRadius: "15px",
  };

  const searchAreaStyle = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0px 5px",
    borderRadius: "10px",
    gap: "5px",
    background: "white",
    height: "100%",
  };

  const buttonStyle = {
    aspectRatio: "1/1",
    width: "100%",
    border: "3px solid var(--bluet)",
    borderRadius: "50%",
  };

  const insideButtonStyle = {
    borderRadius: "50%",
    aspectRatio: "1/1",
    background: "none",
    border: "none",
    color: "var(--bluet)",
    boxShadow: "none",
  };

  return (
    <div style={overlayStyle}>
      <div style={style}>
        <Button
          style={buttonStyle}
          name={<FaHome />}
          functionsArray={[() => setscreen(<Home />)]}
          setRef={(element) => addRef("Home", element)}
        />
        <div className="searchArea" style={searchAreaStyle}>
          <button tabIndex={-1} style={insideButtonStyle}>
            <FaSearch />
          </button>
          <AutoSuggestInput
            suggestions={ListItems(codes, "code")}
            captions={ListItems(codes, "name")}
            value={code}
            process={(value) => setcode(value)}
            placeholder="Go to . . ."
            setRef={(element) => addRef("SearchArea", element)}
            onSelect={(value) => go(value)}
          />
          <button style={insideButtonStyle} onClick={() => go(code)}>
            <FaArrowRight />
          </button>
        </div>

        <Button
          name={<FaChild />}
          style={buttonStyle}
          functionsArray={[() => openFloat(<Accessibility />)]}
          setRef={(element) => addRef("Accessibility", element)}
        />
      </div>
    </div>
  );
}

function Accessibility() {
  const {
    accessibility: { Background, Font },
    changeAccessibility,
    resetAccessibility,
    saveAccessibility,
    closeFloat,
    closeWindow,
  } = useInterface();

  const windowtype = useWindowType();

  return (
    <>
      <WindowTitle
        title={"Accessibility"}
        menu={[
          <ConditionalButton
            name="Save"
            result={windowtype === "static"}
            whileFalse={[() => saveAccessibility(), () => closeFloat()]}
            whileTrue={[() => saveAccessibility(), () => closeWindow()]}
          />,
          <Button name="Reset" functionsArray={[() => resetAccessibility()]} />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <TopFlex>
            <Label label={"Background"} />
            <Radio
              value={Background}
              process={(value) => changeAccessibility("Background", value)}
              options={["Fabric", "Tech"]}
            />
          </TopFlex>
          <TopFlex>
            <Label label={"Font"} />
            <Radio
              value={Font}
              process={(value) => changeAccessibility("Font", value)}
              options={["Helvetica", "Lexend"]}
            />
          </TopFlex>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function Home() {
  const { setscreen, checkauthentication } = useInterface();

  const style = {
    borderRadius: "25px",
    padding: "0px 20px",
    height: "85%",
    overflow: "auto",
    gap: "35px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };

  const titleStyle = {
    textAlign: "left",
    cursor: "pointer",
    margin: "0",
    color: "var(--blue)",
  };

  const menusStyle = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  };

  const menuStyle = {
    aspectRatio: "1/1",
    borderRadius: "50%",
    width: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    cursor: "pointer",
    transition: "0.5s",
    padding: "5px",
    color: "white",
  };

  const Menu = ({ name, drawer, color }) => {
    return (
      <div
        className={`menu`}
        style={{
          ...menuStyle,
          ...{
            background: `var(--${color}t)`,
          },
        }}
        tabIndex={0}
        onKeyDown={(e) => clickButton(e)}
        onClick={() => setscreen(<Drawer initial={drawer} />)}
      >
        <h3>{name}</h3>
      </div>
    );
  };
  return (
    <div style={style}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottom: "2px solid var(--bluet)",
          alignItems: "flex-end",
          padding: "10px 5px",
          width: "min(100%,400px)",
        }}
      >
        <h2 className="home-title" style={titleStyle}>
          C O M P O U N D S
        </h2>
        <div>
          <FaPowerOff
            cursor={"Pointer"}
            onClick={() => {
              logout();
              checkauthentication();
            }}
            padding="0px"
            width={"100%"}
            color="var(--redt)"
          />
        </div>
      </div>
      <div style={menusStyle}>
        <Menu name="Record" color="green" drawer="Record" />
        <Menu name="Control" color="red" drawer="Control" />
        <Menu name="Report" color="blue" drawer="Report" />
      </div>
    </div>
  );
}

export function Drawer({ initial = "Record" }) {
  const [group, setgroup] = useState(initial);
  const { openWindow, setscreen } = useInterface();
  const transactions = codes.filter((code) => code.group === group);
  const subgroups = ListUniqueItems(transactions, "subgroup");
  const transactionsInSubgroup = (subgroup) => {
    return transactions.filter((code) => code.subgroup === subgroup);
  };

  const style = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    width: "min(100%,1020px)",
    color: "var(--blue)",
    padding: "0",
    gap: "10px",
    height: "100%",
  };

  const titleStyle = {
    width: "min(100%,450px)",
    textAlign: "left",
    margin: "10px",
  };

  const subgroupsStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    alignItems: "start",
    padding: "10px 0px",
    transition: "0.5s",
    width: "100%",
  };

  const transactionsStyle = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "left",
    overflow: "auto",
    gap: "0px",
    rowGap: "5px",
    height: "fit-content",
    padding: "15px",
    width: "100%",
  };

  const iconStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    borderRadius: "10px",
    transition: "0.5s",
    cursor: "pointer",
    textAlign: "center",
    aspectRatio: "1 / 1",
    padding: "10px",
    backdropFilter: "blur(3px)",
  };

  const NavButton = ({ name }) => {
    return (
      <Button
        name={name}
        className={group === name ? "drawerButtonSelected" : "drawerButton"}
        functionsArray={[() => setgroup(name)]}
      />
    );
  };

  const Icon = ({ name, code, window }) => {
    return (
      <div
        className="icon"
        tabIndex={0}
        onKeyDown={(e) => clickButton(e)}
        onClick={() => openWindow(window)}
        style={iconStyle}
      >
        <h4 style={{ width: "120px", margin: "0" }}>{name}</h4>
        <p>{code.toUpperCase()}</p>
      </div>
    );
  };

  return (
    <div style={style}>
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottom: "2px solid var(--bluet)",
            width: "min(100%,840px)",
            gap: "10px",
            padding: "0px 0px",
            position: "sticky",
            top: "0",
          }}
        >
          <div
            style={{
              overflowX: "hidden",
              display: "flex",
              flexDirection: "row",
              justifyContent: "left",
            }}
          >
            <NavButton name={"Record"} />
            <NavButton name={"Control"} />
            <NavButton name={"Report"} />
            <NavButton name={"System"} />
          </div>
          <div style={{ padding: "5px" }}>
            <Button
              name={`Close`}
              className="drawerButton closeButton"
              functionsArray={[() => setscreen(<Home />)]}
            />
          </div>
        </div>
      </div>
      <div style={{ height: "100%", overflow: "auto", padding: "10px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "top",
          }}
        >
          {subgroups.map((subgroup) => (
            <div style={subgroupsStyle}>
              <h4 style={titleStyle}>{subgroup}</h4>
              <div style={transactionsStyle}>
                {transactionsInSubgroup(subgroup).map((transaction) => (
                  <Icon
                    name={transaction.name}
                    code={transaction.code}
                    window={transaction.window}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserInterface() {
  const {
    screen,
    setscreen,
    window,
    floatingwindow,
    accessibility,
    resetAccessibility,
    authenticated,
    keyRefs,
  } = useInterface();

  const { Background, Font } = accessibility;

  useEffect(() => resetAccessibility(), [window, floatingwindow]);

  const style = {
    position: "fixed",
    top: "0",
    left: "0",
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    alignItems: "center",
    backgroundSize: Background === "Tech" ? "20%" : "10%",
    backgroundColor: "var(--lightgray)",
    backgroundImage: `url('../${Background}.png')`,
    fontFamily: `${Font},'Arial', Tahoma, Geneva, Verdana, sans-serif`,
    color: "var(--blue)",
  };

  const screenStyle = {
    height: "100%",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    alignItems: "center",
    width: "100%",
    padding: "10px 15px",
    paddingBottom: 0,
  };

  const shortcuts = [
    { key: "h", action: () => keyRefs.current["Home"].click() },
    { key: "g", action: () => keyRefs.current["SearchArea"].focus() },
    { key: "a", action: () => keyRefs.current["Accessibility"].click() },
    { key: "f", action: () => keyRefs.current["CloseFloat"].click() },
  ];
  const keyDownHandler = (e) => {
    if (e.altKey && ListItems(shortcuts, "key").includes(e.key)) {
      e.preventDefault();
      shortcuts.find((shortcut) => shortcut.key === e.key).action();
    }
  };

  return (
    <div
      style={style}
      className="container"
      onKeyDown={(e) => keyDownHandler(e)}
      tabIndex={0}
    >
      {authenticated && (
        <>
          <FloatingWindow />
          <Confirm />
          <Alert />
          <Prompt />
          <SearchBar />
          <div className="screen" style={screenStyle}>
            {screen}
          </div>
        </>
      )}
      {!authenticated && (
        <>
          <Alert />
          <Authentication />
        </>
      )}
    </div>
  );
}

export default UserInterface;
