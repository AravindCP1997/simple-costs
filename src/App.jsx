import "./App.css";
import { useInterface, UserInterfaceProvider } from "./useInterface";
import { LocalStorage, Dictionary, Collection } from "./Database";
import {
  Menu,
  Button,
  CollapsingDisplay,
  WindowTitle,
  WindowContent,
  DisplayArea,
  MultiDisplayArea,
  Input,
} from "./Components";
import UserInterface from "./UserInterface";
import { useState } from "react";
import {
  Asset,
  GeneralLedger,
  GroupGeneralLedger,
  ProfitCenter,
  Segments,
} from "./classes";

export function Scratch() {
  const { showAlert } = useInterface();
  const [key, setkey] = useState("");
  const [value, setvalue] = useState("");
  const pc = new ProfitCenter("A", "ABC");
  return (
    <>
      <WindowTitle
        title={"Test Page"}
        menu={[
          <Menu
            title={"Sample Menu"}
            menu={[
              <Button
                name="Sample 1"
                functionsArray={[() => alert("Sample")]}
              />,
            ]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Button
            name="Clear Storage"
            functionsArray={[
              () => localStorage.clear(),
              () => showAlert("Cleared!", "Storage"),
            ]}
          />
          As this project is still in development stage, data structures are
          supposed to change frequently. Error may occur (by browser window
          going blank, prohibiting further interactions), when data existing in
          the user storage do not match with updated data structure. Use the
          'Clear Storage' option, if any such error pops up.
        </DisplayArea>
      </WindowContent>
    </>
  );
}

function App() {
  return (
    <UserInterfaceProvider>
      <UserInterface />
    </UserInterfaceProvider>
  );
}

export default App;
