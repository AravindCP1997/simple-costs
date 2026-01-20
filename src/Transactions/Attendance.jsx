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
  const [month, setmonth] = useState("01");
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
            name={"Record"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check.")]}
            whileTrue={[
              () =>
                openWindow(<RecordAttendance initial={collection.getData()} />),
            ]}
          />,
          <DisplayHidingError />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[
              () => showAlert("Attendance not yet recorded for the month."),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <RecordAttendance
                    initial={collection.getData()}
                    method="View"
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

export function RecordAttendance({ initial, method = "Record" }) {
  const { data, setdata, changeData } = useData(initial);
  const { showAlert, openWindow } = useInterface();
  const { errorsExist, DisplayHidingError, clearErrors, addError } = useError();
  const { Company, Year, EmployeeCode, Month, Attendance: Days } = data;
  const collection = new Attendance(EmployeeCode, Year, Month, Company);
  useEffect(() => {
    clearErrors();
  }, [data]);
  return (
    <>
      <WindowTitle
        title={`${method} Attendance`}
        menu={
          method === "Record"
            ? [
                <ConditionalButton
                  name={"Save"}
                  result={!errorsExist}
                  whileFalse={[
                    () => showAlert("Messages Exist. Please check."),
                  ]}
                  whileTrue={[
                    () => showAlert(collection.update(data)),
                    () => openWindow(<ManageAttendance />),
                  ]}
                />,
                <DisplayHidingError />,
              ]
            : []
        }
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Company"} />
            <label>{Company}</label>
          </Row>
          <Row>
            <Label label={"Employee"} />
            <label>{EmployeeCode}</label>
          </Row>
          <Row>
            <Label label={"Year"} />
            <label>{Year}</label>
          </Row>
          <Row>
            <Label label={"Month"} />
            <label>{Month}</label>
          </Row>
          <Column>
            <Label label={"Attendance"} />
            <Table
              columns={["Date", "Status", "Remarks"]}
              rows={
                method === "Record"
                  ? Days.map((day, d) => [
                      <label>{day.Date}</label>,
                      <Option
                        value={day.Status}
                        process={(value) =>
                          changeData(`Attendance/${d}`, `Status`, value)
                        }
                        options={["Absent", "Present", "Leave"]}
                      />,
                      <Input
                        value={day.Remarks}
                        process={(value) =>
                          changeData(`Attendance/${d}`, `Remarks`, value)
                        }
                        type={"text"}
                      />,
                    ])
                  : Days.map((day, d) => [
                      <label>{day.Date}</label>,
                      <label>{day.Status}</label>,
                      <label>{day.Remarks}</label>,
                    ])
              }
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
