import { useState, useContext, useMemo } from "react";

import {
  Input,
  Option,
  Radio,
  DisplayRow,
  DisplayBox,
  DisplayFieldLabel,
  WindowContent,
  WindowTitle,
  LabelledInput,
  NavigationRow,
  Button,
  CheckBox,
  DisplayArea,
  HidingDisplay,
  Conditional,
  ConditionalButton,
  Table,
  TableRow,
  ObjectInput,
  ArrayInput,
  FSGroupInput,
  AutoSuggestInput,
  Row,
  Label,
  InputJSONFile,
  ExportJSONFile,
  CollapsingDisplay,
} from "./Components";

import {
  updateIndexValue,
  updateKeyValue,
  isObject,
  rangeOverlap,
  ListItems,
  ListUniqueItems,
  noop,
} from "./functions";
import { updateObject, addToArray, addToObject, newKey } from "./objects";
import useData from "./useData";
import { LocalStorage, Dictionary, Collection } from "./Database";

import {
  validateSubmit,
  overlappingError,
  blankError,
  invalidRangeError,
} from "./errors";
import { IncomeTaxCode } from "./classes";
import { FaInfoCircle } from "react-icons/fa";
import { useError } from "./useError";
import { useInterface, useWindowType } from "./useInterface";

export function ManageChartOfAccounts() {
  const [code, setcode] = useState("");
  const { openWindow } = useContext(WindowContext);
  const { showAlert } = useContext(AlertContext);
  const { showPopup } = useContext(PopupContext);
  return (
    <WindowContent>
      <WindowTitle title={"Manage Chart of Accounts"} />
      <DisplayArea>
        <Button
          name="Create"
          functionsArray={[() => openWindow(<CreateChartOfAccounts />)]}
        />
        <p>{` new Chart of Accounts.`}</p>
      </DisplayArea>
      <DisplayArea>
        <LabelledInput label={"Code"}>
          <Input
            value={code}
            process={(value) => setcode(value)}
            type={"text"}
            maxLength={6}
          />
        </LabelledInput>
        <NavigationRow>
          <ConditionalButton
            name="View"
            result={code !== ""}
            whileTrue={[() => openWindow(<ViewChartOfAccounts code={code} />)]}
            whileFalse={[() => showAlert("Code is blank. Please retry! ")]}
          />
          <ConditionalButton
            name="Edit"
            result={code !== ""}
            whileTrue={[() => openWindow(<EditChartOfAccounts code={code} />)]}
            whileFalse={[() => showAlert("Code is blank. Please retry! ")]}
          />
          <ConditionalButton
            name="Delete"
            result={code !== ""}
            whileTrue={[
              () =>
                showPopup(
                  "Are you sure want to delete this Chart of Accounts?",
                  [],
                  [
                    () =>
                      showAlert(
                        new Collection("ChartOfAccounts").delete({ Code: code })
                      ),
                  ]
                ),
            ]}
            whileFalse={[() => showAlert("Code is blank. Please retry! ")]}
          />
          <ConditionalButton
            name="Copy"
            result={code !== ""}
            whileTrue={[
              () =>
                openWindow(
                  <CreateChartOfAccounts
                    initial={new Collection("ChartOfAccounts").getData({
                      Code: code,
                    })}
                  />
                ),
            ]}
            whileFalse={[() => showAlert("Code is blank. Please retry! ")]}
          />
        </NavigationRow>
      </DisplayArea>
    </WindowContent>
  );
}

