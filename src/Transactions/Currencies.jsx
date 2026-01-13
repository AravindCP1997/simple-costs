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
import { Currencies } from "../classes";
import { noop, rangeOverlap } from "../functions";

export function TableCurrencies() {
  const [method, setmethod] = useState("View");
  const initial = Currencies.read();
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
    data.forEach((currency, h) => {
      const { Code, Description } = currency;
      addError(Code === "", `${h + 1}`, `Code cannot blank.`);
      addError(Description === "", `${h + 1}`, `Description cannot blank.`);
      data.forEach((currencytwo, htwo) => {
        addError(
          htwo > h && Code === currencytwo.Code,
          htwo + 1,
          `Duplicate HSN Code ${h + 1} and ${htwo + 1}.`
        );
      });
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Table Currencies"}
        menu={
          method === "View"
            ? [
                <Button
                  name="Update"
                  functionsArray={[() => setmethod("Update")]}
                />,
              ]
            : [
                <ConditionalButton
                  name={"Save"}
                  result={!errorsExist}
                  whileFalse={[
                    () => showAlert("Messages exist. Please check."),
                  ]}
                  whileTrue={[
                    () => showAlert(Currencies.save(data)),
                    () => setmethod("View"),
                  ]}
                />,
                <Button
                  name="Cancel"
                  functionsArray={[() => setmethod("View")]}
                />,
                <Button
                  name={"Add"}
                  functionsArray={[
                    () => addItemtoArray("", { Code: "", Description: "" }),
                  ]}
                />,
                <Button name={"Reset"} functionsArray={[() => reset()]} />,
                <Button
                  name={"Sample"}
                  functionsArray={[() => setdata(Currencies.sample)]}
                />,
                <DisplayHidingError />,
              ]
        }
      />
      <WindowContent>
        <DisplayArea>
          <Column ac="center">
            <Table
              columns={
                method === "View"
                  ? ["Code", "Currency"]
                  : ["Code", "Currency", ""]
              }
              rows={
                method === "View"
                  ? data.map((currency, h) => [
                      <label>{currency.Code}</label>,
                      <label>{currency.Description}</label>,
                    ])
                  : data.map((currency, h) => [
                      <Input
                        value={currency.Code}
                        process={(value) =>
                          changeData(h.toString(), "Code", value)
                        }
                        type="text"
                      />,
                      <Input
                        value={currency.Description}
                        process={(value) =>
                          changeData(h.toString(), "Description", value)
                        }
                        type="text"
                      />,
                      <ConditionalButton
                        name="Delete"
                        result={
                          currency.Code !== "" && currency.Description !== ""
                        }
                        whileTrue={[
                          () =>
                            openConfirm(
                              "This will permanently remove the Currency.",
                              [],
                              [() => deleteItemfromArray("", h)]
                            ),
                        ]}
                        whileFalse={[() => deleteItemfromArray("", h)]}
                      />,
                    ])
              }
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
