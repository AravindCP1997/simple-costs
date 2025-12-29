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
  HidingInput,
  LabelledInput,
  NavigationRow,
} from "./App";

import {
  Button,
  CheckBox,
  DisplayArea,
  HidingDisplay,
  ConditionalButton,
  Table,
  TableRow,
  ObjectInput,
  ArrayInput,
  FSGroupInput,
} from "./Components";

import {
  updateIndexValue,
  updateKeyValue,
  isObject,
  rangeOverlap,
  ListItems,
  ListUniqueItems,
} from "./functions";
import { updateObject, addToArray, addToObject, newKey } from "./objects";
import useData from "./useData";
import { LocalStorage, Dictionary, Collection } from "./Database";
import {
  AlertContext,
  AccessibilityContext,
  FloatingWindowContext,
  PopupContext,
  ScreenContext,
  WindowContext,
} from "./context";
import {
  validateSubmit,
  overlappingError,
  blankError,
  invalidRangeError,
} from "./errors";
import { IncomeTaxCode } from "./classes";
import { FaInfoCircle } from "react-icons/fa";
import { useError } from "./useError";
import { useInterface } from "./useInterface";

export const Accessibility = () => {
  const {
    accessibility: { Background, Font },
    changeAccessibility,
    resetAccessibility,
    saveAccessibility,
  } = useContext(AccessibilityContext);
  const { closeFloatingWindow } = useContext(FloatingWindowContext);
  return (
    <WindowContent>
      <WindowTitle title={"Accessibility"} />
      <div className="displayInputFields">
        <DisplayBox>
          <DisplayFieldLabel label={"Background"} />
          <Radio
            value={Background}
            process={(value) => changeAccessibility("Background", value)}
            options={["Fabric", "Intersect", "Tech", "No Background"]}
          />
        </DisplayBox>
        <DisplayBox>
          <DisplayFieldLabel label={"Font"} />
          <Radio
            value={Font}
            process={(value) => changeAccessibility("Font", value)}
            options={["Helvetica", "Lexend", "Times New Roman", "Trebuchet MS"]}
          />
        </DisplayBox>
      </div>
      <div className="navigation">
        <Button name={"Reset"} functionsArray={[() => resetAccessibility()]} />
        <Button
          name={"Save"}
          functionsArray={[
            () => saveAccessibility(),
            () => closeFloatingWindow(),
          ]}
        />
      </div>
    </WindowContent>
  );
};

export function CreateAsset() {
  const [data, setdata] = useState({ Code: "", Description: "" });
  return (
    <WindowContent>
      <WindowTitle title={"Create Asset"} />
      <DisplayRow>
        <DisplayFieldLabel label={"Code"} />
        <Input
          value={data["Code"]}
          process={(value) =>
            setdata((pd) => updateKeyValue(pd, "Code", value))
          }
        />
      </DisplayRow>
    </WindowContent>
  );
}

