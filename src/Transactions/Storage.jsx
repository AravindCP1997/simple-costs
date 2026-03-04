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

export function Storage() {
  const { openConfirm, showAlert } = useInterface();
  return (
    <>
      <WindowTitle
        title={"Storage"}
        menu={[
          <Button
            name={"Clear"}
            functionsArray={[
              () =>
                openConfirm(
                  "This action will permanently delete all data in storage.",
                  [],
                  [
                    () => {
                      localStorage.clear();
                      showAlert("Storage Cleared!");
                    },
                  ],
                ),
            ]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row jc="left" borderBottom="none">
            <Label label={"Storage"} style={{ fontWeight: "bold" }} />
            <Label
              label={
                "All user data stored within the local storage of this browser."
              }
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
