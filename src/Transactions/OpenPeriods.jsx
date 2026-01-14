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
import { Company, OpenPeriods } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";

export function ManageOpenPeriods() {
  const [company, setcompany] = useState("");
  const collection = new Company(company);
  const periods = new OpenPeriods(company);
  const { openWindow, openConfirm, showAlert } = useInterface();

  return (
    <>
      <WindowTitle
        title={"Set Open Periods"}
        menu={[
          <ConditionalButton
            name={"Set"}
            result={
              collection.exists() && collection.getData().Status !== "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Company does not exist, or it is in draft stage."
                ),
            ]}
            whileTrue={[
              () => openWindow(<SetOpenPeriods initial={periods.getData()} />),
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
              suggestions={collection.listAll("Code")}
              captions={collection.listAll("Name")}
              placeholder={"Enter Company Code"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function SetOpenPeriods({ initial }) {
  const {
    data,
    setdata,
    reset,
    changeData,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { errorsExist, DisplayHidingError, addError, clearErrors } = useError();
  const { openWindow, showAlert } = useInterface();
  const { Company, Accounting, Costing, Material } = data;
  const collection = new OpenPeriods(Company);
  useEffect(() => {
    clearErrors();
    Accounting.forEach((period, p) => {
      const { From, To } = period;
      addError(
        From === "",
        `AccountingPeriod/${p + 1}`,
        "'Period From' cannot be blank"
      );
      addError(
        To === "",
        `AccountingPeriod/${p + 1}`,
        "'Period To' cannot be blank"
      );
      addError(
        From > To,
        `AccountingPeriod/${p + 1}`,
        "'Period From' greater than 'Period To' "
      );
    });
    Costing.forEach((period, p) => {
      const { From, To } = period;
      addError(
        From === "",
        `CostingPeriod/${p + 1}`,
        "'Period From' cannot be blank"
      );
      addError(
        To === "",
        `CostingPeriod/${p + 1}`,
        "'Period To' cannot be blank"
      );
      addError(
        From > To,
        `CostingPeriod/${p + 1}`,
        "'Period From' greater than 'Period To' "
      );
    });
    Material.forEach((period, p) => {
      const { From, To } = period;
      addError(
        From === "",
        `MaterialPeriod/${p + 1}`,
        "'Period From' cannot be blank"
      );
      addError(
        To === "",
        `MaterialPeriod/${p + 1}`,
        "'Period To' cannot be blank"
      );
      addError(
        From > To,
        `MaterialPeriod/${p + 1}`,
        "'Period From' greater than 'Period To' "
      );
    });
  }, [data]);
  return (
    <>
      <WindowTitle
        title={"Set Open Periods"}
        menu={[
          <ConditionalButton
            name="Save"
            result={!errorsExist}
            whileFalse={[() => showAlert("Meassages exist. Please check.")]}
            whileTrue={[
              () => showAlert(collection.update(data)),
              () => openWindow(<ManageOpenPeriods />),
            ]}
          />,
          <DisplayHidingError />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Company"} /> <label>{Company}</label>
          </Row>
          <Column>
            <Row jc="left">
              <Label label={"Accounting Documents"} />
              <Button
                name={"Add"}
                functionsArray={[
                  () => addItemtoArray("Accounting", { From: "", To: "" }),
                ]}
              />
            </Row>
            <Table
              columns={["Period From", "Period To", ""]}
              rows={Accounting.map((period, p) => [
                <Input
                  type={"date"}
                  value={period.From}
                  process={(value) =>
                    changeData(`Accounting/${p}`, "From", value)
                  }
                />,
                <Input
                  type={"date"}
                  value={period.To}
                  process={(value) =>
                    changeData(`Accounting/${p}`, "To", value)
                  }
                />,
                <Button
                  name={"-"}
                  functionsArray={[() => deleteItemfromArray(`Accounting`, p)]}
                />,
              ])}
            />
          </Column>
          <Column>
            <Row jc="left">
              <Label label={"Costing Documents"} />
              <Button
                name={"Add"}
                functionsArray={[
                  () => addItemtoArray("Costing", { From: "", To: "" }),
                ]}
              />
            </Row>
            <Table
              columns={["Period From", "Period To", ""]}
              rows={Costing.map((period, p) => [
                <Input
                  type={"date"}
                  value={period.From}
                  process={(value) => changeData(`Costing/${p}`, "From", value)}
                />,
                <Input
                  type={"date"}
                  value={period.To}
                  process={(value) => changeData(`Costing/${p}`, "To", value)}
                />,
                <Button
                  name={"-"}
                  functionsArray={[() => deleteItemfromArray(`Costing`, p)]}
                />,
              ])}
            />
          </Column>
          <Column>
            <Row jc="left">
              <Label label={"Material Documents"} />
              <Button
                name={"Add"}
                functionsArray={[
                  () => addItemtoArray("Material", { From: "", To: "" }),
                ]}
              />
            </Row>
            <Table
              columns={["Period From", "Period To", ""]}
              rows={Material.map((period, p) => [
                <Input
                  type={"date"}
                  value={period.From}
                  process={(value) =>
                    changeData(`Material/${p}`, "From", value)
                  }
                />,
                <Input
                  type={"date"}
                  value={period.To}
                  process={(value) => changeData(`Material/${p}`, "To", value)}
                />,
                <Button
                  name={"-"}
                  functionsArray={[() => deleteItemfromArray(`Material`, p)]}
                />,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