export const CreateIncomeTaxCode = () => {
  const defaults = {
    Code: "",
    Taxation: [
      {
        YearFrom: "",
        YearTo: "",
        ExemptionLimit: "",
        StandardDeductionSalary: "",
        Cess: "",
        SlabRate: [{ From: "", To: "", Rate: "" }],
        Surcharge: [{ Threshold: "", Rate: "" }],
        CalculateMarginalReliefOnExemption: true,
        CalculateMarginalReliefOnSurcharge: true,
      },
    ],
  };

  const { data, changeData, addItemtoArray, deleteItemfromArray } =
    useData(defaults);

  const { showAlert } = useInterface();

  const { Code, Taxation } = data;
  const TaxationFields = [
    "Year From",
    "Year To",
    "Exemption Limit",
    "Standard Deduction on Salary",
    "Cess",
    "Slab Rate",
    "Surcharge",
    "Calculate Marginal Relief on Exemption Limit",
    "Calculate Marginal Relief on Surcharge",
    "",
  ];

  const slabCells = (taxationIndex, slabIndex) => {
    return [
      <Input
        value={Taxation[taxationIndex]["SlabRate"][slabIndex]["From"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/SlabRate/${slabIndex}`,
            "From",
            value
          )
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["SlabRate"][slabIndex]["To"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/SlabRate/${slabIndex}`,
            "To",
            value
          )
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["SlabRate"][slabIndex]["Rate"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/SlabRate/${slabIndex}`,
            "Rate",
            value
          )
        }
        type="number"
      />,
    ];
  };

  const surchargeCells = (taxationIndex, slabIndex) => {
    return [
      <Input
        value={Taxation[taxationIndex]["Surcharge"][slabIndex]["Threshold"]}
        type="number"
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Surcharge/${slabIndex}`,
            "Threshold",
            value
          )
        }
      />,
      <Input
        value={Taxation[taxationIndex]["Surcharge"][slabIndex]["Rate"]}
        type="number"
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Surcharge/${slabIndex}`,
            "Rate",
            value
          )
        }
      />,
    ];
  };
  const rowCells = (taxationIndex) => {
    return [
      <Input
        value={Taxation[taxationIndex]["YearFrom"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}`, "YearFrom", value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["YearTo"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}`, "YearTo", value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["ExemptionLimit"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}`, `ExemptionLimit`, value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["StandardDeductionSalary"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}`,
            `StandardDeductionSalary`,
            value
          )
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["Cess"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}`, `Cess`, value)
        }
        type="number"
      />,
      <HidingDisplay title={"Slab Rate"}>
        <Table
          columns={["From", "To", "Rate"]}
          rows={Taxation[taxationIndex]["SlabRate"].map((slab, s) =>
            slabCells(taxationIndex, s)
          )}
        />
        <button
          onClick={() =>
            addItemtoArray(
              `Taxation/${taxationIndex}/SlabRate`,
              Taxation[0]["SlabRate"][0]
            )
          }
        >
          Add slab
        </button>
      </HidingDisplay>,
      <HidingDisplay title={"Surcharge"}>
        <Table
          columns={["Threshold", "Rate"]}
          rows={Taxation[taxationIndex].Surcharge.map((slab, s) =>
            surchargeCells(taxationIndex, s)
          )}
        />
        <NavigationRow>
          <button
            onClick={() =>
              addItemtoArray(
                `Taxation/${taxationIndex}/Surcharge`,
                defaults.Taxation[0]["Surcharge"][0]
              )
            }
          >
            Add
          </button>
        </NavigationRow>
      </HidingDisplay>,
      <CheckBox
        value={Taxation[taxationIndex]["CalculateMarginalReliefOnExemption"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}`,
            `CalculateMarginalReliefOnExemption`,
            value
          )
        }
      />,
      <CheckBox
        value={Taxation[taxationIndex]["CalculateMarginalReliefOnSurcharge"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}`,
            `CalculateMarginalReliefOnSurcharge`,
            value
          )
        }
      />,
      <Button
        name="-"
        functionsArray={[() => deleteItemfromArray(`Taxation`, taxationIndex)]}
      />,
    ];
  };

  return (
    <WindowContent>
      <WindowTitle title={"Create Income Tax Code"} />
      <DisplayArea>
        <LabelledInput label="Code">
          <Input
            value={Code}
            process={(value) => changeData("", "Code", value)}
            maxLength={8}
            type={"text"}
          />
        </LabelledInput>
        <DisplayBox>
          <DisplayFieldLabel label={"Taxation"} />
          <Table
            columns={[...TaxationFields]}
            rows={Taxation.map((item, i) => rowCells(i))}
          />
        </DisplayBox>
        <NavigationRow>
          <button
            onClick={() => addItemtoArray("Taxation", defaults.Taxation[0])}
          >
            Add
          </button>
        </NavigationRow>
      </DisplayArea>
      <DisplayArea>
        <p>
          `<FaInfoCircle /> Income tax code is necessary for calculating and
          deducting tax at source on remuneration payable to personnel of a
          company.`
        </p>
      </DisplayArea>
      <NavigationRow>
        <Button
          name={"Save"}
          functionsArray={[
            () => showAlert(new Collection("IncomeTaxCode").add(data)),
          ]}
        />
      </NavigationRow>
    </WindowContent>
  );
};