export const CreateChartOfAccounts = ({
  initial = {
    Code: "",
    GLNumbering: [
      { LedgerType: "Asset", From: "", To: "" },
      { LedgerType: "Liability", From: "", To: "" },
      { LedgerType: "Equity", From: "", To: "" },
      { LedgerType: "Income", From: "", To: "" },
      { LedgerType: "Expense", From: "", To: "" },
    ],
  },
}) => {
  const { data, changeData, reset } = useData(initial);
  const { Code, GLNumbering } = data;
  const { showAlert } = useContext(AlertContext);
  const { openWindow } = useContext(WindowContext);
  const errors = () => {
    const list = [];
    const addError = (path, error) => {
      list.push({ path: path, error: error });
    };
    if (Code === "") {
      addError("Code", "Code cannot be blank.");
    }
    if (
      Code !== "" &&
      new Collection("ChartOfAccounts").exists({ Code: Code })
    ) {
      addError("Code", "Chart of Accounts with same code already exists.");
    }
    GLNumbering.forEach((numbering, n) => {
      const path = "GLNumbering";
      const { LedgerType, From, To } = numbering;
      if (From > To) {
        addError(path, `${LedgerType} has 'From' greater than 'To'.`);
      }
      if (From === "") {
        addError(path, `'From' cannot be blank at ${LedgerType}.`);
      }
      if (To === "") {
        addError(path, `'To' cannot be blank at ${LedgerType}.`);
      }
      GLNumbering.forEach((numbering2, n2) => {
        const { From: From2, To: To2 } = numbering2;
        if (n2 !== n) {
          if (rangeOverlap([From, To], [From2, To2])) {
            addError(
              path,
              `Numbering overlaps between ${
                GLNumbering[Math.min(n, n2)].LedgerType
              } and ${GLNumbering[Math.max(n, n2)].LedgerType}.`
            );
          }
        }
      });
    });
    return list;
  };

  const ErrorList = (path) => {
    const filteredError = errors().filter((err) => err.path === path);
    const result = ListUniqueItems(filteredError, "error");
    if (result.length === 0) return null;
    return (
      <ul>
        {result.map((item) => (
          <li>{item}</li>
        ))}
      </ul>
    );
  };
  return (
    <WindowContent>
      <WindowTitle title={"Create Chart of Accounts"} />
      <DisplayArea>
        <LabelledInput label={"Code"}>
          <Input
            value={Code}
            process={(value) => changeData("", "Code", value)}
            type={"text"}
            maxLength={4}
          />
        </LabelledInput>
        {ErrorList("Code")}
        <DisplayBox>
          <DisplayFieldLabel label={"General Ledger Numbering"} />
          <Table
            columns={["Ledger", "From", "To"]}
            rows={GLNumbering.map((item, i) => [
              <p>{item.LedgerType}</p>,
              <Input
                value={item.From}
                process={(value) =>
                  changeData(`GLNumbering/${i}`, "From", value)
                }
              />,
              <Input
                value={item.To}
                process={(value) => changeData(`GLNumbering/${i}`, "To", value)}
              />,
            ])}
          />
        </DisplayBox>
        {ErrorList("GLNumbering")}
      </DisplayArea>
      <NavigationRow>
        <Button
          name="Manage Other"
          functionsArray={[() => openWindow(<ManageChartOfAccounts />)]}
        />
        <Button name="Reset" functionsArray={[() => reset()]} />
        <ConditionalButton
          name="Save"
          result={errors().length === 0}
          whileTrue={[
            () => showAlert(new Collection("ChartOfAccounts").add(data)),
            () => reset(),
          ]}
          whileFalse={[() => showAlert("Errors still persit. Please retry!")]}
        />
      </NavigationRow>
    </WindowContent>
  );
};

export const ViewChartOfAccounts = ({ code }) => {
  const data = new Collection("ChartOfAccounts").getData({ Code: code });
  const { Code, GLNumbering } = data;
  const { openWindow } = useContext(WindowContext);

  return (
    <WindowContent>
      <WindowTitle title={"View Chart of Accounts"} />
      <DisplayArea>
        <LabelledInput label={"Code"}>
          <label>{Code}</label>
        </LabelledInput>
        <DisplayBox>
          <DisplayFieldLabel label={"General Ledger Numbering"} />
          <Table
            columns={["Ledger", "From", "To"]}
            rows={GLNumbering.map((item, i) => [
              <p>{item.LedgerType}</p>,
              <p>{item.From}</p>,
              <p>{item.To}</p>,
            ])}
          />
        </DisplayBox>
      </DisplayArea>
      <NavigationRow>
        <Button
          name="Manage Other"
          functionsArray={[() => openWindow(<ManageChartOfAccounts />)]}
        />
      </NavigationRow>
    </WindowContent>
  );
};

