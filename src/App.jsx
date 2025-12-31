import "./App.css";
import { UserInterfaceProvider } from "./useInterface";
import { LocalStorage, Dictionary, Collection } from "./Database";
import { Button, CollapsingDisplay } from "./Components";
import UserInterface from "./UserInterface";

export function Scratch() {
  return (
    <div>
      <CollapsingDisplay title={"Hello"}>
        <p>Sample Paragraph</p>
      </CollapsingDisplay>
    </div>
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