export const ViewIncomeTaxCode = ({ Code }) => {
  const data = new Collection("IncomeTaxCode").getData({ Code: Code });
  const { Taxation } = data;
  const { openwindow } = useInterface();
  return (
    <WindowContent>
      <WindowTitle title={"View Income Tax Code"} />
      <DisplayArea>
        <LabelledInput label={"Code"}>
          <label>{Code}</label>
        </LabelledInput>
        <DisplayBox>
          <DisplayFieldLabel label="Taxation" />
          <Table
            columns={[
              "Year From",
              "Year To",
              "Exemption Limit",
              "Standard Deduction on Salary",
              "Cess",
              "Slab Rate",
              "Surcharge",
              "Calculate Marginal Relief on Exemption Limit",
              "Calculate Marginal Relief on Surcharge",
            ]}
            rows={Taxation.map((item) => [
              item["YearFrom"],
              item["YearTo"],
              item["ExemptionLimit"],
              item["StandardDeductionSalary"],
              item["Cess"],
              <HidingDisplay title={"Slab Rate"}>
                <Table
                  columns={["From", "To", "Rate"]}
                  rows={item["SlabRate"].map((slabitem) => [
                    slabitem["From"],
                    slabitem["To"],
                    slabitem["Rate"],
                  ])}
                />
              </HidingDisplay>,
              <HidingDisplay title={"Surcharge"}>
                <Table
                  columns={["Threshold", "Rate"]}
                  rows={item["Surcharge"].map((surchargeitem) => [
                    surchargeitem["Threshold"],
                    surchargeitem["Rate"],
                  ])}
                />
              </HidingDisplay>,
              <CheckBox value={item["CalculateMarginalReliefOnExemption"]} />,
              <CheckBox value={item["CalculateMarginalReliefOnSurcharge"]} />,
            ])}
          />
        </DisplayBox>
      </DisplayArea>
      <NavigationRow>
        <Button
          name="Back"
          functionsArray={[() => openwindow(<ManageIncomeTaxCode />)]}
        />
        <Button
          name="Create"
          functionsArray={[() => openwindow(<CreateIncomeTaxCode />)]}
        />
      </NavigationRow>
    </WindowContent>
  );
};

export const ManageIncomeTaxCode = () => {
  const { showAlert } = useContext(AlertContext);
  const { showPopup } = useContext(PopupContext);
  const { setWindow } = useContext(WindowContext);
  const defaults = { Code: "" };
  const { data, changeData } = useData(defaults);

  return (
    <WindowContent>
      <WindowTitle title={"Manage Income Tax Code"} />
      <DisplayArea>
        <LabelledInput label="Code">
          <Input
            value={data.Code}
            process={(value) => changeData("", "Code", value)}
            type="text"
            maxLength={8}
          />
        </LabelledInput>
      </DisplayArea>
      <NavigationRow>
        <Button
          name="View"
          functionsArray={[
            () => setWindow(<ViewIncomeTaxCode Code={data.Code} />),
          ]}
        />
      </NavigationRow>
    </WindowContent>
  );
};

