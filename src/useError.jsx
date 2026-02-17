import { ListItems, ListUniqueItems } from "./functions";
import {
  CollapsingDisplay,
  Column,
  HidingDisplay,
  Label,
  Table,
} from "./Components";
import { useState } from "react";

export const useError = (calculatederrors = []) => {
  const [errors, seterrors] = useState([]);
  const addError = (logic, path, error) => {
    if (logic) {
      seterrors((prevdata) => [...prevdata, { path, error }]);
    }
  };

  const clearErrors = () => seterrors([]);

  const errorsByPath = (path) => {
    const filtered = errors.filter((error) => error.path === path);
    return ListUniqueItems(filtered, "error");
  };

  const errorsExist = errors.length > 0 || calculatederrors.length > 0;
  const haveErrors = (path) => {
    return errorsByPath(path).length > 0;
  };

  const mergedErrors = [...errors, ...calculatederrors];

  const DisplayError = () => {
    if (!errorsExist) {
      return null;
    }
    return (
      <Column borderBottom="none">
        <Table
          columns={["Path", "Error"]}
          rows={mergedErrors.map((error) => [
            <p>{error.path}</p>,
            <p>{error.error}</p>,
          ])}
        />
      </Column>
    );
  };

  const DisplayHidingError = () => {
    if (!errorsExist) return null;
    return (
      <HidingDisplay title={`Messages`}>
        <DisplayError />
      </HidingDisplay>
    );
  };

  return {
    errors,
    addError,
    clearErrors,
    errorsExist,
    DisplayError,
    DisplayHidingError,
  };
};
