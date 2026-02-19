import "./App.css";
import { useInterface, UserInterfaceProvider } from "./useInterface";
import { LocalStorage, Dictionary, Collection } from "./Database";
import {
  Menu,
  Button,
  CollapsingDisplay,
  WindowTitle,
  WindowContent,
  DisplayArea,
  MultiDisplayArea,
  Input,
  Row,
  HidingPrompt,
  HidingDisplay,
  Selection,
  ConditionalDisplays,
  JSONString,
  Table,
} from "./Components";
import UserInterface, { Home } from "./UserInterface";
import { useEffect, useMemo, useState } from "react";
import {
  AccountingDocument,
  Asset,
  AssetGroup,
  Attendance,
  BusinessTaxCode,
  Company,
  ConsignmentInwards,
  Employee,
  ExchangeRates,
  GeneralLedger,
  GroupGeneralLedger,
  Holidays,
  LedgerAssignment,
  MaterialBlockInLocation,
  MaterialDocument,
  MaterialReceipt,
  PaymentTerms,
  ProcessAccountingDocument,
  ProfitCenter,
  PurchaseOrder,
  Region,
  RemunerationCalc,
  RemunerationExpensePosting,
  RemunerationOffcycleCalc,
  RemunerationOffCycleResult,
  RemunerationResult,
  RemunerationRun,
  Segments,
  StockTransportOrder,
  STOIssue,
  Transaction,
  Vendor,
  WageType,
  YearlyCompanyCollection,
} from "./classes";
import { FaHome } from "react-icons/fa";
import {
  dateInYear,
  dateString,
  filter,
  filterByMultipleSelection,
  filterBySelection,
  isFuture,
  monthEnd,
  monthsInYear,
  moveDate,
  perform,
  SumField,
  TimeStamp,
  transformObject,
  trimSelection,
} from "./functions";
import {
  BusinessTaxType,
  EmployeeTable,
  MaterialTable,
  PostedRemunerationTable,
} from "./businessFunctions";
import useData from "./useData";
import { defaultSelection } from "./defaults";
import { useAccounting } from "./useAccounting";

export function Scratch() {
  const { showAlert } = useInterface();
  const { setscreen } = useInterface();

  return (
    <>
      <WindowTitle
        title={"Test Page"}
        menu={[
          <Menu
            title={"Sample Menu"}
            menu={[
              <Button
                name="Sample 1"
                functionsArray={[() => alert("Sample")]}
              />,
            ]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <p>
            As this project is still in development stage, data structures are
            supposed to change frequently. Error may occur (by browser window
            going blank, prohibiting further interactions), when data existing
            in the user storage do not match with updated data structure. Use
            the 'Clear Storage' option, if any such error pops up.
          </p>
          <Row borderBottom="none">
            {" "}
            <Button
              name="Clear Storage"
              functionsArray={[
                () => localStorage.clear(),
                () => showAlert("Cleared!", "Storage"),
              ]}
            />
            <Row jc="right" borderBottom="none">
              Proceed to{" "}
              <Button
                name={<FaHome />}
                functionsArray={[() => setscreen(<Home />)]}
              />
            </Row>
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

function App() {
  return (
    <UserInterfaceProvider>
      <UserInterface />
    </UserInterfaceProvider>
  );
}

export default App;