export const EditChartOfAccounts = ({ code }) => {
  const initial = new Collection("ChartOfAccounts").getData({ Code: code });
  const { data, changeData, reset } = useData(initial);
  const { Code, GLNumbering } = data;
  const { showAlert } = useContext(AlertContext);
  const { openWindow } = useContext(WindowContext);
  const errors = () => {
    const list = [];
    const addError = (path, error) => {
      list.push({ path: path, error: error });
    };
    if (Code === "") {
      addError("Code", "Code cannot be blank.");
    }
    GLNumbering.forEach((numbering, n) => {
      const path = "GLNumbering";
      const { LedgerType, From, To } = numbering;
      if (From > To) {
        addError(path, `${LedgerType} has 'From' greater than 'To'.`);
      }
      if (From === "") {
        addError(path, `'From' cannot be blank at ${LedgerType}.`);
      }
      if (To === "") {
        addError(path, `'To' cannot be blank at ${LedgerType}.`);
      }
      GLNumbering.forEach((numbering2, n2) => {
        const { From: From2, To: To2 } = numbering2;
        if (n2 !== n) {
          if (rangeOverlap([From, To], [From2, To2])) {
            addError(
              path,
              `Numbering overlaps between ${
                GLNumbering[Math.min(n, n2)].LedgerType
              } and ${GLNumbering[Math.max(n, n2)].LedgerType}.`
            );
          }
        }
      });
    });
    return list;
  };

  const ErrorList = (path) => {
    const filteredError = errors().filter((err) => err.path === path);
    const result = ListItems(filteredError, "error");
    if (result.length === 0) return null;
    return (
      <ul>
        {result.map((item) => (
          <li>{item}</li>
        ))}
      </ul>
    );
  };
  return (
    <WindowContent>
      <WindowTitle title={"Edit Chart of Accounts"} />
      <DisplayArea>
        <LabelledInput label={"Code"}>
          <label>{Code}</label>
        </LabelledInput>
        {ErrorList("Code")}
        <DisplayBox>
          <DisplayFieldLabel label={"General Ledger Numbering"} />
          <Table
            columns={["Ledger", "From", "To"]}
            rows={GLNumbering.map((item, i) => [
              <p>{item.LedgerType}</p>,
              <Input
                value={item.From}
                process={(value) =>
                  changeData(`GLNumbering/${i}`, "From", value)
                }
              />,
              <Input
                value={item.To}
                process={(value) => changeData(`GLNumbering/${i}`, "To", value)}
              />,
            ])}
          />
        </DisplayBox>
        {ErrorList("GLNumbering")}
      </DisplayArea>
      <NavigationRow>
        <Button
          name="Manage Other"
          functionsArray={[() => openWindow(<ManageChartOfAccounts />)]}
        />
        <Button name="Reset" functionsArray={[() => reset()]} />
        <ConditionalButton
          name="Update"
          result={errors().length === 0}
          whileTrue={[
            () =>
              showAlert(
                new Collection("ChartOfAccounts").update({ Code: code }, data)
              ),
            () => openWindow(<ManageChartOfAccounts />),
          ]}
          whileFalse={[() => showAlert("Errors still persit. Please retry!")]}
        />
      </NavigationRow>
    </WindowContent>
  );
};

