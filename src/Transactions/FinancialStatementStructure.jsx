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
import { ChartOfAccounts, FinancialStatementStructure } from "../classes";
import { Collection } from "../Database";
import { rangeOverlap } from "../functions";
import { sampleFinancialStatementStructure } from "../samples";
import { defaultFinancialStatementStructure } from "../defaults";

export function ManageFinancialStatementStructure() {
  const [Chart, setChart] = useState("");
  const [Code, setCode] = useState("");
  const Collection = new FinancialStatementStructure(Chart, Code);
  const Charts = new ChartOfAccounts(Chart);
  const { openConfirm, openWindow, showAlert } = useInterface();

  return (
    <>
      <WindowTitle
        title={"Manage Financial Statement Structure"}
        menu={[
          <Button
            name="New"
            functionsArray={[
              () => openWindow(<CreateFinancialStatementStructure />),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={Chart !== "" && Code !== "" && Collection.exists()}
            whileFalse={[
              () => showAlert("Financial Statements Structure does not exist."),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateFinancialStatementStructure
                    initial={Collection.getData()}
                    method="Update"
                  />
                ),
            ]}
          />,
          <ConditionalButton
            name={"Delete"}
            result={Chart !== "" && Code !== "" && Collection.exists()}
            whileFalse={[
              () => showAlert("Financial Statements Structure does not exist."),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the Financial Statement Structure.",
                  [],
                  [
                    () => showAlert(Collection.delete()),
                    () => setChart(""),
                    () => setCode(""),
                  ]
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={Chart !== "" && Code !== "" && Collection.exists()}
            whileFalse={[
              () => showAlert("Financial Statements Structure does not exist."),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateFinancialStatementStructure
                    initial={Collection.getData()}
                    method="Create"
                  />
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
              value={Chart}
              process={(value) => setChart(value)}
              onSelect={(value) => setChart(value)}
              suggestions={Charts.filteredList({ Status: "Ready" }, "Code")}
              placeholder={"Enter Chart of Accounts"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"Financial Statement Structure"} />
            <AutoSuggestInput
              value={Code}
              process={(value) => setCode(value)}
              onSelect={(value) => setCode(value)}
              suggestions={Collection.listAll("Code")}
              placeholder={"Enter Structure"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateFinancialStatementStructure({
  method = "Create",
  initial = defaultFinancialStatementStructure,
}) {
  const {
    data,
    changeData,
    reset,
    setdata,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { Chart, Code, Hierarchy, Description } = data;
  const collection = new FinancialStatementStructure(Chart, Code);
  const Charts = new ChartOfAccounts(Chart);
  const { openWindow, showAlert } = useInterface();
  const { errorsExist, DisplayHidingError, clearErrors, addError } = useError();
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        Chart === "" || !Charts.exists(),
        "ChartofAccounts",
        "Chart of Accounts doesnot exist"
      );
      addError(
        Chart !== "" && Code !== "" && collection.exists(),
        "FinancialStatementStructure",
        `Financial Statement Structure ${Code} already exist in Chart of Accounts ${Chart}.`
      );
    }
    allGLAssignment(data["Hierarchy"]).forEach((presentation, p) => {
      const { From, To, Path, Debit, Credit } = presentation;
      addError(
        From === "" || From < 0,
        "Hierarchy",
        `At path ${Path}, 'GL From' shall be a non-negative value`
      );
      addError(
        To === "" || To < 0,
        "Hierarchy",
        `At path ${Path}, 'GL To' shall be a non-negative value`
      );
      addError(
        From > To,
        "Hierarchy",
        `At path ${Path}, 'GL From' is greater than 'GL To.`
      );
      allGLAssignment(data["Hierarchy"]).forEach((presentationtwo, ptwo) => {
        const {
          From: FromTwo,
          To: ToTwo,
          Path: PathTwo,
          Debit: DebitTwo,
          Credit: CreditTwo,
        } = presentationtwo;
        addError(
          p > ptwo &&
            rangeOverlap([From, To], [FromTwo, ToTwo]) &&
            (Debit === DebitTwo || Credit === CreditTwo),
          "Hierarchy",
          `Range overlaps between ${Path} and ${PathTwo}`
        );
      });
    });
  }, [data]);
  if (method === "Create") {
    return (
      <>
        <WindowTitle
          title={"Create Financial Statement Structure"}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Meassages exist. Please check.")]}
              whileTrue={[() => showAlert(collection.add(data))]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <Button
              name="Sample"
              functionsArray={[
                () => setdata(sampleFinancialStatementStructure),
              ]}
            />,
            <DisplayHidingError />,
            ,
            <Button
              name={"Manage"}
              functionsArray={[
                () => openWindow(<ManageFinancialStatementStructure />),
              ]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Column>
              <Row overflow="visible">
                <Label label={"Chart of Accounts"} />
                <AutoSuggestInput
                  value={Chart}
                  process={(value) => changeData("", "Chart", value)}
                  onSelect={(value) => changeData("", "Chart", value)}
                  suggestions={Charts.filteredList({ Status: "Draft" })}
                  placeholder={"Enter Chart of Accounts"}
                />
              </Row>
              <Row>
                <Label label={"Financial Statement Structure"} />
                <Input
                  value={Code}
                  process={(value) => changeData("", "Code", value)}
                  type="text"
                  maxLength={4}
                />
              </Row>
              <Row>
                <Label label={"Description"} />
                <Input
                  value={Description}
                  process={(value) => changeData("", "Description", value)}
                  type={"text"}
                />
              </Row>
              <Column>
                <Label label={"Hierarchy"} />
                <details key="Asset">
                  <summary>
                    <>
                      <label>Assets</label>
                      <Input
                        value={Hierarchy[0].altName}
                        process={(value) =>
                          changeData("Hierarchy/0", "altName", value)
                        }
                        type={"text"}
                        placeholder="Enter Alternate Name"
                      />
                    </>
                  </summary>
                  <Row jc="left">
                    <Button
                      name="Add Presentation"
                      functionsArray={[
                        () =>
                          addItemtoArray("Hierarchy/0/presentations", {
                            name: "",
                            ledgers: [
                              { From: "", To: "", Debit: false, Credit: false },
                            ],
                          }),
                      ]}
                    />
                    <Button
                      name="Add Group"
                      functionsArray={[
                        () =>
                          addItemtoArray("Hierarchy/0/subgroups", {
                            name: "",
                            subgroups: [],
                            presentations: [],
                          }),
                      ]}
                    />
                  </Row>
                  <GroupInput
                    data={Hierarchy[0]}
                    path={"Hierarchy/0"}
                    changeData={changeData}
                    addItemtoArray={addItemtoArray}
                    deleteItemfromArray={deleteItemfromArray}
                  />
                </details>
                <details key="EquityandLiabilities">
                  <summary>
                    <>
                      <label>Equity and Liabilities</label>
                      <Input
                        value={Hierarchy[1].altName}
                        process={(value) =>
                          changeData("Hierarchy/1", "altName", value)
                        }
                        type={"text"}
                        placeholder="Enter Alternate Name"
                      />
                    </>
                  </summary>
                  <Row jc="left">
                    <Button
                      name="Add Presentation"
                      functionsArray={[
                        () =>
                          addItemtoArray("Hierarchy/1/presentations", {
                            name: "",
                            ledgers: [
                              { From: "", To: "", Debit: false, Credit: false },
                            ],
                          }),
                      ]}
                    />
                    <Button
                      name="Add Group"
                      functionsArray={[
                        () =>
                          addItemtoArray("Hierarchy/1/subgroups", {
                            name: "",
                            subgroups: [],
                            presentations: [],
                          }),
                      ]}
                    />
                  </Row>
                  <GroupInput
                    data={Hierarchy[1]}
                    path={"Hierarchy/1"}
                    changeData={changeData}
                    addItemtoArray={addItemtoArray}
                    deleteItemfromArray={deleteItemfromArray}
                  />
                </details>
                <Row>
                  <label>Net Profit</label>
                  <Input
                    value={Hierarchy[2].altName}
                    process={(value) =>
                      changeData("Hierarchy/2", "altName", value)
                    }
                    type={"text"}
                    placeholder="Enter Alternate Name"
                  />
                </Row>
                <Row>
                  <label>Net Loss</label>
                  <Input
                    value={Hierarchy[3].altName}
                    process={(value) =>
                      changeData("Hierarchy/3", "altName", value)
                    }
                    type={"text"}
                    placeholder="Enter Alternate Name"
                  />
                </Row>
              </Column>
            </Column>
            {JSON.stringify(allGLAssignment(data["Hierarchy"]))}
          </DisplayArea>
        </WindowContent>
      </>
    );
  } else if (method === "Update") {
    return (
      <>
        <WindowTitle
          title={"Update Financial Statement Structure"}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Meassages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageFinancialStatementStructure />),
              ]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,

            <DisplayHidingError />,
            ,
            <Button
              name={"Manage"}
              functionsArray={[
                () => openWindow(<ManageFinancialStatementStructure />),
              ]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Column>
              <Row overflow="visible">
                <Label label={"Chart of Accounts"} />
                <label>{Chart}</label>
              </Row>
              <Row>
                <Label label={"Financial Statement Structure"} />
                <label>{Code}</label>
              </Row>
              <Row>
                <Label label={"Description"} />
                <Input
                  value={Description}
                  process={(value) => changeData("", "Description", value)}
                  type={"text"}
                />
              </Row>
              <Column>
                <Label label={"Hierarchy"} />
                <details key="Asset">
                  <summary>
                    <>
                      <label>Assets</label>
                      <Input
                        value={Hierarchy[0].altName}
                        process={(value) =>
                          changeData("Hierarchy/0", "altName", value)
                        }
                        type={"text"}
                        placeholder="Enter Alternate Name"
                      />
                    </>
                  </summary>
                  <Row jc="left">
                    <Button
                      name="Add Presentation"
                      functionsArray={[
                        () =>
                          addItemtoArray("Hierarchy/0/presentations", {
                            name: "",
                            ledgers: [
                              { From: "", To: "", Debit: false, Credit: false },
                            ],
                          }),
                      ]}
                    />
                    <Button
                      name="Add Group"
                      functionsArray={[
                        () =>
                          addItemtoArray("Hierarchy/0/subgroups", {
                            name: "",
                            subgroups: [],
                            presentations: [],
                          }),
                      ]}
                    />
                  </Row>
                  <GroupInput
                    data={Hierarchy[0]}
                    path={"Hierarchy/0"}
                    changeData={changeData}
                    addItemtoArray={addItemtoArray}
                    deleteItemfromArray={deleteItemfromArray}
                  />
                </details>
                <details key="EquityandLiabilities">
                  <summary>
                    <>
                      <label>Equity and Liabilities</label>
                      <Input
                        value={Hierarchy[1].altName}
                        process={(value) =>
                          changeData("Hierarchy/1", "altName", value)
                        }
                        type={"text"}
                        placeholder="Enter Alternate Name"
                      />
                    </>
                  </summary>
                  <Row jc="left">
                    <Button
                      name="Add Presentation"
                      functionsArray={[
                        () =>
                          addItemtoArray("Hierarchy/1/presentations", {
                            name: "",
                            ledgers: [
                              { From: "", To: "", Debit: false, Credit: false },
                            ],
                          }),
                      ]}
                    />
                    <Button
                      name="Add Group"
                      functionsArray={[
                        () =>
                          addItemtoArray("Hierarchy/1/subgroups", {
                            name: "",
                            subgroups: [],
                            presentations: [],
                          }),
                      ]}
                    />
                  </Row>
                  <GroupInput
                    data={Hierarchy[1]}
                    path={"Hierarchy/1"}
                    changeData={changeData}
                    addItemtoArray={addItemtoArray}
                    deleteItemfromArray={deleteItemfromArray}
                  />
                </details>
                <Row>
                  <label>Net Profit</label>
                  <Input
                    value={Hierarchy[2].altName}
                    process={(value) =>
                      changeData("Hierarchy/2", "altName", value)
                    }
                    type={"text"}
                    placeholder="Enter Alternate Name"
                  />
                </Row>
                <Row>
                  <label>Net Loss</label>
                  <Input
                    value={Hierarchy[3].altName}
                    process={(value) =>
                      changeData("Hierarchy/3", "altName", value)
                    }
                    type={"text"}
                    placeholder="Enter Alternate Name"
                  />
                </Row>
              </Column>
            </Column>
          </DisplayArea>
        </WindowContent>
      </>
    );
  }
}

const GroupInput = ({
  data,
  path,
  changeData,
  addItemtoArray,
  deleteItemfromArray,
}) => {
  return (
    <>
      {data.presentations && data.presentations.length > 0 && (
        <>
          {data.presentations.map((presentation, p) => (
            <Row jc="left" key={p}>
              <Input
                value={presentation.name}
                process={(value) =>
                  changeData(`${path}/presentations/${p}`, "name", value)
                }
                type={"text"}
                placeholder="Enter Presentation Name"
              />
              <HidingDisplay
                buttonName={"Assign GL"}
                title={presentation.name}
                menu={[
                  <Button
                    name={"Add"}
                    functionsArray={[
                      () =>
                        addItemtoArray(`${path}/presentations/${p}/ledgers`, {
                          From: "",
                          To: "",
                          Debit: true,
                          Credit: true,
                        }),
                    ]}
                  />,
                ]}
              >
                <Table
                  columns={["From GL", "To GL", "Debit", "Credit", ""]}
                  rows={presentation.ledgers.map((ledger, l) => [
                    <Input
                      value={ledger.From}
                      process={(value) =>
                        changeData(
                          `${path}/presentations/${p}/ledgers/${l}`,
                          "From",
                          value
                        )
                      }
                      type={"number"}
                    />,
                    <Input
                      value={ledger.To}
                      process={(value) =>
                        changeData(
                          `${path}/presentations/${p}/ledgers/${l}`,
                          "To",
                          value
                        )
                      }
                      type={"number"}
                    />,
                    <CheckBox
                      value={ledger.Debit}
                      process={(value) =>
                        changeData(
                          `${path}/presentations/${p}/ledgers/${l}`,
                          "Debit",
                          value
                        )
                      }
                    />,
                    <CheckBox
                      value={ledger.Credit}
                      process={(value) =>
                        changeData(
                          `${path}/presentations/${p}/ledgers/${l}`,
                          "Credit",
                          value
                        )
                      }
                    />,
                  ])}
                />
                ,
                <Button
                  name={"-"}
                  functionsArray={[
                    () =>
                      deleteItemfromArray(
                        `${path}/presentations/${p}/ledgers`,
                        l
                      ),
                  ]}
                />
              </HidingDisplay>
              <Button
                name={"-"}
                functionsArray={[
                  () => deleteItemfromArray(`${path}/presentations`, p),
                ]}
              />
            </Row>
          ))}
        </>
      )}
      {data.subgroups && data.subgroups.length > 0 && (
        <>
          {data.subgroups.map((subgroup, s) => (
            <details key={s}>
              <summary>
                <>
                  <Input
                    value={subgroup.name}
                    process={(value) =>
                      changeData(`${path}/subgroups/${s}`, "name", value)
                    }
                    type={"text"}
                  />
                  <Button
                    name="-"
                    functionsArray={[
                      () => deleteItemfromArray(`${path}/subgroups`, s),
                    ]}
                  />
                </>
              </summary>
              <Column>
                <Row jc="left">
                  <Button
                    name={"Add Presentation"}
                    functionsArray={[
                      () =>
                        addItemtoArray(`${path}/subgroups/${s}/presentations`, {
                          name: "",
                          ledgers: [
                            {
                              From: "",
                              To: "",
                              Debit: true,
                              Credit: true,
                            },
                          ],
                        }),
                    ]}
                  />
                  <Button
                    name={"Add Subgroups"}
                    functionsArray={[
                      () =>
                        addItemtoArray(`${path}/subgroups/${s}/subgroups`, {
                          name: "",
                          presentations: [],
                          subgroups: [],
                        }),
                    ]}
                  />
                </Row>
                <GroupInput
                  data={subgroup}
                  path={`${path}/subgroups/${s}`}
                  changeData={changeData}
                  addItemtoArray={addItemtoArray}
                  deleteItemfromArray={deleteItemfromArray}
                />
              </Column>
            </details>
          ))}
        </>
      )}
    </>
  );
};

export function glAssignment(path, data) {
  const list = [];
  data.presentations.forEach((presentation, p) => {
    presentation.ledgers.forEach((ledger, l) => {
      list.push({ ...ledger, ["Path"]: `${path}/${presentation.name}` });
    });
  });
  data.subgroups.forEach((subgroup, s) => {
    list.push(...glAssignment(`${path}/${subgroup.name}`, subgroup));
  });
  return list;
}

export function allGLAssignment(data) {
  const list = [];
  list.push(...glAssignment("Asset", data[0]));
  list.push(...glAssignment("Equity and Liabilities", data[1]));
  return list;
}
