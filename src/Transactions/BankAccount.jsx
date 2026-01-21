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
import { BankAccount, GeneralLedger, ProfitCenter } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultBankAccount } from "../defaults";
import { StatesMaster } from "../constants";

export function ManageBankAccount() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new BankAccount(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Bank Account"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateBankAccount />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Bank Account does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateBankAccount
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Bank Account does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateBankAccount
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Bank Account does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateBankAccount
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
            <Label label={"Bank Account"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Bank Account Code"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Name")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateBankAccount({
  initial = defaultBankAccount,
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
    Bank,
    Address,
    PostalCode,
    Country,
    State,
    Phone,
    Email,
    CompanyName,
    SWIFT,
    Account,
    Confirm,
    GL,
    PC,
    GroupKeys,
  } = data;
  const collection = new BankAccount(Code, Company);
  const gl = new GeneralLedger(GL, Company);
  const pc = new ProfitCenter(PC, Company);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company does not exists`,
      );
      addError(!gl.exists(), "GeneralLedger", "General Ledger does not exist.");
      addError(!pc.exists(), "ProfitCenter", "Profit Center does not exist.");
      addError(Bank === "", "Bank", "Bank cannot be blank.");
    }
    addError(Country === "", "Country", "Country cannot be blank.");
    addError(State === "", "State", "State cannot be blank.");
  }, [data]);

  return (
    <>
      <WindowTitle
        title={`${method} Bank Account`}
        menu={[
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.add(data)),
                () => setdata(defaultBankAccount),
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
                () => openWindow(<ManageBankAccount />),
              ]}
            />
          </Conditional>,
          <Conditional logic={method !== "View"}>
            <Button name={"Reset"} functionsArray={[() => reset()]} />
          </Conditional>,
          <Conditional logic={method !== "View"}>
            <DisplayHidingError />
          </Conditional>,
          <ConditionalButton
            name="Manage"
            result={method !== "View"}
            whileTrue={[
              () =>
                openConfirm(
                  "Data not saved will be lost.",
                  [],
                  [() => openWindow(<ManageBankAccount />)],
                ),
            ]}
            whileFalse={[() => openWindow(<ManageBankAccount />)]}
          />,
        ]}
      />
      <WindowContent>
        <MultiDisplayArea
          heads={["General", "Accounting", "Banking"]}
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
                <Conditional logic={method === "Create"}>
                  <Input
                    value={Code}
                    process={(value) => changeData("", `Code`, value)}
                    type={"text"}
                    maxLength={4}
                  />
                </Conditional>
              </Row>
              <Row overflow="visible">
                <Label label={"Bank"} />
                <Conditional logic={method === "Create"}>
                  <Input
                    value={Bank}
                    process={(value) => changeData("", "Bank", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method !== "Create"}>
                  <label>{Bank}</label>
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
                <Label label={"General Ledger"} />
                <Conditional logic={method === "Create"}>
                  <AutoSuggestInput
                    value={GL}
                    process={(value) => changeData("", "GL", value)}
                    placeholder={"Enter General Ledger"}
                    suggestions={gl.listAllFromCompany("Code")}
                    captions={gl.listAllFromCompany("Description")}
                  />
                </Conditional>
                <Conditional logic={method !== "Create"}>
                  <label>{GL}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Profit Center"} />
                <Conditional logic={method === "Create"}>
                  <AutoSuggestInput
                    value={PC}
                    process={(value) => changeData("", "PC", value)}
                    placeholder={"Enter Profit Center"}
                    suggestions={pc.listAllFromCompany("Code")}
                    captions={pc.listAllFromCompany("Description")}
                  />
                </Conditional>
                <Conditional logic={method !== "Create"}>
                  <label>{PC}</label>
                </Conditional>
              </Row>
            </Column>,
            <Column borderBottom="none">
              <Row>
                <Label label={"Banking Name"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={CompanyName}
                    process={(value) => changeData("", "CompanyName", value)}
                    type={"text"}
                    placeholder="Company Name in Bank records"
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{CompanyName}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"SWIFT Code"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={SWIFT}
                    process={(value) => changeData("", "SWIFT", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{SWIFT}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Account"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={Account}
                    process={(value) => changeData("", "Account", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{Account}</label>
                </Conditional>
              </Row>
              <Row>
                <Label label={"Confirm Account"} />
                <Conditional logic={method !== "View"}>
                  <Input
                    value={Confirm}
                    process={(value) => changeData("", "Confirm", value)}
                    type={"text"}
                  />
                </Conditional>
                <Conditional logic={method === "View"}>
                  <label>{CompanyName}</label>
                </Conditional>
              </Row>
            </Column>,
          ]}
        />
      </WindowContent>
    </>
  );
}
