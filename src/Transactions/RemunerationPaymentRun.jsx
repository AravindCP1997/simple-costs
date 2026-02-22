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

export function ManageRemunerationPayment() {
  const { showAlert, openConfirm, openWindow } = useInterface();
  const { data, processed, changeData, reset } = useData({
    CompanyCode: "",
    Year: "",
    Month: "01",
    OffCycle: false,
    OffCycleDate: "",
    PostingDate: "",
    Employees: defaultSelection("Employee", "Number"),
    Bank: "",
    BatchId: "",
  });
  const {
    CompanyCode,
    Year,
    Month,
    OffCycle,
    OffCycleDate,
    Employees,
    PostingDate,
    Bank,
    BatchId,
  } = data;
  const { addError, DisplayHidingError, clearErrors, errorsExist } = useError();
  const company = new Company(CompanyCode);
  const rp = OffCycle
    ? new RemunerationOffcyclePayment(
        CompanyCode,
        OffCycleDate,
        BatchId,
        PostingDate,
        trimSelection(Employees),
        Bank,
      )
    : new RemunerationPayment(
        CompanyCode,
        Year,
        Month,
        BatchId,
        PostingDate,
        trimSelection(Employees),
        Bank,
      );
  useEffect(() => {
    clearErrors();
    addError(!company.exists(), "Company", "Company does not exist.");
    addError(
      rp.exists(),
      "Batch",
      "Payment batch already exists for the period.",
    );
    addError(
      !company.collection("BankAccount").exists({ Code: Bank }),
      "Bank",
      "Bank Account does not exist.",
    );
    addError(
      PostingDate === "",
      "PostingDate",
      "Posting Date cannot be blank.",
    );
    addError(
      company.exists() &&
        PostingDate !== "" &&
        !company.openperiods.accountingOpen(PostingDate),
      "PostingDate",
      "Posting Date not open.",
    );
    addError(BatchId === "", "BatchID", "Batch ID cannot be blank.");
    if (OffCycle) {
      addError(OffCycleDate === "", "OffCycleDate", "Date cannot be blank.");
    }
    if (!OffCycle) {
      addError(Year === "", "Year", "Year cannot be blank.");
    }
  }, [data]);
  return (
    <>
      <WindowTitle
        title={"Remuneration Payment Posting"}
        menu={[
          <ConditionalButton
            name={"Run"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check!")]}
            whileTrue={[
              () => {
                showAlert(rp.post());
              },
              () => reset(),
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
            <Label label={"Posting Date"} />
            <Input
              value={PostingDate}
              process={(value) => changeData("", "PostingDate", value)}
              type={"date"}
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
          <Row overflow="visible">
            <Label label={"Employees"} />
            <Selection
              value={Employees}
              path={"Employees"}
              changeData={changeData}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"Company Bank"} />
            <AutoSuggestInput
              value={Bank}
              process={(value) => changeData("", "Bank", value)}
              suggestions={company
                .collection("BankAccount")
                .listAllFromCompany("Code")}
              captions={company
                .collection("BankAccount")
                .listAllFromCompany("Name")}
              placeholder={"Bank Code"}
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
