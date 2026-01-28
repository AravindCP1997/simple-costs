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
import { dateInYear, dateString, perform, TimeStamp } from "./functions";
import { MaterialTable } from "./businessFunctions";
import { MaterialDocuments } from "./Transactions/MaterialDocuments";

export function Scratch() {
  const { showAlert } = useInterface();
  const [key, setkey] = useState("");
  const [value, setvalue] = useState("");
  const pc = new ProfitCenter("A", "ABC");
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
          <Row>
            <Button
              name={"ADD Transaction"}
              functionsArray={[
                () => {
                  const { result, TransactionNo } = new Transaction(
                    "ABC",
                    2025,
                    "",
                    "MG",
                  ).add({
                    Company: "ABC",
                    Year: 2025,
                    Type: "MG",
                    name: "aravind",
                  });
                  perform(
                    () => showAlert(TransactionNo),
                    result,
                    showAlert("Some error occurred!"),
                  );
                },
              ]}
            />
          </Row>
        </DisplayArea>
        {JSON.stringify(new MaterialReceipt("ABC", 2025, 4).exists())}
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
