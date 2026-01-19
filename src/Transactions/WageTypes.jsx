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
import { WageType, GeneralLedger } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultWageType } from "../defaults";

export function ManageWageType() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new WageType(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Wage Type"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateWageType />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Wage Type does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateWageType
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Wage Type does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateWageType
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Wage Type does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateWageType
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
            <Label label={"Wage Type"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Wage Type"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateWageType({
  initial = defaultWageType,
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
  const { Company, Code, Description, Type, Nature, GL, Taxable } = data;
  const collection = new WageType(Code, Company);
  const GLcollection = new GeneralLedger(GL, Company);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company does not exists`,
      );
      addError(Code === "", "Code", `Code cannot be blank.`);
      addError(
        collection.exists(),
        "Code",
        `Wage Type '${Code}' already exist in Company '${Company}'`,
      );
      addError(
        !GLcollection.exists(),
        "GeneralLedger",
        `General Ledger does not exist.`,
      );
    }
  }, [data]);

  return (
    <>
      <WindowTitle
        title={`${method} Wage Type`}
        menu={[
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.add(data)),
                () => setdata(defaultWageType),
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
                () => openWindow(<ManageWageType />),
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
                  [() => openWindow(<ManageWageType />)],
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
            <Label label={"Type"} />
            <Conditional logic={method === "Create"}>
              <Option
                value={Type}
                process={(value) => changeData("", "Type", value)}
                options={["Emolument", "Deduction"]}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{Type}</label>
            </Conditional>
          </Row>
          <Row>
            <Label label={"Nature"} />
            <Conditional logic={method === "Create"}>
              <Option
                value={Nature}
                process={(value) => changeData("", "Nature", value)}
                options={["Variable", "Fixed", "One Time"]}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{Nature}</label>
            </Conditional>
          </Row>
          <Row overflow="visible">
            <Label label={"General Ledger"} />
            <Conditional logic={method === "Create"}>
              <AutoSuggestInput
                value={GL}
                process={(value) => changeData("", "GL", value)}
                suggestions={GLcollection.listAllFromCompany("Code")}
                captions={GLcollection.listAllFromCompany("Description")}
                placeholder={"Enter General Ledger"}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{GL}</label>
            </Conditional>
          </Row>
          <Row jc="left">
            <Label label={"Taxable"} />
            <Conditional logic={method === "Create"}>
              <CheckBox
                value={Taxable}
                process={(value) => changeData("", "Taxable", value)}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <CheckBox value={Taxable} />
            </Conditional>
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
