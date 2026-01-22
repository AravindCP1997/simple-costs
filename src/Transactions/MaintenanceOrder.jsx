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
  Conditional,
  HidingPrompt,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { MaintenanceOrder, CompanyCollection } from "../classes";

import { defaultMaintenanceOrder } from "../defaults";

export function CreateMaintenanceOrder({
  initial = defaultMaintenanceOrder,
  meth = "Create",
}) {
  const {
    data: promptData,
    changeData: changePrompt,
    reset: resetPrompt,
  } = useData({ company: "", code: "" });
  const promptCollection = new MaintenanceOrder(
    promptData.code,
    promptData.company,
  );
  const [method, setmethod] = useState(meth);
  const {
    data,
    processed,
    changeData,
    reset,
    setdata,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { openWindow, openConfirm, showAlert } = useInterface();
  const { DisplayHidingError, addError, clearErrors, errorsExist } = useError();
  const { Company, Code, Date, Description, Activities, Status } = processed;
  const collection = new MaintenanceOrder(Code, Company);
  useEffect(() => {
    clearErrors();
    if (method !== "View") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company '${Company}' does not exist.`,
      );
      addError(Date === "", "Date", "Date cannot be blank.");
      Activities.forEach((activity, a) => {
        const { Description, From, To, OrgAssignment } = activity;
        addError(
          Description === "",
          `Activities/${a + 1}`,
          "Description cannot be blank.",
        );
        addError(
          From === "" || To === "" || From > To,
          `Activities/${a + 1}`,
          `Period invalid.`,
        );
        OrgAssignment.forEach((assignment, as) => {
          const { Type, Assignment, Share } = assignment;
          addError(
            Assignment === "",
            `Activities/${a + 1}/OrgAssignment/${as + 1}`,
            `Assignment cannot be blank.`,
          );
          addError(
            Assignment !== "" &&
              !new CompanyCollection(Company, Type).exists({
                Code: Assignment,
              }),
            `Activities/${a + 1}/OrgAssignment/${as + 1}`,
            `${Type} does not exist.`,
          );
        });
      });
    }
  }, [data]);
  return (
    <>
      <WindowTitle
        title={`${method} Maintenance Order`}
        menu={[
          <Conditional logic={method !== "Create"}>
            <Button
              name="Create"
              functionsArray={[
                () => setmethod("Create"),
                () => setdata(defaultMaintenanceOrder),
              ]}
            />
          </Conditional>,
          <HidingPrompt
            submitLabel="Open"
            result={promptCollection.exists()}
            title={"Open"}
            onClose={[() => resetPrompt()]}
            onSubmitFail={[
              () => showAlert("Maintenance order does not exist."),
            ]}
            onSubmitSuccess={[
              () => setdata(promptCollection.getData()),
              () =>
                setmethod(
                  promptCollection.getData().Status === "Draft"
                    ? "Update"
                    : "View",
                ),
              () => resetPrompt(),
            ]}
          >
            <Row overflow="visible">
              <Label label={"Company"} />
              <AutoSuggestInput
                value={promptData.company}
                process={(value) => changePrompt("", "company", value)}
                suggestions={promptCollection.company.listAll("Code")}
                captions={promptCollection.company.listAll("Name")}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Maintenance Order"} />
              <AutoSuggestInput
                value={promptData.code}
                process={(value) => changePrompt("", "code", value)}
                suggestions={promptCollection.listAllFromCompany("Code")}
                captions={promptCollection.listAllFromCompany("Description")}
              />
            </Row>
          </HidingPrompt>,
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () =>
                  showAlert(
                    collection.add({ ...processed, ["Status"]: "Ready" }),
                  ),
                () => setdata(defaultMaintenanceOrder),
                () => setmethod("Create"),
              ]}
            />
          </Conditional>,
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Draft"}
              result={collection.company.exists()}
              whileFalse={[() => showAlert("Company does not exist.")]}
              whileTrue={[
                () => showAlert(collection.add(processed)),
                () => setdata(defaultMaintenanceOrder),
                () => setmethod("Create"),
              ]}
            />
          </Conditional>,
          <Conditional logic={method === "Update"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () =>
                  showAlert(
                    collection.update({ ...processed, ["Status"]: "Ready" }),
                  ),
                () => setdata(defaultMaintenanceOrder),
                () => setmethod("Create"),
              ]}
            />
          </Conditional>,
          <Conditional logic={method === "Update"}>
            <ConditionalButton
              name={"Draft"}
              result={collection.company.exists()}
              whileFalse={[() => showAlert("Company does not exist.")]}
              whileTrue={[
                () => showAlert(collection.update(processed)),
                () => setdata(defaultMaintenanceOrder),
                () => setmethod("Create"),
              ]}
            />
          </Conditional>,
          <Conditional logic={method !== "View"}>
            <DisplayHidingError />
          </Conditional>,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row overflow="visible">
            <Label label={"Company"} />
            <Conditional logic={method === "Create"}>
              <AutoSuggestInput
                value={Company}
                process={(value) => changeData("", "Company", value)}
                placeholder={"Enter Company Code"}
                suggestions={collection.company.filteredList(
                  { Status: "Ready" },
                  "Code",
                )}
                captions={collection.company.filteredList(
                  { Status: "Ready" },
                  "Name",
                )}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{Company}</label>
            </Conditional>
          </Row>
          <Row>
            <Label label={"Code"} />
            <label>{Code}</label>
          </Row>
          <Row>
            <Label label={"Status"} />
            <label>{Status}</label>
          </Row>
          <Row>
            <Label label={"Date"} />
            <Conditional logic={method !== "View"}>
              <Input
                value={Date}
                process={(value) => changeData("", "Date", value)}
                type={"date"}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{Date}</label>
            </Conditional>
          </Row>
          <Row>
            <Label label={"Description"} />
            <Conditional logic={method !== "View"}>
              <Input
                value={Description}
                process={(value) => changeData("", "Description", value)}
                type={"text"}
                style={{ width: "100%" }}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{Description}</label>
            </Conditional>
          </Row>
          <Column overflow="visible">
            <Conditional logic={method !== "View"}>
              <Row jc="left">
                <Label label={"Activities"} />
                <Button
                  name="Add"
                  functionsArray={[
                    () =>
                      addItemtoArray("Activities", {
                        Description: "",
                        From: "",
                        To: "",
                        OrgAssignment: [
                          { Type: "CostCenter", Assignment: "", Share: "" },
                        ],
                      }),
                  ]}
                />
              </Row>
              <Table
                columns={[
                  "No",
                  "Description",
                  "From",
                  "To",
                  "Organisational Assignment",
                  "",
                ]}
                rows={Activities.map((item, i) => [
                  <Input value={i + 1} />,
                  <Input
                    value={item.Description}
                    process={(value) =>
                      changeData(`Activities/${i}`, "Description", value)
                    }
                    type="text"
                  />,
                  <Input
                    value={item.From}
                    process={(value) =>
                      changeData(`Activities/${i}`, `From`, value)
                    }
                    type={"date"}
                  />,
                  <Input
                    value={item.To}
                    process={(value) =>
                      changeData(`Activities/${i}`, `To`, value)
                    }
                    type={"date"}
                  />,
                  <HidingDisplay
                    title={"Organisational Assignment"}
                    buttonName={"Assign"}
                    menu={[
                      <Button
                        name={"Add"}
                        functionsArray={[
                          () =>
                            addItemtoArray(`Activities/${i}/OrgAssignment`, {
                              Type: "CostCenter",
                              Assignment: "",
                              Share: "",
                            }),
                        ]}
                      />,
                    ]}
                  >
                    <Table
                      columns={["Type", "Assignment", "Share", ""]}
                      rows={item.OrgAssignment.map((assignment, a) => [
                        <Option
                          value={assignment.Type}
                          process={(value) =>
                            changeData(
                              `Activities/${i}/OrgAssignment/${a}`,
                              "Type",
                              value,
                            )
                          }
                          options={[
                            "CostCenter",
                            "Location",
                            "Plant",
                            "RevenueCenter",
                          ]}
                        />,
                        <AutoSuggestInput
                          value={assignment.Assignment}
                          process={(value) =>
                            changeData(
                              `Activities/${i}/OrgAssignment/${a}`,
                              "Assignment",
                              value,
                            )
                          }
                          suggestions={new CompanyCollection(
                            Company,
                            assignment.Type,
                          ).listAllFromCompany("Code")}
                          captions={new CompanyCollection(
                            Company,
                            assignment.Type,
                          ).listAllFromCompany("Description")}
                          placeholder={`Enter ${assignment.Type} Code`}
                        />,
                        <Input
                          value={assignment.Share}
                          process={(value) =>
                            changeData(
                              `Activities/${i}/OrgAssignment/${a}`,
                              "Share",
                              value,
                            )
                          }
                        />,
                        <Button
                          name="-"
                          functionsArray={[
                            () =>
                              deleteItemfromArray(
                                `Activities/${i}/OrgAssignment`,
                                a,
                              ),
                          ]}
                        />,
                      ])}
                    />
                  </HidingDisplay>,
                  <Button
                    name={"-"}
                    functionsArray={[
                      () => deleteItemfromArray(`Activities`, i),
                    ]}
                  />,
                ])}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <Row jc="left">
                <Label label={"Activities"} />
              </Row>
              <Table
                columns={[
                  "No",
                  "Description",
                  "From",
                  "To",
                  "Organisational Assignment",
                ]}
                rows={Activities.map((item, i) => [
                  <label>{i + 1}</label>,
                  <label>{item.Description}</label>,
                  <label>{item.From}</label>,
                  <label>{item.To}</label>,
                  <HidingDisplay
                    title={"Organisational Assignment"}
                    buttonName={"Assigned"}
                  >
                    <Table
                      columns={["Type", "Assignment", "Share"]}
                      rows={item.OrgAssignment.map((assignment, a) => [
                        <label>{assignment.Type}</label>,
                        <label>{assignment.Assignment}</label>,
                        <label>{assignment.Share}</label>,
                      ])}
                    />
                  </HidingDisplay>,
                ])}
              />
            </Conditional>
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
