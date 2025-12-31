import { ListItems, ListUniqueItems } from "./functions";
import { CollapsingDisplay } from "./Components";

export const useError = () => {
  const list = [];
  const addError = (logic, path, error) => {
    if (logic) {
      list.push({ path, error });
    }
  };
  return { list, addError };
};

export const useErrorDisplay = (errors) => {
  const errorsByPath = (path) => {
    const filtered = errors.filter((error) => error.path === path);
    return ListItems(filtered, "error");
  };
  const DisplayError = ({ path }) => {
    const errors = errorsByPath(path);
    if (!errors.length) {
      return null;
    }
    return (
      <ul>
        {errors.map((error, e) => (
          <li key={e}>{error}</li>
        ))}
      </ul>
    );
  };

  const DisplayHidingError = ({ path }) => {
    return (
      <CollapsingDisplay title={"Errors"}>
        <DisplayError path={path} />
      </CollapsingDisplay>
    );
  };

  return { DisplayError, DisplayHidingError };
};
