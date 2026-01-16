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
import { BusinessPlace, CostCenter, ProfitCenter } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultCostCenter } from "../defaults";

export function ManageCostCenter() {
  const [code, setcode] = useState("");
  const [company, setcompany] = useState("");
  const collection = new CostCenter(code, company);
  const { openWindow, openConfirm, showAlert } = useInterface();

  return (
    <>
      <WindowTitle
        title={"Manage Cost Center"}
        menu={[
          <Button
            name={"New"}
            functionsArray={[() => openWindow(<CreateCostCenter />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Cost Center does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateCostCenter
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
                  "Either the Cost Center does not exist, or it is not in draft stage to be updated."
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateCostCenter
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
                  "Either the Cost Center does not exist, or it is not in draft stage to be deleted."
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the Cost Center.",
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
            whileFalse={[() => showAlert("Cost Center does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateCostCenter
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
            <Label label={"Cost Center"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              onSelect={(value) => setcode(value)}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
              placeholder={"Enter Cost Center Code"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateCostCenter({
  initial = defaultCostCenter,
  method = "Create",
}) {
  const { data, reset, setdata, changeData } = useData(initial);
  const { openWindow, showAlert } = useInterface();
  const { errorsExist, clearErrors, addError, DisplayHidingError } = useError();
  const {
    Company,
    Code,
    Description,
    ProfitCenter: pcCode,
    BusinessPlace: bpCode,
    Status,
  } = data;
  const collection = new CostCenter(Code, Company);
  const pc = new ProfitCenter(pcCode, Company);
  const bp = new BusinessPlace(bpCode, Company);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company does not exist.`
      );
      addError(Code === "", "Code", `Code cannot be blank.`);
      addError(
        Code !== "" && collection.exists(),
        "Code",
        `Cost Center ${Code} already exists in Company ${Company}.`
      );
    }
    addError(!pc.exists(), "ProfitCenter", `Profit Center does not exist.`);
    addError(!bp.exists(), "BusinessPlace", `Business Place does not exist.`);
  }, [data]);
  if (method === "Create") {
    return (
      <>
        <WindowTitle
          title={`${method} Cost Center`}
          menu={[
            <ConditionalButton
              name="Save"
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
            />,
            <Button name={"Reset"} functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name="Manage"
              functionsArray={[() => openWindow(<ManageCostCenter />)]}
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
                  {
                    Status: "Ready",
                  },
                  "Code"
                )}
                captions={collection.company.filteredList(
                  {
                    Status: "Ready",
                  },
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
                maxLength={6}
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
              <Label label={"Profit Center"} />
              <AutoSuggestInput
                value={pcCode}
                process={(value) => changeData("", "ProfitCenter", value)}
                placeholder={"Enter Profit Center Code"}
                suggestions={pc.filteredList(
                  {
                    Status: "Ready",
                  },
                  "Code"
                )}
                captions={pc.filteredList(
                  {
                    Status: "Ready",
                  },
                  "Description"
                )}
              />
            </Row>{" "}
            <Row overflow="visible">
              <Label label={"Business Place"} />
              <AutoSuggestInput
                value={bpCode}
                process={(value) => changeData("", "BusinessPlace", value)}
                placeholder={"Enter Business Place Code"}
                suggestions={bp.filteredList(
                  {
                    Status: "Ready",
                  },
                  "Code"
                )}
                captions={bp.filteredList(
                  {
                    Status: "Ready",
                  },
                  "Description"
                )}
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
          title={`${method} Cost Center`}
          menu={[
            <ConditionalButton
              name="Save"
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageCostCenter />),
              ]}
            />,
            <Button name={"Reset"} functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name="Manage"
              functionsArray={[() => openWindow(<ManageCostCenter />)]}
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
              <Label label={"Profit Center"} />
              <AutoSuggestInput
                value={pcCode}
                process={(value) => changeData("", "ProfitCenter", value)}
                placeholder={"Enter Profit Center Code"}
                suggestions={pc.filteredList(
                  {
                    Status: "Ready",
                  },
                  "Code"
                )}
                captions={pc.filteredList(
                  {
                    Status: "Ready",
                  },
                  "Description"
                )}
              />
            </Row>{" "}
            <Row overflow="visible">
              <Label label={"Business Place"} />
              <AutoSuggestInput
                value={bpCode}
                process={(value) => changeData("", "BusinessPlace", value)}
                placeholder={"Enter Business Place Code"}
                suggestions={bp.filteredList(
                  {
                    Status: "Ready",
                  },
                  "Code"
                )}
                captions={bp.filteredList(
                  {
                    Status: "Ready",
                  },
                  "Description"
                )}
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
          title={`${method} Cost Center`}
          menu={[
            <Button
              name="Manage"
              functionsArray={[() => openWindow(<ManageCostCenter />)]}
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
              <Label label={"Profit Center"} />
              <label>{pcCode}</label>
            </Row>{" "}
            <Row overflow="visible">
              <Label label={"Business Place"} />
              <label>{bpCode}</label>
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
