import { ListItems, ListUniqueItems } from "./functions";
import {
  CollapsingDisplay,
  Column,
  HidingDisplay,
  Label,
  Row,
  Table,
} from "./Components";
import { useState } from "react";
import { ProcessAccountingDocument } from "./classes";
import { useInterface } from "./useInterface";

export const useAccounting = (data) => {
  const process = new ProcessAccountingDocument(data);
  const processed = process.processed();
  const { Company, Entries } = processed;
  const errors = process.errors();
  const { showAlert } = useInterface();
  const create = () => {
    if (process.errorsExist()) {
      showAlert(<DisplayError />);
    } else {
      const { DocumentNo } = process.add();
      showAlert(`Accounting Document Created: ${DocumentNo}`);
    }
  };
  const Preview = ({ name = "Preview" }) => {
    return (
      <HidingDisplay title={"Accounting Document"} buttonName={name}>
        <Row>
          <Label label={"Company"} />
          <Label label={Company} />
        </Row>
        <Column>
          <Label label={"Entries"} />
          <Table
            columns={[
              "Entry Type",
              "Account",
              "Amount",
              "Amount in Local Currency",
              "BTC",
            ]}
            rows={Entries.map((entry) => [
              <label>{entry.ET}</label>,
              <label>{entry.Account}</label>,
              <label>{entry.Amount}</label>,
              <label>{entry.AmountInLC}</label>,
              <label>{entry.BTC}</label>,
            ])}
          />
        </Column>
      </HidingDisplay>
    );
  };

  const DisplayError = ({ name = "Messages" }) => {
    return (
      <HidingDisplay title={"Messages"} buttonName={name}>
        <Column borderBottom="none">
          <Table
            columns={["Path", "Error"]}
            rows={errors.map((error) => [
              <label>{error.path}</label>,
              <label>{error.error}</label>,
            ])}
          />
        </Column>
      </HidingDisplay>
    );
  };
  return { Preview, DisplayError, create };
};
