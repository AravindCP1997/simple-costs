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
  HidingDisplay,
  Table,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { ChartOfAccounts } from "../classes";
import { Collection } from "../Database";
import { rangeOverlap } from "../functions";
import { sampleChartOfAccounts } from "../samples";

export function CreateChartofAccounts({
  initial = {
    Code: "",
    GLNumbering: [
      { LedgerType: "Asset", From: "", To: "" },
      { LedgerType: "Equity", From: "", To: "" },
      { LedgerType: "Liability", From: "", To: "" },
      { LedgerType: "Income", From: "", To: "" },
      { LedgerType: "Expense", From: "", To: "" },
    ],
  },
}) {
  const { data, changeData, reset, setdata } = useData(initial);
  const { Code, GLNumbering } = data;
  const { showAlert } = useInterface();
  const isFloat = useWindowType() === "float";
  const { addError, clearErrors, errorsExist, DisplayHidingError } = useError();
  const collection = new ChartOfAccounts(Code);

  useEffect(() => {
    clearErrors();
    addError(Code === "", "Code", "Code cannot be blank");
    addError(
      Code !== "" && collection.exists(),
      "Code",
      "Chart of accounts with same code already exists."
    );
    GLNumbering.forEach((numbering, n) => {
      const { From, To, LedgerType } = numbering;
      addError(
        From === "" || To === "",
        "GLNumbering",
        `For ${LedgerType}, range incomplete.`
      );
      addError(
        From > To,
        "GLNumbering",
        `For ${LedgerType}, 'From' is greater than 'To'.`
      );
      GLNumbering.forEach((numberingtwo, ntwo) => {
        const { From: Fromtwo, To: Totwo } = numberingtwo;
        addError(
          n !== ntwo && rangeOverlap([From, To], [Fromtwo, Totwo]),
          "GLNumbering",
          `Range overlaps between ${
            GLNumbering[Math.min(n, ntwo)].LedgerType
          } and ${GLNumbering[Math.max(n, ntwo)].LedgerType}`
        );
      });
    });
  }, [data]);

  const [clone, setclone] = useState("");

  return (
    <>
      <WindowTitle
        title={"Create Chart of Accounts"}
        menu={[
          <ConditionalButton
            name="Save"
            result={!errorsExist}
            whileFalse={[
              () => showAlert("Errors still persist. Please check!"),
            ]}
            whileTrue={[() => collection.add(data)]}
          />,
          <Button name={"Reset"} functionsArray={[() => reset()]} />,
          <HidingDisplay
            title={"Clone Existing"}
            menu={[
              <Button
                name={"Say Hello"}
                functionsArray={[() => alert("Hello")]}
              />,
            ]}
            content={
              <>
                <Row>
                  <Label label={"Chart of Accounts Code"} />
                  <Input
                    value={clone}
                    process={(value) => setclone(value)}
                    type={"text"}
                    maxLength={6}
                  />
                </Row>
                <Row>
                  <ConditionalButton
                    name={"Clone"}
                    result={clone !== "" && new ChartOfAccounts(clone).exists()}
                    whileFalse={[
                      () => showAlert("Chart of accounts does not exist!"),
                    ]}
                    whileTrue={[
                      () =>
                        changeData(
                          "",
                          "GLNumbering",
                          new ChartOfAccounts(clone).getData().GLNumbering
                        ),
                    ]}
                  />
                </Row>
              </>
            }
          />,
          <Button
            name="Sample"
            functionsArray={[() => setdata(sampleChartOfAccounts)]}
          />,
          <DisplayHidingError />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Code"} />
            <Input
              value={Code}
              process={(value) => changeData("", "Code", value)}
              type={"text"}
              maxLength={6}
            />
          </Row>
          <Column>
            <Label label={"General Ledger Numbering"} />
            <Table
              columns={["Ledger Type", "From Range", "To Range"]}
              rows={GLNumbering.map((numbering, n) => [
                <Label label={numbering.LedgerType} />,
                <Input
                  value={numbering.From}
                  process={(value) =>
                    changeData(`GLNumbering/${n}`, "From", value)
                  }
                  type={"number"}
                />,
                <Input
                  value={numbering.To}
                  process={(value) =>
                    changeData(`GLNumbering/${n}`, "To", value)
                  }
                  type={"number"}
                />,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
