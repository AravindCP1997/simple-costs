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
import { IncomeTaxCode } from "./classes";
import { FaInfoCircle } from "react-icons/fa";

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

  const { showAlert } = useContext(AlertContext);

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
            `Taxation/${taxationIndex}/SlabRate/${slabIndex}/From`,
            value
          )
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["SlabRate"][slabIndex]["To"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/SlabRate/${slabIndex}/To`,
            value
          )
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["SlabRate"][slabIndex]["Rate"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/SlabRate/${slabIndex}/Rate`,
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
        value={Taxation[taxationIndex]["YearFrom"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}/YearFrom`, value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["YearTo"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}/YearTo`, value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["ExemptionLimit"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}/ExemptionLimit`, value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["StandardDeductionSalary"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}/StandardDeductionSalary`, value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["Cess"]}
        process={(value) => changeData(`Taxation/${taxationIndex}/Cess`, value)}
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
            `Taxation/${taxationIndex}/CalculateMarginalReliefOnExemption`,
            value
          )
        }
      />,
      <CheckBox
        value={Taxation[taxationIndex]["CalculateMarginalReliefOnSurcharge"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/CalculateMarginalReliefOnSurcharge`,
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
            process={(value) => changeData("Code", value)}
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
          <Option
            value={Code}
            process={(value) => changeData("Code", value)}
            options={["", ...new IncomeTaxCode().list("Code")]}
          />
        </LabelledInput>
        <LabelledInput label={"Year"}>
          <Input
            value={Year}
            process={(value) => changeData("Year", value)}
            type={"number"}
          />
          {Code !== "" && Year !== "" && !TaxCode.yearExists(Year) && (
            <p>Year does not exist in the tax code.</p>
          )}
        </LabelledInput>
        <LabelledInput label={"Income"}>
          <Input
            value={Income}
            process={(value) => changeData("Income", value)}
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
