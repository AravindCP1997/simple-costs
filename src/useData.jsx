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
  updateKeyOfObject,
  convertToArray,
  convertToValue,
  convertToObject,
} from "./objects.js";

const useData = (defaults) => {
  const [data, setdata] = useState(defaults);
  const reset = () => setdata(defaults);
  const changeData = (path, key, value) => {
    setdata((prevdata) => updateObject(prevdata, path, key, value));
  };
  const addItemtoArray = (path, item) => {
    setdata((prevdata) => addToArray(prevdata, path, item));
  };
  const addItemtoObject = (path, item) => {
    setdata((prevdata) => addToObject(prevdata, path, item));
  };
  const deleteItemfromArray = (path, index) => {
    setdata((prevdata) => removeFromArray(prevdata, path, index));
  };
  const deleteItemfromObject = (path, key) => {
    setdata((prevdata) => removeFromObject(prevdata, path, key));
  };
  const updateKey = (path, index, newKey) => {
    setdata((prevdata) => updateKeyOfObject(prevdata, path, index, newKey));
  };
  const convertAsValue = (path, key) => {
    setdata((prevdata) => convertToValue(prevdata, path, key));
  };
  const convertAsArray = (path, key) => {
    setdata((prevdata) => convertToArray(prevdata, path, key));
  };
  const convertAsObject = (path, key) => {
    setdata((prevdata) => convertToObject(prevdata, path, key));
  };

  return {
    data,
    reset,
    changeData,
    addItemtoArray,
    addItemtoObject,
    deleteItemfromArray,
    deleteItemfromObject,
    updateKey,
    convertAsArray,
    convertAsObject,
    convertAsValue,
  };
};

export default useData;
