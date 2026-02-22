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
import { defaultRemunerationRun } from "../defaults";
import { RemunerationSlip } from "./RemunerationSlip";

export function ManageRemunerationRun() {
  const { showAlert, openConfirm, openWindow } = useInterface();
  const { data, processed, changeData, reset } = useData(
    defaultRemunerationRun,
  );
  const {
    CompanyCode,
    Year,
    Month,
    BatchId,
    CalcFrom,
    Employees,
    Groups,
    OffCycle,
    OffCycleDate,
  } = data;
  const { addError, DisplayHidingError, clearErrors, errorsExist } = useError();
  const company = new Company(CompanyCode);
  const rr = OffCycle
    ? new RemunerationOffcycleRun(CompanyCode, OffCycleDate)
    : new RemunerationRun(CompanyCode, Year, Month, BatchId);
  useEffect(() => {
    clearErrors();
    addError(!company.exists(), "Company", "Company does not exist.");
    if (!OffCycle) {
      addError(
        rr.exists(),
        "BatchID",
        "Remuneration Run with same batch ID already exists.",
      );
      addError(BatchId === "", "BatchID", "Batch ID cannot be blank.");
      addError(Year === "", "Year", "Year cannot be blank.");
      addError(
        CalcFrom === "",
        "Calc From",
        `'Calculate from' date cannot be blank.`,
      );
      addError(
        Year !== "" && CalcFrom > monthBegin(Year, Month),
        "Calc From",
        `'Calculate From' date cannot be later than month beginning.`,
      );
      addError(
        rr.expensePosting().posted(),
        "Period",
        "Expense has already been posted for the period, or off-cycle date.",
      );
    }
    if (OffCycle) {
      addError(
        rr.exists(),
        "Date",
        "Remuneration already run on the Off-cycle Date.",
      );
      addError(OffCycleDate === "", "OffCycleDate", "Date cannot be blank.");
    }
  }, [data]);
  return (
    <>
      <WindowTitle
        title={"Remuneration Run"}
        menu={[
          <ConditionalButton
            name={"Run"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check!")]}
            whileTrue={[
              () => {
                openConfirm(
                  "This action will initiate remuneration run for the month. Please do not close the window until the operation completes.",
                  [],
                  [
                    () => {
                      OffCycle
                        ? rr.run(
                            trimSelection(Employees),
                            trimSelection(Groups),
                          )
                        : rr.run(
                            CalcFrom,
                            trimSelection(Employees),
                            trimSelection(Groups),
                          );
                      openWindow(
                        <RemunerationRunStatus
                          data={rr.getData()}
                          offcycle={OffCycle}
                        />,
                      );
                      reset();
                    },
                  ],
                );
              },
            ]}
          />,
          <DisplayHidingError />,
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
          <Row overflow="visible">
            <Label label={"Employees"} />
            <Selection
              value={Employees}
              changeData={changeData}
              path={"Employees"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"Employee Groups"} />
            <Selection value={Groups} changeData={changeData} path={"Groups"} />
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
            <Row overflow="visible">
              <Label label={"Batch Id"} />
              <Input
                value={BatchId}
                process={(value) => changeData("", "BatchId", value)}
                type={"text"}
                maxLength={4}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Calculate From"} />
              <Input
                value={CalcFrom}
                process={(value) => changeData("", "CalcFrom", value)}
                type={"date"}
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

export function QueryRemunerationRun() {
  const { openWindow, showAlert } = useInterface();
  const { data, changeData, reset } = useData({
    CompanyCode: "",
    Year: "",
    Month: "",
    BatchId: "",
    OffCycle: false,
    OffCycleDate: "",
  });
  const { CompanyCode, Year, Month, BatchId, OffCycle, OffCycleDate } = data;
  const company = new Company(CompanyCode);
  const rr = OffCycle
    ? new RemunerationOffcycleRun(CompanyCode, OffCycleDate)
    : new RemunerationRun(CompanyCode, Year, Month, BatchId);
  return (
    <>
      <WindowTitle
        title={"Remuneration Run Status"}
        menu={[
          <ConditionalButton
            name={"Check"}
            result={rr.exists()}
            whileFalse={[() => showAlert("Remuneration Run does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <RemunerationRunStatus
                    data={rr.getData()}
                    offcycle={OffCycle}
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
            <Row overflow="visible">
              <Label label={"Batch Id"} />
              <Input
                value={BatchId}
                process={(value) => changeData("", "BatchId", value)}
                type={"text"}
                maxLength={4}
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

export function RemunerationRunStatus({ data, offcycle = false }) {
  const { Company, Year, Month, BatchId, Date: OffCycleDate, Status } = data;
  const { openWindow } = useInterface();
  return (
    <>
      <WindowTitle
        title={"Remuneration Run Status"}
        menu={[
          <Button
            name={"Back"}
            functionsArray={[() => openWindow(<QueryRemunerationRun />)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Company"} />
            <label>{Company}</label>
          </Row>
          <ConditionalDisplay
            logic={offcycle}
            whileFalse={
              <>
                <Row>
                  <Label label={"Year"} />
                  <label>{Year}</label>
                </Row>
                <Row>
                  <Label label={"Month"} />
                  <label>{Month}</label>
                </Row>
                <Row>
                  <Label label={"Batch ID"} />
                  <label>{BatchId}</label>
                </Row>
              </>
            }
            whileTrue={
              <>
                <Row>
                  <Label label={"Off-cycle Date"} />
                  <label>{OffCycleDate}</label>
                </Row>
              </>
            }
          />
          <Column>
            <Label label={"Status"} />
            <Table
              columns={["Employee", "Status", "Remarks"]}
              rows={Status.map((employee) => [
                <label>{employee.Employee}</label>,
                <label>{employee.Status}</label>,
                <label>{employee.Remarks}</label>,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
