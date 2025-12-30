import { createContext, useContext, useState, useRef } from "react";
import accessibilityData from "./accessibility.js";
import { updateObject } from "./objects.js";
import { Home, Window, Drawer } from "./UserInterface.jsx";

const UserInterfaceContext = createContext({});

export const useInterface = () => useContext(UserInterfaceContext);

export const UserInterfaceProvider = ({ children }) => {
  const [screen, setscreen] = useState(<Home />);
  const [window, setwindow] = useState({ visible: false, content: null });
  const openWindow = (content) => {
    setscreen(<Window />);
    setwindow({ visible: true, content });
  };
  const closeWindow = () => {
    setwindow({ visible: true, content: null });
    setscreen(<Drawer />);
  };

  const [alert, setalert] = useState({
    visible: false,
    message: null,
    type: null,
  });

  const closeAlert = () => {
    setalert({ visible: false, message: null, type: null });
  };

  const showAlert = (message, type = "Info") => {
    setalert({ visible: true, message, type });
    setTimeout(() => closeAlert(), 1500);
  };

  const [floatingwindow, setfloatingwindow] = useState({
    visible: false,
    window: null,
  });

  const openFloat = (window) => {
    setfloatingwindow({ visible: true, window });
  };

  const closeFloat = () => {
    setfloatingwindow({ visible: false, window: null });
  };

  const [confirm, setconfirm] = useState({
    visible: false,
    message: null,
    onCancel: [],
    onConfirm: [],
  });

  const openConfirm = (message, onCancel = [], onConfirm = []) => {
    setconfirm({ visible: true, message, onCancel, onConfirm });
  };

  const closeConfirm = () => {
    setconfirm({ visible: false, message: null, onCancel: [], onConfirm: [] });
  };

  const [accessibility, setaccessibility] = useState(accessibilityData.read());

  const changeAccessibility = (field, value) => {
    setaccessibility((prevdata) => updateObject(prevdata, "", field, value));
  };

  const resetAccessibility = () => {
    setaccessibility(accessibilityData.read());
  };

  const saveAccessibility = () => {
    accessibilityData.save(accessibility);
  };

  const keyRefs = useRef({});

  const addRef = (key, element) => {
    keyRefs.current[key] = element;
  };

  const UserInterfaceContextValue = {
    screen,
    setscreen,
    window,
    setwindow,
    openWindow,
    closeWindow,
    floatingwindow,
    setfloatingwindow,
    openFloat,
    closeFloat,
    alert,
    setalert,
    showAlert,
    closeAlert,
    confirm,
    setconfirm,
    openConfirm,
    closeConfirm,
    accessibility,
    setaccessibility,
    changeAccessibility,
    resetAccessibility,
    saveAccessibility,
    keyRefs,
    addRef,
  };

  return (
    <UserInterfaceContext.Provider value={UserInterfaceContextValue}>
      {children}
    </UserInterfaceContext.Provider>
  );
};
