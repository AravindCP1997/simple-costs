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
import { EntryTypes } from "../classes";
import {
  FilteredList,
  ListUniqueItems,
  noop,
  rangeOverlap,
} from "../functions";
import { StatesMaster } from "../constants";

export function TableEntryTypes() {
  const initial = EntryTypes.types;
  return (
    <>
      <WindowTitle title={"Entry Types"} />
      <WindowContent>
        <DisplayArea>
          <Column ac="center">
            <Table
              columns={["Code", "Description", "Account", "Debit/Credit"]}
              rows={initial.map((item) => [
                <label>{item.C}</label>,
                <label>{item.D}</label>,
                <label>{item.A}</label>,
                <label>{item.T}</label>,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
