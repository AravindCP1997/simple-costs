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
import {
  Employee,
  CompanyCollection,
  WageType,
  IncomeTaxCode,
  EmployeeGroup,
} from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultEmployee } from "../defaults";
import { StatesMaster } from "../constants";

export function ManageEmployee() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new Employee(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Employee"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateEmployee />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Employee does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateEmployee
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Employee does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateEmployee
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Employee does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateEmployee
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
            <Label label={"Employee"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Employee Code"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Name")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateEmployee({
  initial = defaultEmployee,
  method = "Create",
}) {
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
    Name,
    EmployeeGroupCode,
    Address,
    PostalCode,
    Country,
    State,
    Phone,
    Email,
    DOB,
    DOJ,
    DOS,
    Position,
    OrgAssignment,
    OneTimeWages,
    VariableWages,
    FixedWages,
    TaxCode,
    Additions,
    Deductions,
    TIN,
    BankAccounts,
    Blocked,
  } = data;
  const collection = new Employee(Code, Company);
  const eg = new EmployeeGroup(EmployeeGroupCode, Company);
  const wagetypes = new WageType("", Company);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company does not exists`,
      );
      addError(!eg.exists(), "EmployeeGroup", "Employee Group does not exist.");
      addError(Name === "", "Name", "Name cannot be blank.");
    }
    addError(Country === "", "Country", "Country cannot be blank.");
    addError(State === "", "State", "State cannot be blank.");
    addError(DOB === "", "DOB", "Date of Birth cannot be blank.");
    addError(DOJ === "", "DOJ", "Date of Joining cannot be blank.");
    addError(
      DOJ < DOB,
      "DOJ",
      "Date of Joining cannot be earlier than Date of Birth",
    );
    addError(
      DOS !== "" && DOS < DOJ,
      "DOS",
      "Date of Separation cannot be earlier than Date of Joining",
    );
  }, [data]);

  return (
    <>
      <WindowTitle
        title={`${method} Employee`}
        menu={[
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.add(data)),
                () => setdata(defaultEmployee),
              ]}
            />
          </Conditional>,
          <Conditional logic={method === "Update"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageEmployee />),
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
                  [() => openWindow(<ManageEmployee />)],
                ),
            ]}
          />,
        ]}
      />
      <WindowContent>
        <MultiDisplayArea
          heads={["General", "Organisational", "Wages", "Taxation", "Banking"]}
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
              <Row overflow="visible">
                <Label label={"Employee Group"} />
                <Conditional logic={method === "Create"}>
                  <AutoSuggestInput
                    value={EmployeeGroupCode}
                    process={(value) =>
                      changeData("", "EmployeeGroupCode", value)
                    }
                    placeholder={"Enter Employee Group"}
                    suggestions={eg.listAllFromCompany("Code")}
                    captions={eg.listAllFromCompany("Description")}
                  />
                </Conditional>
                <Conditional logic={method !== "Create"}>
                  <label>{EmployeeGroupCode}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Name"} />
                <Conditional logic={method === "Create"}>
                  <Input
                    value={Name}
                    process={(value) => changeData("", "Name", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method !== "Create"}>
                  <label>{Name}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Address"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={Address}
                    process={(value) => changeData("", "Address", value)}
                    type={"text"}
                    style={{ width: "min(100%,600px)" }}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{Address}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Postal Code"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={PostalCode}
                    process={(value) => changeData("", "PostalCode", value)}
                    type={"number"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{PostalCode}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Country"} />
                <Conditional logic={method !== "View"}>
                  <Option
                    value={Country}
                    process={(value) => changeData("", "Country", value)}
                    options={["", ...ListUniqueItems(StatesMaster, "Country")]}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{Country}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"State"} />
                <Conditional logic={method !== "View"}>
                  <Option
                    value={State}
                    process={(value) => changeData("", "State", value)}
                    options={[
                      "",
                      ...FilteredList(
                        StatesMaster,
                        { Country: Country },
                        "State",
                      ),
                    ]}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{State}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Phone"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={Phone}
                    process={(value) => changeData("", "Phone", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{Phone}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Email"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={Email}
                    process={(value) => changeData("", "Email", value)}
                    type={"text"}
                    style={{ width: "min(100%,600px)" }}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{Email}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Date of Birth"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={DOB}
                    process={(value) => changeData("", "DOB", value)}
                    type={"date"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{DOB}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Date of Joining"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={DOJ}
                    process={(value) => changeData("", "DOJ", value)}
                    type={"date"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{DOJ}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Date of Separation"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={DOS}
                    process={(value) => changeData("", "DOS", value)}
                    type={"date"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{DOS}</label>
                </Conditional>
              </Row>
              <Row borderBottom="none">
                <Label label={"Blocked"} />
                <Conditional logic={method !== "View"}>
                  <CheckBox
                    value={Blocked}
                    process={(value) => changeData("", "Blocked", value)}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <CheckBox
                    value={Blocked}
                    process={() => changeData("", "Blocked", Blocked)}
                  />
                </Conditional>
              </Row>
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
              <Conditional logic={method !== "View"}>
                <Row jc="left">
                  <Label label={"Position Details"} />
                  <Button
                    name="Add"
                    functionsArray={[
                      () =>
                        addItemtoArray("Position", {
                          From: "",
                          To: "",
                          Position: "",
                        }),
                    ]}
                  />
                </Row>
                <Table
                  columns={["From", "To", "Position", ""]}
                  rows={Position.map((position, p) => [
                    <Input
                      value={position.From}
                      process={(value) =>
                        changeData(`Position/${p}`, "From", value)
                      }
                      type={"date"}
                    />,
                    <Input
                      value={position.To}
                      process={(value) =>
                        changeData(`Position/${p}`, "To", value)
                      }
                      type={"date"}
                    />,
                    <Input
                      value={position.Position}
                      process={(value) =>
                        changeData(`Position/${p}`, "Position", value)
                      }
                      type={"text"}
                    />,
                    <Button
                      name="-"
                      functionsArray={[
                        () => deleteItemfromArray(`Position`, p),
                      ]}
                    />,
                  ])}
                />
              </Conditional>
              <Conditional logic={method === "View"}>
                <Row jc="left">
                  <Label label={"Position Details"} />
                </Row>
                <Table
                  columns={["From", "To", "Position"]}
                  rows={Position.map((position, p) => [
                    <label>{position.From}</label>,
                    <label>{position.To}</label>,
                    <label>{position.Position}</label>,
                  ])}
                />
              </Conditional>
            </Column>,
            <Column overflow="visible">
              <Conditional logic={method !== "View"}>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"Variable Wages"} />
                    <Button
                      name="Add"
                      functionsArray={[
                        () =>
                          addItemtoArray("VariableWages", {
                            WT: "",
                            From: "",
                            To: "",
                            Amount: "",
                          }),
                      ]}
                    />
                  </Row>
                  <Table
                    columns={["Wage Type", "From", "To", "Amount", ""]}
                    rows={VariableWages.map((wage, w) => [
                      <AutoSuggestInput
                        value={wage.WT}
                        process={(value) =>
                          changeData(`VariableWages/${w}`, "WT", value)
                        }
                        suggestions={wagetypes.filterFromCompany(
                          {
                            Nature: "Variable",
                          },
                          "Code",
                        )}
                        captions={wagetypes.filterFromCompany(
                          {
                            Nature: "Variable",
                          },
                          "Description",
                        )}
                        placeholder={"Enter Wage Type"}
                      />,
                      <Input
                        value={wage.From}
                        process={(value) =>
                          changeData(`VariableWages/${w}`, "From", value)
                        }
                        type={"date"}
                      />,
                      <Input
                        value={wage.To}
                        process={(value) =>
                          changeData(`VariableWages/${w}`, "To", value)
                        }
                        type={"date"}
                      />,
                      <Input
                        value={wage.Amount}
                        process={(value) =>
                          changeData(`VariableWages/${w}`, "Amount", value)
                        }
                        type={"number"}
                      />,
                      <Button
                        name="-"
                        functionsArray={[
                          () => deleteItemfromArray(`VariableWages`, w),
                        ]}
                      />,
                    ])}
                  />
                </Column>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"Fixed Wages"} />
                    <Button
                      name="Add"
                      functionsArray={[
                        () =>
                          addItemtoArray("FixedWages", {
                            WT: "",
                            From: "",
                            To: "",
                            Amount: "",
                          }),
                      ]}
                    />
                  </Row>
                  <Table
                    columns={["Wage Type", "From", "To", "Amount", ""]}
                    rows={FixedWages.map((wage, w) => [
                      <AutoSuggestInput
                        value={wage.WT}
                        process={(value) =>
                          changeData(`FixedWages/${w}`, "WT", value)
                        }
                        suggestions={wagetypes.filterFromCompany(
                          {
                            Nature: "Fixed",
                          },
                          "Code",
                        )}
                        captions={wagetypes.filterFromCompany(
                          {
                            Nature: "Fixed",
                          },
                          "Description",
                        )}
                        placeholder={"Enter Wage Type"}
                      />,
                      <Input
                        value={wage.From}
                        process={(value) =>
                          changeData(`FixedWages/${w}`, "From", value)
                        }
                        type={"date"}
                      />,
                      <Input
                        value={wage.To}
                        process={(value) =>
                          changeData(`FixedWages/${w}`, "To", value)
                        }
                        type={"date"}
                      />,
                      <Input
                        value={wage.Amount}
                        process={(value) =>
                          changeData(`FixedWages/${w}`, "Amount", value)
                        }
                        type={"number"}
                      />,
                      <Button
                        name="-"
                        functionsArray={[
                          () => deleteItemfromArray(`FixedWages`, w),
                        ]}
                      />,
                    ])}
                  />
                </Column>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"One Time Wages"} />
                    <Button
                      name="Add"
                      functionsArray={[
                        () =>
                          addItemtoArray("OneTimeWages", {
                            WT: "",
                            Date: "",
                            Amount: "",
                          }),
                      ]}
                    />
                  </Row>
                  <Table
                    columns={["Wage Type", "Date", "Amount", ""]}
                    rows={OneTimeWages.map((wage, w) => [
                      <AutoSuggestInput
                        value={wage.WT}
                        process={(value) =>
                          changeData(`OneTimeWages/${w}`, "WT", value)
                        }
                        suggestions={wagetypes.filterFromCompany(
                          {
                            Nature: "One Time",
                          },
                          "Code",
                        )}
                        captions={wagetypes.filterFromCompany(
                          {
                            Nature: "One Time",
                          },
                          "Description",
                        )}
                        placeholder={"Enter Wage Type"}
                      />,
                      <Input
                        value={wage.Date}
                        process={(value) =>
                          changeData(`OneTimeWages/${w}`, "Date", value)
                        }
                        type={"date"}
                      />,
                      <Input
                        value={wage.Amount}
                        process={(value) =>
                          changeData(`OneTimeWages/${w}`, "Amount", value)
                        }
                        type={"number"}
                      />,
                      <Button
                        name="-"
                        functionsArray={[
                          () => deleteItemfromArray(`OneTimeWages`, w),
                        ]}
                      />,
                    ])}
                  />
                </Column>
              </Conditional>
              <Conditional logic={method === "View"}>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"Variable Wages"} />
                  </Row>
                  <Table
                    columns={["Wage Type", "From", "To", "Amount"]}
                    rows={VariableWages.map((wage, w) => [
                      <label>{wage.WT}</label>,
                      <label>{wage.From}</label>,
                      <label>{wage.To}</label>,
                      <label>{wage.Amount}</label>,
                    ])}
                  />
                </Column>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"Fixed Wages"} />
                  </Row>
                  <Table
                    columns={["Wage Type", "From", "To", "Amount"]}
                    rows={FixedWages.map((wage, w) => [
                      <label>{wage.WT}</label>,
                      <label>{wage.From}</label>,
                      <label>{wage.To}</label>,
                      <label>{wage.Amount}</label>,
                    ])}
                  />
                </Column>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"One Time Wages"} />
                  </Row>
                  <Table
                    columns={["Wage Type", "Date", "Amount"]}
                    rows={OneTimeWages.map((wage, w) => [
                      <label>{wage.WT}</label>,
                      <label>{wage.Date}</label>,
                      <label>{wage.Amount}</label>,
                    ])}
                  />
                </Column>
              </Conditional>
            </Column>,
            <Column overflow="visible">
              <Row>
                <Label label={"Taxpayer Identification Number"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={TIN}
                    process={(value) => changeData("", "TIN", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{TIN}</label>
                </Conditional>
              </Row>
              <Conditional logic={method !== "View"}>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"Income Tax Code"} />
                    <Button
                      name="Add"
                      functionsArray={[
                        () =>
                          addItemtoArray("TaxCode", {
                            From: "",
                            To: "",
                            Code: "",
                          }),
                      ]}
                    />
                  </Row>
                  <Table
                    columns={["From Year", "To Year", "Code", ""]}
                    rows={TaxCode.map((code, c) => [
                      <Input
                        value={code.From}
                        process={(value) =>
                          changeData(`TaxCode/${c}`, "From", value)
                        }
                        type={"number"}
                      />,
                      <Input
                        value={code.To}
                        process={(value) =>
                          changeData(`TaxCode/${c}`, "To", value)
                        }
                        type={"number"}
                      />,
                      <AutoSuggestInput
                        value={code.Code}
                        process={(value) =>
                          changeData(`TaxCode/${c}`, "Code", value)
                        }
                        suggestions={new IncomeTaxCode("").listAll("Code")}
                        placeholder={"Enter Income Tax Code"}
                      />,
                      <Button
                        name={"-"}
                        functionsArray={[
                          () => deleteItemfromArray(`TaxCode`, c),
                        ]}
                      />,
                    ])}
                  />
                </Column>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"Additional Income"} />
                    <Button
                      name="Add"
                      functionsArray={[
                        () =>
                          addItemtoArray("Additions", {
                            Year: "",
                            Description: "",
                            Amount: "",
                          }),
                      ]}
                    />
                  </Row>
                  <Table
                    columns={["Year", "Description", "Amount", ""]}
                    rows={Additions.map((addition, a) => [
                      <Input
                        value={addition.Year}
                        process={(value) =>
                          changeData(`Additions/${a}`, "Year", value)
                        }
                        type={"number"}
                      />,
                      <Input
                        value={addition.Description}
                        process={(value) =>
                          changeData(`Additions/${a}`, "Description", value)
                        }
                        type={"text"}
                      />,
                      <Input
                        value={addition.Amount}
                        process={(value) =>
                          changeData(`Additions/${a}`, "Amount", value)
                        }
                        type={"number"}
                      />,
                      <Button
                        name={"-"}
                        functionsArray={[
                          () => deleteItemfromArray(`Additions`, a),
                        ]}
                      />,
                    ])}
                  />
                </Column>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"Deductions"} />
                    <Button
                      name="Add"
                      functionsArray={[
                        () =>
                          addItemtoArray("Deductions", {
                            Year: "",
                            Description: "",
                            Amount: "",
                          }),
                      ]}
                    />
                  </Row>
                  <Table
                    columns={["Year", "Description", "Amount", ""]}
                    rows={Deductions.map((deduction, a) => [
                      <Input
                        value={deduction.Year}
                        process={(value) =>
                          changeData(`Deductions/${a}`, "Year", value)
                        }
                        type={"number"}
                      />,
                      <Input
                        value={deduction.Description}
                        process={(value) =>
                          changeData(`Deductions/${a}`, "Description", value)
                        }
                        type={"text"}
                      />,
                      <Input
                        value={deduction.Amount}
                        process={(value) =>
                          changeData(`Deductions/${a}`, "Amount", value)
                        }
                        type={"number"}
                      />,
                      <Button
                        name={"-"}
                        functionsArray={[
                          () => deleteItemfromArray(`Deductions`, a),
                        ]}
                      />,
                    ])}
                  />
                </Column>
              </Conditional>
              <Conditional logic={method === "View"}>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"Income Tax Code"} />
                  </Row>
                  <Table
                    columns={["From Year", "To Year", "Code"]}
                    rows={TaxCode.map((code, c) => [
                      <label>{code.From}</label>,
                      <label>{code.To}</label>,
                      <label>{code.Code}</label>,
                    ])}
                  />
                </Column>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"Additional Income"} />
                  </Row>
                  <Table
                    columns={["Year", "Description", "Amount"]}
                    rows={Additions.map((addition, a) => [
                      <label>{addition.Year}</label>,
                      <label>{addition.Description}</label>,
                      <label>{addition.Amount}</label>,
                    ])}
                  />
                </Column>
                <Column overflow="visible">
                  <Row jc="left">
                    <Label label={"Deductions"} />
                  </Row>
                  <Table
                    columns={["Year", "Description", "Amount"]}
                    rows={Deductions.map((deduction, a) => [
                      <label>{deduction.Year}</label>,
                      <label>{deduction.Description}</label>,
                      <label>{deduction.Amount}</label>,
                    ])}
                  />
                </Column>
              </Conditional>
            </Column>,
            <Column>
              <Conditional logic={method !== "View"}>
                <Row jc="left">
                  <Label label={"Bank Accounts"} />
                  <Button
                    name={"Add"}
                    functionsArray={[
                      () =>
                        addItemtoArray(`BankAccounts`, {
                          Bank: "",
                          SWIFT: "",
                          Account: "",
                          Confirm: "",
                        }),
                    ]}
                  />
                </Row>
                <Table
                  columns={[
                    "Bank",
                    "SWIFT Code",
                    "Account",
                    "Re-enter Account",
                    "",
                  ]}
                  rows={BankAccounts.map((account, a) => [
                    <Input
                      value={account.Bank}
                      process={(value) =>
                        changeData(`BankAccounts/${a}`, "Bank", value)
                      }
                      type={"text"}
                    />,
                    <Input
                      value={account.SWIFT}
                      process={(value) =>
                        changeData(`BankAccounts/${a}`, "SWIFT", value)
                      }
                      type={"text"}
                    />,
                    <Input
                      value={account.Account}
                      process={(value) =>
                        changeData(`BankAccounts/${a}`, "Account", value)
                      }
                      type={"text"}
                    />,
                    <Input
                      value={account.Confirm}
                      process={(value) =>
                        changeData(`BankAccounts/${a}`, "Confirm", value)
                      }
                      type={"text"}
                    />,
                    <Button
                      name={"-"}
                      functionsArray={[
                        () => deleteItemfromArray("BankAccounts", a),
                      ]}
                    />,
                  ])}
                />
              </Conditional>
              <Conditional logic={method === "View"}>
                <Row jc="left">
                  <Label label={"Bank Accounts"} />
                </Row>
                <Table
                  columns={[
                    "Bank",
                    "SWIFT Code",
                    "Account",
                    "Re-enter Account",
                  ]}
                  rows={BankAccounts.map((account, a) => [
                    <label>{account.Bank}</label>,
                    <label>{account.SWIFT}</label>,
                    <label>{account.Account}</label>,
                    <label>{account.Confirm}</label>,
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
