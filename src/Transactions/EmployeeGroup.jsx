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
import { EmployeeGroup, GeneralLedger } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultEmployeeGroup } from "../defaults";

export function ManageEmployeeGroup() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new EmployeeGroup(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Employee Group"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateEmployeeGroup />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Employee Group does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateEmployeeGroup
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Employee Group does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateEmployeeGroup
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Employee Group does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateEmployeeGroup
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
            <Label label={"Employee Group"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Employee Group"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateEmployeeGroup({
  initial = defaultEmployeeGroup,
  method = "Create",
}) {
  const { data, changeData, reset, setdata } = useData(initial);
  const { openWindow, openConfirm, showAlert } = useInterface();
  const { DisplayHidingError, addError, clearErrors, errorsExist } = useError();
  const { Company, Code, Description, GL } = data;
  const Gls = [
    { code: "GL", name: "General Ledger Payables" },
    { code: "GLWHT", name: "General Ledger Withholding Tax" },
  ];
  const collection = new EmployeeGroup(Code, Company);
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
        `Employee Group ${Code} already exist in Company ${Company}.`,
      );
      Gls.forEach((gl, g) => {
        addError(
          collection.company.exists() &&
            !collection.company.existsGL(data[gl.code]),
          gl.name,
          `General Ledger ${
            data[gl.code]
          } does not exist in Company ${Company}.`,
        );
      });
    }
  }, [data]);
  return (
    <>
      <WindowTitle
        title={`${method} Employee Group`}
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
                () => openWindow(<ManageEmployeeGroup />),
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
                  [() => openWindow(<ManageEmployeeGroup />)],
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
