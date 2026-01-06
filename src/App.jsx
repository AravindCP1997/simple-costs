import "./App.css";
import { useInterface, UserInterfaceProvider } from "./useInterface";
import { LocalStorage, Dictionary, Collection } from "./Database";
import {
  Menu,
  Button,
  CollapsingDisplay,
  WindowTitle,
  WindowContent,
} from "./Components";
import UserInterface from "./UserInterface";

export function Scratch() {
  const { showAlert } = useInterface();
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
        <Button
          name="Clear Storage"
          functionsArray={[
            () => localStorage.clear(),
            () => showAlert("Cleared!", "Storage"),
          ]}
        />
        <Menu
          title={"Sample Menu"}
          menu={[
            <Button name="Sample 1" functionsArray={[() => alert("Sample")]} />,
          ]}
        />
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
