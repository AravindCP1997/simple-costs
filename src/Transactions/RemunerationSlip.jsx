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

export function QueryRemunerationSlip() {
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
        title={"Remuneration Slip"}
        menu={[
          <ConditionalButton
            name={"Slip"}
            result={rr.exists()}
            whileFalse={[
              () =>
                showAlert(
                  "Remunertion not yet posted for the month/ off-cycle date.",
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <RemunerationSlip
                    data={rr.slip()}
                    date={OffCycle ? OffCycleDate : monthEnd(Year, Month)}
                  />,
                ),
            ]}
          />,
          <ConditionalButton
            name={"Result"}
            result={rr.exists()}
            whileFalse={[
              () =>
                showAlert(
                  "Remunertion not yet posted for the month/ off-cycle date.",
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <DisplayRemunerationResult
                    company={CompanyCode}
                    employee={EmployeeCode}
                    year={Year}
                    month={Month}
                    offcycle={OffCycle}
                    offcycledate={OffCycleDate}
                  />,
                ),
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

export function RemunerationSlip({ data, date = "" }) {
  const { openWindow } = useInterface();
  const {
    Employee,
    Year,
    Month,
    Name,
    Address,
    Company,
    Emoluments,
    Gross,
    Deductions,
    TotalDeductions,
    WithholdingTax,
    NetPayable,
    Payment,
    Balance,
    Adjusted,
  } = data;
  return (
    <>
      <WindowTitle
        title={`Remuneration Slip - ${Employee} ${date}`}
        menu={[
          <Button
            name={"Back"}
            functionsArray={[() => openWindow(<QueryRemunerationSlip />)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Name of Employee"} />
            <label>{Name}</label>
          </Row>
          <Row>
            <Label label={"Address"} />
            <label>{Address}</label>
          </Row>
        </DisplayArea>
        <DisplayArea>
          <Column borderBottom="none">
            <Label label={"Emoluments"} style={{ fontWeight: "bold" }} />
            {Emoluments.map((emolument) => (
              <Row>
                <Label label={emolument.Description} />
                <label>{Math.round(emolument.Amount)}</label>
              </Row>
            ))}
            <Row>
              <Label label={"Gross Emoluments"} />
              <label>{Math.round(Gross)}</label>
            </Row>
          </Column>
          <Column borderBottom="none">
            <Label label={"Deductions"} style={{ fontWeight: "bold" }} />
            {Deductions.map((deduction) => (
              <Row>
                <Label label={deduction.Description} />
                <label>{Math.round(-deduction.Amount)}</label>
              </Row>
            ))}
            <Row>
              <Label label={"Withholding Tax"} />
              <label>{Math.round(WithholdingTax)}</label>
            </Row>
            <Row>
              <Label label={"Total Deductions"} />
              <label>{Math.round(WithholdingTax - TotalDeductions)}</label>
            </Row>
            <Row>
              <Label label={"Net Payable"} style={{ fontWeight: "bold" }} />
              <label>{Math.round(NetPayable)}</label>
            </Row>
            <Row>
              <Label label={"Previous Dues"} />
              <label>{Math.round(Adjusted)}</label>
            </Row>
            <Row>
              <Label label={"Payment"} />
              <label>{Math.round(Payment)}</label>
            </Row>
            <Row>
              <Label label={"Unrecovered Dues"} />
              <label>{Math.round(Balance)}</label>
            </Row>
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function DisplayRemunerationResult({
  company,
  employee,
  year = "",
  month = "",
  offcycle = false,
  offcycledate = "",
}) {
  const rr = offcycle
    ? new RemunerationOffCycleResult(company, employee, offcycledate)
    : new RemunerationResult(company, employee, year, month);
  const data = rr.getData();
  const { Wages } = data;
  const { openWindow, openFloat } = useInterface();
  return (
    <>
      <WindowTitle
        title={
          offcycle
            ? `Remuneration Result Off-cycle ${offcycledate}`
            : `Remuneration Result - ${employee} ${monthEnd(year, month)}`
        }
        menu={[
          <Button
            name={"View Slip"}
            functionsArray={[
              () => openFloat(<RemunerationSlip data={rr.slip()} />),
            ]}
          />,
          <Button
            name="Back"
            functionsArray={[() => openWindow(<QueryRemunerationSlip />)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Column borderBottom="none">
            <Label label={"Remuneration"} />
            <Table
              columns={[
                "Wage Type",
                "From",
                "To",
                "Amount",
                "Organisational Unit Type",
                "Organisational Unit",
              ]}
              rows={Wages.map((wage) => [
                <label>{wage.WT}</label>,
                <label>{wage.From}</label>,
                <label>{wage.To}</label>,
                <label>{wage.Amount}</label>,
                <label>{wage.OrgUnit.split("/")[0]}</label>,
                <label>{wage.OrgUnit.split("/")[1]}</label>,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
