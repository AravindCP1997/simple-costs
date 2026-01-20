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
import { Service, ServiceGroup, Units } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultService } from "../defaults";

export function ManageService() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new Service(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage Service"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateService />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Service does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateService
                    method="View"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Service does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateService
                    method="Update"
                    initial={collection.getData()}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Service does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateService
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
            <Label label={"Service"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter Service Code"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateService({ initial = defaultService, method = "Create" }) {
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
  const { Company, Code, Description, ServiceGroupCode, Unit } = data;
  const collection = new Service(Code, Company);
  const ServiceGroups = new ServiceGroup(ServiceGroupCode, Company);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company does not exist.`,
      );
      addError(
        !ServiceGroups.exists(),
        "ServiceGroup",
        `Service Group does not exist.`,
      );
    }
    addError(!Units.unitExists(Unit), "Unit", "Unit does not exist.");
  }, [data]);

  return (
    <>
      <WindowTitle
        title={`${method} Service`}
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
                () => openWindow(<ManageService />),
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
                  [() => openWindow(<ManageService />)],
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
            <Label label={"Service Group"} />
            <Conditional logic={method === "Create"}>
              <AutoSuggestInput
                value={ServiceGroupCode}
                process={(value) => changeData("", "ServiceGroupCode", value)}
                placeholder={"Enter Service Group"}
                suggestions={ServiceGroups.listAllFromCompany("Code")}
                captions={ServiceGroups.listAllFromCompany("Description")}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{ServiceGroupCode}</label>
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
