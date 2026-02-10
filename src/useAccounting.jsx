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
import {
  AccountingDocument,
  Company,
  Currencies,
  EntryTypes,
  Region,
} from "./classes.js";
import { isPositive, perform, SumField, transformObject } from "./functions.js";
import useData from "./useData.jsx";
import {
  Button,
  Column,
  HidingDisplay,
  Label,
  Row,
  Table,
} from "./Components.jsx";

export function useAccounting() {
  const defaults = {
    CompanyCode: "",
    PostingDate: "",
    Year: "",
    DocumentDate: "",
    DocumentNo: "",
    Reference: "",
    ExchangeRate: 1,
    Currency: "",
    Text: "",
    Entries: [],
  };
  const defaultEntry = {
    EntryType: "",
    Account: "",
    Description: "",
    Amount: 0,
    AmountInLC: 0,
    BTC: "",
    PC: "",
    Text: "",
    HSN: "",
    BPlace: "",
    BPartnerType: "",
    BPartner: "",
    PoS: "",
    WHT: [],
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
      "DocumentNo",
      "Reference",
      "Currency",
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
              "Description",
              "Amount",
              "Amount in Local Currency",
              "BTC",
              "Profit Center",
              "Text",
              "HSN",
            ]}
            rows={Entries.map((entry) => [
              <label>{entry.EntryType}</label>,
              <label>{entry.Account}</label>,
              <label>{entry.Description}</label>,
              <label>{entry.Amount}</label>,
              <label>{entry.AmountInLC}</label>,
              <label>{entry.BTC}</label>,
              <label>{entry.PC}</label>,
              <label>{entry.Text}</label>,
              <label>{entry.HSN}</label>,
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
    DocumentNo,
    Year,
    Currency,
    Reference,
    ExchangeRate,
    Entries,
  } = data;
  const company = new Company(CompanyCode);
  const document = new AccountingDocument(DocumentNo, Year, CompanyCode);
  const create = () => {
    const { result, DocumentNo } = document.add(processed);
    if (result) {
      processed.DocumentNo = DocumentNo;
    }
  };
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
    Entries.forEach((entry) => {
      const { BTC, BPlace, BPartnerType, BPartner, PoS, Amount } = entry;
      perform(
        () => {
          processed.Entries.push(
            ...company
              .btc(BTC)
              .accounting(BPlace, BPartnerType, BPartner, PoS)
              .map((item) => ({
                ...defaultEntry,
                ...{
                  Account: item.GL,
                  Amount: (Number(item.Rate) * Amount) / 100,
                  EntryType: item.Type === "Debit" ? "G1" : "G2",
                },
              })),
          );
        },
        company.btc(BTC).exists() &&
          company.bp(BPlace).exists() &&
          company.collection(BPartnerType).exists({ Code: BPartner }) &&
          Region.exists(PoS),
      );
    });
    processed.Entries.forEach((entry) => {
      const { WHT, Amount, EntryType } = entry;
      WHT.forEach((item) => {
        const { Code, Base, Tax } = item;
        const WHT = company.wht(Code);
        perform(
          () => {
            const gl = WHT.getData().GL;
            const et = EntryTypes.isDebit(EntryType) ? "G1" : "G2";
            entry.Amount = entry.Amount - Tax;
            processed.Entries.push({
              ...defaultEntry,
              ...{ Account: gl, Amount: Tax, EntryType: et },
            });
          },
          WHT.exists() && Amount >= Tax,
        );
      });
      processed.Entries = processed.Entries.filter(
        (entry) => entry.Amount !== 0,
      );
    });

    processed.Entries.forEach((entry) => {
      const { EntryType, Account } = entry;
      const accountType = EntryTypes.getField(EntryType, "A");
      const collection = company.collection(accountType);

      perform(
        () => {
          const accountsData = collection.getData({ Code: Account });
          entry.Description = accountsData.Description;
          if (["Vendor", "Customer"].includes(accountType)) {
            entry.Description = accountsData.Name;
          }
        },
        collection.exists({ Code: entry.Account }),
      );
      perform(
        () => {
          entry.Amount = Math.abs(entry.Amount);
        },
        EntryTypes.isDebit(EntryType),
        () => {
          entry.Amount = -Math.abs(entry.Amount);
        },
      );
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

  perform(() => {
    addError(!company.exists(), "AccountingCompany", "Company does not exist.");
    addError(
      !Currencies.currencyExists(Currency),
      "Currency",
      "Currency does not exist.",
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
      "Posting date not open.",
    );
    addError(
      ExchangeRate < 0,
      "ExchangeRate",
      "Exchange rate cannot be negative.",
    );
    addError(
      SumField(processed.Entries, "Amount") !== 0,
      "Balance",
      "Balance not zero.",
    );
  });

  return {
    modify,
    addEntries,
    clearEntries,
    processed,
    Preview,
    accountingErrors,
    create,
  };
}
