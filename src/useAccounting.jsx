import { useEffect, useState } from "react";
import {
  addToArray,
  addToObject,
  updateObject,
  removeFromObject,
  removeFromArray,
  updateKeyOfObject,
  convertToArray,
  convertToValue,
  convertToObject,
} from "./objects.js";
import { AccountingDocument, Company } from "./classes.js";
import { isPositive, perform, transformObject } from "./functions.js";
import useData from "./useData.jsx";
import {
  Button,
  Column,
  HidingDisplay,
  Label,
  Row,
  Table,
} from "./Components.jsx";
import { useError } from "./useError.jsx";

export function useAccounting() {
  const defaults = {
    CompanyCode: "",
    PostingDate: "",
    Year: "",
    DocumentDate: "",
    Reference: "",
    ExchangeRate: 1,
    Currency: "",
    Text: "",
    Entries: [],
  };
  const defaultEntry = {
    EntryType: "",
    Account: "",
    Amount: 0,
    AmountInLC: 0,
    BTC: "",
    PC: "",
    Text: "",
  };
  const { data, changeData, addItemtoArray } = useData(defaults);

  const modify = (data) => {
    Object.keys(data).forEach((key) => {
      changeData("", key, data[key]);
    });
  };
  const addEntries = (entries) => {
    entries.forEach((entry) => {
      addItemtoArray("Entries", entry);
    });
  };
  const clearEntries = () => {
    changeData("", "Entries", []);
  };
  const processed = transformObject(
    data,
    [
      "CompanyCode",
      "PostingDate",
      "DocumentDate",
      "Reference",
      "ExchangeRate",
      "Year",
    ],
    [],
    { Entries: [] },
  );

  const Preview = () => {
    const { PostingDate, Year, Entries } = processed;
    return (
      <HidingDisplay
        title={"Preview Accounting Document"}
        buttonName={"Preview"}
      >
        <Column>
          <Row>
            <Label label={"Posting Date"} />
            <label>{PostingDate}</label>
          </Row>
          <Row>
            <Label label={"Year"} />
            <label>{Year}</label>
          </Row>
          <Table
            columns={[
              "Entry Type",
              "Account",
              "Amount",
              "Amount in Local Currency",
              "BTC",
              "Profit Center",
              "Text",
            ]}
            rows={Entries.map((entry) => [
              <label>{entry.EntryType}</label>,
              <label>{entry.Account}</label>,
              <label>{entry.Amount}</label>,
              <label>{entry.AmountInLC}</label>,
              <label>{entry.BTC}</label>,
              <label>{entry.PC}</label>,
              <label>{entry.Text}</label>,
            ])}
          />
        </Column>
      </HidingDisplay>
    );
  };

  const {
    CompanyCode,
    PostingDate,
    DocumentDate,
    Reference,
    ExchangeRate,
    Entries,
  } = data;
  const company = new Company(CompanyCode);
  perform(
    () => {
      processed.Year = company.year(PostingDate);
    },
    company.exists() && PostingDate !== "",
  );
  perform(() => {
    Entries.forEach((entry) => {
      processed.Entries.push({ ...defaultEntry, ...entry });
    });
    processed.Entries.forEach((entry) => {
      perform(
        () => {
          entry.AmountInLC = entry.Amount * ExchangeRate;
        },
        isPositive(ExchangeRate),
        () => {
          entry.AmountInLC = entry.Amount;
        },
      );
    });
  });

  const accountingErrors = [];

  const addError = (logic, path, error) => {
    if (logic) {
      accountingErrors.push({ path, error });
    }
  };

  addError(!company.exists(), "AccountingCompany", "Company does not exist.");
  addError(
    company.exists() &&
      PostingDate !== "" &&
      !company.openperiods.accountingOpen(PostingDate),
    "PostingDate",
    "Posting date not open.",
  );
  addError(
    ExchangeRate < 0,
    "ExchangeRate",
    "Exchange rate cannot be negative.",
  );

  return {
    modify,
    addEntries,
    clearEntries,
    processed,
    Preview,
    accountingErrors,
  };
}
