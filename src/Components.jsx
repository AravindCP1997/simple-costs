import { AccessibilityContext, WindowContext } from "./context";
import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import {
  DisplayBox,
  DisplayFieldLabel,
  DisplayRow,
  Input,
  LabelledInput,
  NavigationRow,
  WindowContent,
  WindowTitle,
} from "./App";
import { isObject, noop } from "./functions";

export const Button = ({ name, functionsArray, setRef = noop }) => {
  const perform = () => {
    functionsArray.forEach((func) => {
      func();
    });
  };

  return (
    <button ref={(el) => setRef(el)} onClick={perform}>
      {name}
    </button>
  );
};

export const CheckBox = ({ value, process }) => {
  return (
    <input type="checkbox" checked={value} onChange={() => process(!value)} />
  );
};

export const HidingDisplay = ({ title, children }) => {
  const [isOpen, setOpen] = useState(false);
  const {
    accessibility: { Font },
  } = useContext(AccessibilityContext);

  return (
    <div>
      <Button name={title} functionsArray={[() => setOpen(true)]} />
      {isOpen && (
        <>
          {createPortal(
            <div style={{ fontFamily: Font }} className="hidingDisplayOverlay">
              <div className="hidingDisplay">
                <WindowTitle title={title} />
                {children}
                <Button name="Close" functionsArray={[() => setOpen(false)]} />
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
};
export const ConditionalButton = ({ name, result, whileTrue, whileFalse }) => {
  return (
    <Button name={name} functionsArray={result ? whileTrue : whileFalse} />
  );
};

export const AutoSuggestInput = ({
  value,
  process,
  setRef = noop,
  suggestions,
  placeholder,
  keyDownHandler,
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleChange = (value) => {
    const newFilteredSuggestions = suggestions.filter(
      (suggestion) => suggestion.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    process(value);
    setFilteredSuggestions(newFilteredSuggestions);
    setShowSuggestion(true);
  };

  const handleClick = (e) => {
    process(e.currentTarget.innerText);
    setFilteredSuggestions([]);
    setShowSuggestion(false);
  };

  const cancel = () => {
    setFilteredSuggestions([]);
    setShowSuggestion(false);
  };

  const dropdownStyle = {
    position: "absolute",
    background: "white",
    width: "100%",
    zIndex: "1550",
  };

  const renderSuggestion = () => {
    if (showSuggestion && value) {
      if (filteredSuggestions.length) {
        return (
          <div style={dropdownStyle}>
            {filteredSuggestions.map((suggestion) => (
              <p key={suggestion} onClick={(e) => handleClick(e)}>
                {suggestion}
              </p>
            ))}
          </div>
        );
      } else {
        return (
          <div style={dropdownStyle}>
            <p>No Suggestion</p>
          </div>
        );
      }
    }
    return null;
  };

  const style = { position: "relative" };
  return (
    <div style={style}>
      <Input
        value={value}
        process={(value) => handleChange(value)}
        type={"text"}
        placeholder={placeholder}
        setRef={setRef}
        keyDownHandler={keyDownHandler}
      />
      {renderSuggestion()}
    </div>
  );
};

export const TableRow = ({ cells }) => {
  return (
    <tr>
      {cells.map((cell, i) => (
        <td className="tableCell" key={`cell${i}`}>
          {cell}
        </td>
      ))}
    </tr>
  );
};

export function DisplayArea({ children }) {
  const {
    accessibility: { Background },
  } = useContext(AccessibilityContext);

  const style = {
    display: "flex",
    flexDirection: "column",
    background: ["Tech", "No Background"].includes(Background)
      ? "var(--lightbluet)"
      : "var(--whitet)",
    borderRadius: "15px",
    padding: "10px",
    border: ["Tech", "No Background"].includes(Background)
      ? "5px solid var(--lightbluet)"
      : "5px solid var(--whitet)",
    boxShadow: "0px 0.5px 2px 0px var(--gray)",
  };
  return <div style={style}>{children}</div>;
}

export const Table = ({ columns, rows }) => {
  return (
    <div className="tableContainer">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th className="tableCell">
                <h4>{column}</h4>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <TableRow cells={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export function ObjectInput({
  path,
  value,
  changeData,
  updateKeyOfObject,
  addToObject,
  addToArray,
  deleteFromObject,
  deleteFromArray,
  convertAsObject,
  convertAsArray,
  convertAsValue,
}) {
  const keys = Object.keys(value);
  const preventDeletion = (e) => {
    if (e.key === "ctrlKey" && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
    }
  };

  return (
    <DisplayBox>
      <NavigationRow>
        <Button name="Add (+)" functionsArray={[() => addToObject(path, "")]} />
      </NavigationRow>

      {keys.map((key, k) => (
        <>
          {typeof value[key] !== "object" && (
            <DisplayRow>
              <Input
                keyDownHandler={preventDeletion}
                value={key}
                process={(value) => updateKeyOfObject(path, k, value)}
              />
              <Input
                value={value[key]}
                process={(value) => changeData(path, key, value)}
              />
              <Button
                name={"-"}
                functionsArray={[() => deleteFromObject(path, key)]}
              />
              <Button
                name={"Object"}
                functionsArray={[() => convertAsObject(path, key)]}
              />
              <Button
                name={"Array"}
                functionsArray={[() => convertAsArray(path, key)]}
              />
            </DisplayRow>
          )}
          {typeof value[key] === "object" && (
            <DisplayBox>
              <DisplayFieldLabel label={key} />
              {isObject(value[key]) ? (
                <>
                  <ObjectInput
                    path={path !== "" ? `${path}/${key}` : key}
                    value={value[key]}
                    changeData={changeData}
                    updateKeyOfObject={updateKeyOfObject}
                    addToArray={addToArray}
                    addToObject={addToObject}
                    deleteFromArray={deleteFromArray}
                    deleteFromObject={deleteFromObject}
                    convertAsArray={convertAsArray}
                    convertAsObject={convertAsObject}
                    convertAsValue={convertAsValue}
                  />
                  <Button
                    name={"Array"}
                    functionsArray={[() => convertAsArray(path, key)]}
                  />
                  <Button
                    name={"Value"}
                    functionsArray={[() => convertAsValue(path, key)]}
                  />
                </>
              ) : (
                <>
                  <ArrayInput
                    path={path !== "" ? `${path}/${key}` : key}
                    value={value[key]}
                    changeData={changeData}
                    updateKeyOfObject={updateKeyOfObject}
                    addToArray={addToArray}
                    addToObject={addToObject}
                    deleteFromArray={deleteFromArray}
                    deleteFromObject={deleteFromObject}
                    convertAsArray={convertAsArray}
                    convertAsObject={convertAsObject}
                    convertAsValue={convertAsValue}
                  />
                  <Button
                    name={"Object"}
                    functionsArray={[() => convertAsObject(path, key)]}
                  />
                  <Button
                    name={"Value"}
                    functionsArray={[() => convertAsValue(path, key)]}
                  />
                </>
              )}
              <Button
                name="-"
                functionsArray={[() => deleteFromObject(path, key)]}
              />
            </DisplayBox>
          )}
        </>
      ))}
    </DisplayBox>
  );
}

export function ArrayInput({
  path,
  value,
  changeData,
  updateKeyOfObject,
  addToObject,
  addToArray,
  deleteFromObject,
  deleteFromArray,
  convertAsObject,
  convertAsArray,
  convertAsValue,
}) {
  return (
    <DisplayBox>
      <Button name="Add (+)" functionsArray={[() => addToArray(path, "")]} />
      {value.map((valu, v) => (
        <>
          {typeof valu !== "object" && (
            <DisplayRow>
              <Input value={valu} process={(val) => changeData(path, v, val)} />
              <Button
                name={"-"}
                functionsArray={[() => deleteFromArray(path, v)]}
              />
              <Button
                name={"Object"}
                functionsArray={[() => convertAsObject(path, v)]}
              />
              <Button
                name={"Array"}
                functionsArray={[() => convertAsArray(path, v)]}
              />
            </DisplayRow>
          )}
          {typeof valu === "object" && (
            <DisplayBox>
              {isObject(valu) ? (
                <>
                  <ObjectInput
                    path={path !== "" ? `${path}/${v}` : v.toString()}
                    value={valu}
                    changeData={changeData}
                    updateKeyOfObject={updateKeyOfObject}
                    addToArray={addToArray}
                    addToObject={addToObject}
                    deleteFromArray={deleteFromArray}
                    deleteFromObject={deleteFromObject}
                    convertAsArray={convertAsArray}
                    convertAsObject={convertAsObject}
                    convertAsValue={convertAsValue}
                  />
                  <Button
                    name={"Array"}
                    functionsArray={[() => convertAsArray(path, v)]}
                  />
                  <Button
                    name={"Value"}
                    functionsArray={[() => convertAsValue(path, v)]}
                  />
                </>
              ) : (
                <>
                  <ArrayInput
                    path={path !== "" ? `${path}/${v}` : v.toString()}
                    value={valu}
                    changeData={changeData}
                    updateKeyOfObject={updateKeyOfObject}
                    addToArray={addToArray}
                    addToObject={addToObject}
                    deleteFromArray={deleteFromArray}
                    deleteFromObject={deleteFromObject}
                    convertAsArray={convertAsArray}
                    convertAsObject={convertAsObject}
                    convertAsValue={convertAsValue}
                  />
                  <Button
                    name={"Object"}
                    functionsArray={[() => convertAsObject(path, v)]}
                  />
                  <Button
                    name={"Value"}
                    functionsArray={[() => convertAsValue(path, v)]}
                  />
                </>
              )}
              <Button
                name="-"
                functionsArray={[() => deleteFromArray(path, v)]}
              />
            </DisplayBox>
          )}
        </>
      ))}
    </DisplayBox>
  );
}

export const FSGroupInput = ({
  data,
  path,
  changeData,
  addItemtoArray,
  deleteItemfromArray,
}) => {
  const { name, subgroups, presentations } = data;

  return (
    <DisplayBox>
      <DisplayRow>
        <Input
          value={name}
          process={(value) => changeData(`${path}`, "name", value)}
        />
        <Button
          name="Add Presentation"
          functionsArray={[
            () =>
              addItemtoArray(`${path}/presentations`, {
                name: "",
                generalledgers: [],
              }),
          ]}
        />
        <Button
          name="Add Subgroup"
          functionsArray={[
            () =>
              addItemtoArray(`${path}/subgroups`, {
                name: "",
                presentations: [],
                subgroups: [],
              }),
          ]}
        />
      </DisplayRow>
      <Table
        columns={["Presentation", "General Ledgers"]}
        rows={presentations.map((presentation, p) => [
          <Input
            value={presentation.name}
            process={(value) =>
              changeData(`${path}/presentations/${p}`, "name", value)
            }
          />,
          <HidingDisplay title={"Show"}>
            <Table
              columns={["From", "To"]}
              rows={presentation.generalledgers.map((generalledger, g) => [
                <Input
                  value={generalledger.From}
                  type="number"
                  process={(value) =>
                    changeData(
                      `${path}/presentations/${p}/generalledgers/${g}`,
                      "From",
                      value
                    )
                  }
                />,
                <Input
                  value={generalledger.To}
                  type="number"
                  process={(value) =>
                    changeData(
                      `${path}/presentations/${p}/generalledgers/${g}`,
                      "To",
                      value
                    )
                  }
                />,
              ])}
            />
            <NavigationRow>
              <Button
                name="Add"
                functionsArray={[
                  () =>
                    addItemtoArray(
                      `${path}/presentations/${p}/generalledgers`,
                      { From: "", To: "" }
                    ),
                ]}
              />
            </NavigationRow>
          </HidingDisplay>,
        ])}
      />
      {subgroups.map((subgroup, s) => (
        <>
          <FSGroupInput
            data={subgroup}
            path={`${path}/subgroups/${s}`}
            changeData={changeData}
            addItemtoArray={addItemtoArray}
            deleteItemfromArray={deleteItemfromArray}
          />
          <Button
            name="Add Subgroup"
            functionsArray={[
              () =>
                addItemtoArray(`${path}/subgroups`, {
                  name: "",
                  presentations: [],
                  subgroups: [],
                }),
            ]}
          />
        </>
      ))}
    </DisplayBox>
  );
};
