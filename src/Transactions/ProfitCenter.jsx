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
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { ProfitCenter, Segments } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { sampleProfitCenter } from "../samples";
import { defaultProfitCenter } from "../defaults";

export function ManageProfitCenter() {
  const [code, setcode] = useState("");
  const [company, setcompany] = useState("");
  const collection = new ProfitCenter(code, company);
  const { openWindow, openConfirm, showAlert } = useInterface();

  return (
    <>
      <WindowTitle
        title={"Manage Profit Center"}
        menu={[
          <Button
            name={"New"}
            functionsArray={[() => openWindow(<CreateProfitCenter />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Profit Center does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateProfitCenter
                    method="View"
                    initial={collection.getData()}
                  />
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={
              collection.exists() && collection.getData().Status === "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Profit Center does not exist, or it is not in draft stage to be updated."
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateProfitCenter
                    method="Update"
                    initial={collection.getData()}
                  />
                ),
            ]}
          />,
          <ConditionalButton
            name={"Delete"}
            result={
              collection.exists() && collection.getData().Status === "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Profit Center does not exist, or it is not in draft stage to be deleted."
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the Profit Center.",
                  [],
                  [
                    () => showAlert(collection.delete()),
                    () => setcode(""),
                    () => setcompany(""),
                  ]
                ),
            ]}
          />,

          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Profit Center does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateProfitCenter
                    method="Create"
                    initial={collection.getData()}
                  />
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
              onSelect={(value) => setcompany(value)}
              suggestions={collection.company.listAll("Code")}
              captions={collection.company.listAll("Name")}
              placeholder={"Enter Company Code"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"Profit Center"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              onSelect={(value) => setcode(value)}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
              placeholder={"Enter Profit Center Code"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateProfitCenter({
  method = "Create",
  initial = defaultProfitCenter,
}) {
  const { data, reset, setdata, changeData } = useData(initial);
  const { openWindow, showAlert } = useInterface();
  const { errorsExist, clearErrors, addError, DisplayHidingError } = useError();
  const { Company, Code, Segment, Description, Status } = data;
  const collection = new ProfitCenter(Code, Company);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        "Company does not exist."
      );
      addError(Code === "", "Code", `Code cannot be blank.`);
      addError(
        Code !== "" && collection.exists(),
        "Code",
        `Profit Center ${Code} already exists in Company ${Company}.`
      );
    }
    addError(
      !Segments.segmentExists(Segment),
      "Segment",
      `Segment does not exist.`
    );
  }, [data]);
  if (method === "Create") {
    return (
      <>
        <WindowTitle
          title={"Create Profit Center"}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <Button
              name="Sample"
              functionsArray={[() => setdata(sampleProfitCenter)]}
            />,
            <DisplayHidingError />,
            <Button
              name="Manage"
              functionsArray={[() => openWindow(<ManageProfitCenter />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row overflow="visible">
              <Label label={"Company"} />
              <AutoSuggestInput
                value={Company}
                process={(value) => changeData("", "Company", value)}
                onSelect={(value) => changeData("", "Company", value)}
                placeholder={"Enter Company Code"}
                suggestions={collection.company.filteredList(
                  { Status: "Ready" },
                  "Code"
                )}
                captions={collection.company.filteredList(
                  { Status: "Ready" },
                  "Name"
                )}
              />
            </Row>
            <Row>
              <Label label={"Code"} />
              <Input
                value={Code}
                process={(value) => changeData("", "Code", value)}
                type={"text"}
                maxLength={4}
              />
            </Row>
            <Row>
              <Label label={"Description"} />
              <Input
                value={Description}
                process={(value) => changeData("", "Description", value)}
                type={"text"}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Segment"} />
              <AutoSuggestInput
                value={Segment}
                process={(value) => changeData("", "Segment", value)}
                placeholder={"Enter Segment"}
                suggestions={ListItems(Segments.read(), "Segment")}
                captions={ListItems(Segments.read(), "Description")}
              />
            </Row>
            <Row>
              <Label label={"Status"} />
              <Option
                value={Status}
                process={(value) => changeData("", "Status", value)}
                options={["Draft", "Ready", "Blocked"]}
              />
            </Row>
          </DisplayArea>
        </WindowContent>
      </>
    );
  } else if (method === "Update") {
    return (
      <>
        <WindowTitle
          title={"Update Profit Center"}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageProfitCenter />),
              ]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name="Manage"
              functionsArray={[() => openWindow(<ManageProfitCenter />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row overflow="visible">
              <Label label={"Company"} />
              <label>{Company}</label>
            </Row>
            <Row>
              <Label label={"Code"} />
              <label>{Code}</label>
            </Row>
            <Row>
              <Label label={"Description"} />
              <Input
                value={Description}
                process={(value) => changeData("", "Description", value)}
                type={"text"}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Segment"} />
              <AutoSuggestInput
                value={Segment}
                process={(value) => changeData("", "Segment", value)}
                placeholder={"Enter Segment"}
                suggestions={ListItems(Segments.read(), "Segment")}
                captions={ListItems(Segments.read(), "Description")}
              />
            </Row>
            <Row>
              <Label label={"Status"} />
              <Option
                value={Status}
                process={(value) => changeData("", "Status", value)}
                options={["Draft", "Ready", "Blocked"]}
              />
            </Row>
          </DisplayArea>
        </WindowContent>
      </>
    );
  } else {
    return (
      <>
        <WindowTitle
          title={"View Profit Center"}
          menu={[
            <Button
              name="Manage"
              functionsArray={[() => openWindow(<ManageProfitCenter />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row overflow="visible">
              <Label label={"Company"} />
              <label>{Company}</label>
            </Row>
            <Row>
              <Label label={"Code"} />
              <label>{Code}</label>
            </Row>
            <Row>
              <Label label={"Description"} />
              <label>{Description}</label>
            </Row>
            <Row overflow="visible">
              <Label label={"Segment"} />
              <label>{Segment}</label>
            </Row>
            <Row>
              <Label label={"Status"} />
              <label>{Status}</label>
            </Row>
          </DisplayArea>
        </WindowContent>
      </>
    );
  }
}
