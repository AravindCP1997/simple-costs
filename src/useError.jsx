import { ListItems, ListUniqueItems } from "./functions";
import { CollapsingDisplay, HidingDisplay, Label, Table } from "./Components";
import { useState } from "react";

export const useError = () => {
  const [errors, seterrors] = useState(["Hi"]);
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

  const errorsExist = errors.length > 0;
  const haveErrors = (path) => {
    return errorsByPath(path).length > 0;
  };

  const DisplayError = () => {
    if (!errorsExist) {
      return null;
    }
    return (
      <Table
        columns={["Path", "Error"]}
        rows={errors.map((error) => [
          <p>{error.path}</p>,
          <p>{error.error}</p>,
        ])}
      />
    );
  };

  const DisplayHidingError = () => {
    if (!errorsExist) return null;
    return (
      <HidingDisplay title={`Errors ${errors.length}`}>
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
