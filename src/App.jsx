import "./App.css";
import { UserInterfaceProvider } from "./useInterface";
import { LocalStorage, Dictionary, Collection } from "./Database";
import {
  Button,
  CheckBox,
  HidingDisplay,
  ConditionalButton,
  Table,
  TableRow,
  AutoSuggestInput,
  FSGroupInput,
} from "./Components";
import UserInterface from "./UserInterface";

export function Scratch() {
  const passtime = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  function save() {
    new Collection("Sample").save([{ name: "Aravind" }]);
  }

  async function check() {
    save();
    await passtime(3000);
    const result = new Collection("Sample").exists({ name: "Aravind" });
    alert(JSON.stringify(result));
  }

  async function eight() {
    await hello();
    console.log("eight called");
    await passtime(6000);
    console.log("eight seconds passed");
  }

  return (
    <div>
      <Button name={"Async"} functionsArray={[() => check()]} />
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
