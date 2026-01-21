import { useEffect, useState } from "react";
import {
  Label,
  Input,
  Option,
  Radio,
  CheckBox,
  Button,
  ConditionalButton,
  WindowTitle,
  WindowContent,
  DisplayArea,
  Row,
  Column,
  Table,
  AutoSuggestInput,
  HidingDisplay,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { Company, LedgerAssignment, GeneralLedger } from "../classes";

export function ManageLedgerAssignment() {
  const [company, setcompany] = useState("");
  const collection = new Company(company);
  const assignments = new LedgerAssignment(company);
  const { openWindow, openConfirm, showAlert } = useInterface();

  return (
    <>
      <WindowTitle
        title={"Ledger Assignment"}
        menu={[
          <ConditionalButton
            name={"Set"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Company does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <SetLedgerAssignment initial={assignments.getData()} />,
                ),
            ]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row overflow="visible">
            <Label label={"Company"} />
            <AutoSuggestInput
              value={company}
              process={(value) => setcompany(value)}
              onSelect={(value) => setcompany(value)}
              suggestions={collection.listAll("Code")}
              captions={collection.listAll("Name")}
              placeholder={"Enter Company Code"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function SetLedgerAssignment({ initial }) {
  const {
    data,
    setdata,
    reset,
    changeData,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { errorsExist, DisplayHidingError, addError, clearErrors } = useError();
  const { openWindow, showAlert } = useInterface();
  const { Company, GLDisc, GLIntC, GLIntD, GLForexG, GLForexL } = data;
  const collection = new LedgerAssignment(Company);
  const ledgers = new GeneralLedger("", Company);
  useEffect(() => {
    clearErrors();
    const gls = [GLDisc, GLForexG, GLForexL, GLIntC, GLIntD];
    gls.forEach((gl, g) => {
      addError(
        !new GeneralLedger(gl, Company).exists(),
        "General Ledger",
        `General Ledger ${gl} does not exist.`,
      );
    });
  }, [data]);
  return (
    <>
      <WindowTitle
        title={"Ledger Assignment"}
        menu={[
          <ConditionalButton
            name="Save"
            result={!errorsExist}
            whileFalse={[() => showAlert("Meassages exist. Please check.")]}
            whileTrue={[
              () => showAlert(collection.update(data)),
              () => openWindow(<ManageLedgerAssignment />),
            ]}
          />,
          <DisplayHidingError />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Company"} /> <label>{Company}</label>
          </Row>
          <Row overflow="visible">
            <Label label={"General Ledger - Discount"} />{" "}
            <AutoSuggestInput
              value={GLDisc}
              process={(value) => changeData("", "GLDisc", value)}
              suggestions={ledgers.listAllFromCompany("Code")}
              captions={ledgers.listAllFromCompany("Description")}
              placeholder={"Enter General Ledger"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"General Ledger - Interest (Credit)"} />{" "}
            <AutoSuggestInput
              value={GLIntC}
              process={(value) => changeData("", "GLIntC", value)}
              suggestions={ledgers.listAllFromCompany("Code")}
              captions={ledgers.listAllFromCompany("Description")}
              placeholder={"Enter General Ledger"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"General Ledger - Interest (Debit)"} />{" "}
            <AutoSuggestInput
              value={GLIntD}
              process={(value) => changeData("", "GLIntD", value)}
              suggestions={ledgers.listAllFromCompany("Code")}
              captions={ledgers.listAllFromCompany("Description")}
              placeholder={"Enter General Ledger"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"General Ledger - Forex Gain"} />{" "}
            <AutoSuggestInput
              value={GLForexG}
              process={(value) => changeData("", "GLForexG", value)}
              suggestions={ledgers.listAllFromCompany("Code")}
              captions={ledgers.listAllFromCompany("Description")}
              placeholder={"Enter General Ledger"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"General Ledger - Forex Loss"} />{" "}
            <AutoSuggestInput
              value={GLForexL}
              process={(value) => changeData("", "GLForexL", value)}
              suggestions={ledgers.listAllFromCompany("Code")}
              captions={ledgers.listAllFromCompany("Description")}
              placeholder={"Enter General Ledger"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
