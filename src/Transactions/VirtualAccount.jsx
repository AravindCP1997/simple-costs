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
  VirtualAccount,
  BankAccount,
  GeneralLedger,
  ProfitCenter,
  CompanyCollection,
} from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultVirtualAccount } from "../defaults";
import { StatesMaster } from "../constants";

export function ManageVirtualAccount() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new VirtualAccount(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Virtual Account"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateVirtualAccount />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Virtual Account does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateVirtualAccount
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Virtual Account does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateVirtualAccount
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Virtual Account does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateVirtualAccount
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
            <Label label={"Virtual Account"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Virtual Account Code"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Name")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateVirtualAccount({
  initial = defaultVirtualAccount,
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
  const { Company, Code, Account, VAN, Credit, CreditAccount, PC } = data;
  const collection = new VirtualAccount(Code, Company);
  const creditAccounts = new CompanyCollection(Company, Credit);
  const bankAccount = new BankAccount(Account, Company);
  const pc = new ProfitCenter(PC, Company);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company does not exists`,
      );
      addError(Code === "", "Code", "Code cannot be blank.");
      addError(
        collection.exists(),
        "Code",
        `Virtual Account ${Code} already exists in Company ${Company}`,
      );
      addError(!pc.exists(), "ProfitCenter", "Profit Center does not exist.");
      addError(
        !bankAccount.exists(),
        "BankAccount",
        "Bank Account does not exist.",
      );
      addError(
        !creditAccounts.exists({ Code: CreditAccount }),
        Credit,
        `${Credit} does not exist.`,
      );
    }
  }, [data]);

  return (
    <>
      <WindowTitle
        title={`${method} Virtual Account`}
        menu={[
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.add(data)),
                () => setdata(defaultVirtualAccount),
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
                () => openWindow(<ManageVirtualAccount />),
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
                  [() => openWindow(<ManageVirtualAccount />)],
                ),
            ]}
            whileFalse={[() => openWindow(<ManageVirtualAccount />)]}
          />,
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
            <Label label={"Bank Account"} />
            <Conditional logic={method === "Create"}>
              <AutoSuggestInput
                value={Account}
                process={(value) => changeData("", "Account", value)}
                placeholder={"Enter Bank Account"}
                suggestions={bankAccount.listAllFromCompany("Code")}
                captions={bankAccount.listAllFromCompany("Bank")}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{Account}</label>
            </Conditional>
          </Row>
          <Row>
            <Label label={"Virtual Account Number"} />
            <Conditional logic={method !== "View"}>
              <Input
                value={VAN}
                process={(value) => changeData("", "VAN", value)}
                type={"text"}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{VAN}</label>
            </Conditional>
          </Row>
          <Row>
            <Label label={"Credit To"} />
            <Conditional logic={method == "Create"}>
              <Option
                value={Credit}
                process={(value) => changeData("", "Credit", value)}
                options={["Customer", "GeneralLedger"]}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{Credit}</label>
            </Conditional>
          </Row>
          <Row overflow="visible">
            <Label label={`Credit Account`} />
            <Conditional logic={method === "Create"}>
              <AutoSuggestInput
                value={CreditAccount}
                process={(value) => changeData("", "CreditAccount", value)}
                placeholder={`Enter ${Credit} Code`}
                suggestions={creditAccounts.listAllFromCompany("Code")}
                captions={creditAccounts.listAllFromCompany("Description")}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{CreditAccount}</label>
            </Conditional>
          </Row>
          <Row overflow="visible">
            <Label label={`Profit Center`} />
            <Conditional logic={method === "Create"}>
              <AutoSuggestInput
                value={PC}
                process={(value) => changeData("", "PC", value)}
                placeholder={`Enter Profit Center`}
                suggestions={pc.listAllFromCompany("Code")}
                captions={pc.listAllFromCompany("Description")}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{PC}</label>
            </Conditional>
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