export function ManageFinancialStatementsCode() {
  const [code, setcode] = useState("");
  const { openWindow } = useContext(WindowContext);
  const { showAlert } = useContext(AlertContext);
  const { showPopup } = useContext(PopupContext);

  return (
    <WindowContent>
      <WindowTitle title={"Manage Financial Statement Code"} />
      <DisplayArea>
        <p>
          <Button
            name="Create"
            functionsArray={[
              () => openWindow(<CreateFinancialStatementsCode />),
            ]}
          />
          {` new Financial Statements Code.`}
        </p>
      </DisplayArea>
      <DisplayArea>
        <LabelledInput label={"Code"}>
          <Input
            value={code}
            process={(value) => setcode(value)}
            type={"text"}
            maxLength={4}
          />
        </LabelledInput>
        <NavigationRow>
          <ConditionalButton
            name="View"
            result={code !== ""}
            whileTrue={[
              () => openWindow(<ViewFinancialStatementsCode code={code} />),
            ]}
            whileFalse={[() => showAlert("Code is blank. Please retry!")]}
          />
          <ConditionalButton
            name="Update"
            result={code !== ""}
            whileTrue={[
              () => openWindow(<EditFinancialStatementsCode code={code} />),
            ]}
            whileFalse={[() => showAlert("Code is blank. Please retry!")]}
          />
          <ConditionalButton
            name="Delete"
            result={code !== ""}
            whileTrue={[
              () =>
                showPopup(
                  "Are you sure want to delete this Financial Statements Code?",
                  [],
                  [
                    () =>
                      new Collection("FinancialStatementsCode").delete({
                        Code: code,
                      }),
                  ]
                ),
            ]}
            whileFalse={[() => showAlert("Code is blank. Please retry!")]}
          />
          <ConditionalButton
            name="Clone"
            result={code !== ""}
            whileTrue={[
              () =>
                openWindow(
                  <CreateFinancialStatementsCode
                    initial={new Collection("FinancialStatementsCode").getData({
                      Code: code,
                    })}
                  />
                ),
            ]}
            whileFalse={[() => showAlert("Code is blank. Please retry!")]}
          />
        </NavigationRow>
      </DisplayArea>
    </WindowContent>
  );
}

function CreateFinancialStatementsCode({
  initial = {
    Code: "",
    ChartofAccounts: "",
    Hierarchy: [
      { name: "Asset", presentations: [], subgroups: [] },
      { name: "Equity", presentations: [], subgroups: [] },
      { name: "Liability", presentations: [], subgroups: [] },
      { name: "Income", presentations: [], subgroups: [] },
      { name: "Expense", presentations: [], subgroups: [] },
    ],
  },
}) {
  const { openWindow } = useContext(WindowContext);
  const { showAlert } = useContext(AlertContext);

  const { data, changeData, reset, addItemtoArray, deleteItemfromArray } =
    useData(initial);

  const { Code, Hierarchy, ChartofAccounts } = data;

  const processErrors = () => {
    const errors = [];
    const [addError] = useError(errors);
    if (Code === "") {
      addError("Code", "Code cannot be blank.");
    }
    return errors;
  };

  const [, errorsByPath] = useError(processErrors());

  return (
    <WindowContent>
      <WindowTitle title={"Create Financial Statements Code"} />
      <DisplayArea>
        <LabelledInput label={"Code"}>
          <Input
            value={Code}
            process={(value) => changeData("", "Code", value)}
            type={"text"}
            maxLength={6}
          />
        </LabelledInput>
        {errorsByPath("Code")}
        {Hierarchy.map((level, l) => (
          <FSGroupInput
            data={level}
            path={`Hierarchy/${l}`}
            changeData={changeData}
            addItemtoArray={addItemtoArray}
            deleteItemfromArray={deleteItemfromArray}
          />
        ))}
      </DisplayArea>
      <NavigationRow>
        <Button name="Reset" functionsArray={[() => reset()]} />
        <Button
          name={"Manage"}
          functionsArray={[() => openWindow(<ManageFinancialStatementsCode />)]}
        />
        <ConditionalButton
          name="Save"
          result={processErrors().length === 0}
          whileTrue={[
            () => new Collection("FinancialStatementsCode").add(data),
          ]}
          whileFalse={[() => showAlert("Errors still persist. Please retry!")]}
        />
      </NavigationRow>
    </WindowContent>
  );
}
