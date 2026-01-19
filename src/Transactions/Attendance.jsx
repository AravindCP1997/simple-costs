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
import { Attendance } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";

export function ManageAttendance() {
  const [company, setcompany] = useState("");
  const [year, setyear] = useState("");
  const [month, setmonth] = useState("");
  const [employee, setemployee] = useState("");
  const { errorsExist, clearErrors, addError, DisplayHidingError } = useError();
  const collection = new Attendance(employee, year, month, company);
  const { showAlert, openWindow } = useInterface();
  useEffect(() => {
    clearErrors();
    addError(
      !collection.employee.exists(),
      "Employee",
      "Employee does not exist.",
    );
  }, [company, employee, month, year]);

  return (
    <>
      <WindowTitle
        title={"Attendance"}
        menu={[
          <ConditionalButton
            name={"Set"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check.")]}
            whileTrue={[
              () =>
                openWindow(<RecordAttendance initial={collection.getData()} />),
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
            <Label label={"Employee"} />
            <AutoSuggestInput
              value={employee}
              process={(value) => setemployee(value)}
              placeholder={"Enter Employee Code"}
              suggestions={collection.employee.listAllFromCompany("Code")}
              captions={collection.employee.listAllFromCompany("Name")}
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
          <Row>
            <Label label={"Month"} />
            <Option
              value={month}
              process={(value) => setmonth(value)}
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
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function RecordAttendance() {}
