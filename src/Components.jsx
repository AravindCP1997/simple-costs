import { AccessibilityContext } from "./context";
import { useState, useContext } from "react";
import { createPortal } from "react-dom";

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
              <div className="hidingDisplay">{children}</div>
              <Button name="Close" functionsArray={[() => setOpen(false)]} />
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
  return <div className="displayArea">{children}</div>;
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
