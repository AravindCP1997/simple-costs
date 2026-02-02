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
import { FreightGroup, GeneralLedger } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultFreightGroup } from "../defaults";

export function ManageFreightGroup() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new FreightGroup(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Freight Group"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateFreightGroup />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Freight Group does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateFreightGroup
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Freight Group does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateFreightGroup
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Freight Group does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateFreightGroup
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
            <Label label={"Freight Group"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Freight Group"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateFreightGroup({
  initial = defaultFreightGroup,
  method = "Create",
}) {
  const { data, changeData, reset, setdata } = useData(initial);
  const { openWindow, openConfirm, showAlert } = useInterface();
  const { DisplayHidingError, addError, clearErrors, errorsExist } = useError();
  const { Company, Code, Description, Type, GLFreight, GLClearing } = data;
  const Gls = [
    { code: "GLFreight", name: "General Ledger - Freight" },
    { code: "GLClearing", name: "General Ledger - Clearing Receipts" },
  ];
  const collection = new FreightGroup(Code, Company);
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
        `Freight Group ${Code} already exist in Company ${Company}.`,
      );
      addError(
        Type === "Expense" && !collection.company.gl(GLFreight).exists(),
        "GLFreight",
        `General Ledger does not exist.`,
      );
      addError(
        !collection.company.gl(GLClearing).exists(),
        "GLClearing",
        `General Ledger does not exist.`,
      );
    }
  }, [data]);
  return (
    <>
      <WindowTitle
        title={`${method} Freight Group`}
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
                () => openWindow(<ManageFreightGroup />),
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
                  [() => openWindow(<ManageFreightGroup />)],
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
                maxLength={4}
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
            <Label label={"Valuation Type"} />
            <Conditional logic={method === "Create"}>
              <Option
                options={["Material Cost", "Expense"]}
                value={Type}
                process={(value) => changeData("", "Type", value)}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{Type}</label>
            </Conditional>
          </Row>
          <Conditional logic={method === "View"}>
            {Gls.map((gl, g) => (
              <Row overflow="visible" key={g}>
                <Label label={gl.name} />
                <label>{data[gl.code]}</label>
              </Row>
            ))}
          </Conditional>
          <Conditional logic={method !== "View"}>
            {Gls.map((gl, g) => (
              <Row overflow="visible">
                <Label label={gl.name} />
                <AutoSuggestInput
                  value={data[gl.code]}
                  process={(value) => changeData("", `${gl.code}`, value)}
                  suggestions={glcollection.filterFromCompany(
                    { Status: "Ready" },
                    "Code",
                  )}
                  captions={glcollection.filterFromCompany(
                    { Status: "Ready" },
                    "Description",
                  )}
                  placeholder={"Enter General Ledger Code"}
                />
              </Row>
            ))}
          </Conditional>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
