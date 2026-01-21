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
import { Customer, CustomerGroup, WithholdingTax } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultCustomer } from "../defaults";
import { StatesMaster } from "../constants";

export function ManageCustomer() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new Customer(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Customer"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateCustomer />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Customer does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateCustomer
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Customer does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateCustomer
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Customer does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateCustomer
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
            <Label label={"Customer"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Customer Code"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Name")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateCustomer({
  initial = defaultCustomer,
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
    CustomerGroupCode,
    Address,
    PostalCode,
    Country,
    State,
    Phone,
    Email,
    BankAccounts,
    Withholding,
    CIN,
    CTIN,
    BTIN,
    GroupKeys,
  } = data;
  const collection = new Customer(Code, Company);
  const group = new CustomerGroup(CustomerGroupCode, Company);
  const wt = new WithholdingTax("", Company);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company does not exists`,
      );
      addError(
        !group.exists(),
        "CustomerGroup",
        "Customer Group does not exist.",
      );
      addError(Name === "", "Name", "Name cannot be blank.");
    }
    addError(Country === "", "Country", "Country cannot be blank.");
    addError(State === "", "State", "State cannot be blank.");
  }, [data]);

  return (
    <>
      <WindowTitle
        title={`${method} Customer`}
        menu={[
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.add(data)),
                () => setdata(defaultCustomer),
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
                () => openWindow(<ManageCustomer />),
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
                  [() => openWindow(<ManageCustomer />)],
                ),
            ]}
          />,
        ]}
      />
      <WindowContent>
        <MultiDisplayArea
          heads={["General", "Taxation", "Banking"]}
          contents={[
            <Column overflow="visible" borderBottom="none">
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
                <Label label={"Customer Group"} />
                <Conditional logic={method === "Create"}>
                  <AutoSuggestInput
                    value={CustomerGroupCode}
                    process={(value) =>
                      changeData("", "CustomerGroupCode", value)
                    }
                    placeholder={"Enter Customer Group"}
                    suggestions={group.listAllFromCompany("Code")}
                    captions={group.listAllFromCompany("Description")}
                  />
                </Conditional>
                <Conditional logic={method !== "Create"}>
                  <label>{CustomerGroupCode}</label>
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
                <Label label={"Corporate Identification Number"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={CIN}
                    process={(value) => changeData("", "CIN", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{CIN}</label>
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
              <Column>
                <Row jc="left">
                  <Label label={"Group Keys"} />
                  <Button
                    name={"Add"}
                    functionsArray={[() => addItemtoArray("GroupKeys", "")]}
                  />
                </Row>
                <Row jc="left" flexWrap="wrap">
                  {GroupKeys.map((key, k) => (
                    <Row
                      jc="left"
                      key={k}
                      width="fit-content"
                      borderBottom="none"
                      gap="0"
                    >
                      <Input
                        value={key}
                        process={(value) => changeData(`GroupKeys`, k, value)}
                      />
                      <Button
                        style={{
                          border: "none",
                          background: "var(--whitet)",
                          color: "var(--bluet)",
                          aspectRatio: "1/1",
                          borderRadius: "0",
                        }}
                        name={"-"}
                        functionsArray={[
                          () => deleteItemfromArray("GroupKeys", k),
                        ]}
                      />
                    </Row>
                  ))}
                </Row>
              </Column>
            </Column>,
            <Column overflow="visible" borderBottom="none">
              <Row>
                <Label
                  label={
                    "Corporate Taxpayer Identification Number (Withholding Tax)"
                  }
                />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={CTIN}
                    process={(value) => changeData("", "CTIN", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{CTIN}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Business Tax Identification Number"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={BTIN}
                    process={(value) => changeData("", "BTIN", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{BTIN}</label>
                </Conditional>
              </Row>
              <Column overflow="visible">
                <Conditional logic={method !== "View"}>
                  <Row jc="left">
                    <Label label={"Withholding Tax"} />
                    <Button
                      name={"Add"}
                      functionsArray={[
                        () =>
                          addItemtoArray(`Withholding`, {
                            Code: "",
                            Exemption: 0,
                            Remarks: "",
                            Active: true,
                          }),
                      ]}
                    />
                  </Row>
                  <Table
                    columns={[
                      "Code",
                      "Exemption %",
                      "Exemption Remarks",
                      "Active",
                      "",
                    ]}
                    rows={Withholding.map((code, c) => [
                      <AutoSuggestInput
                        value={code.Code}
                        process={(value) =>
                          changeData(`Withholding/${c}`, "Code", value)
                        }
                        suggestions={wt.listAllFromCompany("Code")}
                        captions={wt.listAllFromCompany("Description")}
                        placeholder={"Enter Withholding Tax Code"}
                      />,
                      <Input
                        value={code.Exemption}
                        process={(value) =>
                          changeData(`Withholding/${c}`, "Exemption", value)
                        }
                        type={"number"}
                      />,
                      <Input
                        value={code.Remarks}
                        process={(value) =>
                          changeData(`Withholding/${c}`, "Remarks", value)
                        }
                        type={"text"}
                      />,
                      <CheckBox
                        value={code.Active}
                        process={(value) =>
                          changeData(`Withholding/${c}`, "Active", value)
                        }
                      />,
                      <Button
                        name="-"
                        functionsArray={[
                          () => deleteItemfromArray(`Withholding`, c),
                        ]}
                      />,
                    ])}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <Row jc="left">
                    <Label label={"Withholding Tax"} />
                  </Row>
                  <Table
                    columns={[
                      "Code",
                      "Exemption %",
                      "Exemption Remarks",
                      "Active",
                    ]}
                    rows={Withholding.map((code, c) => [
                      <label>{code.Code}</label>,
                      <label>{code.Exemption}</label>,
                      <label>{code.Remarks}</label>,
                      <CheckBox value={code.Active} />,
                    ])}
                  />
                </Conditional>
              </Column>
            </Column>,
            <Column borderBottom="none">
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
