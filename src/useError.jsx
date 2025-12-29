import { ListUniqueItems } from "./functions";

export const useError = (list) => {
  const addError = (path, error) => {
    list.push({ path, error });
  };
  const errorsByPath = (path) => {
    const filtered = list.filter((error) => error.path === path);
    const errors = ListUniqueItems(filtered, "error");

    if (errors.length === 0) {
      return null;
    }

    return (
      <ul>
        {errors.map((error) => (
          <li>{error}</li>
        ))}
      </ul>
    );
  };

  return [addError, errorsByPath];
};
