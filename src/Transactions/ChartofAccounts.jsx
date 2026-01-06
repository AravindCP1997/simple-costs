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
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { ChartOfAccounts } from "../classes";
import { Collection } from "../Database";
import { rangeOverlap } from "../functions";
import { sampleChartOfAccounts } from "../samples";

export function CreateChartofAccounts({
  initial = {
    Code: "",
    GLNumbering: [
      { LedgerType: "Asset", From: "", To: "" },
      { LedgerType: "Equity", From: "", To: "" },
      { LedgerType: "Liability", From: "", To: "" },
      { LedgerType: "Income", From: "", To: "" },
      { LedgerType: "Expense", From: "", To: "" },
    ],
    Status: "Draft",
  },
}) {
  const { data, changeData, reset, setdata } = useData(initial);
  const { Code, GLNumbering, Status } = data;
  const { showAlert, openWindow } = useInterface();
  const isFloat = useWindowType() === "float";
  const { addError, clearErrors, errorsExist, DisplayHidingError } = useError();
  const collection = new ChartOfAccounts(Code);

  useEffect(() => {
    clearErrors();
    addError(Code === "", "Code", "Code cannot be blank.");
    addError(
      Code !== "" && collection.exists(),
      "Code",
      "Chart of accounts with same code already exists."
    );
    GLNumbering.forEach((numbering, n) => {
      const { From, To, LedgerType } = numbering;
      addError(
        From === "" || To === "",
        "GLNumbering",
        `For ${LedgerType}, range incomplete.`
      );
      addError(
        From > To,
        "GLNumbering",
        `For ${LedgerType}, 'From' is greater than 'To'.`
      );
      GLNumbering.forEach((numberingtwo, ntwo) => {
        const { From: Fromtwo, To: Totwo } = numberingtwo;
        addError(
          n !== ntwo &&
            rangeOverlap(
              [Number(From), Number(To)],
              [Number(Fromtwo), Number(Totwo)]
            ),
          "GLNumbering",
          `Range overlaps between ${
            GLNumbering[Math.min(n, ntwo)].LedgerType
          } and ${GLNumbering[Math.max(n, ntwo)].LedgerType}`
        );
      });
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Create Chart of Accounts"}
        menu={[
          <ConditionalButton
            name="Save"
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check!")]}
            whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
          />,
          <Button name={"Reset"} functionsArray={[() => reset()]} />,
          <Button
            name="Sample"
            functionsArray={[() => setdata(sampleChartOfAccounts)]}
          />,
          <DisplayHidingError />,
          <Button
            name={"Manage"}
            functionsArray={[() => openWindow(<ManageChartofAccounts />)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Code"} />
            <Input
              value={Code}
              process={(value) => changeData("", "Code", value)}
              type={"text"}
              maxLength={6}
            />
          </Row>
          <Column>
            <Label label={"General Ledger Numbering"} />
            <Table
              columns={["Ledger Type", "From Range", "To Range"]}
              rows={GLNumbering.map((numbering, n) => [
                <Label label={numbering.LedgerType} />,
                <Input
                  value={numbering.From}
                  process={(value) =>
                    changeData(`GLNumbering/${n}`, "From", value)
                  }
                  type={"number"}
                />,
                <Input
                  value={numbering.To}
                  process={(value) =>
                    changeData(`GLNumbering/${n}`, "To", value)
                  }
                  type={"number"}
                />,
              ])}
            />
          </Column>
          <Row>
            <Label label={"Status"} />
            <Option
              value={Status}
              process={(value) => changeData("", "Status", value)}
              options={["Draft", "Ready", "Blocked"]}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function UpdateChartofAccounts({ Code }) {
  const collection = new ChartOfAccounts(Code);
  const initial = collection.getData();
  const { data, changeData, reset, setdata } = useData(initial);
  const { GLNumbering, Status } = data;
  const { showAlert, openWindow } = useInterface();
  const isFloat = useWindowType() === "float";
  const { addError, clearErrors, errorsExist, DisplayHidingError } = useError();

  useEffect(() => {
    clearErrors();
    GLNumbering.forEach((numbering, n) => {
      const { From, To, LedgerType } = numbering;
      addError(
        From === "" || To === "",
        "GLNumbering",
        `For ${LedgerType}, range incomplete.`
      );
      addError(
        From > To,
        "GLNumbering",
        `For ${LedgerType}, 'From' is greater than 'To'.`
      );
      GLNumbering.forEach((numberingtwo, ntwo) => {
        const { From: Fromtwo, To: Totwo } = numberingtwo;
        addError(
          n !== ntwo &&
            rangeOverlap(
              [Number(From), Number(To)],
              [Number(Fromtwo), Number(Totwo)]
            ),
          "GLNumbering",
          `Range overlaps between ${
            GLNumbering[Math.min(n, ntwo)].LedgerType
          } and ${GLNumbering[Math.max(n, ntwo)].LedgerType}`
        );
      });
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Update Chart of Accounts"}
        menu={[
          <ConditionalButton
            name="Save"
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check!")]}
            whileTrue={[
              () => showAlert(collection.update(data)),
              () => openWindow(<ManageChartofAccounts />),
            ]}
          />,
          <Button name={"Reset"} functionsArray={[() => reset()]} />,
          <Button
            name="Sample"
            functionsArray={[() => setdata(sampleChartOfAccounts)]}
          />,
          <DisplayHidingError />,
          <Button
            name={"Manage"}
            functionsArray={[() => openWindow(<ManageChartofAccounts />)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Code"} />
            <label>{Code}</label>
          </Row>
          <Column>
            <Label label={"General Ledger Numbering"} />
            <Table
              columns={["Ledger Type", "From Range", "To Range"]}
              rows={GLNumbering.map((numbering, n) => [
                <Label label={numbering.LedgerType} />,
                <Input
                  value={numbering.From}
                  process={(value) =>
                    changeData(`GLNumbering/${n}`, "From", value)
                  }
                  type={"number"}
                />,
                <Input
                  value={numbering.To}
                  process={(value) =>
                    changeData(`GLNumbering/${n}`, "To", value)
                  }
                  type={"number"}
                />,
              ])}
            />
          </Column>
          <Row>
            <Label label={"Status"} />
            <Option
              value={Status}
              process={(value) => changeData("", "Status", value)}
              options={["Draft", "Ready", "Blocked"]}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function ViewChartofAccounts({ Code }) {
  const collection = new ChartOfAccounts(Code);
  const data = collection.getData();
  const { GLNumbering, Status } = data;
  const { showAlert, openWindow } = useInterface();
  const isFloat = useWindowType() === "float";

  return (
    <>
      <WindowTitle
        title={"View Chart of Accounts"}
        menu={[
          <Button
            name={"Manage"}
            functionsArray={[() => openWindow(<ManageChartofAccounts />)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Code"} />
            <label>{Code}</label>
          </Row>
          <Column>
            <Label label={"General Ledger Numbering"} />
            <Table
              columns={["Ledger Type", "From Range", "To Range"]}
              rows={GLNumbering.map((numbering, n) => [
                <Label label={numbering.LedgerType} />,
                <label>{numbering.From}</label>,
                <label>{numbering.To}</label>,
              ])}
            />
          </Column>
          <Row>
            <Label label={"Status"} />
            <label>{Status}</label>
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function ManageChartofAccounts() {
  const [Code, setCode] = useState("");
  const { showAlert, openConfirm, openWindow } = useInterface();
  const collection = new ChartOfAccounts(Code);

  return (
    <>
      <WindowTitle
        title={"Manage Chart of Accounts"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateChartofAccounts />)]}
          />,
          <ConditionalButton
            name="View"
            result={Code !== "" && collection.exists()}
            whileFalse={[() => showAlert("Chart of Accounts does not exist.")]}
            whileTrue={[() => openWindow(<ViewChartofAccounts Code={Code} />)]}
          />,
          <ConditionalButton
            name="Update"
            result={
              Code !== "" &&
              collection.exists() &&
              collection.getData().Status === "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Chart of Accounts does not exist, or it is not in draft stage to make changes."
                ),
            ]}
            whileTrue={[
              () => openWindow(<UpdateChartofAccounts Code={Code} />),
            ]}
          />,
          <ConditionalButton
            name="Delete"
            result={
              Code !== "" &&
              collection.exists() &&
              collection.getData().Status === "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Chart of Accounts does not exist, or it is not in draft stage to be deleted."
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the Chart of Accounts",
                  [],
                  [() => showAlert(collection.delete()), () => setCode("")]
                ),
            ]}
          />,
          <ConditionalButton
            name="Copy"
            result={Code !== "" && collection.exists()}
            whileFalse={[() => showAlert("Chart of Accounts does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateChartofAccounts initial={collection.getData()} />
                ),
            ]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row overflow="visible">
            <Label label={"Chart of Accounts"} />
            <AutoSuggestInput
              value={Code}
              process={(value) => setCode(value)}
              onSelect={(value) => setCode(value)}
              suggestions={collection.listAll("Code")}
              placeholder={"Enter Code"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
