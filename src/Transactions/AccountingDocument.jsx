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

  const collection = new AccountingDocument(Company, Number(DocumentNo), Year);

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
                  <ViewAccountingDocument initial={collection.getData()} />,
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

export function ViewAccountingDocument({ initial }) {
  const { openWindow, showAlert } = useInterface();
  const [data, setdata] = useState(initial);
  const {
    Company,
    PostingDate,
    DocumentNo,
    DocumentType,
    Year,
    Text,
    EntryDate,
    Reversed,
    Entries,
    TimeStamp,
  } = data;
  const {
    data: promptData,
    changeData,
    reset,
  } = useData({
    Company: "",
    Year: 0,
    DocumentNo: "",
  });
  const promptDoc = new AccountingDocument(
    promptData.Company,
    Number(promptData.DocumentNo),
    promptData.Year,
  );
  return (
    <>
      <WindowTitle
        title={"View Accounting Document"}
        menu={[
          <HidingPrompt
            title={"Open Accounting Document"}
            buttonName={"Other"}
            result={promptDoc.exists()}
            onSubmitFail={[
              () => showAlert("Accounting Document does not exist."),
            ]}
            onSubmitSuccess={[() => setdata(promptDoc.getData())]}
            onClose={[() => reset()]}
          >
            <Row overflow="visible">
              <Label label={"Company"} />
              <AutoSuggestInput
                value={promptData.Company}
                process={(value) => changeData("", "Company", value)}
                placeholder={"Enter Company Code"}
                suggestions={promptDoc.company.listAll("Code")}
                captions={promptDoc.company.listAll("Name")}
              />
            </Row>
            <Row>
              <Label label={"Year"} />
              <Input
                value={promptData.Year}
                process={(value) => changeData("", "Year", value)}
                type={"number"}
              />
            </Row>
            <Row>
              <Label label={"Document Number"} />
              <Input
                value={promptData.DocumentNo}
                process={(value) => changeData("", "DocumentNo", value)}
                type={"number"}
              />
            </Row>
          </HidingPrompt>,
          <HidingDisplay title={"Info"}>
            <Row>
              <Label label={"Entry Date"} />
              <label>{EntryDate}</label>
            </Row>
            <Row>
              <Label label={"Time Stamp"} />
              <label>{TimeStamp}</label>
            </Row>
          </HidingDisplay>,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row width="min(100%,400px)">
            <Label label={"Document Number"} />
            <label>{DocumentNo}</label>
          </Row>
          <Row width="min(100%,400px)">
            <Label label={"Document Type"} />
            <label>{DocumentType}</label>
          </Row>
          <Row width="min(100%,400px)">
            <Label label={"Year"} />
            <label>{Year}</label>
          </Row>
          <Row width="min(100%,400px)">
            <Label label={"Company"} />
            <label>{Company}</label>
          </Row>
          <Row width="min(100%,400px)">
            <Label label={"Posting Date"} />
            <label>{PostingDate}</label>
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
                "Entry Type",
                "Account",
                "Amount",
                "Amount in Local Currency",
                "Text",
                "BTC",
                "HSN",
                "Profit Center",
              ]}
              rows={Entries.map((entry, e) => [
                <label>{entry.ET}</label>,
                <label>{entry.Account}</label>,
                <label>{entry.Amount}</label>,
                <label>{entry.AmountInLC}</label>,
                <label>{entry.Text}</label>,
                <label>{entry.BTC}</label>,
                <label>{entry.HSN}</label>,
                <label>{entry.PC}</label>,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
