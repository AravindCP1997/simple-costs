export const validateSubmit = (errors, onSuccess, onError) => {
  if (errors.length > 0) {
    onError.forEach((func) => {
      func();
    });
  } else {
    onSuccess.forEach((func) => {
      func();
    });
  }
};

export const blankError = (data, fields) => {
  const errors = [];
  fields.forEach((field) => {
    if (data[field] === "") {
      errors.push(`${field} cannot be blank.`);
    }
  });
  return errors;
};

export const invalidRangeError = (from, to) => {
  if (from > to) {
    return `'From' cannot be greater than 'To'`;
  }
};

const isOverlapping = (range1, range2) => {
  return !(
    (range1[0] < range2[0] && range1[1] < range2[0]) ||
    (range1[0] > range2[1] && range1[1] > range2[1])
  );
};

export const overlappingError = (array, nameField, fromField, toField) => {
  const errors = [];
  array.forEach((firstitem, i) => {
    array.forEach((seconditem, j) => {
      if (i !== j) {
        if (
          isOverlapping(
            [firstitem[fromField], firstitem[toField]],
            [seconditem[fromField], seconditem[toField]]
          )
        ) {
          errors.push(
            `Overlapping between ${firstitem[nameField]} and ${seconditem[nameField]}.`
          );
        }
      }
    });
  });
  return errors;
};
