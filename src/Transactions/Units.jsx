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
import { Units } from "../classes";
import { noop, rangeOverlap } from "../functions";

export function TableUnits() {
  const [method, setmethod] = useState("View");
  const initial = Units.read();
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
    data.forEach((unit, h) => {
      const { Unit, Description } = unit;
      addError(Unit === "", `${h + 1}`, `Unit cannot blank.`);
      addError(Description === "", `${h + 1}`, `Description cannot blank.`);
      data.forEach((unittwo, htwo) => {
        addError(
          htwo > h && Unit === unittwo.Unit,
          htwo + 1,
          `Duplicate Unit ${h + 1} and ${htwo + 1}.`
        );
      });
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Table Units"}
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
                    () => showAlert(Units.save(data)),
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
                    () => addItemtoArray("", { Unit: "", Description: "" }),
                  ]}
                />,
                <Button name={"Reset"} functionsArray={[() => reset()]} />,
                <Button
                  name={"Sample"}
                  functionsArray={[() => setdata(Units.sample)]}
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
                  ? ["Units", "Description"]
                  : ["Units", "Description", ""]
              }
              rows={
                method === "View"
                  ? data.map((unit, h) => [
                      <label>{unit.Unit}</label>,
                      <label>{unit.Description}</label>,
                    ])
                  : data.map((unit, h) => [
                      <Input
                        value={unit.Unit}
                        process={(value) =>
                          changeData(h.toString(), "Unit", value)
                        }
                        type="text"
                      />,
                      <Input
                        value={unit.Description}
                        process={(value) =>
                          changeData(h.toString(), "Description", value)
                        }
                        type="text"
                      />,
                      <ConditionalButton
                        name="Delete"
                        result={unit.Unit !== "" && unit.Description !== ""}
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
