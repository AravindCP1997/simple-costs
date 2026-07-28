import { useState, useContext, useMemo, useEffect } from "react";

import {
  Input,
  Option,
  Radio,
  DisplayRow,
  DisplayBox,
  DisplayFieldLabel,
  WindowContent,
  WindowTitle,
  LabelledInput,
  NavigationRow,
  Button,
  CheckBox,
  DisplayArea,
  HidingDisplay,
  Conditional,
  ConditionalButton,
  Table,
  TableRow,
  ObjectInput,
  ArrayInput,
  FSGroupInput,
  AutoSuggestInput,
  Row,
  Label,
  InputJSONFile,
  ExportJSONFile,
  CollapsingDisplay,
  Column,
  Menu,
  InputXMLFile,
} from "../Components";

import { updateObject, addToArray, addToObject, newKey } from "../objects";
import useData from "../useData";

import { useInterface, useWindowType } from "../useInterface";
import { isObject } from "../functions";

export const XMLToJSON = ({ initial = {} }) => {
  const {
    data,
    reset,
    setdata,
    changeData,
    addItemtoArray,
    addItemtoObject,
    deleteItemfromArray,
    deleteItemfromObject,
    updateKey,
    convertAsArray,
    convertAsObject,
    convertAsValue,
  } = useData(initial);
  const { showAlert } = useInterface();

  return (
    <>
      <WindowTitle
        title={"XML To JSON Converter"}
        menu={[
          <InputXMLFile
            title="Open"
            process={(value) => setdata(value)}
            handleError={(error) => showAlert(error)}
          />,
          <ExportJSONFile
            fileName="Compounds_JSON"
            data={data}
            name="Download"
          />,
        ]}
        closeTo="Report"
      />
      <WindowContent>
        <DisplayArea>
          <Column bg="var(--lightbluet)" padding="10px" overflow="hidden">
            {JSON.stringify(data)}
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
};
