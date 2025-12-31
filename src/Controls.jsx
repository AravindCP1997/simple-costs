import { ChartOfAccounts } from "./classes";
import { useState } from "react";
import {
  Conditional,
  ConditionalButton,
  DistributedRow,
  Input,
  WindowContent,
  WindowTitle,
  Label,
  Flex,
  Button,
  DisplayArea,
  TopFlex,
  Table,
} from "./Components";
import useData from "./useData";
import { useError, useErrorDisplay } from "./useError";
import { useInterface } from "./useInterface";
import { rangeOverlap } from "./functions";
import { ManageChartOfAccounts } from "./Transactions";

export function CreateChartOfAccounts({
  method = "Create",
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
  const { data, changeData, reset } = useData(initial);
  const { showAlert, openWindow } = useInterface();
  const { Code, GLNumbering } = data;
  const Collection = new ChartOfAccounts(Code);
  const process = () => {
    const { list, addError } = useError();
    addError(Code === "", "Code", "Code cannot be blank");
    addError(
      method === "Create" && Code !== "" && Collection.exists(),
      "Code",
      "Chart of Accouts with same Code already exists"
    );
    GLNumbering.forEach((numbering, n) => {
      const { From, To, LedgerType } = numbering;
      addError(
        From > To,
        "GLNumbering",
        `'From' of ${LedgerType} greater than 'To'`
      );
      addError(From === "", "GLNumbering", `'From' of ${LedgerType} blank.`);
      addError(To === "", "GLNumbering", `'To' of ${LedgerType} blank.`);

      GLNumbering.forEach((numbering2, n2) => {
        const { From: From2, To: To2 } = numbering2;
        addError(
          n !== n2 && rangeOverlap([From, To], [From2, To2]),
          `${GLNumbering[Math.min(n, n2)].LedgerType} numbering overlaps with ${
            GLNumbering[Math.max(n, n2)].LedgerType
          } numbering.`
        );
      });
    });
    return list;
  };
  const { DisplayError, DisplayHidingError } = useErrorDisplay(process());
  const [clone, setclone] = useState("");

  return (
    <WindowContent>
      <WindowTitle title={`${method} Chart of Accounts`} />
      <Flex>
        <Conditional logic={method === "Create"}>
          <ConditionalButton
            name={"Save"}
            result={process().length === 0}
            whileFalse={[() => showAlert("Errors persist. Please retry!")]}
            whileTrue={[() => Collection.save(data)]}
          />
        </Conditional>
        <Conditional logic={method === "Update"}>
          <ConditionalButton
            name={"Update"}
            result={process().length === 0}
            whileFalse={[() => showAlert("Errors persist. Please retry!")]}
            whileTrue={[() => Collection.update(data)]}
          />
        </Conditional>
        <Conditional logic={method !== "View"}>
          <Button name={"Reset"} functionsArray={[() => reset()]} />
          <Button
            name={"Manage"}
            functionsArray={[() => openWindow(<ManageChartOfAccounts />)]}
          />
        </Conditional>
      </Flex>
      <DisplayArea>
        <DistributedRow>
          <Label label={"Code"} />
          <Input
            value={Code}
            process={(value) => changeData("", "Code", value)}
            maxLength={4}
          />
        </DistributedRow>
        <DisplayError path={"Code"} />
        <TopFlex>
          <Label label={"General Ledger Numbering"} />
          <Table
            columns={["Ledger Type", "From", "To"]}
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
                process={(value) => changeData(`GLNumbering/${n}`, "To", value)}
                type={"number"}
              />,
            ])}
          />
          <DisplayHidingError path={"GLNumbering"} />
        </TopFlex>
      </DisplayArea>
    </WindowContent>
  );
}
