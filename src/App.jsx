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
} from "./Components";
import UserInterface, { Home } from "./UserInterface";
import { useState } from "react";
import {
  AccountingDocument,
  Asset,
  AssetGroup,
  Attendance,
  Company,
  GeneralLedger,
  GroupGeneralLedger,
  Holidays,
  LedgerAssignment,
  MaterialDocument,
  MaterialReceipt,
  ProfitCenter,
  PurchaseOrder,
  Segments,
  StockTransportOrder,
  Transaction,
  YearlyCompanyCollection,
} from "./classes";
import { FaHome } from "react-icons/fa";
import {
  dateInYear,
  dateString,
  filterBySelection,
  perform,
  TimeStamp,
  transformObject,
  trimSelection,
} from "./functions";
import { MaterialTable } from "./businessFunctions";
import useData from "./useData";
import { defaultSelection } from "./defaults";

export function Scratch() {
  const { showAlert } = useInterface();
  const { setscreen } = useInterface();
  const { data, changeData } = useData({ loc: defaultSelection });
  const random = [{ Name: "Kohli" }, { Name: "Dhoni" }];
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
