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
import { Company, RemunerationResult, RemunerationRun } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  monthBegin,
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
  const { CompanyCode, Year, Month, BatchId, CalcFrom, Employees, Groups } =
    data;
  const { addError, DisplayHidingError, clearErrors, errorsExist } = useError();
  const company = new Company(CompanyCode);
  const rr = new RemunerationRun(CompanyCode, Year, Month, BatchId);
  useEffect(() => {
    clearErrors();
    addError(!company.exists(), "Company", "Company does not exist.");
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
                      rr.run(
                        CalcFrom,
                        trimSelection(Employees),
                        trimSelection(Groups),
                      );
                      openWindow(<RemunerationRunStatus data={rr.getData()} />);
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
  });
  const { CompanyCode, Year, Month, BatchId } = data;
  const company = new Company(CompanyCode);
  const rr = new RemunerationRun(CompanyCode, Year, Month, BatchId);
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
              () => openWindow(<RemunerationRunStatus data={rr.getData()} />),
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
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function RemunerationRunStatus({ data }) {
  const { Company, Year, Month, BatchId, Status } = data;
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
          <Column>
            <Label label={"Status"} />
            <Table
              columns={["Employee", "Status", "Remarks", "Slip"]}
              rows={Status.map((employee) => [
                <label>{employee.Employee}</label>,
                <label>{employee.Status}</label>,
                <label>{employee.Remarks}</label>,
                <label>
                  {employee.Status === "Success" && (
                    <>
                      <Button
                        name={"View"}
                        functionsArray={[
                          () =>
                            openWindow(
                              <RemunerationSlip
                                data={new RemunerationResult(
                                  Company,
                                  employee.Employee,
                                  Year,
                                  Month,
                                ).slip()}
                              />,
                            ),
                        ]}
                      />
                    </>
                  )}
                </label>,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
