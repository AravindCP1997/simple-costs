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
  ConditionalDisplay,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import {
  Company,
  RemunerationOffCycleResult,
  RemunerationOffcycleRun,
  RemunerationResult,
  RemunerationRun,
  RemunerationExpensePosting,
  RemunerationOffcycleExpensePosting,
} from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  monthBegin,
  monthEnd,
  rangeOverlap,
  trimSelection,
} from "../functions";

export function ReverseRemunerationExpensePosting() {
  const { showAlert, openConfirm, openWindow } = useInterface();
  const { data, processed, changeData, reset } = useData({
    CompanyCode: "",
    Year: "",
    Month: "01",
    OffCycle: false,
    OffCycleDate: "",
  });
  const { CompanyCode, Year, Month, OffCycle, OffCycleDate } = data;
  const company = new Company(CompanyCode);
  const rr = OffCycle
    ? new RemunerationOffcycleExpensePosting(CompanyCode, OffCycleDate)
    : new RemunerationExpensePosting(CompanyCode, Year, Month);

  return (
    <>
      <WindowTitle
        title={"Reverse Remuneration Expense Posting"}
        menu={[
          <ConditionalButton
            name={"Reverse"}
            result={rr.posted()}
            whileFalse={[
              () => showAlert("Expense not yet posted. Please check!"),
            ]}
            whileTrue={[
              () => {
                showAlert(rr.reverse());
              },
              () => reset(),
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
              suggestions={company.listAll("Code")}
              captions={company.listAll("Name")}
              placeholder={"Company Code"}
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
