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
  Selection,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import {
  Company,
  CompanyCollection,
  RemunerationOffCycleResult,
  RemunerationResult,
} from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  monthBegin,
  monthEnd,
  rangeOverlap,
  roundOff,
  trimSelection,
} from "../functions";

export function DeleteRemunerationResult() {
  const { data, changeData, reset } = useData({
    CompanyCode: "",
    EmployeeCode: "",
    Year: "",
    Month: "01",
    OffCycle: false,
    OffCycleDate: "",
  });
  const { CompanyCode, EmployeeCode, Year, Month, OffCycle, OffCycleDate } =
    data;
  const rr = OffCycle
    ? new RemunerationOffCycleResult(CompanyCode, EmployeeCode, OffCycleDate)
    : new RemunerationResult(CompanyCode, EmployeeCode, Year, Month);
  const { showAlert, openWindow } = useInterface();

  return (
    <>
      <WindowTitle
        title={"Delete Remuneration Result"}
        menu={[
          <ConditionalButton
            name={"Delete"}
            result={rr.exists()}
            whileFalse={[
              () =>
                showAlert(
                  "Remunertion not yet posted for the month/ off-cycle date.",
                ),
            ]}
            whileTrue={[
              () => {
                if (rr.expensePosting().posted()) {
                  showAlert("Cannot delete result. Expense already posted.");
                } else {
                  showAlert(rr.delete());
                }
              },
            ]}
          />,
          <Button name={"Reset"} functionsArray={[() => reset()]} />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row overflow="visible">
            <Label label={"Company"} />
            <AutoSuggestInput
              value={CompanyCode}
              process={(value) => changeData("", "CompanyCode", value)}
              suggestions={new Collection("Company").listAll("Code")}
              captions={new Collection("Company").listAll("Name")}
              placeholder={"Company Code"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"Employee"} />
            <AutoSuggestInput
              value={EmployeeCode}
              process={(value) => changeData("", "EmployeeCode", value)}
              suggestions={new CompanyCollection(
                CompanyCode,
                "Employee",
              ).listAllFromCompany("Code")}
              captions={new CompanyCollection(
                CompanyCode,
                "Employee",
              ).listAllFromCompany("Name")}
              placeholder={"Employee Code"}
            />
          </Row>
          <Column
            borderBottom="none"
            bg={OffCycle ? "none" : "var(--lightbluet)"}
            padding="5px"
          >
            <Row overflow="visible">
              <Label label={"Year"} />
              <Input
                value={Year}
                process={(value) => changeData("", "Year", value)}
                type={"number"}
                placeholder={"Year"}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Month"} />
              <Option
                value={Month}
                process={(value) => changeData("", "Month", value)}
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
          </Column>
          <Column
            borderBottom="none"
            bg={OffCycle ? "var(--lightbluet)" : "none"}
            padding="5px"
          >
            <Row jc="left">
              <Label label="Off Cycle Run" />
              <CheckBox
                value={OffCycle}
                process={(value) => changeData("", "OffCycle", value)}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Off Cycle Date"} />
              <Input
                value={OffCycleDate}
                process={(value) => changeData("", "OffCycleDate", value)}
                type={"date"}
              />
            </Row>
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
