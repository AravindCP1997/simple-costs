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
  MultiDisplayArea,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { Asset, AssetGroup, CompanyCollection } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultAsset } from "../defaults";

export function ManageAsset() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new Asset(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Asset"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateAsset />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Asset does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateAsset method="View" initial={collection.getData()} />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Asset does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateAsset
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Asset does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateAsset
                    method="Create"
                    initial={{
                      ...collection.getData(),
                      ...{ Company: "", Code: "" },
                    }}
                  />,
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
              placeholder={"Enter Company Code"}
              suggestions={collection.company.listAll("Code")}
              captions={collection.company.listAll("Name")}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"Asset"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Asset Code"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateAsset({ initial = defaultAsset, method = "Create" }) {
  const {
    data,
    changeData,
    reset,
    setdata,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { openWindow, openConfirm, showAlert } = useInterface();
  const { DisplayHidingError, addError, clearErrors, errorsExist } = useError();
  const {
    Company,
    Code,
    Description,
    AssetGroupCode,
    DateofCapitalisation,
    Method,
    Rate,
    UsefulLife,
    SalvageValue,
    OrgAssignment,
  } = data;
  const collection = new Asset(Code, Company);
  const AssetGroups = new AssetGroup(AssetGroupCode, Company);
  const Depreciable = AssetGroups.depreciable();
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company does not exists`,
      );
    }
    addError(
      DateofCapitalisation === "",
      "DateofCapitalsation",
      `Date of Capitalisation cannot be blank.`,
    );
    addError(
      Method === "Reducing Balance" && (Rate === "" || Rate <= 0),
      "Rate",
      `Depreciation Rate shall be a positive value.`,
    );
    if (Method === "Straight Line") {
      addError(
        UsefulLife === "" || UsefulLife <= 0,
        "UsefulLife",
        `Useful Life shall be a positive value.`,
      );
      addError(
        SalvageValue === "" || SalvageValue < 0,
        "SalvageValue",
        `Salvage Value shall be a non-negative value.`,
      );
    }
    OrgAssignment.forEach((assignment, a) => {
      const { From, To, Type, Assignment } = assignment;
      const assignmentcollection = new CompanyCollection(Company, Type);
      addError(
        From === "" || To === "" || From > To,
        `OrgAssignment/${a + 1}`,
        `Period From and To are not valid.`,
      );
      addError(
        !assignmentcollection.exists({ Code: Assignment }),
        `OrgAssignment/${a + 1}`,
        `${Type} ${Assignment} does not exist in Company ${Company}.`,
      );
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={`${method} Asset`}
        menu={[
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
            />
          </Conditional>,
          <Conditional logic={method === "Update"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageAsset />),
              ]}
            />
          </Conditional>,
          <Conditional logic={method !== "View"}>
            <Button name={"Reset"} functionsArray={[() => reset()]} />
          </Conditional>,
          <Conditional logic={method !== "View"}>
            <DisplayHidingError />
          </Conditional>,
          <Button
            name="Manage"
            functionsArray={[
              () =>
                openConfirm(
                  "Data not saved will be lost.",
                  [],
                  [() => openWindow(<ManageAsset />)],
                ),
            ]}
          />,
        ]}
      />
      <WindowContent>
        <MultiDisplayArea
          heads={["General", "Depreciation", "Organisational"]}
          contents={[
            <Column overflow="visible">
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
                <Conditional logic={method !== "Create"}>
                  <label>{Code}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Description"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={Description}
                    process={(value) => changeData("", "Description", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{Description}</label>
                </Conditional>
              </Row>
              <Row overflow="visible">
                <Label label={"Asset Group"} />
                <Conditional logic={method === "Create"}>
                  <AutoSuggestInput
                    value={AssetGroupCode}
                    process={(value) => changeData("", "AssetGroupCode", value)}
                    placeholder={"Enter Asset Group"}
                    suggestions={AssetGroups.listAllFromCompany("Code")}
                    captions={AssetGroups.listAllFromCompany("Description")}
                  />
                </Conditional>
                <Conditional logic={method !== "Create"}>
                  <label>{AssetGroupCode}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Asset Group Depreciable"} />
                <CheckBox value={Depreciable} />
              </Row>
              <Row overflow="visible">
                <Label label={"Date of Capitalisation"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={DateofCapitalisation}
                    process={(value) =>
                      changeData("", "DateofCapitalisation", value)
                    }
                    type={"date"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{DateofCapitalisation}</label>
                </Conditional>
              </Row>
            </Column>,
            <Column>
              <Conditional logic={!Depreciable}>
                <label>The Asset Group is not depreciable.</label>
              </Conditional>
              <Conditional logic={Depreciable}>
                <Row>
                  <Label label={"Method of Depreciation"} />
                  <Conditional logic={method !== "View"}>
                    <Option
                      value={Method}
                      process={(value) => changeData("", "Method", value)}
                      options={["Reducing Balance", "Straight Line"]}
                    />
                  </Conditional>
                  <Conditional logic={method === "View"}>
                    <label>{Method}</label>
                  </Conditional>
                </Row>
                <Conditional logic={Method === "Straight Line"}>
                  <Row>
                    <Label label={"Useful Life"} />
                    <Conditional logic={method !== "View"}>
                      <Input
                        value={UsefulLife}
                        process={(value) => changeData("", "UsefulLife", value)}
                        type={"number"}
                      />
                    </Conditional>
                    <Conditional logic={method === "View"}>
                      <label>{UsefulLife}</label>
                    </Conditional>
                  </Row>
                  <Row>
                    <Label label={"Salvage Value"} />
                    <Conditional logic={method !== "View"}>
                      <Input
                        value={SalvageValue}
                        process={(value) =>
                          changeData("", "SalvageValue", value)
                        }
                        type={"number"}
                      />
                    </Conditional>
                    <Conditional logic={method === "View"}>
                      <label>{SalvageValue}</label>
                    </Conditional>
                  </Row>
                </Conditional>
                <Conditional logic={Method === "Reducing Balance"}>
                  <Row>
                    <Label label={"Rate of Depreciation"} />
                    <Conditional logic={method !== "View"}>
                      <Input
                        value={Rate}
                        process={(value) => changeData("", "Rate", value)}
                        type={"number"}
                      />
                    </Conditional>
                    <Conditional logic={method === "View"}>
                      <label>{Rate}</label>
                    </Conditional>
                  </Row>
                </Conditional>
              </Conditional>
            </Column>,
            <Column>
              <Conditional logic={method !== "View"}>
                <Row jc="left">
                  <Label label={"Organisational Assignment"} />
                  <Button
                    name="Add"
                    functionsArray={[
                      () =>
                        addItemtoArray("OrgAssignment", {
                          From: "",
                          To: "",
                          Type: "CostCenter",
                          Assignment: "",
                        }),
                    ]}
                  />
                </Row>
                <Table
                  columns={["From", "To", "Type", "Assignment", ""]}
                  rows={OrgAssignment.map((assignment, a) => [
                    <Input
                      value={assignment.From}
                      process={(value) =>
                        changeData(`OrgAssignment/${a}`, "From", value)
                      }
                      type={"date"}
                    />,
                    <Input
                      value={assignment.To}
                      process={(value) =>
                        changeData(`OrgAssignment/${a}`, "To", value)
                      }
                      type={"date"}
                    />,
                    <Option
                      value={assignment.Type}
                      process={(value) =>
                        changeData(`OrgAssignment/${a}`, "Type", value)
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
                        changeData(`OrgAssignment/${a}`, "Assignment", value)
                      }
                      placeholder={`Enter ${assignment.Type}`}
                      suggestions={new CompanyCollection(
                        Company,
                        assignment.Type,
                      ).listAllFromCompany("Code")}
                      captions={new CompanyCollection(
                        Company,
                        assignment.Type,
                      ).listAllFromCompany("Description")}
                    />,
                    <Button
                      name="-"
                      functionsArray={[
                        () => deleteItemfromArray(`OrgAssignment`, a),
                      ]}
                    />,
                  ])}
                />
              </Conditional>
              <Conditional logic={method === "View"}>
                <Row jc="left">
                  <Label label={"Organisational Assignment"} />
                </Row>
                <Table
                  columns={["From", "To", "Type", "Assignment"]}
                  rows={OrgAssignment.map((assignment, a) => [
                    <label>{assignment.From}</label>,
                    <label>{assignment.To}</label>,
                    <label>{assignment.Type}</label>,
                    <label>{assignment.Assignment}</label>,
                  ])}
                />
              </Conditional>
            </Column>,
          ]}
        />
      </WindowContent>
    </>
  );
}
