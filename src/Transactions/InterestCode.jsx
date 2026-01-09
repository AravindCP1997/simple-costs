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
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { Collection } from "../Database";
import { noop, rangeOverlap } from "../functions";
import { InterestCode } from "../classes";
import { sampleInterestCode } from "../samples";
import { defaultInterestCode } from "../defaults";

export function ManageInterestCode() {
  const [Code, setCode] = useState("");
  const collection = new InterestCode(Code);
  const { openWindow, showAlert, openConfirm } = useInterface();

  return (
    <>
      <WindowTitle
        title={"Manage Interest Code"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateInterestCode />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("The Interest Code does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateInterestCode
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
                  "Either the Interest Code does not exist, or it is not in a draft stage to be updated."
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateInterestCode
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
                  "Either the Interest Code does not exist, or it is not in a draft stage to be deleted."
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the Interest Code.",
                  [],
                  [() => showAlert(collection.delete()), () => setCode("")]
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("The Interest Code does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateInterestCode
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
            <Label label={"Interest Code"} />
            <AutoSuggestInput
              value={Code}
              process={(value) => setCode(value)}
              suggestions={collection.listAll("Code")}
              onSelect={(value) => setCode(value)}
              placeholder={"Enter Code"}
              captions={collection.listAll("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateInterestCode({
  method = "Create",
  initial = defaultInterestCode,
}) {
  const { data, reset, setdata, changeData } = useData(initial);
  const { showAlert, openWindow } = useInterface();
  const { DisplayHidingError, errorsExist, clearErrors, addError } = useError();
  const { Code, Description, Compounding, DaysinYear, Status } = data;
  const collection = new InterestCode(Code);

  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(Code === "", "Code", "Code cannot be blank");
      addError(
        Code !== "" && collection.exists(),
        "Code",
        `Interest Code ${Code} already exists.`
      );
    }
    addError(Description === "", "Descripition", "Description cannot be blank");
  }, [data]);
  if (method === "Create") {
    return (
      <>
        <WindowTitle
          title={"Create Interest Code"}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check!")]}
              whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <Button
              name="Sample"
              functionsArray={[() => setdata(sampleInterestCode)]}
            />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageInterestCode />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
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
            <Row>
              <Label label={"Compounding"} />
              <Option
                value={Compounding}
                process={(value) => changeData("", "Compounding", value)}
                options={[
                  "Daily",
                  "Weekly",
                  "Monthly",
                  "Yearly",
                  "Exponentially",
                ]}
              />
            </Row>
            <Row>
              <Label label={"Days in Year"} />
              <Option
                value={DaysinYear}
                process={(value) => changeData("", "DaysinYear", value)}
                options={[360, 365, "Actual"]}
              />
            </Row>
            <Row>
              <Label label={"Status"} />
              <Option
                value={Status}
                options={["Draft", "Ready", "Blocked"]}
                process={(value) => changeData("", "Status", value)}
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
          title={"Update Interest Code"}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check!")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageInterestCode />),
              ]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageInterestCode />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
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
            <Row>
              <Label label={"Compounding"} />
              <Option
                value={Compounding}
                process={(value) => changeData("", "Compounding", value)}
                options={[
                  "Daily",
                  "Weekly",
                  "Monthly",
                  "Yearly",
                  "Exponentially",
                ]}
              />
            </Row>
            <Row>
              <Label label={"Days in Year"} />
              <Option
                value={DaysinYear}
                process={(value) => changeData("", "DaysinYear", value)}
                options={[360, 365, "Actual"]}
              />
            </Row>
            <Row>
              <Label label={"Status"} />
              <Option
                value={Status}
                options={["Draft", "Ready", "Blocked"]}
                process={(value) => changeData("", "Status", value)}
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
          title={"Create Interest Code"}
          menu={[
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageInterestCode />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row>
              <Label label={"Code"} />
              <label>{Code}</label>
            </Row>
            <Row>
              <Label label={"Description"} />
              <label>{Description}</label>
            </Row>
            <Row>
              <Label label={"Compounding"} />
              <label>{Compounding}</label>
            </Row>
            <Row>
              <Label label={"Days in Year"} />
              <label>{DaysinYear}</label>
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

export function UpdateInterestCode({ Code }) {
  const collection = new InterestCode(Code);
  const initial = collection.getData();
  const { data, reset, setdata, changeData } = useData(initial);
  const { showAlert, openWindow } = useInterface();
  const { DisplayHidingError, errorsExist, clearErrors, addError } = useError();
  const { Description, Compounding, DaysinYear, Status } = data;

  useEffect(() => {
    clearErrors();
    addError(Code === "", "Code", "Code cannot be blank");
    addError(
      Code !== "" && collection.exists(),
      "Code",
      `Interest Code ${Code} already exists.`
    );
    addError(Description === "", "Description", "Description cannot be blank");
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Update Interest Code"}
        menu={[
          <ConditionalButton
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check!")]}
            whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
          />,
          <Button name="Reset" functionsArray={[() => reset()]} />,
          <DisplayHidingError />,
          <Button
            name={"Manage"}
            functionsArray={[() => openWindow(<ManageInterestCode />)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
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
          <Row>
            <Label label={"Compounding"} />
            <Option
              value={Compounding}
              process={(value) => changeData("", "Compounding", value)}
              options={[
                "Daily",
                "Weekly",
                "Monthly",
                "Yearly",
                "Exponentially",
              ]}
            />
          </Row>
          <Row>
            <Label label={"Days in Year"} />
            <Option
              value={DaysinYear}
              process={(value) => changeData("", "DaysinYear", value)}
              options={[360, 365, "Actual"]}
            />
          </Row>
          <Row>
            <Label label={"Status"} />
            <Option
              value={Status}
              options={["Draft", "Ready", "Blocked"]}
              process={(value) => changeData("", "Status", value)}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function ViewInterestCode({ Code }) {
  const collection = new InterestCode(Code);
  const initial = collection.getData();
  const { data, reset, setdata, changeData } = useData(initial);
  const { showAlert, openWindow } = useInterface();
  const { Description, Compounding, DaysinYear, Status } = data;

  return (
    <>
      <WindowTitle
        title={"View Interest Code"}
        menu={[
          <Button
            name={"Manage"}
            functionsArray={[() => openWindow(<ManageInterestCode />)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Code"} />
            <label>{Code}</label>
          </Row>
          <Row>
            <Label label={"Description"} />

            <label>{Description}</label>
          </Row>
          <Row>
            <Label label={"Compounding"} />
            <Option
              value={Compounding}
              process={noop}
              options={[
                "Daily",
                "Weekly",
                "Monthly",
                "Yearly",
                "Exponentially",
              ]}
            />
          </Row>
          <Row>
            <Label label={"Days in Year"} />
            <Option
              value={DaysinYear}
              process={noop}
              options={[360, 365, "Actual"]}
            />
          </Row>
          <Row>
            <Label label={"Status"} />
            <Option
              value={Status}
              options={["Draft", "Ready", "Blocked"]}
              process={noop}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
