import { useState, useContext } from "react";
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
} from "./Components";

import { updateIndexValue, updateKeyValue } from "./functions";
import { collectionChange, singleChange } from "./uiscript";
import { updateObject, addToArray, addToObject } from "./objects";
import useData from "./useData";
import { LocalStorage, Dictionary, Collection } from "./Database";
import {
  AlertContext,
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
        "Year From": "",
        "Year To": "",
        "Exemption Limit": "",
        "Calculate Marginal Relief": true,
        "Standard Deduction Salary": "",
        "Slab Rate": [{ From: "", To: "", Rate: "" }],
        Surcharge: [{ Threshold: "", Rate: "" }],
      },
      {
        "Year From": "",
        "Year To": "",
        "Exemption Limit": "",
        "Marginal Relief": "",
        "Standard Deduction Salary": "",
        "Slab Rate": [{ From: "", To: "", Rate: "" }],
        Surcharge: [{ Threshold: "", Rate: "" }],
      },
    ],
  };

  const {
    data,
    setdata,
    changeData,
    addItemtoArray,
    addItemtoObject,
    deleteItemfromArray,
  } = useData(defaults);

  const { showAlert } = useContext(AlertContext);

  const { Code, Taxation } = data;
  const TaxationFields = [
    "Year From",
    "Year To",
    "Exemption Limit",
    "Calculate Marginal Relief",
    "Standard Deduction",
    "Slab Rate",
    "Surcharge",
  ];

  const slabCells = (taxationIndex, slabIndex) => {
    return [
      <Input
        value={Taxation[taxationIndex]["Slab Rate"][slabIndex]["From"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Slab Rate/${slabIndex}/From`,
            value
          )
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["Slab Rate"][slabIndex]["To"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Slab Rate/${slabIndex}/To`,
            value
          )
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["Slab Rate"][slabIndex]["Rate"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Slab Rate/${slabIndex}/Rate`,
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
            `Taxation/${taxationIndex}/Surcharge/${slabIndex}/Threshold`,
            value
          )
        }
      />,
      <Input
        value={Taxation[taxationIndex]["Surcharge"][slabIndex]["Rate"]}
        type="number"
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Surcharge/${slabIndex}/Rate`,
            value
          )
        }
      />,
    ];
  };
  const rowCells = (taxationIndex) => {
    return [
      <Input
        value={Taxation[taxationIndex]["Year From"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}/Year From`, value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["Year To"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}/Year To`, value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["Exemption Limit"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}/Exemption Limit`, value)
        }
        type="number"
      />,
      <CheckBox
        value={Taxation[taxationIndex][" Calculate Marginal Relief"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Calculate Marginal Relief`,
            value
          )
        }
      />,
      <Input
        value={Taxation[taxationIndex]["Standard Deduction Salary"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Standard Deduction Salary`,
            value
          )
        }
        type="number"
      />,
      <HidingInput>
        <h3>Slab Rate</h3>
        <Table
          columns={["From", "To", "Rate"]}
          rows={Taxation[taxationIndex]["Slab Rate"].map((slab, s) =>
            slabCells(taxationIndex, s)
          )}
        />
        <button
          onClick={() =>
            addItemtoArray(
              `Taxation/${taxationIndex}/Slab Rate`,
              Taxation[0]["Slab Rate"][0]
            )
          }
        >
          Add slab
        </button>
      </HidingInput>,
      <HidingInput>
        <h3>Surcharge</h3>
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
      </HidingInput>,
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
            process={(value) => changeData("Code", value)}
            maxLength={4}
            type={"text"}
          />
        </LabelledInput>
        <DisplayBox>
          <DisplayFieldLabel label={"Taxation"} />
          <Table
            columns={[...TaxationFields, ""]}
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
  const { setWindow } = useContext(WindowContext);
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
              "Calculate Marginal Relief",
              "Standard Deduction Salary",
              "Slab Rate",
              "Surcharge",
            ]}
            rows={Taxation.map((item) => [
              item["Year From"],
              item["Year To"],
              item["Exemption Limit"],
              <CheckBox value={item["Calculate Marginal Relief"]} />,
              item["Standard Deduction Salary"],
              <HidingDisplay title={"Slab Rate"}>
                <Table
                  columns={["From", "To", "Rate"]}
                  rows={item["Slab Rate"].map((slabitem) => [
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
            ])}
          />
        </DisplayBox>
      </DisplayArea>
      <NavigationRow>
        <Button
          name="Back"
          functionsArray={[() => setWindow(<ManageIncomeTaxCode />)]}
        />
        <Button
          name="Create"
          functionsArray={[() => setWindow(<CreateIncomeTaxCode />)]}
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
            process={(value) => changeData("Code", value)}
            type="text"
            maxLength={4}
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

export const CreateChartofAccounts = () => {
  const { showAlert } = useContext(AlertContext);
  const defaults = {
    Code: "",
    GLNumbering: [
      { LedgerType: "Asset", From: "", To: "" },
      { LedgerType: "Liability", From: "", To: "" },
      { LedgerType: "Equity", From: "", To: "" },
      { LedgerType: "Income", From: "", To: "" },
      { LedgerType: "Expense", From: "", To: "" },
    ],
  };
  const GLs = ["Asset", "Liability", "Equity", "Income", "Expense"];
  const { data, changeData } = useData(defaults);
  const { Code, GLNumbering } = data;
  const GLNumberingCells = (index) => {
    return [
      <label>{GLs[index]}</label>,
      <Input
        value={GLNumbering[index]["From"]}
        process={(value) => changeData(`GLNumbering/${index}/From`, value)}
        type="number"
      />,
      <Input
        value={GLNumbering[index]["To"]}
        process={(value) => changeData(`GLNumbering/${index}/To`, value)}
        type="number"
      />,
    ];
  };
  const errors = () => {
    const errors = [];
    errors.push(...blankError(data, ["Code"]));
    GLNumbering.forEach((item) => {
      errors.push(invalidRangeError(item.From, item.To));
    });
    errors.push(...overlappingError(GLNumbering, "LedgerType", "From", "To"));
    return errors;
  };

  return (
    <WindowContent>
      <WindowTitle title={"Create Chart of Accounts"} />
      <DisplayArea>
        <LabelledInput label={"Code"}>
          <Input
            value={Code}
            process={(value) => changeData("Code", value)}
            type={"text"}
            maxLength={4}
          />
        </LabelledInput>
        <DisplayBox>
          <DisplayFieldLabel label={"General Ledger Numbering"} />
          <Table
            columns={["Ledger", "From", "To"]}
            rows={GLNumbering.map((item, i) => GLNumberingCells(i))}
          />
        </DisplayBox>
      </DisplayArea>
      <NavigationRow>
        <HidingDisplay title={`Errors ${errors().length}`}>
          <ul>
            {errors().map((error) => (
              <li>{error}</li>
            ))}
          </ul>
        </HidingDisplay>
        <Button
          name="Save"
          functionsArray={[
            () =>
              validateSubmit(
                errors(),
                [() => showAlert(new Collection("ChartofAccounts").add())],
                [() => showAlert("Errors persist!")]
              ),
          ]}
        />
      </NavigationRow>
    </WindowContent>
  );
};
