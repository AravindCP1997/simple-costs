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
import { Company, Holidays } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { init } from "components/src/helpers/mixins";

export function ManageHolidays() {
  const [company, setcompany] = useState("");
  const [year, setyear] = useState("");
  const { errorsExist, clearErrors, addError, DisplayHidingError } = useError();
  const collection = new Holidays(year, company);
  const { showAlert, openWindow } = useInterface();
  useEffect(() => {
    clearErrors();
    addError(
      !collection.company.exists(),
      "Company",
      "Company does not exist.",
    );
    addError(
      collection.company.exists() &&
        collection.company.getData().StartingYear > year,
      "Year",
      "Year earlier than company starting year, cannot set holidays",
    );
  }, [company, year]);

  return (
    <>
      <WindowTitle
        title={"Holidays"}
        menu={[
          <ConditionalButton
            name={"Set"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check.")]}
            whileTrue={[
              () => openWindow(<SetHolidays initial={collection.getData()} />),
            ]}
          />,
          <DisplayHidingError />,
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
          <Row overflow="visible">
            <Label label={"Year"} />
            <Input
              value={year}
              process={(value) => setyear(value)}
              type={"number"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function SetHolidays({ initial }) {
  const { data, reset, changeData, addItemtoArray, deleteItemfromArray } =
    useData(initial);
  const { openWindow, showAlert } = useInterface();
  const { errorsExist, DisplayHidingError, addError, clearErrors } = useError();
  const { Company, Year, WeekHolidays, Holidays: days } = data;
  const collection = new Holidays(Year, Company);
  useEffect(() => {
    clearErrors();
    days.forEach((day, d) => {
      addError(day.Date === "", `Holidays/${d + 1}`, `Date cannot be blank.`);
      addError(
        !collection.company.dateInYear(day.Date, Year),
        `Holidays/${d + 1}`,
        `Date not within financial year ${Year} for Company ${Company}`,
      );
    });
  }, [data]);
  return (
    <>
      <WindowTitle
        title={"Set Holidays"}
        menu={[
          <ConditionalButton
            name={"Set"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check")]}
            whileTrue={[
              () => showAlert(collection.update(data)),
              () => openWindow(<ManageHolidays />),
            ]}
          />,
          <Button name={"Reset"} functionsArray={[() => reset()]} />,
          <DisplayHidingError />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Company"} />
            <label>{Company}</label>
          </Row>
          <Row>
            <Label label={"Year"} />
            <label>{Year}</label>
          </Row>
          <Column>
            <Label label={"Weekly Holidays"} />
            <Table
              columns={["Day", "Holiday"]}
              rows={WeekHolidays.map((day, d) => [
                <label>{day.Day}</label>,
                <CheckBox
                  value={day.Holiday}
                  process={(value) =>
                    changeData(`WeekHolidays/${d}`, "Holiday", value)
                  }
                />,
              ])}
            />
          </Column>
          <Column>
            <Row jc="left" borderBottom="none">
              <Label label={"Special Holidays"} />
              <Button
                name="Add"
                functionsArray={[
                  () =>
                    addItemtoArray(`Holidays`, { Date: "", Description: "" }),
                ]}
              />
            </Row>
            <Table
              columns={["Date", "Description", ""]}
              rows={days.map((day, d) => [
                <Input
                  value={day.Date}
                  process={(value) =>
                    changeData(`Holidays/${d}`, "Date", value)
                  }
                  type={"date"}
                />,
                <Input
                  value={day.Description}
                  process={(value) =>
                    changeData(`Holidays/${d}`, "Description", value)
                  }
                  type={"text"}
                />,
                <Button
                  name={"-"}
                  functionsArray={[() => deleteItemfromArray(`Holidays`, d)]}
                />,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
