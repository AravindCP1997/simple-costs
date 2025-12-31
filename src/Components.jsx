import { useState, useContext, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { isObject, noop } from "./functions";
import { useInterface } from "./useInterface";
import { FocusTrap } from "focus-trap-react";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";

export const Flex = ({ children, justify = "left", direction = "row" }) => {
  const style = {
    display: "flex",
    flexDirection: direction,
    justifyContent: justify,
    gap: "5px",
  };
  return <div style={style}>{children}</div>;
};

export const RightFlex = ({ children }) => {
  return <Flex justify="right">{children}</Flex>;
};

export const CenterFlex = ({ children }) => {
  return <Flex justify="center">{children}</Flex>;
};

export const DistributedRow = ({ children }) => {
  return <Flex justify="space-between">{children}</Flex>;
};

export const CoveredRow = ({ children }) => {
  return <Flex justify="space-around">{children}</Flex>;
};

export const TopFlex = ({ children }) => {
  return (
    <Flex justify="top" direction="column">
      {children}
    </Flex>
  );
};

export const Button = ({ name, functionsArray, setRef = noop, style = {} }) => {
  const perform = () => {
    functionsArray.forEach((func) => {
      func();
    });
  };

  return (
    <button ref={(el) => setRef(el)} style={style} onClick={perform}>
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
  } = useInterface();

  return (
    <div>
      <Button name={title} functionsArray={[() => setOpen(true)]} />
      {isOpen && (
        <>
          {createPortal(
            <Overlay>
              <FocusTrap
                focusTrapOptions={{
                  escapeDeactivates: false,
                  clickOutsideDeactivates: false,
                }}
              >
                <div style={{ fontFamily: Font }} className="hidingDisplay">
                  <WindowTitle title={title} />
                  {children}
                  <Button
                    name="Close"
                    functionsArray={[() => setOpen(false)]}
                  />
                </div>
              </FocusTrap>
            </Overlay>,
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
  onSelect = noop,
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [selected, setselected] = useState(-1);

  const handleChange = (value) => {
    const newFilteredSuggestions = suggestions.filter(
      (suggestion) => suggestion.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    process(value);
    setFilteredSuggestions(newFilteredSuggestions);
    setShowSuggestion(true);
  };

  const cancel = () => {
    setFilteredSuggestions([]);
    setShowSuggestion(false);
    setselected(-1);
  };

  const handleClick = (suggestion) => {
    process(suggestion);
    onSelect(suggestion);
    setTimeout(() => cancel(), 100);
  };

  const dropdownStyle = {
    position: "absolute",
    background: "white",
    width: "100%",
    zIndex: "1550",
    borderBottomLeftRadius: "10px",
    borderBottomRightRadius: "10px",
    overflow: "hidden",
    boxShadow: "0px 2px 10px 0px var(--gray)",
  };

  const keyDownHandler = (e) => {
    if (e.key === "ArrowUp" && selected > 0) {
      e.preventDefault();
      setselected((prev) => prev - 1);
      console.log(filteredSuggestions[selected]);
    }
    if (e.key === "ArrowDown" && selected < filteredSuggestions.length - 1) {
      e.preventDefault();
      setselected((prev) => prev + 1);
      console.log(filteredSuggestions[selected]);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (selected === -1) {
        onSelect(value);
      } else {
        onSelect(filteredSuggestions[selected]);
      }
      cancel();
    }
    if (e.key === "Tab" && selected !== -1) {
      e.preventDefault();
      process(filteredSuggestions[selected]);
      cancel();
    }
  };

  const onBlur = () => {};

  const renderSuggestion = () => {
    if (showSuggestion && value) {
      if (filteredSuggestions.length) {
        return (
          <div style={dropdownStyle}>
            {filteredSuggestions.map((suggestion, s) => (
              <p
                style={
                  s === selected
                    ? {
                        background: "var(--redt)",
                        fontSize: "14px",
                        borderTop: "2px solid var(--lightgray)",
                        color: "white",
                      }
                    : {
                        borderTop: "2px solid var(--lightgray)",
                        fontSize: "14px",
                      }
                }
                key={suggestion}
                onClick={() => handleClick(suggestion)}
                className="autoSuggestion"
              >
                {suggestion}
              </p>
            ))}
          </div>
        );
      } else {
        return (
          <div style={dropdownStyle}>
            <p onClick={() => cancel()}>Not found!</p>
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
        blurHandler={onBlur}
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

export function WindowTitle({ title, style = {} }) {
  const defaultStyle = { textAlign: "center", padding: "20px" };
  return (
    <div style={{ ...defaultStyle, ...style }}>
      <h3 style={{ margin: "0" }}>{title}</h3>
    </div>
  );
}

export function DisplayArea({ children }) {
  const {
    accessibility: { Background },
  } = useInterface();

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

export const Overlay = ({ children, onClick = noop }) => {
  const style = {
    zIndex: "1000",
    position: "fixed",
    top: "0",
    left: "0",
    height: "100%",
    width: "100%",
    backdropFilter: "blur(2px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    alignItems: "center",
    padding: "10px",
  };
  return (
    <div style={style} onClick={(e) => onClick(e)}>
      {children}
    </div>
  );
};

export function WindowContent({ children }) {
  return <div className="windowContent">{children}</div>;
}

export function Label({ label, style = {} }) {
  return <label style={{ ...{ textAlign: "left" }, ...style }}>{label}</label>;
}

export function Option({ value, options, process }) {
  return (
    <select onChange={(e) => process(e.target.value)} value={value}>
      {options.map((option) => (
        <option value={option}>{option}</option>
      ))}
    </select>
  );
}

export function Input({
  value,
  type,
  maxLength,
  process,
  keyDownHandler = noop,
  placeholder = "",
  setRef = noop,
  blurHandler = noop,
}) {
  const style = { position: "relative" };
  return (
    <input
      className="input"
      onChange={(e) => process(e.target.value)}
      value={value}
      type={type}
      maxLength={maxLength}
      onKeyDown={(e) => keyDownHandler(e)}
      placeholder={placeholder}
      ref={(el) => setRef(el)}
      style={style}
      onBlur={(e) => blurHandler(e)}
    />
  );
}

export function Radio({ value, options, process }) {
  return (
    <div className="radios">
      {options.map((option, i) => (
        <div
          key={`radio${i}`}
          className="radio"
          onClick={() => process(option)}
        >
          <input
            type="radio"
            value={option}
            checked={value === option}
            onChange={(e) => process(e.target.value)}
          />
          <label>{option}</label>
        </div>
      ))}
    </div>
  );
}

export function DisplayRow({ children }) {
  return <div className="displayRow">{children}</div>;
}

export function DisplayBox({ children }) {
  return <div className="displayBox">{children}</div>;
}

export function DisplayFieldLabel({ label }) {
  return <label className="displayFieldLabel">{label}</label>;
}

export function NavigationRow({ children }) {
  return <div className="navigationRow">{children}</div>;
}

export function LabelledInput({ label, children }) {
  return (
    <DisplayRow>
      <DisplayFieldLabel label={label} />
      {children}
    </DisplayRow>
  );
}

export function CollapsingDisplay({ title, children }) {
  const [visible, setvisible] = useState(false);
  const contentRef = useRef(null);
  const [height, setheight] = useState(0);
  useEffect(() => {
    if (contentRef.current) {
      setheight(contentRef.current.scrollHeight);
    }
  }, [children, visible]);
  const toggleVisibility = () => {
    setvisible(!visible);
  };
  return (
    <div>
      <Button
        name={
          visible ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {title}
              <FaAngleUp />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {title}
              <FaAngleDown />
            </div>
          )
        }
        functionsArray={[() => toggleVisibility()]}
      />
      <div
        style={{
          maxHeight: visible ? `${height}px` : "0",
          overflow: "hidden",
          transition: "max-Height 0.3s ease-in-out",
        }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
}

export function Conditional({ logic, children }) {
  if (!logic) return null;
  return <>{children}</>;
}
