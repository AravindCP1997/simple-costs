import { useState, useContext, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { clickButton, isObject, noop } from "./functions";
import { useInterface, useWindowType } from "./useInterface";
import { FocusTrap } from "focus-trap-react";
import {
  FaAngleUp,
  FaAngleDown,
  FaWindowClose,
  FaArrowCircleRight,
} from "react-icons/fa";
import exportFromJSON from "export-from-json";
import { FaArrowRight } from "react-icons/fa6";

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

export const Button = ({
  name,
  functionsArray,
  setRef = noop,
  style = {},
  className,
}) => {
  const perform = () => {
    functionsArray.forEach((func) => {
      func();
    });
  };

  return (
    <button
      className={className}
      ref={(el) => setRef(el)}
      style={style}
      onClick={perform}
    >
      {name}
    </button>
  );
};

export const CheckBox = ({ value, process = noop }) => {
  return (
    <input type="checkbox" checked={value} onChange={() => process(!value)} />
  );
};

export const HidingDisplay = ({
  title,
  children,
  menu = [],
  buttonName = title,
}) => {
  const [isOpen, setOpen] = useState(false);
  const {
    accessibility: { Font },
  } = useInterface();

  const style = {
    position: "fixed",
    fontFamily: Font,
    color: "var(--blue)",
    width: "min(90%,600px)",
    maxHeight: "90%",
    overflow: "auto",
    boxShadow: "0px 2px 10px -5px gray",
    background: "var(--whitet)",
    border: "5px solid var(--whitet)",
    backdropFilter: "blur(30px)",
    padding: "10px",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  return (
    <div>
      <Button name={buttonName} functionsArray={[() => setOpen(true)]} />
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
                <div style={style}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "2px solid var(--bluet)",
                        padding: "10px",
                      }}
                    >
                      <h3 style={{ margin: 0 }}>{title}</h3>
                      <Button
                        name="Close"
                        className={"closeButton"}
                        functionsArray={[() => setOpen(false)]}
                      />
                    </div>
                    {menu.length > 0 && (
                      <div
                        className="controlButtons"
                        style={{
                          borderBottom: "1px solid var(--bluet)",
                        }}
                      >
                        {menu.map((control) => (
                          <>{control}</>
                        ))}
                      </div>
                    )}
                  </div>
                  {children}
                </div>
              </FocusTrap>
            </Overlay>,
            document.body,
          )}
        </>
      )}
    </div>
  );
};
export const ConditionalButton = ({
  name,
  result,
  whileTrue,
  whileFalse,
  className = "",
}) => {
  return (
    <Button
      className={className}
      name={name}
      functionsArray={result ? whileTrue : whileFalse}
    />
  );
};

export const ControlButton = ({
  name,
  result,
  whileTrue,
  whileFalse,
  className = "controlButton",
}) => {
  return (
    <ConditionalButton
      name={name}
      result={result}
      whileFalse={whileFalse}
      whileTrue={whileTrue}
      className={className}
    />
  );
};

