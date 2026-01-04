import { useState, useContext, useMemo, useEffect } from "react";

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
  Column,
} from "../Components";

import { updateObject, addToArray, addToObject, newKey } from "../objects";
import useData from "../useData";
import { LocalStorage, Dictionary, Collection } from "../Database";

import { IncomeTaxCode } from "../classes";
import { FaInfoCircle } from "react-icons/fa";
import { useError } from "../useError";
import { useInterface, useWindowType } from "../useInterface";
import { sampleIncomeTaxCode } from "../samples";

export const CreateIncomeTaxCode = ({
  initial = {
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
  },
}) => {
  const {
    data,
    setdata,
    changeData,
    reset,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);

  const { showAlert, openWindow } = useInterface();

  const { Code, Taxation } = data;
  const collection = new IncomeTaxCode(Code);
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

  const { addError, clearErrors, DisplayHidingError, errorsExist } = useError();

  useEffect(() => {
    clearErrors();
    addError(Code === "", "Code", "Code cannot be blank.");
    addError(
      Code !== "" && collection.exists(),
      "Code",
      `Income Tax Code ${Code} already exists.`
    );
  }, [data]);

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
      <HidingDisplay title={"Slab Rate"} menu={[<Button name={"Save"} />]}>
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
    <>
      <WindowTitle
        title={"Create Income Tax Code"}
        menu={[
          <ConditionalButton
            name={"Save"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages persist, please check!")]}
            whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
          />,
          <Button name={"Reset"} functionsArray={[() => reset()]} />,
          <Button
            name={"Sample"}
            functionsArray={[
              () => setdata(sampleIncomeTaxCode),
              () => showAlert("Sample Copied"),
            ]}
          />,
          <DisplayHidingError />,
          <Button
            name="Manage"
            functionsArray={[() => openWindow(<ManageIncomeTaxCode />)]}
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
              maxLength={8}
              type={"text"}
            />
          </Row>
          <DisplayBox>
            <Row>
              <DisplayFieldLabel label={"Taxation"} />
              <button
                onClick={() => addItemtoArray("Taxation", defaults.Taxation[0])}
              >
                Add
              </button>
            </Row>
            <Table
              columns={[...TaxationFields]}
              rows={Taxation.map((item, i) => rowCells(i))}
            />
          </DisplayBox>
        </DisplayArea>
      </WindowContent>
    </>
  );
};

export const ViewIncomeTaxCode = ({ Code }) => {
  const data = new IncomeTaxCode(Code).getData();
  const { Taxation } = data;
  const { openWindow } = useInterface();
  const float = useWindowType() === "float";
  return (
    <>
      <WindowTitle
        title={"View Income Tax Code"}
        menu={[
          <Conditional logic={!float}>
            <Button
              name="Back"
              functionsArray={[() => openWindow(<ManageIncomeTaxCode />)]}
            />
          </Conditional>,
          <Conditional logic={!float}>
            <Button
              name="Create"
              functionsArray={[() => openWindow(<CreateIncomeTaxCode />)]}
            />
          </Conditional>,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Income Tax Code"} />
            <label>{Code}</label>
          </Row>
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
      </WindowContent>
    </>
  );
};

export const ManageIncomeTaxCode = () => {
  const { openConfirm, openWindow, showAlert } = useInterface();
  const [Code, setCode] = useState("");
  const collection = new IncomeTaxCode(Code);

  return (
    <>
      <WindowTitle
        title={"Manage Income Tax Code"}
        menu={[
          <ConditionalButton
            name={"View"}
            result={Code !== "" && collection.exists()}
            whileFalse={[
              () =>
                showAlert(
                  "Income Tax Code does not exists. Please check the code."
                ),
            ]}
            whileTrue={[() => openWindow(<ViewIncomeTaxCode Code={Code} />)]}
          />,
          <ConditionalButton
            name={"Delete"}
            result={Code !== "" && collection.exists()}
            whileFalse={[
              () =>
                showAlert(
                  "Income Tax Code does not exists. Please check the code."
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the Income Tax Code",
                  [],
                  [() => showAlert(collection.delete())]
                ),
            ]}
          />,
        ]}
      />

      <WindowContent>
        <DisplayArea>
          <Row overflow="visible">
            <Label label={"Income Tax Code"} />
            <AutoSuggestInput
              value={Code}
              process={(value) => setCode(value)}
              onSelect={(value) => setCode(value)}
              suggestions={[...new IncomeTaxCode().listAll("Code")]}
              placeholder={"Enter Code"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
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
    <>
      <WindowTitle
        title={"Income Tax Simulate"}
        menu={[
          <Button
            name={"Create Code"}
            functionsArray={[() => openWindow(<CreateIncomeTaxCode />)]}
          />,
          <Conditional logic={Code !== "" && TaxCode.exists()}>
            <Button
              name={"View Code"}
              functionsArray={[
                () => openFloat(<ViewIncomeTaxCode Code={Code} />),
              ]}
            />
          </Conditional>,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <LabelledInput label={"Code"}>
            <AutoSuggestInput
              value={Code}
              process={(value) => changeData("", "Code", value)}
              onSelect={(value) => changeData("", "Code", value)}
              suggestions={[...new IncomeTaxCode().listAll("Code")]}
              placeholder={"Enter Code"}
            />
          </LabelledInput>
          <LabelledInput label={"Year"}>
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
          {Code === "" && (
            <p
              style={{
                background: "var(--redt)",
                color: "white",
                fontSize: "85%",
                margin: "0",
                width: "fit-content",
              }}
            >
              Code cannot be blank.
            </p>
          )}
          {Code !== "" &&
            Year !== "" &&
            TaxCode.exists() &&
            !TaxCode.yearExists(Year) && (
              <p
                style={{
                  background: "var(--redt)",
                  color: "white",
                  fontSize: "85%",
                  margin: "0",
                  width: "fit-content",
                }}
              >
                Year does not exist in the tax code.
              </p>
            )}
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
    </>
  );
};