export const IncomeTaxSimulate = ({ initialCode = "" }) => {
  const { openWindow, openFloat } = useInterface();
  const { data, changeData } = useData({
    Code: initialCode,
    Year: "",
    Income: "",
  });
  const { Code, Year, Income } = data;
  const TaxCode = new IncomeTaxCode(Code);
  const result = () => {
    if (
      Code !== "" &&
      Year !== "" &&
      Income !== "" &&
      TaxCode.yearExists(Year)
    ) {
      return TaxCode.taxComputation(Year, Income);
    } else {
      return false;
    }
  };

  return (
    <WindowContent>
      <WindowTitle title={"Income Tax Simulate"} />
      <DisplayArea>
        <LabelledInput label={"Code"}>
          {Code === "" && (
            <p>
              Code cannot be blank. Or,{" "}
              <Button
                name="Create Code"
                functionsArray={[() => openWindow(<CreateIncomeTaxCode />)]}
              />
            </p>
          )}
          {Code !== "" && (
            <Button
              name="View Code"
              functionsArray={[
                () => openFloat(<ViewIncomeTaxCode Code={Code} />),
              ]}
            />
          )}
          <Option
            value={Code}
            process={(value) => changeData("", "Code", value)}
            options={["", ...new IncomeTaxCode().list("Code")]}
          />
        </LabelledInput>
        <LabelledInput label={"Year"}>
          {Code !== "" && Year !== "" && !TaxCode.yearExists(Year) && (
            <p>Year does not exist in the tax code.</p>
          )}
          <Input
            value={Year}
            process={(value) => changeData("", "Year", value)}
            type={"number"}
          />
        </LabelledInput>
        <LabelledInput label={"Income"}>
          <Input
            value={Income}
            process={(value) => changeData("", "Income", value)}
            type={"number"}
          />
        </LabelledInput>
      </DisplayArea>
      {result() && (
        <DisplayArea>
          <DisplayRow>
            <DisplayFieldLabel label={"Tax on Total Income (A)"} />
            <p>{result().tax.toFixed(2)}</p>
          </DisplayRow>
          <DisplayRow>
            <DisplayFieldLabel label={"Tax Exemption (B)"} />
            <p>{result().taxExemption.toFixed(2)}</p>
          </DisplayRow>
          <DisplayRow>
            <DisplayFieldLabel label={"Marginal Relief (C)"} />
            <p>{result().marginalReliefOnExemption.toFixed(2)}</p>
          </DisplayRow>
          <DisplayRow>
            <DisplayFieldLabel label={"Gross Exemption (D) = (B) + (C)"} />
            <p>{result().grossExemption.toFixed(2)}</p>
          </DisplayRow>
          <DisplayRow>
            <DisplayFieldLabel label={"Surcharge (E)"} />
            <p>{result().surcharge.toFixed(2)}</p>
          </DisplayRow>
          <DisplayRow>
            <DisplayFieldLabel label={"Marginal Relief from Surcharge (F)"} />
            <p>{result().marginalReliefOnSurcharge.toFixed(2)}</p>
          </DisplayRow>
          <DisplayRow>
            <DisplayFieldLabel label={"Net Surcharge (G) = (E) - (F)"} />
            <p>{result().netSurcharge.toFixed(2)}</p>
          </DisplayRow>
          <DisplayRow>
            <DisplayFieldLabel
              label={"Tax Before Cess (H) = (A) - (D) + (G)"}
            />
            <p>{result().taxBeforeCess.toFixed(2)}</p>
          </DisplayRow>
          <DisplayRow>
            <DisplayFieldLabel label={"Cess (I)"} />
            <p>{result().cess.toFixed(2)}</p>
          </DisplayRow>
          <DisplayRow>
            <DisplayFieldLabel label={"Total Tax (J) = (H) + (I)"} />
            <p>{result().totalTax.toFixed(2)}</p>
          </DisplayRow>
        </DisplayArea>
      )}
    </WindowContent>
  );
};

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

  const { Code, Hierarchy } = data;

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

export function JSONEditor({ initial }) {
  const {
    data,
    changeData,
    addItemtoArray,
    addItemtoObject,
    deleteItemfromArray,
    deleteItemfromObject,
    updateKey,
    convertAsArray,
    convertAsValue,
    convertAsObject,
  } = useData(initial);

  const editable = typeof data === "object";

  return (
    <WindowContent>
      <WindowTitle title="JSON Editor" />
      <DisplayArea>
        {!editable && (
          <LabelledInput label={"JSON Not Editable"}>
            <p>The data isn't a valid JSON and therefore can't be edited.</p>
          </LabelledInput>
        )}
        {editable && (
          <>
            {isObject(data) ? (
              <ObjectInput
                path={""}
                value={data}
                changeData={changeData}
                updateKeyOfObject={updateKey}
                addToArray={addItemtoArray}
                addToObject={addItemtoObject}
                deleteFromArray={deleteItemfromArray}
                deleteFromObject={deleteItemfromObject}
                convertAsArray={convertAsArray}
                convertAsObject={convertAsObject}
                convertAsValue={convertAsValue}
              />
            ) : (
              <ArrayInput
                path={""}
                value={data}
                changeData={changeData}
                updateKeyOfObject={updateKey}
                addToArray={addItemtoArray}
                addToObject={addItemtoObject}
                deleteFromArray={deleteItemfromArray}
                deleteFromObject={deleteItemfromObject}
                convertAsArray={convertAsArray}
                convertAsObject={convertAsObject}
                convertAsValue={convertAsValue}
              />
            )}
          </>
        )}
      </DisplayArea>
      {JSON.stringify(data)}
    </WindowContent>
  );
}
