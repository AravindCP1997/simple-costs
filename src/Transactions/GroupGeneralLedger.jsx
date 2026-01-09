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
import { GroupGeneralLedger, ChartOfAccounts } from "../classes";
import { Collection } from "../Database";
import { rangeOverlap, valueInRange } from "../functions";
import { defaultGroupGeneralLedger } from "../defaults";

export function ManageGroupGeneralLedger() {
  const [gl, setgl] = useState("");
  const [coa, setcoa] = useState("");
  const { openWindow, showAlert, openConfirm } = useInterface();
  const collection = new GroupGeneralLedger(coa, gl);
  const chart = new ChartOfAccounts(coa);
  return (
    <>
      <WindowTitle
        title={"Manage Group General Ledger"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateGroupGeneralLedger />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[
              () => showAlert("The Group General Ledger does not exist."),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateGroupGeneralLedger
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
                  "Either the Group General Ledger does not exist, or it is not in draft stage to be updated."
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateGroupGeneralLedger
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
                  "Either the Group General Ledger does not exist, or it is not in draft stage to be deleted."
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will premanently delete the Group General Ledger.",
                  [],
                  [
                    () => showAlert(collection.delete()),
                    () => setcoa(""),
                    () => setgl(""),
                  ]
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[
              () => showAlert("The Group General Ledger does not exist."),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateGroupGeneralLedger
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
            <Label label={"Group Chart of Accounts"} />
            <AutoSuggestInput
              value={coa}
              process={(value) => setcoa(value)}
              suggestions={chart.filteredList({ Level: "Group" }, "Code")}
              onSelect={(value) => setcoa(value)}
              placeholder={"Enter Chart of Accounts"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"Group General Ledger"} />
            <AutoSuggestInput
              value={gl}
              process={(value) => setgl(value)}
              suggestions={collection.filteredList(
                { ChartofAccounts: coa },
                "GeneralLedger"
              )}
              onSelect={(value) => setgl(value)}
              placeholder={"Enter General Ledger"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateGroupGeneralLedger({
  method = "Create",
  initial = defaultGroupGeneralLedger,
}) {
  const { data, setdata, reset, changeData } = useData(initial);
  const { showAlert, openWindow } = useInterface();
  const { DisplayHidingError, errorsExist, clearErrors, addError } = useError();
  const {
    ChartofAccounts,
    GeneralLedger,
    Description,
    Group,
    LedgerType,
    Status,
  } = data;
  const collection = new GroupGeneralLedger(ChartofAccounts, GeneralLedger);
  const chart = new ChartOfAccounts(ChartofAccounts);

  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(
        ChartofAccounts === "",
        "ChartofAccounts",
        "Chart of Accounts cannot be blank."
      );
      addError(
        GeneralLedger === "",
        "GeneralLedger",
        "General Ledger Number cannot be blank."
      );
      addError(
        ChartofAccounts !== "" && GeneralLedger !== "" && collection.exists(),
        "General Ledger",
        `Group General Ledger ${GeneralLedger} already exists in Chart of Accounts ${ChartofAccounts}.`
      );
      addError(
        ChartofAccounts !== "" && !chart.exists(),
        "ChartofAccounts",
        `Chart of Accounts does not exist.`
      );
    }
    addError(Group === "", "Group", "Group cannot be blank.");
    addError(
      Description === "",
      "Description",
      "Please provide a description for the General Ledger."
    );
    addError(
      ChartofAccounts !== "" &&
        GeneralLedger !== "" &&
        chart.exists() &&
        !chart.groupExists(Group),
      "Group",
      `Chart of Accounts does not have group '${Group}'.`
    );

    addError(
      ChartofAccounts !== "" &&
        GeneralLedger !== "" &&
        chart.exists() &&
        chart.groupExists(Group) &&
        !valueInRange(GeneralLedger, chart.groupRange(Group)),
      "Group",
      `General Ledger Number not within the range specified for the group '${Group}' in Chart of Accounts '${ChartofAccounts}'.`
    );
  }, [data]);

  if (method === "Create") {
    return (
      <>
        <WindowTitle
          title={"Create Group General Ledger"}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
            />,
            <Button name={"Reset"} functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageGroupGeneralLedger />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row overflow="visible">
              <Label label={"Chart of Accounts"} />
              <AutoSuggestInput
                value={ChartofAccounts}
                process={(value) => changeData("", "ChartofAccounts", value)}
                onSelect={(value) => changeData("", "ChartofAccounts", value)}
                placeholder={"Enter Chart of Accounts"}
                suggestions={chart.filteredList(
                  { Level: "Group", Status: "Ready" },
                  "Code"
                )}
              />
            </Row>
            <Row>
              <Label label={"General Ledger Number"} />
              <Input
                value={GeneralLedger}
                process={(value) => changeData("", "GeneralLedger", value)}
                type={"number"}
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
              <Label label={"Group"} />
              <AutoSuggestInput
                value={Group}
                process={(value) => changeData("", "Group", value)}
                onSelect={(value) => changeData("", "Group", value)}
                suggestions={chart.groups()}
                placeholder={"Enter Group"}
              />
            </Row>
            <Row>
              <Label label={"Ledger Type"} />
              <Radio
                value={LedgerType}
                process={(value) => changeData("", "LedgerType", value)}
                options={["Balance Sheet", "Profit or Loss"]}
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
          title={"Update Group General Ledger"}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageGroupGeneralLedger />),
              ]}
            />,
            <Button name={"Reset"} functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageGroupGeneralLedger />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row overflow="visible">
              <Label label={"Chart of Accounts"} />
              <label>{ChartofAccounts}</label>
            </Row>
            <Row>
              <Label label={"General Ledger Number"} />
              <label>{GeneralLedger}</label>
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
              <Label label={"Group"} />
              <AutoSuggestInput
                value={Group}
                process={(value) => changeData("", "Group", value)}
                onSelect={(value) => changeData("", "Group", value)}
                suggestions={chart.groups()}
                placeholder={"Enter Group"}
              />
            </Row>
            <Row>
              <Label label={"Ledger Type"} />
              <Radio
                value={LedgerType}
                process={(value) => changeData("", "LedgerType", value)}
                options={["Balance Sheet", "Profit or Loss"]}
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
          title={"View Group General Ledger"}
          menu={[
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageGroupGeneralLedger />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row overflow="visible">
              <Label label={"Chart of Accounts"} />
              <label>{ChartofAccounts}</label>
            </Row>
            <Row>
              <Label label={"General Ledger Number"} />
              <label>{GeneralLedger}</label>
            </Row>
            <Row>
              <Label label={"Description"} />
              <label>{Description}</label>
            </Row>
            <Row overflow="visible">
              <Label label={"Group"} />
              <label>{Group}</label>
            </Row>
            <Row>
              <Label label={"Ledger Type"} />
              <label>{LedgerType}</label>
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
