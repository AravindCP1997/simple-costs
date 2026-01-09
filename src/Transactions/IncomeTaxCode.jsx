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
import { defaultIncomeTaxCode } from "../defaults";
import { rangeOverlap } from "../functions";

export const CreateIncomeTaxCode = ({
  method = "Create",
  initial = defaultIncomeTaxCode,
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

  const { Code, Taxation, Status } = data;
  const collection = new IncomeTaxCode(Code);

  const { addError, clearErrors, DisplayHidingError, errorsExist } = useError();

  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(Code === "", "Code", "Code cannot be blank.");
      addError(
        Code !== "" && collection.exists(),
        "Code",
        `Income Tax Code ${Code} already exists.`
      );
    }
    Taxation.forEach((taxation, t) => {
      const {
        YearFrom,
        YearTo,
        ExemptionLimit,
        StandardDeductionSalary,
        Cess,
        SlabRate,
        Surcharge,
        CalculateMarginalReliefOnExemption,
        CalculateMarginalReliefOnSurcharge,
      } = taxation;
      addError(
        YearFrom === "" || YearFrom < 1900,
        "Taxation",
        `Taxation ${t + 1}, From year shall be greater than 1900`
      );
      addError(
        YearTo === "" || YearTo < 1900,
        "Taxation",
        `Taxation ${t + 1}, To year shall be greater than 1900`
      );
      addError(
        ExemptionLimit === "" || ExemptionLimit < 0,
        "Taxation",
        `Taxation ${t + 1}, Exemption Limit shall be non-negative value.`
      );

      addError(
        StandardDeductionSalary === "" || StandardDeductionSalary < 0,
        "Taxation",
        `Taxation ${
          t + 1
        }, Standard Deduction Salary shall be non-negative value.`
      );
      addError(
        Cess === "" || Cess < 0,
        "Taxation",
        `Taxation ${t + 1}, Cess Rate shall be non-negative value.`
      );
      addError(
        YearFrom > YearTo,
        "Taxation",
        `Taxation ${t + 1}, From Year is greater than To Year`
      );
      Taxation.forEach((taxationTwo, ttwo) => {
        const { YearFrom: YF, YearTo: YT } = taxationTwo;
        addError(
          t < ttwo && rangeOverlap([YearFrom, YearTo], [YF, YT]),
          "Taxation",
          `Taxation period overlaps between taxation ${t + 1} and ${ttwo + 1}`
        );
      });
      SlabRate.forEach((slab, s) => {
        const { From, To, Rate } = slab;
        addError(
          From === "" || From < 0,
          "Taxation",
          `Taxation ${t + 1}, Slab ${s + 1}, From shall be non-negative value.`
        );
        addError(
          To === "" || To < 0,
          "Taxation",
          `Taxation ${t + 1}, Slab ${s + 1}, To shall be non-negative value.`
        );
        addError(
          Rate === "" || Rate < 0,
          "Taxation",
          `Taxation ${t + 1}, Slab ${s + 1}, Rate shall be non-negative value.`
        );
      });
      Surcharge.forEach((surcharge, s) => {
        const { Threshold, Rate } = surcharge;
        addError(
          Rate === "" || Rate < 0,
          "Taxation",
          `Taxation ${t + 1}, Surcharge ${
            s + 1
          }, Rate shall be non-negative value.`
        );
        addError(
          Threshold === "" || Threshold < 0,
          "Taxation",
          `Taxation ${t + 1}, Surcharge ${
            s + 1
          }, Threshold shall be non-negative value.`
        );
      });
    });
  }, [data]);

  if (method === "Create") {
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
              functionsArray={[() => setdata(sampleIncomeTaxCode)]}
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
            <Column>
              <Row>
                <Label label={"Taxation"} />
                <button
                  onClick={() =>
                    addItemtoArray("Taxation", defaultIncomeTaxCode.Taxation[0])
                  }
                >
                  Add
                </button>
              </Row>
              <Table
                columns={[
                  "From Year",
                  "To Year",
                  "Exemption Limit",
                  "Standard Deduction from Salary",
                  "Cess",
                  "Slab Rate",
                  "Surcharge",
                  "Marginal Releif after Exemption",
                  "Marginal Relief on Surcharge",
                  "Delete",
                ]}
                rows={Taxation.map((item, i) => [
                  <Input
                    value={item.YearFrom}
                    process={(value) =>
                      changeData(`Taxation/${i}`, "YearFrom", value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={item.YearTo}
                    process={(value) =>
                      changeData(`Taxation/${i}`, "YearTo", value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={item.ExemptionLimit}
                    process={(value) =>
                      changeData(`Taxation/${i}`, "ExemptionLimit", value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={item.StandardDeductionSalary}
                    process={(value) =>
                      changeData(
                        `Taxation/${i}`,
                        "StandardDeductionSalary",
                        value
                      )
                    }
                    type={"number"}
                  />,
                  <Input
                    value={item.Cess}
                    process={(value) =>
                      changeData(`Taxation/${i}`, "Cess", value)
                    }
                    type={"number"}
                  />,
                  <HidingDisplay
                    title={"Slab Rate"}
                    menu={[
                      <Button
                        name="Add Threshold"
                        functionsArray={[
                          () =>
                            addItemtoArray(`Taxation/${i}/SlabRate`, {
                              From: "",
                              To: "",
                              Rate: "",
                            }),
                        ]}
                      />,
                    ]}
                  >
                    <Table
                      columns={["From", "To", "Rate", "Delete"]}
                      rows={item.SlabRate.map((slab, s) => [
                        <Input
                          value={slab.From}
                          process={(value) =>
                            changeData(
                              `Taxation/${i}/SlabRate/${s}`,
                              "From",
                              value
                            )
                          }
                        />,
                        <Input
                          value={slab.To}
                          process={(value) =>
                            changeData(
                              `Taxation/${i}/SlabRate/${s}`,
                              "To",
                              value
                            )
                          }
                        />,
                        <Input
                          value={slab.Rate}
                          process={(value) =>
                            changeData(
                              `Taxation/${i}/SlabRate/${s}`,
                              "Rate",
                              value
                            )
                          }
                        />,
                        <Button
                          name={""}
                          functionsArray={[
                            () =>
                              deleteItemfromArray(`Taxation/${i}/SlabRate`, s),
                          ]}
                        />,
                      ])}
                    />
                  </HidingDisplay>,
                  <HidingDisplay
                    title={"Surcharge"}
                    menu={[
                      <Button
                        name="Add Threshold"
                        functionsArray={[
                          () =>
                            addItemtoArray(`Taxation/${i}/Surcharge`, {
                              Threshold: "",
                              Rate: "",
                            }),
                        ]}
                      />,
                    ]}
                  >
                    <Table
                      columns={["Threshold", "Rate", "Delete"]}
                      rows={item.Surcharge.map((slab, s) => [
                        <Input
                          value={slab.Threshold}
                          process={(value) =>
                            changeData(
                              `Taxation/${i}/Surcharge/${s}`,
                              "Threshold",
                              value
                            )
                          }
                        />,
                        <Input
                          value={slab.Rate}
                          process={(value) =>
                            changeData(
                              `Taxation/${i}/Surcharge/${s}`,
                              "Rate",
                              value
                            )
                          }
                        />,
                        <Button
                          name={""}
                          functionsArray={[
                            () =>
                              deleteItemfromArray(`Taxation/${i}/Surcharge`, s),
                          ]}
                        />,
                      ])}
                    />
                  </HidingDisplay>,
                  <CheckBox
                    value={item.CalculateMarginalReliefOnExemption}
                    process={(value) =>
                      changeData(
                        `Taxation/${i}`,
                        "CalculateMarginalReliefOnExemption",
                        value
                      )
                    }
                  />,
                  <CheckBox
                    value={item.CalculateMarginalReliefOnSurcharge}
                    process={(value) =>
                      changeData(
                        `Taxation/${i}`,
                        "CalculateMarginalReliefOnSurcharge",
                        value
                      )
                    }
                  />,
                  <Button
                    name={""}
                    functionsArray={[() => deleteItemfromArray(`Taxation`, i)]}
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
  } else if (method === "Update") {
    return (
      <>
        <WindowTitle
          title={"Update Income Tax Code"}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages persist, please check!")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageIncomeTaxCode />),
              ]}
            />,
            <Button name={"Reset"} functionsArray={[() => reset()]} />,
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
              <label>{Code}</label>
            </Row>
            <Column>
              <Row>
                <Label label={"Taxation"} />
                <button
                  onClick={() =>
                    addItemtoArray("Taxation", defaultIncomeTaxCode.Taxation[0])
                  }
                >
                  Add
                </button>
              </Row>
              <Table
                columns={[
                  "From Year",
                  "To Year",
                  "Exemption Limit",
                  "Standard Deduction from Salary",
                  "Cess",
                  "Slab Rate",
                  "Surcharge",
                  "Marginal Releif after Exemption",
                  "Marginal Relief on Surcharge",
                  "Delete",
                ]}
                rows={Taxation.map((item, i) => [
                  <Input
                    value={item.YearFrom}
                    process={(value) =>
                      changeData(`Taxation/${i}`, "YearFrom", value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={item.YearTo}
                    process={(value) =>
                      changeData(`Taxation/${i}`, "YearTo", value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={item.ExemptionLimit}
                    process={(value) =>
                      changeData(`Taxation/${i}`, "ExemptionLimit", value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={item.StandardDeductionSalary}
                    process={(value) =>
                      changeData(
                        `Taxation/${i}`,
                        "StandardDeductionSalary",
                        value
                      )
                    }
                    type={"number"}
                  />,
                  <Input
                    value={item.Cess}
                    process={(value) =>
                      changeData(`Taxation/${i}`, "Cess", value)
                    }
                    type={"number"}
                  />,
                  <HidingDisplay
                    title={"Slab Rate"}
                    menu={[
                      <Button
                        name="Add Threshold"
                        functionsArray={[
                          () =>
                            addItemtoArray(`Taxation/${i}/SlabRate`, {
                              From: "",
                              To: "",
                              Rate: "",
                            }),
                        ]}
                      />,
                    ]}
                  >
                    <Table
                      columns={["From", "To", "Rate", "Delete"]}
                      rows={item.SlabRate.map((slab, s) => [
                        <Input
                          value={slab.From}
                          process={(value) =>
                            changeData(
                              `Taxation/${i}/SlabRate/${s}`,
                              "From",
                              value
                            )
                          }
                        />,
                        <Input
                          value={slab.To}
                          process={(value) =>
                            changeData(
                              `Taxation/${i}/SlabRate/${s}`,
                              "To",
                              value
                            )
                          }
                        />,
                        <Input
                          value={slab.Rate}
                          process={(value) =>
                            changeData(
                              `Taxation/${i}/SlabRate/${s}`,
                              "Rate",
                              value
                            )
                          }
                        />,
                        <Button
                          name={""}
                          functionsArray={[
                            () =>
                              deleteItemfromArray(`Taxation/${i}/SlabRate`, s),
                          ]}
                        />,
                      ])}
                    />
                  </HidingDisplay>,
                  <HidingDisplay
                    title={"Surcharge"}
                    menu={[
                      <Button
                        name="Add Threshold"
                        functionsArray={[
                          () =>
                            addItemtoArray(`Taxation/${i}/Surcharge`, {
                              Threshold: "",
                              Rate: "",
                            }),
                        ]}
                      />,
                    ]}
                  >
                    <Table
                      columns={["Threshold", "Rate", "Delete"]}
                      rows={item.Surcharge.map((slab, s) => [
                        <Input
                          value={slab.Threshold}
                          process={(value) =>
                            changeData(
                              `Taxation/${i}/Surcharge/${s}`,
                              "Threshold",
                              value
                            )
                          }
                        />,
                        <Input
                          value={slab.Rate}
                          process={(value) =>
                            changeData(
                              `Taxation/${i}/Surcharge/${s}`,
                              "Rate",
                              value
                            )
                          }
                        />,
                        <Button
                          name={""}
                          functionsArray={[
                            () =>
                              deleteItemfromArray(`Taxation/${i}/Surcharge`, s),
                          ]}
                        />,
                      ])}
                    />
                  </HidingDisplay>,
                  <CheckBox
                    value={item.CalculateMarginalReliefOnExemption}
                    process={(value) =>
                      changeData(
                        `Taxation/${i}`,
                        "CalculateMarginalReliefOnExemption",
                        value
                      )
                    }
                  />,
                  <CheckBox
                    value={item.CalculateMarginalReliefOnSurcharge}
                    process={(value) =>
                      changeData(
                        `Taxation/${i}`,
                        "CalculateMarginalReliefOnSurcharge",
                        value
                      )
                    }
                  />,
                  <Button
                    name={""}
                    functionsArray={[() => deleteItemfromArray(`Taxation`, i)]}
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
  } else {
    return (
      <>
        <WindowTitle
          title={"View Income Tax Code"}
          menu={[
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
              <label>{Code}</label>
            </Row>
            <Column>
              <Row>
                <Label label={"Taxation"} />
              </Row>
              <Table
                columns={[
                  "From Year",
                  "To Year",
                  "Exemption Limit",
                  "Standard Deduction from Salary",
                  "Cess",
                  "Slab Rate",
                  "Surcharge",
                  "Marginal Releif after Exemption",
                  "Marginal Relief on Surcharge",
                ]}
                rows={Taxation.map((item, i) => [
                  <label>{item.YearFrom}</label>,
                  <label>{item.YearFrom}</label>,
                  <label>{item.ExemptionLimit}</label>,
                  <label>{item.StandardDeductionSalary}</label>,
                  <label>{item.Cess}</label>,
                  <HidingDisplay title={"Slab Rate"}>
                    <Table
                      columns={["From", "To", "Rate"]}
                      rows={item.SlabRate.map((slab, s) => [
                        <label>{slab.From}</label>,
                        <label>{slab.To}</label>,
                        <label>{slab.Rate}</label>,
                      ])}
                    />
                  </HidingDisplay>,
                  <HidingDisplay title={"Surcharge"}>
                    <Table
                      columns={["Threshold", "Rate"]}
                      rows={item.Surcharge.map((slab, s) => [
                        <label>{slab.Threshold}</label>,
                        <label>{slab.Rate}</label>,
                      ])}
                    />
                  </HidingDisplay>,
                  <CheckBox value={item.CalculateMarginalReliefOnExemption} />,
                  <CheckBox value={item.CalculateMarginalReliefOnSurcharge} />,
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
          <Button
            name={"New"}
            functionsArray={[() => openWindow(<CreateIncomeTaxCode />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={Code !== "" && collection.exists()}
            whileFalse={[() => showAlert("Income Tax Code does not exists.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateIncomeTaxCode
                    method="View"
                    initial={collection.getData()}
                  />
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={
              Code !== "" &&
              collection.exists() &&
              collection.getData().Status === "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Income Tax Code does not exists or, it is not in draft stage to be updated."
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateIncomeTaxCode
                    method="Update"
                    initial={collection.getData()}
                  />
                ),
            ]}
          />,
          <ConditionalButton
            name={"Delete"}
            result={
              Code !== "" &&
              collection.exists() &&
              collection.getData().Status === "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Income Tax Code does not exists or, it is not in draft stage to be deleted."
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
          <ConditionalButton
            name={"Copy"}
            result={Code !== "" && collection.exists()}
            whileFalse={[
              () => showAlert("The Income Tax Code does not exists."),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateIncomeTaxCode
                    method="Create"
                    initial={collection.getData()}
                  />
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
      TaxCode.exists() &&
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
        title={"Income Tax Simulation"}
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
        </DisplayArea>
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
        {Code !== "" && !TaxCode.exists() && (
          <p
            style={{
              background: "var(--redt)",
              color: "white",
              fontSize: "85%",
              margin: "0",
              width: "fit-content",
            }}
          >
            Income Tax Code does not exists.
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
