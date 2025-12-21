import { updateKeyValue, updateIndexValue } from "./functions";

export const clickButton = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.target.click();
  }
};

export const inputChange = (setdata, value) => {
  setdata(value);
};

export const objectValueChange = (setdata, key, value) => {
  setdata((prevdata) => updateKeyValue(prevdata, key, value));
};

export const arrayValueChange = (setdata, index, value) => {
  setdata((prevdata) => updateIndexValue(prevdata, index, value));
};

export const singleChange = (setdata, field, value) => {
  setdata((prevdata) => updateKeyValue(prevdata, field, value));
};

export const objectChange = (setdata, field, subfield, value) => {
  setdata((prevdata) =>
    updateKeyValue(
      prevdata,
      field,
      updateKeyValue(prevdata[field], subfield, value)
    )
  );
};

export const tableChange = (setdata, index, field, value) => {
  setdata((prevdata) =>
    updateIndexValue(
      prevdata,
      index,
      updateKeyValue(prevdata[index], field, value)
    )
  );
};

export const objectInTableChange = (setdata, index, field, subfield, value) => {
  setdata((prevdata) =>
    updateIndexValue(
      prevdata,
      index,
      updateKeyValue(
        prevdata[index],
        field,
        updateKeyValue(prevdata[index][field], subfield, value)
      )
    )
  );
};

export const collectionChange = (setdata, field, index, subfield, value) => {
  setdata((prevdata) =>
    updateKeyValue(
      prevdata,
      field,
      updateIndexValue(
        prevdata[field],
        index,
        updateKeyValue(prevdata[field][index], subfield, value)
      )
    )
  );
};

export const objectInCollectionChange = (
  setdata,
  field,
  index,
  subfield,
  subsubfield,
  value
) => {
  setdata((prevdata) =>
    updateKeyValue(
      prevdata,
      field,
      updateIndexValue(
        prevdata[field],
        index,
        updateKeyValue(
          prevdata[field][index],
          subfield,
          updateKeyValue(prevdata[field][index][subfield], subsubfield, value)
        )
      )
    )
  );
};

export const tableInCollectionChange = (
  setdata,
  field,
  index,
  subfield,
  subindex,
  subsubfield
) => {
  setdata((prevdata) =>
    updateKeyValue(
      prevdata,
      field,
      updateIndexValue(
        prevdata[field],
        index,
        updateKeyValue(
          prevdata[field][index],
          subfield,
          updateIndexValue(
            prevdata[field][index][subfield],
            subindex,
            updateKeyValue(
              prevdata[field][index][subfield][subindex],
              subsubfield,
              value
            )
          )
        )
      )
    )
  );
};
