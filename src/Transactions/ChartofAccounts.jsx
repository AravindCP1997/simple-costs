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
import { ChartOfAccounts } from "../classes";
import { Collection } from "../Database";
import { rangeOverlap } from "../functions";
import { sampleChartOfAccounts } from "../samples";
import { defaultChartofAccounts } from "../defaults";

export function CreateChartofAccounts({
  method = "Create",
  initial = defaultChartofAccounts,
}) {
  const {
    data,
    changeData,
    reset,
    setdata,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { Code, AccountGroups, Status } = data;
  const { showAlert, openWindow } = useInterface();
  const { addError, clearErrors, errorsExist, DisplayHidingError } = useError();
  const collection = new ChartOfAccounts(Code);

  useEffect(() => {
    clearErrors();
    addError(
      method === "Create" && Code === "",
      "Code",
      "Code cannot be blank."
    );
    addError(
      method === "Create" && Code !== "" && collection.exists(),
      "Code",
      "Chart of accounts with same code already exists."
    );
    AccountGroups.forEach((numbering, n) => {
      const { From, To, Group } = numbering;
      addError(
        From === "" || To === "",
        "AccountGroups",
        `For Account Group ${n}, range incomplete.`
      );
      addError(
        Group === "",
        "AccountGroups",
        `For Group ${n + 1}, group name is blank.`
      );
      addError(
        From > To,
        "AccountGroups",
        `For Account Group ${n}, 'From' is greater than 'To'.`
      );
      AccountGroups.forEach((numberingtwo, ntwo) => {
        const { From: Fromtwo, To: Totwo, Group: Grouptwo } = numberingtwo;
        addError(
          n !== ntwo &&
            n < ntwo &&
            rangeOverlap(
              [Number(From), Number(To)],
              [Number(Fromtwo), Number(Totwo)]
            ),
          "AccountGroups",
          `Range overlaps between group ${Math.min(n, ntwo) + 1} and ${
            Math.max(n, ntwo) + 1
          }`
        );
        addError(
          n !== ntwo && n < ntwo && Group === Grouptwo,
          "AccountGroups",
          `Names of groups ${Math.min(n, ntwo) + 1} and ${
            Math.max(n, ntwo) + 1
          } are same.`
        );
      });
    });
  }, [data]);
  if (method === "Create") {
    return (
      <>
        <WindowTitle
          title={"Create Chart of Accounts"}
          menu={[
            <ConditionalButton
              name="Save"
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check!")]}
              whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
            />,
            <Button name={"Reset"} functionsArray={[() => reset()]} />,
            <Button
              name="Sample"
              functionsArray={[() => setdata(sampleChartOfAccounts)]}
            />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageChartofAccounts />)]}
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
                maxLength={6}
              />
            </Row>
            <Column>
              <Row>
                <Label label={"Account Groups"} />
                <Button
                  name={"Add Group"}
                  functionsArray={[
                    () =>
                      addItemtoArray("AccountGroups", {
                        Group: "",
                        From: "",
                        To: "",
                      }),
                  ]}
                />
              </Row>
              <Table
                columns={["", "Group Name", "From Range", "To Range"]}
                rows={AccountGroups.map((numbering, n) => [
                  <Button
                    name="-"
                    functionsArray={[
                      () => deleteItemfromArray("AccountGroups", n),
                    ]}
                  />,
                  <Input
                    value={numbering.Group}
                    process={(value) =>
                      changeData(`AccountGroups/${n}`, "Group", value)
                    }
                    type={"text"}
                  />,
                  <Input
                    value={numbering.From}
                    process={(value) =>
                      changeData(`AccountGroups/${n}`, "From", value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={numbering.To}
                    process={(value) =>
                      changeData(`AccountGroups/${n}`, "To", value)
                    }
                    type={"number"}
                  />,
                ])}
              />
            </Column>
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
          title={"Create Chart of Accounts"}
          menu={[
            <ConditionalButton
              name="Save"
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check!")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageChartofAccounts />),
              ]}
            />,
            <Button
              name={"Reset"}
              functionsArray={[() => setdata(defaultChartofAccounts)]}
            />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageChartofAccounts />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row>
              <Label label={"Code"} />
              <label>{Code}</label>
            </Row>
            <Column>
              <Row>
                <Label label={"Account Groups"} />
                <Button
                  name={"Add Group"}
                  functionsArray={[
                    () =>
                      addItemtoArray("AccountGroups", {
                        Group: "",
                        From: "",
                        To: "",
                      }),
                  ]}
                />
              </Row>
              <Table
                columns={["", "Group Name", "From Range", "To Range"]}
                rows={AccountGroups.map((numbering, n) => [
                  <Button
                    name="-"
                    functionsArray={[
                      () => deleteItemfromArray("AccountGroups", n),
                    ]}
                  />,
                  <Input
                    value={numbering.Group}
                    process={(value) =>
                      changeData(`AccountGroups/${n}`, "Group", value)
                    }
                    type={"text"}
                  />,
                  <Input
                    value={numbering.From}
                    process={(value) =>
                      changeData(`AccountGroups/${n}`, "From", value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={numbering.To}
                    process={(value) =>
                      changeData(`AccountGroups/${n}`, "To", value)
                    }
                    type={"number"}
                  />,
                ])}
              />
            </Column>
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
          title={"View Chart of Accounts"}
          menu={[
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageChartofAccounts />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row>
              <Label label={"Code"} />
              <label>{Code}</label>
            </Row>
            <Column>
              <Row>
                <Label label={"Account Groups"} />
              </Row>
              <Table
                columns={["Group Name", "From Range", "To Range"]}
                rows={AccountGroups.map((numbering, n) => [
                  <label>{numbering.Group}</label>,
                  <label>{numbering.From}</label>,
                  <label>{numbering.To}</label>,
                ])}
              />
            </Column>
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

export function ManageChartofAccounts() {
  const [Code, setCode] = useState("");
  const { showAlert, openConfirm, openWindow } = useInterface();
  const collection = new ChartOfAccounts(Code);

  return (
    <>
      <WindowTitle
        title={"Manage Chart of Accounts"}
        menu={[
          <Button
            name="New"
            functionsArray={[() => openWindow(<CreateChartofAccounts />)]}
          />,
          <ConditionalButton
            name="View"
            result={Code !== "" && collection.exists()}
            whileFalse={[() => showAlert("Chart of Accounts does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateChartofAccounts
                    method="View"
                    initial={collection.getData()}
                  />
                ),
            ]}
          />,
          <ConditionalButton
            name="Update"
            result={
              Code !== "" &&
              collection.exists() &&
              collection.getData().Status === "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Chart of Accounts does not exist, or it is not in draft stage to make changes."
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateChartofAccounts
                    method="Update"
                    initial={collection.getData()}
                  />
                ),
            ]}
          />,
          <ConditionalButton
            name="Delete"
            result={
              Code !== "" &&
              collection.exists() &&
              collection.getData().Status === "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Chart of Accounts does not exist, or it is not in draft stage to be deleted."
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the Chart of Accounts",
                  [],
                  [() => showAlert(collection.delete()), () => setCode("")]
                ),
            ]}
          />,
          <ConditionalButton
            name="Copy"
            result={Code !== "" && collection.exists()}
            whileFalse={[() => showAlert("Chart of Accounts does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateChartofAccounts initial={collection.getData()} />
                ),
            ]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row overflow="visible">
            <Label label={"Chart of Accounts"} />
            <AutoSuggestInput
              value={Code}
              process={(value) => setCode(value)}
              onSelect={(value) => setCode(value)}
              suggestions={collection.listAll("Code")}
              placeholder={"Enter Code"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
