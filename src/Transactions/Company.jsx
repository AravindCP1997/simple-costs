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
  MultiDisplayArea,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { ChartOfAccounts, Currencies, Company } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { sampleCompany } from "../samples";
import { defaultCompany } from "../defaults";
import { StatesMaster } from "../constants";

export function ManageCompany() {
  const [code, setcode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new Company(code);

  return (
    <>
      <WindowTitle
        title={"Manage Company"}
        menu={[
          <Button
            name={"New"}
            functionsArray={[() => openWindow(<CreateCompany />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Company does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateCompany initial={collection.getData()} method="View" />
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
                  "Either the Company does not exist, or it is not in draft stage to be updated."
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreateCompany
                    initial={collection.getData()}
                    method="Update"
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
                  "Either the Company does not exist, or it is not in draft stage to be deleted."
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the Company",
                  [],
                  [() => showAlert(collection.delete()), () => setcode("")]
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
              value={code}
              process={(value) => setcode(value)}
              onSelect={(value) => setcode(value)}
              placeholder={"Enter Company"}
              suggestions={collection.listAll("Code")}
              captions={collection.listAll("Name")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreateCompany({ initial = defaultCompany, method = "Create" }) {
  const {
    data,
    setdata,
    reset,
    changeData,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { errorsExist, clearErrors, addError, DisplayHidingError } = useError();
  const { openWindow, showAlert } = useInterface();
  const {
    Code,
    Name,
    Address,
    Country,
    State,
    PostalCode,
    CIN,
    CTIN,
    Email,
    Phone,
    Numbering,
    ChartofAccounts,
    GroupChartofAccounts,
    Currency,
    StartingYear,
    FYBeginning,
    Status,
  } = data;
  const collection = new Company(Code);
  const charts = new ChartOfAccounts(ChartofAccounts);
  const groupcharts = new ChartOfAccounts(GroupChartofAccounts);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(Code === "", "Code", "Company Code cannot be blank.");
      addError(
        Code !== "" && collection.exists(),
        "Code",
        `Company Code ${Code} already exists.`
      );
    }
    Numbering.map((numbering, n) => {
      const { Item, From } = numbering;
      addError(
        From === "" || From < 1,
        "Numbering",
        `Numbering of ${Item} shall be a positive integer.`
      );
    });
  }, [data]);
  if (method === "Create") {
    return (
      <>
        <WindowTitle
          title={"Create Company"}
          menu={[
            <ConditionalButton
              name="Save"
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
            />,
            <Button name={"Reset"} functionsArray={[() => reset]} />,
            <Button
              name={"Sample"}
              functionsArray={[() => setdata(sampleCompany)]}
            />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageCompany />)]}
            />,
          ]}
        />
        <WindowContent>
          <MultiDisplayArea
            heads={["General", "Numbering"]}
            contents={[
              <Column>
                <Row>
                  <Label label={"Code"} />
                  <Input
                    value={Code}
                    process={(value) => changeData("", "Code", value)}
                    type="text"
                    maxLength={6}
                  />
                </Row>
                <Row>
                  <Label label={"Name"} />
                  <Input
                    value={Name}
                    process={(value) => changeData("", "Name", value)}
                    type="text"
                  />
                </Row>
                <Row>
                  <Label label={"Corporate Identification Number"} />
                  <Input
                    value={CIN}
                    process={(value) => changeData("", "CIN", value)}
                    type="text"
                  />
                </Row>
                <Row>
                  <Label label={"Corporate Tax Identification Number"} />
                  <Input
                    value={CTIN}
                    process={(value) => changeData("", "CTIN", value)}
                    type="text"
                  />
                </Row>
                <Row>
                  <Label label={"Registered Address"} />
                  <Input
                    value={Address}
                    process={(value) => changeData("", "Address", value)}
                    type="text"
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
                    options={[
                      "",
                      ...FilteredList(
                        StatesMaster,
                        { Country: Country },
                        "State"
                      ),
                    ]}
                  />
                </Row>
                <Row>
                  <Label label={"Postal Code"} />
                  <Input
                    value={PostalCode}
                    process={(value) => changeData("", "PostalCode", value)}
                    type="text"
                  />
                </Row>
                <Row>
                  <Label label={"Email"} />
                  <Input
                    value={Email}
                    process={(value) => changeData("", "Email", value)}
                    type="text"
                    placeholder="example@domain.com"
                  />
                </Row>
                <Row>
                  <Label label={"Phone"} />
                  <Input
                    value={Phone}
                    process={(value) => changeData("", "Phone", value)}
                    type="text"
                    placeholder="1234 23456789"
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Chart of Accounts"} />
                  <AutoSuggestInput
                    value={ChartofAccounts}
                    process={(value) =>
                      changeData("", "ChartofAccounts", value)
                    }
                    onSelect={(value) =>
                      changeData("", "ChartofAccounts", value)
                    }
                    placeholder="Enter Chart of Accounts"
                    suggestions={charts.filteredList(
                      { Status: "Ready", Level: "Company" },
                      "Code"
                    )}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Group Chart of Accounts"} />
                  <AutoSuggestInput
                    value={GroupChartofAccounts}
                    process={(value) =>
                      changeData("", "GroupChartofAccounts", value)
                    }
                    onSelect={(value) =>
                      changeData("", "GroupChartofAccounts", value)
                    }
                    placeholder="Enter Chart of Accounts"
                    suggestions={charts.filteredList(
                      { Status: "Ready", Level: "Group" },
                      "Code"
                    )}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Currency"} />
                  <AutoSuggestInput
                    value={Currency}
                    process={(value) => changeData("", "Currency", value)}
                    onSelect={(value) => changeData("", "Currency", value)}
                    placeholder="Enter Currency"
                    suggestions={ListItems(Currencies.read(), "Code")}
                    captions={ListItems(Currencies.read(), "Description")}
                  />
                </Row>
                <Row>
                  <Label label={"Starting Year"} />
                  <Input
                    value={StartingYear}
                    process={(value) => changeData("", "StartingYear", value)}
                    type="number"
                  />
                </Row>
                <Row>
                  <Label label={"Beginning of Financial Year"} />
                  <Option
                    value={FYBeginning}
                    process={(value) => changeData("", "FYBeginning", value)}
                    options={[
                      "01",
                      "02",
                      "03",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                      "11",
                      "12",
                    ]}
                  />
                </Row>{" "}
                <Row>
                  <Label label={"Status"} />
                  <Option
                    value={Status}
                    process={(value) => changeData("", "Status", value)}
                    options={["Draft", "Ready", "Blocked"]}
                  />
                </Row>
              </Column>,
              <Column>
                <Table
                  columns={["Particular", "Number From"]}
                  rows={Numbering.map((numbering, n) => [
                    <label>{numbering.Item}</label>,
                    <Input
                      value={numbering.From}
                      process={(value) =>
                        changeData(`Numbering/${n}`, "From", value)
                      }
                    />,
                  ])}
                />
              </Column>,
            ]}
          />
        </WindowContent>
      </>
    );
  } else if (method === "Update") {
    return (
      <>
        <WindowTitle
          title={"Create Company"}
          menu={[
            <ConditionalButton
              name="Save"
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManageCompany />),
              ]}
            />,
            <Button name={"Reset"} functionsArray={[() => reset]} />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageCompany />)]}
            />,
          ]}
        />
        <WindowContent>
          <MultiDisplayArea
            heads={["General", "Numbering"]}
            contents={[
              <Column>
                <Row>
                  <Label label={"Code"} />
                  <label>{Code}</label>
                </Row>
                <Row>
                  <Label label={"Name"} />
                  <Input
                    value={Name}
                    process={(value) => changeData("", "Name", value)}
                    type="text"
                  />
                </Row>
                <Row>
                  <Label label={"Corporate Identification Number"} />
                  <Input
                    value={CIN}
                    process={(value) => changeData("", "CIN", value)}
                    type="text"
                  />
                </Row>
                <Row>
                  <Label label={"Corporate Tax Identification Number"} />
                  <Input
                    value={CTIN}
                    process={(value) => changeData("", "CTIN", value)}
                    type="text"
                  />
                </Row>
                <Row>
                  <Label label={"Registered Address"} />
                  <Input
                    value={Address}
                    process={(value) => changeData("", "Address", value)}
                    type="text"
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
                    options={[
                      "",
                      ...FilteredList(
                        StatesMaster,
                        { Country: Country },
                        "State"
                      ),
                    ]}
                  />
                </Row>
                <Row>
                  <Label label={"Postal Code"} />
                  <Input
                    value={PostalCode}
                    process={(value) => changeData("", "PostalCode", value)}
                    type="text"
                  />
                </Row>
                <Row>
                  <Label label={"Email"} />
                  <Input
                    value={Email}
                    process={(value) => changeData("", "Email", value)}
                    type="text"
                    placeholder="example@domain.com"
                  />
                </Row>
                <Row>
                  <Label label={"Phone"} />
                  <Input
                    value={Phone}
                    process={(value) => changeData("", "Phone", value)}
                    type="text"
                    placeholder="1234 23456789"
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Chart of Accounts"} />
                  <AutoSuggestInput
                    value={ChartofAccounts}
                    process={(value) =>
                      changeData("", "ChartofAccounts", value)
                    }
                    onSelect={(value) =>
                      changeData("", "ChartofAccounts", value)
                    }
                    placeholder="Enter Chart of Accounts"
                    suggestions={charts.filteredList(
                      { Status: "Ready", Level: "Company" },
                      "Code"
                    )}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Group Chart of Accounts"} />
                  <AutoSuggestInput
                    value={GroupChartofAccounts}
                    process={(value) =>
                      changeData("", "GroupChartofAccounts", value)
                    }
                    onSelect={(value) =>
                      changeData("", "GroupChartofAccounts", value)
                    }
                    placeholder="Enter Chart of Accounts"
                    suggestions={charts.filteredList(
                      { Status: "Ready", Level: "Group" },
                      "Code"
                    )}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Currency"} />
                  <AutoSuggestInput
                    value={Currency}
                    process={(value) => changeData("", "Currency", value)}
                    onSelect={(value) => changeData("", "Currency", value)}
                    placeholder="Enter Currency"
                    suggestions={ListItems(Currencies.read(), "Code")}
                    captions={ListItems(Currencies.read(), "Description")}
                  />
                </Row>
                <Row>
                  <Label label={"Starting Year"} />
                  <Input
                    value={StartingYear}
                    process={(value) => changeData("", "StartingYear", value)}
                    type="number"
                  />
                </Row>
                <Row>
                  <Label label={"Beginning of Financial Year"} />
                  <Option
                    value={FYBeginning}
                    process={(value) => changeData("", "FYBeginning", value)}
                    options={[
                      "01",
                      "02",
                      "03",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                      "11",
                      "12",
                    ]}
                  />
                </Row>{" "}
                <Row>
                  <Label label={"Status"} />
                  <Option
                    value={Status}
                    process={(value) => changeData("", "Status", value)}
                    options={["Draft", "Ready", "Blocked"]}
                  />
                </Row>
              </Column>,
              <Column>
                <Table
                  columns={["Particular", "Number From"]}
                  rows={Numbering.map((numbering, n) => [
                    <label>{numbering.Item}</label>,
                    <Input
                      value={numbering.From}
                      process={(value) =>
                        changeData(`Numbering/${n}`, "From", value)
                      }
                    />,
                  ])}
                />
              </Column>,
            ]}
          />
        </WindowContent>
      </>
    );
  } else {
    return (
      <>
        <WindowTitle
          title={"View Company"}
          menu={[
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManageCompany />)]}
            />,
          ]}
        />
        <WindowContent>
          <MultiDisplayArea
            heads={["General", "Numbering"]}
            contents={[
              <Column>
                <Row>
                  <Label label={"Code"} />
                  <label>{Code}</label>
                </Row>
                <Row>
                  <Label label={"Name"} />
                  <label>{Name}</label>
                </Row>
                <Row>
                  <Label label={"Corporate Identification Number"} />
                  <label>{CIN}</label>
                </Row>
                <Row>
                  <Label label={"Corporate Tax Identification Number"} />
                  <label>{CTIN}</label>
                </Row>
                <Row>
                  <Label label={"Registered Address"} />
                  <label>{Address}</label>
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
                  <Label label={"Postal Code"} />
                  <label>{PostalCode}</label>
                </Row>
                <Row>
                  <Label label={"Email"} />
                  <label>{Email}</label>
                </Row>
                <Row>
                  <Label label={"Phone"} />
                  <label>{Phone}</label>
                </Row>
                <Row overflow="visible">
                  <Label label={"Chart of Accounts"} />
                  <label>{ChartofAccounts}</label>
                </Row>
                <Row overflow="visible">
                  <Label label={"Group Chart of Accounts"} />
                  <label>{GroupChartofAccounts}</label>
                </Row>
                <Row overflow="visible">
                  <Label label={"Currency"} />
                  <label>{Currency}</label>
                </Row>
                <Row>
                  <Label label={"Starting Year"} />
                  <label>{StartingYear}</label>
                </Row>
                <Row>
                  <Label label={"Beginning of Financial Year"} />
                  <label>{FYBeginning}</label>
                </Row>
                <Row>
                  <Label label={"Status"} />
                  <label>{Status}</label>
                </Row>
              </Column>,
              <Column>
                <Table
                  columns={["Particular", "Number From"]}
                  rows={Numbering.map((numbering, n) => [
                    <label>{numbering.Item}</label>,
                    <label>{numbering.From}</label>,
                  ])}
                />
              </Column>,
            ]}
          />
        </WindowContent>
      </>
    );
  }
}
