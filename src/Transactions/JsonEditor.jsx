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
} from "../Components";

import { updateObject, addToArray, addToObject, newKey } from "../objects";
import useData from "../useData";

import { useInterface, useWindowType } from "../useInterface";
import { isObject } from "../functions";

export const JSONEditor = ({ initial = [""] }) => {
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

  const ObjectInput = ({ data, path }) => {
    return (
      <>
        {Object.keys(data).map((key, k) => (
          <>
            {typeof data[key] !== "object" && (
              <Row key={key}>
                <Input
                  value={key}
                  process={(value) => updateKey(path, k, value)}
                />
                <Input
                  value={data[key]}
                  process={(value) => changeData(path, key, value)}
                />
                <Menu
                  title={"Menu"}
                  menu={[
                    <Button
                      name={"Convert to Array"}
                      functionsArray={[() => changeData(path, key, [""])]}
                    />,
                    <Button
                      name={"Convert to Object"}
                      functionsArray={[() => changeData(path, key, { "": "" })]}
                    />,
                    <Button
                      name={"Remove"}
                      functionsArray={[() => deleteItemfromObject(path, key)]}
                    />,
                  ]}
                />
              </Row>
            )}
            {isObject(data[key]) && (
              <Column key={key}>
                <Row>
                  <Input
                    value={key}
                    process={(value) => updateKey(path, k, value)}
                  />
                  <Menu
                    title={"Menu"}
                    menu={[
                      <Button
                        name={"Convert to Array"}
                        functionsArray={[() => changeData(path, key, [""])]}
                      />,
                      <Button
                        name={"Convert to Value"}
                        functionsArray={[() => changeData(path, key, "")]}
                      />,
                      <Button
                        name={"Remove"}
                        functionsArray={[() => deleteItemfromObject(path, key)]}
                      />,
                      <Button
                        name={"Add"}
                        functionsArray={[() => addItemtoObject(path, "")]}
                      />,
                    ]}
                  />
                </Row>
                <ObjectInput
                  data={data[key]}
                  path={path === "" ? key : `${path}/${key}`}
                />
              </Column>
            )}
            {Array.isArray(data[key]) && (
              <Column key={key}>
                <Row>
                  <Input
                    value={key}
                    process={(value) => updateKey(path, k, value)}
                  />
                  <Menu
                    title={"Menu"}
                    menu={[
                      <Button
                        name={"Convert to Object"}
                        functionsArray={[
                          () => changeData(path, key, { "": "" }),
                        ]}
                      />,
                      <Button
                        name={"Convert to Value"}
                        functionsArray={[() => changeData(path, key, "")]}
                      />,
                      <Button
                        name={"Remove"}
                        functionsArray={[() => deleteItemfromArray(path, key)]}
                      />,
                      <Button
                        name={"Add"}
                        functionsArray={[() => addItemtoArray(path, "")]}
                      />,
                    ]}
                  />
                </Row>
                <ArrayInput
                  data={data[key]}
                  path={path === "" ? key : `${path}/${key}`}
                />
              </Column>
            )}
          </>
        ))}
      </>
    );
  };

  const ArrayInput = ({ data, path }) => {
    return (
      <>
        {data.map((item, i) => (
          <>
            {typeof item !== "object" && (
              <Row key={i}>
                <Label label={i + 1} />
                <Input
                  value={item}
                  process={(value) => changeData(path, i, value)}
                />
                <Menu
                  title={"Menu"}
                  menu={[
                    <Button
                      name={"Convert to Array"}
                      functionsArray={[() => changeData(path, i, [""])]}
                    />,
                    <Button
                      name={"Convert to Object"}
                      functionsArray={[() => changeData(path, i, { "": "" })]}
                    />,
                    <Button
                      name={"Remove"}
                      functionsArray={[() => deleteItemfromArray(path, i)]}
                    />,
                  ]}
                />
              </Row>
            )}
            {isObject(item) && (
              <Column key={i}>
                <Row>
                  <Label label={i + 1} />
                  <Menu
                    title={"Menu"}
                    menu={[
                      <Button
                        name={"Convert to Array"}
                        functionsArray={[() => changeData(path, i, [""])]}
                      />,
                      <Button
                        name={"Convert to Value"}
                        functionsArray={[() => changeData(path, i, "")]}
                      />,
                      <Button
                        name={"Remove"}
                        functionsArray={[() => deleteItemfromObject(path, i)]}
                      />,
                      <Button
                        name={"Add"}
                        functionsArray={[() => addItemtoObject(path, "")]}
                      />,
                    ]}
                  />
                </Row>
                <ObjectInput
                  data={item}
                  path={path === "" ? i : `${path}/${i}`}
                />
              </Column>
            )}
            {Array.isArray(item) && (
              <Column>
                <Row>
                  <Label label={i + 1} />
                  <Menu
                    title={"Menu"}
                    menu={[
                      <Button
                        name={"Convert to Object"}
                        functionsArray={[() => changeData(path, i, { "": "" })]}
                      />,
                      <Button
                        name={"Convert to Value"}
                        functionsArray={[() => changeData(path, i, "")]}
                      />,
                      <Button
                        name={"Remove"}
                        functionsArray={[() => deleteItemfromArray(path, i)]}
                      />,
                      <Button
                        name={"Add"}
                        functionsArray={[() => addItemtoArray(path, "")]}
                      />,
                    ]}
                  />
                </Row>
                <ArrayInput
                  data={item}
                  path={path === "" ? i : `${path}/${i}`}
                />
              </Column>
            )}
          </>
        ))}
      </>
    );
  };

  return (
    <>
      <WindowTitle
        title={"JSON Editor"}
        menu={[
          <Menu
            title={"New"}
            menu={[
              <Button
                name={"Object"}
                functionsArray={[() => setdata({ "": "" })]}
              />,
              <Button name={"Array"} functionsArray={[() => setdata([""])]} />,
            ]}
          />,
          <InputJSONFile
            title="Open"
            process={(value) => setdata(value)}
            handleError={(error) => showAlert(error)}
          />,
          <ExportJSONFile
            fileName="Compounds_JSON"
            data={data}
            name="Download"
          />,
          <HidingDisplay title={"Text View"}>
            <p>{JSON.stringify(data, null, "\n")}</p>
          </HidingDisplay>,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          {isObject(data) && <ObjectInput data={data} path={""} />}
          {Array.isArray(data) && <ArrayInput data={data} path={""} />}
        </DisplayArea>
      </WindowContent>
    </>
  );
};
