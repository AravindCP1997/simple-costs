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
import { WithholdingTax, GeneralLedger } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultWithholdingTax } from "../defaults";

export function ManageWithholdingTax() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new WithholdingTax(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Withholding Tax"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateWithholdingTax />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Withholding Tax does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateWithholdingTax
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Withholding Tax does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateWithholdingTax
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Withholding Tax does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateWithholdingTax
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
            <Label label={"Withholding Tax"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Withholding Tax"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateWithholdingTax({
  initial = defaultWithholdingTax,
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
  const { Company, Code, Description, ExemptionT, ExemptionA, Accounting } =
    data;
  const collection = new WithholdingTax(Code, Company);
  const glcollection = new GeneralLedger("", Company);
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
        `Withholding Tax ${Code} already exist in Company ${Company}.`,
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
    });
    addError(
      ExemptionT === "" || ExemptionT < 0,
      `ExemptionT`,
      "Transactional Exemption Limit shall be a non-negative value.",
    );
    addError(
      ExemptionA === "" || ExemptionA < 0,
      `ExemptionA`,
      "Aggregate Exemption Limit shall be a non-negative value.",
    );
  }, [data]);
  return (
    <>
      <WindowTitle
        title={`${method} Withholding Tax`}
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
                () => openWindow(<ManageWithholdingTax />),
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
                  [() => openWindow(<ManageWithholdingTax />)],
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
                maxLength={6}
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
          <Row>
            <Label label={"Exmeption Limit - Transactional"} />
            <Conditional logic={method !== "View"}>
              <Input
                value={ExemptionT}
                process={(value) => changeData("", "ExemptionT", value)}
                type={"number"}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{ExemptionT}</label>
            </Conditional>
          </Row>
          <Row>
            <Label label={"Exemption Limit - Aggregate in Year"} />
            <Conditional logic={method !== "View"}>
              <Input
                value={ExemptionA}
                process={(value) => changeData("", "ExemptionA", value)}
                type={"number"}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{ExemptionA}</label>
            </Conditional>
          </Row>
          <Column overflow="visible">
            <Conditional logic={method !== "View"}>
              <Row jc="left">
                <Label label={"Accounting"} />
                <Button
                  name={"Add"}
                  functionsArray={[
                    () => addItemtoArray(`Accounting`, { GL: "", Rate: 0 }),
                  ]}
                />
              </Row>
              <Table
                columns={["General Ledger", "Rate", ""]}
                rows={Accounting.map((account, a) => [
                  <AutoSuggestInput
                    value={account.GL}
                    process={(value) =>
                      changeData(`Accounting/${a}`, "GL", value)
                    }
                    suggestions={glcollection.listAllFromCompany("Code")}
                    captions={glcollection.listAllFromCompany("Description")}
                    placeholder={"Enter General Ledger"}
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
                columns={["General Ledger", "Rate"]}
                rows={Accounting.map((account, a) => [
                  <label>{account.GL}</label>,
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
