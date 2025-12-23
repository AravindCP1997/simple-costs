import { AccessibilityContext, WindowContext } from "./context";
import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { WindowTitle } from "./App";

export const Button = ({ name, functionsArray }) => {
  const perform = () => {
    functionsArray.forEach((func) => {
      func();
    });
  };

  return <button onClick={perform}>{name}</button>;
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
