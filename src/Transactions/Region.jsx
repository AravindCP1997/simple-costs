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
import { Region } from "../classes";
import {
  FilteredList,
  ListUniqueItems,
  noop,
  rangeOverlap,
} from "../functions";
import { StatesMaster } from "../constants";

export function TableRegion() {
  const [method, setmethod] = useState("View");
  const initial = Region.read();
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
    data.forEach((region, r) => {
      const { Code, Description, Country, State } = region;
      addError(Code === "", `${r + 1}`, `Code cannot blank.`);
      data.forEach((regiontwo, rtwo) => {
        addError(
          rtwo > r && Code === regiontwo.Code,
          rtwo + 1,
          `Duplicate Region Code ${r + 1} and ${rtwo + 1}.`,
        );
      });
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Table Region"}
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
                    () => showAlert(Region.save(data)),
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
                    () =>
                      addItemtoArray("", {
                        Code: "",
                        Country: "",
                        State: "",
                        Description: "",
                      }),
                  ]}
                />,
                <Button name={"Reset"} functionsArray={[() => reset()]} />,
                <Button
                  name={"Sample"}
                  functionsArray={[() => setdata(Region.sample)]}
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
                  ? ["Code", "Country", "State", "Description"]
                  : ["Code", "Country", "State", "Description", ""]
              }
              rows={
                method === "View"
                  ? data.map((region, r) => [
                      <label>{region.Code}</label>,
                      <label>{region.Country}</label>,
                      <label>{region.State}</label>,
                      <label>{region.Description}</label>,
                    ])
                  : data.map((region, r) => [
                      <Input
                        value={region.Code}
                        process={(value) =>
                          changeData(r.toString(), "Code", value)
                        }
                        type="text"
                        maxLength={3}
                      />,
                      <Option
                        value={region.Country}
                        process={(value) =>
                          changeData(r.toString(), "Country", value)
                        }
                        options={[
                          "",
                          ...ListUniqueItems(StatesMaster, "Country"),
                        ]}
                      />,
                      <Option
                        value={region.State}
                        process={(value) =>
                          changeData(r.toString(), "State", value)
                        }
                        options={[
                          "",
                          ...FilteredList(
                            StatesMaster,
                            { Country: region.Country },
                            "State",
                          ),
                        ]}
                      />,
                      <Input
                        value={region.Description}
                        process={(value) =>
                          changeData(r.toString(), "Description", value)
                        }
                        type="text"
                      />,
                      <ConditionalButton
                        name="Delete"
                        result={region.Code !== "" && region.Description !== ""}
                        whileTrue={[
                          () =>
                            openConfirm(
                              "This will permanently remove the Region.",
                              [],
                              [() => deleteItemfromArray("", r)],
                            ),
                        ]}
                        whileFalse={[() => deleteItemfromArray("", r)]}
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
