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
  HidingPrompt,
  Selection,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import { PostedRemunerationTable } from "../businessFunctions";
import { defaultSelection } from "../defaults";
import useData from "../useData";
import {
  filterByMultipleSelection,
  filterBySelection,
  perform,
  trimSelection,
} from "../functions";

export function QueryRemunerationTable() {
  const { openWindow } = useInterface();
  const { data, processed, changeData } = useData({
    Company: defaultSelection("Company"),
    Year: defaultSelection("Year", "Number"),
    Month: defaultSelection("Month", "StringCaseInsensitive"),
    OffcycleDate: defaultSelection("Date"),
    Employee: defaultSelection("Employee", "Number"),
  });
  const { Company, Year, Month, OffcycleDate, Employee } = processed;

  const filter = {
    Company: trimSelection(Company),
    Year: trimSelection(Year),
    Month: trimSelection(Month),
    OffcycleDate: trimSelection(OffcycleDate),
    Employee: trimSelection(Employee),
  };

  return (
    <>
      <WindowTitle
        title={"Remuneration Table"}
        menu={[
          <Button
            name={"Search"}
            functionsArray={[
              () => openWindow(<DisplayRemunerationTable filter={filter} />),
            ]}
          />,
        ]}
        closeTo="Report"
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Company"} />
            <Selection
              value={Company}
              changeData={changeData}
              path={"Company"}
            />
          </Row>
          <Row>
            <Label label={"Year"} />
            <Selection value={Year} changeData={changeData} path={"Year"} />
          </Row>
          <Row>
            <Label label={"Month"} />
            <Selection value={Month} changeData={changeData} path={"Month"} />
          </Row>
          <Row>
            <Label label={"Off-cycle Date"} />
            <Selection
              value={OffcycleDate}
              changeData={changeData}
              path={"OffcycleDate"}
            />
          </Row>
          <Row>
            <Label label={"Employee"} />
            <Selection
              value={Employee}
              changeData={changeData}
              path={"Employee"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
export function DisplayRemunerationTable({ filter }) {
  if (PostedRemunerationTable() === null) {
    return (
      <>
        <WindowTitle title={"Remuneration Table"} />
        <WindowContent>
          <DisplayArea>
            <p>No remuneration posted yet.</p>
          </DisplayArea>
        </WindowContent>
      </>
    );
  }
  const { openFloat, openWindow } = useInterface();
  const data = PostedRemunerationTable();
  const { Company, Year, Employee, Month, OffcycleDate } = filter;
  const filtered = filterByMultipleSelection(data, [
    Company,
    Year,
    Employee,
    Month,
    OffcycleDate,
  ]);

  return (
    <>
      <WindowTitle
        title={"Remuneration Table"}
        menu={[
          <Button
            name={"Back"}
            functionsArray={[() => openWindow(<QueryRemunerationTable />)]}
          />,
        ]}
        closeTo="Report"
      />
      <WindowContent>
        <DisplayArea>
          <Table
            columns={[
              "Company",
              "Type",
              "Year",
              "Month",
              "Off-cycle Date",
              "Employee",
              "Organisation Unit Type",
              "Organisational Unit",
              "Wage Type",
              "From",
              "To",
              "Amount",
            ]}
            rows={filtered.map((item, i) => [
              <label>{item.Company}</label>,
              <label>{item.Type}</label>,
              <label>{item.Year}</label>,
              <label>{item.Month}</label>,
              <label>{item.Date}</label>,
              <label>{item.Employee}</label>,
              <label>{item.OrgUnit.split("/")[0]}</label>,
              <label>{item.OrgUnit.split("/")[1]}</label>,
              <label>{item.WT}</label>,
              <label>{item.From}</label>,
              <label>{item.To}</label>,
              <label>{item.Amount}</label>,
            ])}
          />
        </DisplayArea>
      </WindowContent>
    </>
  );
}
