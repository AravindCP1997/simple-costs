export const updateObject = (object, pathString, value) => {
  let newObject = JSON.parse(JSON.stringify(object));
  let result = newObject;
  let path = pathString.split("/");
  let key = path.pop();
  path.forEach((key) => {
    result = result[key];
  });
  result[key] = value;
  return newObject;
};

export const addToObject = (object, pathString, key, value) => {
  if (pathString !== "") {
    return updateObject(object, `${pathString}/${key}`, value);
  } else {
    return updateObject(object, key, value);
  }
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