export const AutoSuggestInput = ({
  value,
  process,
  setRef = noop,
  suggestions,
  captions = [],
  placeholder,
  onSelect = process,
  inputStyle,
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [selected, setselected] = useState(-1);

  const handleChange = (value) => {
    const newFilteredSuggestions = suggestions.filter(
      (suggestion) =>
        suggestion.toString().toLowerCase().indexOf(value.toLowerCase()) > -1,
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
    width: "100%",
    background: "white",
    zIndex: "1550",
    overflowX: "clip",
    borderBottomLeftRadius: "10px",
    borderBottomRightRadius: "10px",
    boxShadow: "0px 2px 10px -5px gray",
  };

  const keyDownHandler = (e) => {
    if (e.key === "ArrowUp" && selected > 0) {
      e.preventDefault();
      setselected((prev) => prev - 1);
    }
    if (e.key === "ArrowDown" && selected < filteredSuggestions.length - 1) {
      e.preventDefault();
      setselected((prev) => prev + 1);
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

  const onBlur = () => {
    async function delayedCancel() {
      setTimeout(() => cancel(), 1000);
    }
    delayedCancel();
  };

  const renderSuggestion = () => {
    const style = {
      borderTop: "2px solid var(--lightgray)",
      fontSize: "14px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    };
    const selectedStyle = {
      background: "var(--bluet)",
      color: "white",
      opacity: "1",
    };

    if (showSuggestion && value) {
      if (filteredSuggestions.length) {
        return (
          <div style={dropdownStyle}>
            {filteredSuggestions.slice(0, 11).map((suggestion, s) => (
              <div
                key={suggestion}
                style={s === selected ? { ...style, ...selectedStyle } : style}
                className="autoSuggestion"
                onClick={() => handleClick(suggestion)}
              >
                <p>{suggestion.toString().toUpperCase()}</p>
                <p
                  style={{ opacity: 0.5, textAlign: "right", fontSize: "90%" }}
                >
                  {captions[suggestions.indexOf(suggestion)]}
                </p>
              </div>
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
        style={inputStyle}
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

export function WindowTitle({
  title,
  style = {},
  menu = [],
  closeTo = "Control",
}) {
  const { closeWindow } = useInterface();
  const windowType = useWindowType();

  const defaultStyle = {
    color: windowType === "static" ? "var(--blue)" : "white",
    textAlign: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-end",
    borderBottom:
      windowType === "static"
        ? "2px solid var(--bluet)"
        : "2px solid var(--whitet)",
    padding: "5px",
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "min(100%,960px)",
        color: windowType === "static" ? "var(--blue)" : "white",
      }}
    >
      <div style={{ ...defaultStyle, ...style }}>
        <h3 style={{ margin: "0" }}>{title}</h3>
        <Conditional logic={windowType === "static"}>
          <Button
            className={"closeButton"}
            name={"Close"}
            functionsArray={[() => closeWindow(closeTo)]}
          />
        </Conditional>
      </div>
      {menu.length > 0 && (
        <div
          className="controlButtons"
          style={{
            borderBottom:
              windowType === "static"
                ? "1px solid var(--bluet)"
                : "1px solid var(--whitet)",
            width: "min(100%,960px)",
          }}
        >
          {menu.map((control) => (
            <>{control}</>
          ))}
        </div>
      )}
    </div>
  );
}

export function DisplayArea({ children }) {
  const {
    accessibility: { Background },
  } = useInterface();

  const blue = useWindowType() === "float" || Background === "Tech";

  const style = {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    background: blue ? "var(--lightbluet)" : "var(--whitet)",
    backdropFilter: "blur(5px)",
    borderRadius: "5px",
    padding: "10px",
    border: blue ? "5px solid var(--lightbluet)" : "5px solid var(--whitet)",
    overflow: "visible",
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

export function MultiDisplayArea({ heads = [], contents = [] }) {
  const [selected, setselected] = useState(0);
  const blue =
    useWindowType() === "float" ||
    useInterface().accessibility.Background === "Tech";
  return (
    <div className="multiDisplay">
      <div key={"Header"}>
        <div className="multiDisplayOptions">
          {heads.map((head, h) => (
            <div
              key={head}
              tabIndex={0}
              onClick={() => setselected(h)}
              onKeyDown={(e) => clickButton(e)}
              className={
                selected === h
                  ? "multiDisplayOptionSelected"
                  : "multiDisplayOption"
              }
              style={{
                background: blue ? "var(--lightbluet)" : "var(--whitet)",
                borderTopRightRadius: h === heads.length - 1 ? "10px" : "0",
                borderTopLeftRadius: h === 0 ? "10px" : "0",
              }}
            >
              <h4>{head}</h4>
            </div>
          ))}
        </div>
      </div>
      <div
        key={"content"}
        className="multiDisplayContent"
        style={
          blue
            ? {
                background: "var(--lightbluet)",
                border: "5px solid var(--lightbluet)",
              }
            : {
                background: "var(--whitet)",
                border: "5px solid var(--whitet)",
              }
        }
      >
        {contents.length && contents[selected]}
      </div>
    </div>
  );
}

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
    <Column>
      {keys.map((key, k) => (
        <>
          {typeof value[key] !== "object" && (
            <Row>
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
                name={"{}"}
                functionsArray={[() => convertAsObject(path, key)]}
              />
              <Button
                name={"[]"}
                functionsArray={[() => convertAsArray(path, key)]}
              />
            </Row>
          )}
          {typeof value[key] === "object" && (
            <Column>
              <Label label={key} />
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
                    name={"[]"}
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
                    name={"{}"}
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
            </Column>
          )}
        </>
      ))}
      <Row>
        <Button name="+" functionsArray={[() => addToObject(path, "")]} />
      </Row>
    </Column>
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
    <Column>
      {value.map((valu, v) => (
        <>
          {typeof valu !== "object" && (
            <Row>
              <Input value={valu} process={(val) => changeData(path, v, val)} />
              <Button
                name={"-"}
                functionsArray={[() => deleteFromArray(path, v)]}
              />
              <Button
                name={"{}"}
                functionsArray={[() => convertAsObject(path, v)]}
              />
              <Button
                name={"[]"}
                functionsArray={[() => convertAsArray(path, v)]}
              />
            </Row>
          )}
          {typeof valu === "object" && (
            <Column>
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
                  <Row>
                    <Button
                      name={"[]"}
                      functionsArray={[() => convertAsArray(path, v)]}
                    />
                    <Button
                      name={"Value"}
                      functionsArray={[() => convertAsValue(path, v)]}
                    />
                  </Row>
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
                  <Row>
                    <Button
                      name={"{}"}
                      functionsArray={[() => convertAsObject(path, v)]}
                    />
                    <Button
                      name={"Value"}
                      functionsArray={[() => convertAsValue(path, v)]}
                    />
                  </Row>
                </>
              )}
              <Row>
                <Button
                  name="-"
                  functionsArray={[() => deleteFromArray(path, v)]}
                />
              </Row>
            </Column>
          )}
        </>
      ))}
      <Row>
        <Button name="+" functionsArray={[() => addToArray(path, "")]} />
      </Row>
    </Column>
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
                      value,
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
                      value,
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
                      { From: "", To: "" },
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
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
  const float = useWindowType() === "float";
  const style = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    padding: "10px 10px 10px 0px",
    height: "100%",
    overflow: "auto",
  };
  return <div style={style}>{children}</div>;
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
  process = noop,
  keyDownHandler = noop,
  placeholder = "",
  setRef = noop,
  blurHandler = noop,
  style = {},
}) {
  const defaultStyle = { position: "relative" };
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
      style={{ ...defaultStyle, ...style }}
      onBlur={(e) => blurHandler(e)}
      autoComplete="off"
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

export function Row({
  children,
  jc = "space-between",
  ai = "center",
  cn = "",
  gap = "5px",
  padding = "0px",
  overflow = "auto",
  borderBottom = "2px solid var(--whitet)",
  flexWrap = "nowrap",
  width = "100%",
}) {
  return (
    <div
      className={cn}
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: jc,
        alignItems: ai,
        gap: gap,
        padding: padding,
        width,
        overflow: overflow,
        borderBottom,
        flexWrap,
      }}
    >
      {children}
    </div>
  );
}

export function Column({
  children,
  jc = "left",
  ac = "left",
  cn = "",
  gap = "5px",
  padding = "0px",
  overflow = "auto",
  borderBottom = "2px solid var(--whitet)",
  width = "100%",
  bg = "none",
}) {
  return (
    <div
      className={cn}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: jc,
        alignItems: ac,
        gap: gap,
        padding: padding,
        width,
        overflow,
        borderBottom,
        background: bg,
      }}
    >
      {children}
    </div>
  );
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
        style={{
          border: "none",
          borderRadius: "0",
          background: "var(--bluet)",
        }}
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

export function InputJSONFile({ title = "Import", process, handleError }) {
  const button = useRef(null);
  const fileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target.result);
          process(parsedData);
        } catch (err) {
          process({});
          handleError("Error parsing JSON file. Please ensure it is valid.");
        }
      };

      reader.readAsText(file);
    } else {
      process({});
      handleError("Please upload a valid JSON file.");
    }
  };

  return (
    <>
      <Button name={title} functionsArray={[() => button.current.click()]} />
      <input
        style={{ display: "none" }}
        ref={button}
        type="file"
        accept=".json"
        onChange={fileChange}
      />
    </>
  );
}

export function ExportJSONFile({
  fileName = "New",
  data,
  name = "Export JSON",
}) {
  const exportType = "json";
  const handleExport = () => {
    exportFromJSON({ data, fileName, exportType });
  };
  return <Button name={name} functionsArray={[() => handleExport()]} />;
}

export function Menu({ title, menu, arrange = "column" }) {
  const [visible, setvisible] = useState(false);
  const toggleVisibility = () => {
    setvisible((prev) => !prev);
  };
  const style = {
    display: "flex",
    flexDirection: arrange,
    position: "absolute",
    width: "fit-content",
    zIndex: "1000",
  };

  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (visible && menuRef.current && !menuRef.current.contains(e.target)) {
        setvisible(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [visible]);

  return (
    <div ref={menuRef} style={{ position: "relative", overflow: "visible" }}>
      <Button name={title} functionsArray={[() => toggleVisibility()]} />
      {visible && (
        <div className="controlButtons" style={style}>
          {menu.map((item) => (
            <>{item}</>
          ))}
        </div>
      )}
    </div>
  );
}
export const HidingPrompt = ({
  title,
  children,
  menu = [],
  buttonName = title,
  onClose = [],
  onSubmitSuccess = [],
  onSubmitFail = [],
  result = false,
  submitLabel = "Submit",
}) => {
  const [isOpen, setOpen] = useState(false);
  const {
    accessibility: { Background, Font },
  } = useInterface();

  const style = {
    position: "fixed",
    fontFamily: Font,
    color: "var(--blue)",
    width: "min(90%,600px)",
    maxHeight: "90%",
    overflow: "visible",
    boxShadow: "0px 2px 10px -5px gray",
    background: "var(--lightbluet)",
    border: "5px solid var(--whitet)",
    backdropFilter: "blur(30px)",
    padding: "10px",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 1010,
  };

  return (
    <div>
      <Button name={buttonName} functionsArray={[() => setOpen(true)]} />
      {isOpen && (
        <>
          {createPortal(
            <Overlay>
              <FocusTrap
                focusTrapOptions={{
                  escapeDeactivates: false,
                  clickOutsideDeactivates: true,
                }}
              >
                <div style={style}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "2px solid var(--bluet)",
                        padding: "10px",
                      }}
                    >
                      <h3 style={{ margin: 0 }}>{title}</h3>
                      <Button
                        name="Close"
                        className={"closeButton"}
                        functionsArray={[...onClose, () => setOpen(false)]}
                      />
                    </div>
                    <div
                      className="controlButtons"
                      style={{
                        borderBottom: "1px solid var(--bluet)",
                      }}
                    >
                      <Button
                        name={submitLabel}
                        functionsArray={
                          result
                            ? [...onSubmitSuccess, () => setOpen(false)]
                            : onSubmitFail
                        }
                      />
                      {menu.map((control) => (
                        <>{control}</>
                      ))}
                    </div>
                  </div>
                  {children}
                </div>
              </FocusTrap>
            </Overlay>,
            document.body,
          )}
        </>
      )}
    </div>
  );
};

