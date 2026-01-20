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
import { Material, MaterialGroup, Units } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultMaterial } from "../defaults";

export function ManageMaterial() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new Material(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Material"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateMaterial />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Material does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateMaterial
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Material does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateMaterial
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Material does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateMaterial
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
            <Label label={"Material"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Material Code"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateMaterial({
  initial = defaultMaterial,
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
  const { Company, Code, Description, MaterialGroupCode, Unit } = data;
  const collection = new Material(Code, Company);
  const MaterialGroups = new MaterialGroup(MaterialGroupCode, Company);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company does not exist.`,
      );
      addError(
        !MaterialGroups.exists(),
        "MaterialGroup",
        `Material Group does not exist.`,
      );
    }
    addError(!Units.unitExists(Unit), "Unit", "Unit does not exist.");
  }, [data]);

  return (
    <>
      <WindowTitle
        title={`${method} Material`}
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
                () => openWindow(<ManageMaterial />),
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
                  [() => openWindow(<ManageMaterial />)],
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
            <Label label={"Material Group"} />
            <Conditional logic={method === "Create"}>
              <AutoSuggestInput
                value={MaterialGroupCode}
                process={(value) => changeData("", "MaterialGroupCode", value)}
                placeholder={"Enter Material Group"}
                suggestions={MaterialGroups.listAllFromCompany("Code")}
                captions={MaterialGroups.listAllFromCompany("Description")}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{MaterialGroupCode}</label>
            </Conditional>
          </Row>
          <Row overflow="visible">
            <Label label={"Unit"} />
            <Conditional logic={method === "Create"}>
              <AutoSuggestInput
                value={Unit}
                process={(value) => changeData("", "Unit", value)}
                placeholder={"Enter Unit"}
                suggestions={Units.list()}
                captions={ListItems(Units.read(), "Description")}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{Unit}</label>
            </Conditional>
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
