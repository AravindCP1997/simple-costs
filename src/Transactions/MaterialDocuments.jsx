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
import { MaterialTable } from "../businessFunctions";

export function MaterialDocuments() {
  if (MaterialTable() === null) {
    return null;
  }
  const data = MaterialTable();
  const columns = Object.keys(data[0]);
  return (
    <>
      <WindowContent>
        <DisplayArea>
          <Table
            columns={columns}
            rows={data.map((item, i) =>
              columns.map((column, c) => <Label label={item[column]} />),
            )}
          />
        </DisplayArea>
      </WindowContent>
    </>
  );
}
