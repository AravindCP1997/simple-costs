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
import {
  GeneralLedger,
  ChartOfAccounts,
  Currencies,
  InterestCode,
} from "../classes";
import { Collection } from "../Database";
import { ListItems, rangeOverlap, valueInRange } from "../functions";
import { defaultGeneralLedger } from "../defaults";

export function ManageGeneralLedger() {
  const [company, setcompany] = useState("");
  const [code, setcode] = useState("");
  const { openWindow, showAlert, openConfirm } = useInterface();
  const collection = new GeneralLedger(code, company);

  return (
    <>
      <WindowTitle
        title={"Manage General Ledger"}
        menu={[
          <Button
            name="New"
            functionsArray={[
              () => {
                openWindow(<CreateGeneralLedger />);
              },
            ]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("General Ledger does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateGeneralLedger
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
                  "Either the General Ledger does not exist, or it is not in draft stage to be updated."
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateGeneralLedger
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
                  "Either the General Ledger does not exist, or it is not in draft stage to be deleted."
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the General Ledger.",
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
            whileFalse={[() => showAlert("General Ledger does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateGeneralLedger
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
              placeholder={"Enter Company Code"}
              suggestions={collection.company.listAll("Code")}
              captions={collection.company.listAll("Description")}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"General Ledger"} />
            <AutoSuggestInput
              value={code}
              process={(value) => setcode(value)}
              placeholder={"Enter General Ledger"}
              suggestions={collection.listAllFromCompany("Code")}
              captions={collection.listAllFromCompany("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateGeneralLedger({
  initial = defaultGeneralLedger,
  method = "Create",
}) {
  const { data, setdata, reset, changeData } = useData(initial);
  const { openWindow, showAlert } = useInterface();
  const {
    Company,
    Code,
    Description,
    Group,
    Type,
    CostElement,
    RestrictManual,
    Currency,
    PostForex,
    PostInterest,
    InterestCode: int,
    Status,
  } = data;
  const collection = new GeneralLedger(Code, Company);
  const interestcode = new InterestCode(int);
  const { errorsExist, DisplayHidingError, clearErrors, addError } = useError();
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
        collection.exists(),
        "Code",
        `General Ledger ${Code} already exists in Company ${Company}.`
      );
    }
    addError(
      collection.company.exists() && !collection.getChart().groupExists(Group),
      "Group",
      `Group does not exist in Chart of Accounts ${collection.getChart().Code}`
    );
    addError(
      collection.company.exists() &&
        collection.getChart().groupExists(Group) &&
        !valueInRange(Number(Code), collection.getChart().groupRange(Group)),
      "Group",
      `General Ledger Number not within the range specified for the group '${Group}' in Chart of Accounts '${
        collection.getChart().Code
      }'`
    );
  }, [data]);
  if (method === "Create") {
    return (
      <>
        <WindowTitle
          title={`${method} General Ledger`}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageGeneralLedger />)]}
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
                suggestions={collection.company.filteredList(
                  { Status: "Ready" },
                  "Code"
                )}
                captions={collection.company.filteredList(
                  { Status: "Ready" },
                  "Name"
                )}
                placeholder={"Enter Company Code"}
              />
            </Row>
            <Row>
              <Label label={"Code"} />
              <Input
                value={Code}
                process={(value) => changeData("", "Code", value)}
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
                placeholder={"Enter Account Group"}
                suggestions={collection.getChart().groups()}
              />
            </Row>
            <Row>
              <Label label={"Type"} />
              <Radio
                value={Type}
                process={(value) => changeData("", "Type", value)}
                options={["Balance Sheet", "Profit or Loss"]}
              />
            </Row>
            <Row jc="left">
              <Label label={"Create as Cost Element"} />
              <CheckBox
                value={CostElement}
                process={(value) => changeData("", "CostElement", value)}
              />
            </Row>
            <Row jc="left">
              <Label label={"Restrict Manual Posting"} />
              <CheckBox
                value={RestrictManual}
                process={(value) => changeData("", "RestrictManual", value)}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Currency"} />
              <AutoSuggestInput
                value={Currency}
                process={(value) => changeData("", "Currency", value)}
                placeholder={"Enter Currency"}
                suggestions={ListItems(Currencies.read(), "Code")}
                captions={ListItems(Currencies.read(), "Description")}
              />
            </Row>
            <Row jc="left">
              <Label label={"Post Forex Differences"} />
              <CheckBox
                value={PostForex}
                process={(value) => changeData("", "PostForex", value)}
              />
            </Row>
            <Row jc="left">
              <Label label={"Post Interest"} />
              <CheckBox
                value={PostInterest}
                process={(value) => changeData("", "PostInterest", value)}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Interest Code"} />
              <AutoSuggestInput
                value={int}
                process={(value) => changeData("", "InterestCode", value)}
                placeholder={"Enter Interest Code"}
                suggestions={interestcode.filteredList(
                  { Status: "Ready" },
                  "Code"
                )}
                captions={interestcode.filteredList(
                  { Status: "Ready" },
                  "Description"
                )}
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
          title={`${method} General Ledger`}
          menu={[
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageGeneralLedger />),
              ]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageGeneralLedger />)]}
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
              <Label label={"Group"} />
              <AutoSuggestInput
                value={Group}
                process={(value) => changeData("", "Group", value)}
                placeholder={"Enter Account Group"}
                suggestions={collection.getChart().groups()}
              />
            </Row>
            <Row>
              <Label label={"Type"} />
              <Radio
                value={Type}
                process={(value) => changeData("", "Type", value)}
                options={["Balance Sheet", "Profit or Loss"]}
              />
            </Row>
            <Row jc="left">
              <Label label={"Create as Cost Element"} />
              <CheckBox
                value={CostElement}
                process={(value) => changeData("", "CostElement", value)}
              />
            </Row>
            <Row jc="left">
              <Label label={"Restrict Manual Posting"} />
              <CheckBox
                value={RestrictManual}
                process={(value) => changeData("", "RestrictManual", value)}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Currency"} />
              <AutoSuggestInput
                value={Currency}
                process={(value) => changeData("", "Currency", value)}
                placeholder={"Enter Currency"}
                suggestions={ListItems(Currencies.read(), "Code")}
                captions={ListItems(Currencies.read(), "Description")}
              />
            </Row>
            <Row jc="left">
              <Label label={"Post Forex Differences"} />
              <CheckBox
                value={PostForex}
                process={(value) => changeData("", "PostForex", value)}
              />
            </Row>
            <Row jc="left">
              <Label label={"Post Interest"} />
              <CheckBox
                value={PostInterest}
                process={(value) => changeData("", "PostInterest", value)}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Interest Code"} />
              <AutoSuggestInput
                value={int}
                process={(value) => changeData("", "InterestCode", value)}
                placeholder={"Enter Interest Code"}
                suggestions={interestcode.filteredList(
                  { Status: "Ready" },
                  "Code"
                )}
                captions={interestcode.filteredList(
                  { Status: "Ready" },
                  "Description"
                )}
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
          title={`${method} General Ledger`}
          menu={[
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageGeneralLedger />)]}
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
              <Label label={"Group"} />
              <label>{Group}</label>
            </Row>
            <Row>
              <Label label={"Type"} />
              <Radio
                value={Type}
                options={["Balance Sheet", "Profit or Loss"]}
              />
            </Row>
            <Row jc="left">
              <Label label={"Create as Cost Element"} />
              <CheckBox value={CostElement} />
            </Row>
            <Row jc="left">
              <Label label={"Restrict Manual Posting"} />
              <CheckBox value={RestrictManual} />
            </Row>
            <Row overflow="visible">
              <Label label={"Currency"} />
              <label>{Currency}</label>
            </Row>
            <Row jc="left">
              <Label label={"Post Forex Differences"} />
              <CheckBox value={PostForex} />
            </Row>
            <Row jc="left">
              <Label label={"Post Interest"} />
              <CheckBox value={PostInterest} />
            </Row>
            <Row overflow="visible">
              <Label label={"Interest Code"} />
              <label>{int}</label>
            </Row>
          </DisplayArea>
        </WindowContent>
      </>
    );
  }
}
