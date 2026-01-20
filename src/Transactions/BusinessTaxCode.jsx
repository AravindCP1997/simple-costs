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
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { BusinessTaxCode, BusinessPlace, GeneralLedger } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultBusinessTaxCode } from "../defaults";

export function ManageBusinessTaxCode() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new BusinessTaxCode(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Business Tax Code"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateBusinessTaxCode />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Business Tax Code does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateBusinessTaxCode
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Business Tax Code does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateBusinessTaxCode
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Business Tax Code does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateBusinessTaxCode
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
            <Label label={"Business Tax Code"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Business Tax Code"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateBusinessTaxCode({
  initial = defaultBusinessTaxCode,
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
  const { Company, Code, Description, Accounting } = data;
  const collection = new BusinessTaxCode(Code, Company);
  const glcollection = new GeneralLedger("", Company);
  const bp = new BusinessPlace("", Company);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company does not exist.`,
      );
      addError(Code === "", "Code", `Code cannot be blank.`);
      addError(
        collection.exists(),
        "Code",
        `Business Tax Code ${Code} already exist in Company ${Company}.`,
      );
    }
    Accounting.forEach((account, a) => {
      addError(
        !new GeneralLedger(account.GL, Company).exists(),
        `Accounting/${a + 1}`,
        "General Ledger does not exist.",
      );
      addError(
        account.Rate === "" || account.Rate < 0,
        `Accounting/${a + 1}`,
        "Rate shall be a non-negative value.",
      );
      addError(
        !new BusinessPlace(account.BP, Company).exists(),
        `Accounting/${a}`,
        "Business Place does not exist.",
      );
    });
  }, [data]);
  return (
    <>
      <WindowTitle
        title={`${method} Business Tax Code`}
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
                () => openWindow(<ManageBusinessTaxCode />),
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
                  [() => openWindow(<ManageBusinessTaxCode />)],
                ),
            ]}
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
            <Conditional logic={method === "Create"}>
              <Input
                value={Code}
                process={(value) => changeData("", "Code", value)}
                type={"text"}
                maxLength={2}
              />
            </Conditional>
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
          <Column overflow="visible">
            <Conditional logic={method !== "View"}>
              <Row jc="left">
                <Label label={"Accounting"} />
                <Button
                  name={"Add"}
                  functionsArray={[
                    () =>
                      addItemtoArray(`Accounting`, {
                        BP: "",
                        TType: "All",
                        GL: "",
                        Type: "Debit",
                        Rate: 0,
                      }),
                  ]}
                />
              </Row>
              <Table
                columns={[
                  "Business Place",
                  "Transaction Type",
                  "General Ledger",
                  "Debit/Credit",
                  "Rate",
                  "",
                ]}
                rows={Accounting.map((account, a) => [
                  <AutoSuggestInput
                    value={account.BP}
                    process={(value) =>
                      changeData(`Accounting/${a}`, "BP", value)
                    }
                    suggestions={bp.listAllFromCompany("Code")}
                    captions={bp.listAllFromCompany("Description")}
                    placeholder={"Enter Business Place"}
                  />,
                  <Option
                    value={account.TType}
                    process={(value) =>
                      changeData(`Accounting/${a}`, "TType", value)
                    }
                    options={[
                      "InterCountry",
                      "InterState",
                      "IntraState",
                      "All",
                    ]}
                  />,
                  <AutoSuggestInput
                    value={account.GL}
                    process={(value) =>
                      changeData(`Accounting/${a}`, "GL", value)
                    }
                    suggestions={glcollection.listAllFromCompany("Code")}
                    captions={glcollection.listAllFromCompany("Description")}
                    placeholder={"Enter General Ledger"}
                  />,
                  <Option
                    value={account.Type}
                    process={(value) =>
                      changeData(`Accounting/${a}`, "Type", value)
                    }
                    options={["Debit", "Credit"]}
                  />,
                  <Input
                    type={"number"}
                    value={account.Rate}
                    process={(value) =>
                      changeData(`Accounting/${a}`, "Rate", value)
                    }
                  />,
                  <Button
                    name={"-"}
                    functionsArray={[
                      () => deleteItemfromArray(`Accounting`, a),
                    ]}
                  />,
                ])}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <Row jc="left">
                <Label label={"Accounting"} />
              </Row>
              <Table
                columns={[
                  "Business Place",
                  "Transaction",
                  "General Ledger",
                  "Debit/ Credit",
                  "Rate",
                ]}
                rows={Accounting.map((account, a) => [
                  <label>{account.BP}</label>,
                  <label>{account.TType}</label>,
                  <label>{account.GL}</label>,
                  <label>{account.Type}</label>,
                  <label>{account.Rate}</label>,
                ])}
              />
            </Conditional>
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
