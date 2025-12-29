export const updateObject = (object, pathString, key, value) => {
  let newObject = JSON.parse(JSON.stringify(object));
  let result = newObject;
  if (pathString !== "") {
    let path = pathString.split("/");
    path.forEach((pathKey) => {
      result = result[pathKey];
    });
  }
  result[key] = value;
  return newObject;
};

export const addToObject = (object, pathString, value) => {
  let newObject = JSON.parse(JSON.stringify(object));
  let result = newObject;
  if (pathString !== "") {
    let path = pathString.split("/");
    path.forEach((index) => {
      result = result[index];
    });
  }
  result[newKey(result)] = value;
  return newObject;
};

export const addToArray = (object, pathString, value) => {
  let newObject = JSON.parse(JSON.stringify(object));
  let result = newObject;
  if (pathString !== "") {
    let path = pathString.split("/");
    path.forEach((index) => {
      result = result[index];
    });
  }
  result.push(value);
  return newObject;
};

export const removeFromArray = (object, pathString, index) => {
  let newObject = JSON.parse(JSON.stringify(object));
  let result = newObject;
  if (pathString !== "") {
    let path = pathString.split("/");
    path.forEach((index) => {
      result = result[index];
    });
  }
  result.splice(index, 1);
  return newObject;
};

export const removeFromObject = (object, pathString, key) => {
  let newObject = JSON.parse(JSON.stringify(object));
  let result = newObject;
  if (pathString !== "") {
    let path = pathString.split("/");
    path.forEach((index) => {
      result = result[index];
    });
  }
  delete result[key];
  return newObject;
};

export const changeKey = (object, oldKey, newKey) => {
  const keys = Object.keys(object);
  let updatedKey = newKey;
  if (keys.includes(newKey)) {
    updatedKey = `_${newKey}`;
  }
  const result = {};
  keys.map((key) =>
    key !== oldKey
      ? (result[key] = object[key])
      : (result[updatedKey] = object[key])
  );
  return result;
};

export const changeKeyByIndex = (object, index, newKey) => {
  const oldkey = Object.keys(object)[index];
  return changeKey(object, oldkey, newKey);
};

export const updateKeyOfObject = (object, pathString, index, newKey) => {
  let newObject = JSON.parse(JSON.stringify(object));
  let result = newObject;
  if (pathString !== "") {
    let path = pathString.split("/");
    let finalKey = path.pop();
    path.forEach((index) => {
      result = result[index];
    });
    result[finalKey] = changeKeyByIndex(result[finalKey], index, newKey);
    return newObject;
  } else {
    let newResult = changeKeyByIndex(result, index, newKey);
    return newResult;
  }
};

export const newKey = (object) => {
  let start = 0;
  const keys = Object.keys(object);
  do {
    start++;
  } while (keys.includes(`Key_${start}`));
  return `Key_${start}`;
};

export const convertToValue = (object, pathString, key) => {
  return updateObject(object, pathString, key, "");
};

export const convertToArray = (object, pathString, key) => {
  return updateObject(object, pathString, key, [""]);
};

export const convertToObject = (object, pathString, key) => {
  return updateObject(object, pathString, key, { Key_1: "" });
};
