import { useState } from "react";
import {
  SingleInput,
  Input,
  DisplayRow,
  DisplayBox,
  DisplayFieldLabel,
  Radio,
} from "./App.jsx";
import {
  singleChange,
  objectChange,
  collectionChange,
  tableChange,
  objectInCollectionChange,
  objectInTableChange,
  tableInCollectionChange,
} from "./uiscript.js";
import {
  addToArray,
  addToObject,
  updateObject,
  removeFromObject,
  removeFromArray,
} from "./objects.js";

const useData = (defaults) => {
  const [data, setdata] = useState(defaults);
  const reset = () => setdata(defaults);
  const changeData = (path, value) => {
    setdata((prevdata) => updateObject(prevdata, path, value));
  };
  const addItemtoArray = (path, item) => {
    setdata((prevdata) => addToArray(prevdata, path, item));
  };
  const addItemtoObject = (path, key, item) => {
    setdata((prevdata) => addToObject(prevdata, path, key, item));
  };
  const deleteItemfromArray = (path, index) => {
    setdata((prevdata) => removeFromArray(prevdata, path, index));
  };
  const deleteItemfromObject = (path, key) => {
    setdata((prevdata) => removeFromObject(prevdata, path, key));
  };

  return {
    data,
    reset,
    changeData,
    addItemtoArray,
    addItemtoObject,
    deleteItemfromArray,
    deleteItemfromObject,
  };
};

export default useData;
