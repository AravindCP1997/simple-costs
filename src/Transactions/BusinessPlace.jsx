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
import { Company, BusinessPlace, Region } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { sampleBusinessPlace } from "../samples";
import { defaultBusinessPlace } from "../defaults";
import { StatesMaster } from "../constants";

export function ManageBusinessPlace() {
  const [code, setcode] = useState("");
  const [company, setcompany] = useState("");
  const collection = new BusinessPlace(code, company);
  const { openWindow, openConfirm, showAlert } = useInterface();

  return (
    <>
      <WindowTitle
        title={"Manage Business Place"}
        menu={[
          <Button
            name={"New"}
            functionsArray={[() => openWindow(<CreateBusinessPlace />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Business Place does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateBusinessPlace
                    method="View"
                    initial={collection.getData()}
                  />,
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
                  "Either the Business Place does not exist, or it is not in draft stage to be updated.",
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateBusinessPlace
                    method="Update"
                    initial={collection.getData()}
                  />,
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
                  "Either the Business Place does not exist, or it is not in draft stage to be deleted.",
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the Business Place.",
                  [],
                  [
                    () => showAlert(collection.delete()),
                    () => setcode(""),
                    () => setcompany(""),
                  ],
                ),
            ]}
          />,

          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Business Place does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateBusinessPlace
                    method="Create"
                    initial={collection.getData()}
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
              onSelect={(value) => setcompany(value)}
              suggestions={collection.company.listAll("Code")}
              captions={collection.company.listAll("Name")}
              placeholder={"Enter Company Code"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"Business Place"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              onSelect={(value) => setcode(value)}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
              placeholder={"Enter Business Place Code"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateBusinessPlace({
  initial = defaultBusinessPlace,
  method = "Create",
}) {
  const { data, reset, setdata, changeData } = useData(initial);
  const { openWindow, showAlert } = useInterface();
  const { errorsExist, clearErrors, addError, DisplayHidingError } = useError();
  const {
    Company,
    Code,
    Description,
    Address,
    Country,
    State,
    PostalCode,
    Email,
    Phone,
    BTIN,
    Status,
    RegionCode,
  } = data;
  const collection = new BusinessPlace(Code, Company);
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
        Code !== "" && collection.exists(),
        "Code",
        `Business Place ${Code} already exists in Company ${Company}.`,
      );
    }
    addError(
      !Region.exists(RegionCode),
      "RegionCode",
      "Region does not exist.",
    );
    addError(Country === "", "Country", `Country cannot be blank.`);
    addError(State === "", "State", `State cannot be blank.`);
  }, [data]);
  if (method === "Create") {
    return (
      <>
        <WindowTitle
          title={`${method} Business Place`}
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
              functionsArray={[() => setdata(sampleBusinessPlace)]}
            />,
            <DisplayHidingError />,
            <Button
              name="Manage"
              functionsArray={[() => openWindow(<ManageBusinessPlace />)]}
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
            <Row>
              <Label label={"Address"} />
              <Input
                value={Address}
                process={(value) => changeData("", "Address", value)}
                type={"text"}
              />
            </Row>
            <Row>
              <Label label={"Postal Code"} />
              <Input
                value={PostalCode}
                process={(value) => changeData("", "PostalCode", value)}
                type={"text"}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Region"} />
              <AutoSuggestInput
                value={RegionCode}
                process={(value) => changeData("", "RegionCode", value)}
                suggestions={Region.list("Code")}
                captions={Region.list("Description")}
              />
            </Row>
            <Row>
              <Label label={"Country"} />
              <Option
                value={Country}
                process={(value) => changeData("", "Country", value)}
                options={["", ...ListUniqueItems(StatesMaster, "Country")]}
              />
            </Row>
            <Row>
              <Label label={"State"} />
              <Option
                value={State}
                process={(value) => changeData("", "State", value)}
                options={FilteredList(
                  StatesMaster,
                  { Country: Country },
                  "State",
                )}
              />
            </Row>
            <Row>
              <Label label={"Email"} />
              <Input
                value={Email}
                process={(value) => changeData("", "Email", value)}
                type={"text"}
              />
            </Row>
            <Row>
              <Label label={"Phone"} />
              <Input
                value={Phone}
                process={(value) => changeData("", "Phone", value)}
                type={"text"}
              />
            </Row>
            <Row>
              <Label label={"Business Tax Identification Number"} />
              <Input
                value={BTIN}
                process={(value) => changeData("", "BTIN", value)}
                type={"text"}
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
          title={`${method} Business Place`}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageBusinessPlace />),
              ]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name="Manage"
              functionsArray={[() => openWindow(<ManageBusinessPlace />)]}
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
            <Row>
              <Label label={"Address"} />
              <Input
                value={Address}
                process={(value) => changeData("", "Address", value)}
                type={"text"}
              />
            </Row>
            <Row>
              <Label label={"Postal Code"} />
              <Input
                value={PostalCode}
                process={(value) => changeData("", "PostalCode", value)}
                type={"text"}
              />
            </Row>
            <Row>
              <Label label={"Region Code"} />
              <Input
                value={RegionCode}
                process={(value) => changeData("", "RegionCode", value)}
                type={"text"}
              />
            </Row>
            <Row>
              <Label label={"Country"} />
              <Option
                value={Country}
                process={(value) => changeData("", "Country", value)}
                options={["", ...ListUniqueItems(StatesMaster, "Country")]}
              />
            </Row>
            <Row>
              <Label label={"State"} />
              <Option
                value={State}
                process={(value) => changeData("", "State", value)}
                options={FilteredList(
                  StatesMaster,
                  { Country: Country },
                  "State",
                )}
              />
            </Row>
            <Row>
              <Label label={"Email"} />
              <Input
                value={Email}
                process={(value) => changeData("", "Email", value)}
                type={"text"}
              />
            </Row>
            <Row>
              <Label label={"Phone"} />
              <Input
                value={Phone}
                process={(value) => changeData("", "Phone", value)}
                type={"text"}
              />
            </Row>
            <Row>
              <Label label={"Business Tax Identification Number"} />
              <Input
                value={BTIN}
                process={(value) => changeData("", "BTIN", value)}
                type={"text"}
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
          title={`${method} Business Place`}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageBusinessPlace />),
              ]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name="Manage"
              functionsArray={[() => openWindow(<ManageBusinessPlace />)]}
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
            <Row>
              <Label label={"Address"} />
              <label>{Address}</label>
            </Row>
            <Row>
              <Label label={"Postal Code"} />
              <label>{PostalCode}</label>
            </Row>
            <Row>
              <Label label={"Postal Code"} />
              <label>{RegionCode}</label>
            </Row>
            <Row>
              <Label label={"Country"} />
              <label>{Country}</label>
            </Row>
            <Row>
              <Label label={"State"} />
              <label>{State}</label>
            </Row>
            <Row>
              <Label label={"Email"} />
              <label>{Email}</label>
            </Row>
            <Row>
              <Label label={"Phone"} />
              <label>{Phone}</label>
            </Row>
            <Row>
              <Label label={"Business Tax Identification Number"} />
              <label>{BTIN}</label>
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