export function Selection({ value, path, changeData = noop }) {
  const { List, ExclList, Range, ExclRange } = value;
  return (
    <Row width="fit-content">
      <Input
        value={Range[0][0]}
        process={(value) => changeData(`${path}/Range/0`, 0, value)}
        type={"text"}
      />
      <label>to</label>
      <Input
        value={Range[0][1]}
        process={(value) => changeData(`${path}/Range/0`, 1, value)}
        type={"text"}
      />
      <HidingDisplay title={"Multi Selection"} buttonName={<FaArrowRight />}>
        <MultiDisplayArea
          heads={["List", "Exclude List", "Range", "Exclude Range"]}
          contents={[
            <Column width="min(100%,250px)">
              {List.map((item, i) => (
                <Input
                  key={i}
                  value={List[i]}
                  process={(value) => changeData(`${path}/List`, i, value)}
                  type={"text"}
                />
              ))}
            </Column>,
            <Column width="min(100%,250px)">
              {ExclList.map((item, i) => (
                <Input
                  key={i}
                  value={ExclList[i]}
                  process={(value) => changeData(`${path}/ExclList`, i, value)}
                  type={"text"}
                />
              ))}
            </Column>,
            <Column>
              {Range.map((item, i) => (
                <Row key={i} jc="left" borderBottom="none">
                  <Input
                    key={0}
                    value={Range[i][0]}
                    process={(value) =>
                      changeData(`${path}/Range/${i}`, 0, value)
                    }
                    type={"text"}
                  />
                  <Input
                    key={1}
                    value={Range[i][1]}
                    process={(value) =>
                      changeData(`${path}/Range/${i}`, 1, value)
                    }
                    type={"text"}
                  />
                </Row>
              ))}
            </Column>,
            <Column>
              {ExclRange.map((item, i) => (
                <Row key={i} jc="left" borderBottom="none">
                  <Input
                    key={0}
                    value={ExclRange[i][0]}
                    process={(value) =>
                      changeData(`${path}/ExclRange/${i}`, 0, value)
                    }
                    type={"text"}
                  />
                  <Input
                    key={1}
                    value={ExclRange[i][1]}
                    process={(value) =>
                      changeData(`${path}/ExclRange/${i}`, 1, value)
                    }
                    type={"text"}
                  />
                </Row>
              ))}
            </Column>,
          ]}
        />
      </HidingDisplay>
    </Row>
  );
}

export function ConditionalDisplays({ displays = [[true, <p></p>]] }) {
  return (
    <div>
      {displays.map((item, i) => (
        <div key={i}>{item[0] && item[1]}</div>
      ))}
    </div>
  );
}

export function PsuedoButton({ name, onClick }) {
  return (
    <div className="pseudoButton" onClick={(e) => onClick(e)}>
      {name}
    </div>
  );
}

export function ConditionalDisplay({
  logic,
  whileTrue = null,
  whileFalse = null,
}) {
  if (logic) {
    return <>{whileTrue}</>;
  } else {
    return <>{whileFalse}</>;
  }
}

export function JSONString({ data }) {
  return <>{JSON.stringify(data)}</>;
}
