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
              <details key={key}>
                <summary>
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
                </summary>
                <ObjectInput
                  data={data[key]}
                  path={path === "" ? key : `${path}/${key}`}
                />
              </details>
            )}
            {Array.isArray(data[key]) && (
              <details>
                <summary>
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
                          functionsArray={[
                            () => deleteItemfromArray(path, key),
                          ]}
                        />,
                        <Button
                          name={"Add"}
                          functionsArray={[() => addItemtoArray(path, "")]}
                        />,
                      ]}
                    />
                  </Row>
                </summary>
                <ArrayInput
                  data={data[key]}
                  path={path === "" ? key : `${path}/${key}`}
                />
              </details>
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
              <details key={i}>
                <summary>
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
                </summary>
                <ObjectInput
                  data={item}
                  path={path === "" ? i : `${path}/${i}`}
                />
              </details>
            )}
            {Array.isArray(item) && (
              <details>
                <summary>
                  <Row>
                    <Label label={i + 1} />
                    <Menu
                      title={"Menu"}
                      menu={[
                        <Button
                          name={"Convert to Object"}
                          functionsArray={[
                            () => changeData(path, i, { "": "" }),
                          ]}
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
                </summary>
                <ArrayInput
                  data={item}
                  path={path === "" ? i : `${path}/${i}`}
                />
              </details>
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
            <p>{JSON.stringify(data, null, 2)}</p>
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
