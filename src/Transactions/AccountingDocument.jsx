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
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { AccountingDocument, GeneralLedger } from "../classes";
import { noop } from "../functions";

export function QueryAccountingDocument() {
  const { data, changeData } = useData({
    Company: "",
    Year: 0,
    DocumentNo: 0,
  });
  const { Company, Year, DocumentNo } = data;
  const { openWindow, showAlert } = useInterface();

  const collection = new AccountingDocument(DocumentNo, Year, Company);

  return (
    <>
      <WindowTitle
        title={"View Accounting Document"}
        menu={[
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[
              () => showAlert("Accounting Document does not exist."),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <ViewAccountingDocument data={collection.getData()} />,
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
              value={Company}
              process={(value) => changeData("", "Company", value)}
              placeholder={"Enter Company Code"}
              suggestions={collection.company.listAll("Code")}
              captions={collection.company.listAll("Name")}
            />
          </Row>
          <Row>
            <Label label={"Year"} />
            <Input
              value={Year}
              process={(value) => changeData("", "Year", value)}
              type={"number"}
            />
          </Row>
          <Row>
            <Label label={"Document Number"} />
            <Input
              value={DocumentNo}
              process={(value) => changeData("", "DocumentNo", value)}
              type={"number"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function ViewAccountingDocument({ data }) {
  const { openWindow } = useInterface();
  const { Company, PostingDate, Year, Text, EntryDate, Reversed, Entries } =
    data;
  return (
    <>
      <WindowTitle
        title={"View Accounting Document"}
        menu={[
          <Button
            name="Other"
            functionsArray={[() => openWindow(<QueryAccountingDocument />)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row width="min(100%,400px)">
            <Label label={"Company"} />
            <label>{Company}</label>
          </Row>
          <Row width="min(100%,400px)">
            <Label label={"Posting Date"} />
            <label>{PostingDate}</label>
          </Row>
          <Row width="min(100%,400px)">
            <Label label={"Entry Date"} />
            <label>{EntryDate}</label>
          </Row>
          <Row width="min(100%,400px)">
            <Label label={"Year"} />
            <label>{Year}</label>
          </Row>
          <Conditional logic={Reversed}>
            <Row jc="left" width="min(100%,400px)">
              <Label label={"Reversed"} />
              <CheckBox value={Reversed} />
            </Row>
          </Conditional>
          <Row width="min(100%,400px)">
            <Label label={"Text"} />
            <label>{Text}</label>
          </Row>
          <Column>
            <Label label={"Entries"} style={{ fontWeight: "bold" }} />
            <Table
              columns={[
                "Account",
                "Account Desc.",
                "Type",
                "Amount",
                "Text",
                "BTC",
                "Profit Center",
              ]}
              rows={Entries.map((entry, e) => [
                <label>{entry.Account}</label>,
                <label>
                  {
                    new GeneralLedger(entry.Account, Company).getData()
                      .Description
                  }
                </label>,
                <label>{entry.Type}</label>,
                <label>{entry.Amount}</label>,
                <label>{entry.Text}</label>,
                <label>{entry.BTC}</label>,
                <label>{entry.ProfitCenter}</label>,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
