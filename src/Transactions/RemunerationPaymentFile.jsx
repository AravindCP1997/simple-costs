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
  RemunerationPayment,
  RemunerationOffcyclePayment,
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
import { defaultSelection } from "../defaults";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const downloadFile = async (data) => {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Payment File");
  sheet.columns = [
    { header: "Payee", key: "payee", width: 30 },
    { header: "Amount", key: "amount", width: 30 },
    { header: "Bank", key: "bank", width: 30 },
    { header: "Account", key: "account", width: 30 },
    { header: "SWIFT", key: "swift", width: 30 },
  ];
  data.forEach((record) => {
    const { Payee, Amount, SWIFT, Bank, Account } = record;
    sheet.addRow({
      payee: Payee,
      amount: Amount,
      bank: Bank,
      account: Account,
      swift: SWIFT,
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "PaymentFile.xlsx");
};

export function QueryRemunerationPayment() {
  const { showAlert, openConfirm, openWindow } = useInterface();
  const { data, processed, changeData, reset } = useData({
    CompanyCode: "",
    Year: "",
    Month: "01",
    OffCycle: false,
    OffCycleDate: "",
    BatchId: "",
  });
  const { CompanyCode, Year, Month, OffCycle, OffCycleDate, BatchId } = data;
  const company = new Company(CompanyCode);
  const rp = OffCycle
    ? new RemunerationOffcyclePayment(
        CompanyCode,
        OffCycleDate,
        BatchId,
        "",
        "",
        "",
      )
    : new RemunerationPayment(CompanyCode, Year, Month, BatchId, "", "", "");
  return (
    <>
      <WindowTitle
        title={"Remuneration Payment File"}
        menu={[
          <ConditionalButton
            name={"Display"}
            result={rp.exists()}
            whileFalse={[
              () => showAlert("Payment run does not exist. Please check!"),
            ]}
            whileTrue={[
              () => {
                openWindow(
                  <DisplayPaymentFile data={rp.getData().PaymentFile} />,
                );
              },
              () => reset(),
            ]}
          />,
          <ConditionalButton
            name={"Download"}
            result={rp.exists()}
            whileFalse={[
              () => showAlert("Payment run does not exist. Please check!"),
            ]}
            whileTrue={[
              () => {
                downloadFile(rp.getData().PaymentFile);
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
          <Row overflow="visible">
            <Label label={"Batch ID"} />
            <Input
              value={BatchId}
              process={(value) => changeData("", "BatchId", value)}
              type={"text"}
              maxLength={6}
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

export function DisplayPaymentFile({ data }) {
  const { openWindow } = useInterface();
  return (
    <>
      <WindowTitle
        title={"Payment File"}
        menu={[
          <Button
            name={"Back"}
            functionsArray={[() => openWindow(<QueryRemunerationPayment />)]}
          />,
          <Button
            name={"Download"}
            functionsArray={[() => downloadFile(data)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Column>
            <Table
              columns={["Payee", "Amount", "Bank", "Account", "SWIFT Code"]}
              rows={data.map((record) => [
                <label>{record.Payee}</label>,
                <label>{record.Amount}</label>,
                <label>{record.Bank}</label>,
                <label>{record.Account}</label>,
                <label>{record.SWIFT}</label>,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
