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
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { Dictionary } from "../Database";
import { HSN } from "../classes";
import { noop, rangeOverlap } from "../functions";

export function TableHSN() {
  const initial = HSN.read();
  const {
    data,
    setdata,
    reset,
    addItemtoArray,
    deleteItemfromArray,
    changeData,
  } = useData(initial);
  const { openWindow, showAlert, openConfirm } = useInterface();
  const { errorsExist, clearErrors, addError, DisplayHidingError } = useError();
  useEffect(() => {
    clearErrors();
    data.forEach((hsn, h) => {
      const { Code, Description } = hsn;
      addError(Code === "", `${h + 1}`, `Code cannot blank.`);
      addError(Description === "", `${h + 1}`, `Description cannot blank.`);
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Table HSN"}
        menu={[
          <ConditionalButton
            name={"Save"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check.")]}
            whileTrue={[() => showAlert(HSN.save(data))]}
          />,
          <Button
            name={"Add"}
            functionsArray={[
              () => addItemtoArray("", { Code: "", Description: "" }),
            ]}
          />,
          <DisplayHidingError />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Table
            columns={["HSN Code", "Description", ""]}
            rows={data.map((hsn, h) => [
              <Input
                value={hsn.Code}
                process={(value) => changeData(h.toString(), "Code", value)}
                type="text"
              />,
              <Input
                value={hsn.Description}
                process={(value) =>
                  changeData(h.toString(), "Description", value)
                }
                type="text"
              />,
              <ConditionalButton
                name="Delete"
                result={hsn.Code !== "" && hsn.Description !== ""}
                whileTrue={[
                  () =>
                    openConfirm(
                      "This will permanently remove the HSN Code",
                      [],
                      [() => deleteItemfromArray("", h)]
                    ),
                ]}
                whileFalse={[() => deleteItemfromArray("", h)]}
              />,
            ])}
          />
        </DisplayArea>
      </WindowContent>
    </>
  );
}
