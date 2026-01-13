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
import { Segments } from "../classes";
import { noop, rangeOverlap } from "../functions";

export function TableSegments() {
  const [method, setmethod] = useState("View");
  const initial = Segments.read();
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
    data.forEach((segment, h) => {
      const { Segment, Description } = segment;
      addError(Segment === "", `${h + 1}`, `Segment ID cannot blank.`);
      addError(Description === "", `${h + 1}`, `Description cannot blank.`);
      data.forEach((segmenttwo, htwo) => {
        addError(
          htwo > h && Segment === segmenttwo.Segment,
          htwo + 1,
          `Duplicate HSN Code ${h + 1} and ${htwo + 1}.`
        );
      });
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Table Segments"}
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
                    () => showAlert(Segments.save(data)),
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
                    () => addItemtoArray("", { Segment: "", Description: "" }),
                  ]}
                />,
                <Button name={"Reset"} functionsArray={[() => reset()]} />,
                <Button
                  name={"Sample"}
                  functionsArray={[() => setdata(Segments.sample)]}
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
                  ? ["Segment", "Description"]
                  : ["Segment", "Description", ""]
              }
              rows={
                method === "View"
                  ? data.map((segment, h) => [
                      <label>{segment.Segment}</label>,
                      <label>{segment.Description}</label>,
                    ])
                  : data.map((segment, h) => [
                      <Input
                        value={segment.Segment}
                        process={(value) =>
                          changeData(h.toString(), "Segment", value)
                        }
                        type="text"
                      />,
                      <Input
                        value={segment.Description}
                        process={(value) =>
                          changeData(h.toString(), "Description", value)
                        }
                        type="text"
                      />,
                      <ConditionalButton
                        name="Delete"
                        result={
                          segment.Code !== "" && segment.Description !== ""
                        }
                        whileTrue={[
                          () =>
                            openConfirm(
                              "This will permanently remove the Segment",
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
