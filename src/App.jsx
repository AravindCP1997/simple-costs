import "./App.css";
import { useInterface, UserInterfaceProvider } from "./useInterface";
import { LocalStorage, Dictionary, Collection } from "./Database";
import {
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
      <WindowTitle title={"Test Page"} />
      <WindowContent>
        <Button
          name="Clear Storage"
          functionsArray={[
            () => localStorage.clear(),
            () => showAlert("Cleared!", "Storage"),
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
