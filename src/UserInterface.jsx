import { useEffect, useRef, useState } from "react";
import { useInterface } from "./useInterface";
import {
  RightFlex,
  DistributedRow,
  Button,
  Overlay,
  Flex,
  CenterFlex,
  TopFlex,
  DisplayArea,
  WindowContent,
  WindowTitle,
  Label,
  Input,
  Option,
  Radio,
  AutoSuggestInput,
} from "./Components";
import Draggable from "react-draggable";
import {
  FaArrowsAlt,
  FaSearch,
  FaHome,
  FaArrowRight,
  FaDesktop,
} from "react-icons/fa";
import { ListItems, ListUniqueItems, clickButton } from "./functions";
import { Scratch } from "./App";
import {
  CreateAsset,
  CreateChartOfAccounts,
  CreateIncomeTaxCode,
  ManageChartOfAccounts,
  ManageFinancialStatementsCode,
  ManageIncomeTaxCode,
  IncomeTaxSimulate,
  JSONEditor,
} from "./Transactions";

const codes = [
  { code: "home", screen: <Home />, window: null },
  {
    code: "sc",
    screen: <Window />,
    window: <Scratch />,
    name: "Scratch",
    group: "Record",
    subgroup: "Scratch",
  },
  {
    code: "casset",
    screen: <Window />,
    window: <CreateAsset />,
    name: "Create Asset",
    group: "Control",
    subgroup: "Asset",
  },
  {
    code: "coa",
    screen: <Window />,
    window: <ManageChartOfAccounts />,
    name: "Chart of Accounts",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "fs",
    screen: <Window />,
    window: <ManageFinancialStatementsCode />,
    name: "Financial Statements",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "citc",
    screen: <Window />,
    window: <CreateIncomeTaxCode />,
    name: "Create Income Tax Code",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "mitc",
    screen: <Window />,
    window: <ManageIncomeTaxCode />,
    name: "Manage Income Tax Code",
    group: "Control",
    subgroup: "Global",
  },

  {
    code: "simtax",
    screen: <Window />,
    window: <IncomeTaxSimulate />,
    name: "Remuneration Tax Simulator",
    group: "Application",
    subgroup: "Application",
  },
  {
    code: "json",
    screen: <Window />,
    window: <JSONEditor initial={[["Aravind"]]} />,
    name: "JSON Editor",
    group: "Application",
    subgroup: "Application",
  },
];

export function Window() {
  const {
    window: { visible, content },
    closeWindow,
  } = useInterface();

  if (!visible) {
    return null;
  }

  return (
    <div className="window">
      <RightFlex>
        <Button name={`&times;`} functionsArray={[() => closeWindow()]} />
      </RightFlex>
      {content}
    </div>
  );
}

function FloatingWindow() {
  const {
    floatingwindow: { visible, window },
    closeFloat,
  } = useInterface();

  const nodeRef = useRef(null);

  if (!visible) return null;

  return (
    <Draggable nodeRef={nodeRef} cancel=".no-drag">
      <div className="floatingWindow" ref={nodeRef}>
        <DistributedRow>
          <FaArrowsAlt />
          <Button name={`&times;`} functionsArray={[() => closeFloat()]} />
        </DistributedRow>
        <div className="floatingWindowContent no-drag">{window}</div>
      </div>
    </Draggable>
  );
}

function Alert() {
  const {
    alert: { visible, message, type },
  } = useInterface();

  if (!visible) return null;

  return (
    <Overlay>
      <div className="alert">
        <h2>{type}</h2>
        <h4>{message}</h4>
      </div>
    </Overlay>
  );
}

function Confirm() {
  const {
    confirm: { visible, message, onCancel, onConfirm },
    closeConfirm,
  } = useInterface();

  if (!visible) return null;

  return (
    <Overlay>
      <div className="confirm">
        <h2>Are your sure?</h2>
        <h4>{message}</h4>
        <CenterFlex>
          <Button
            name="Cancel"
            functionsArray={[...onCancel, () => closeConfirm()]}
          />
          <Button
            name="Confirm"
            functionsArray={[...onConfirm, () => closeConfirm()]}
          />
        </CenterFlex>
      </div>
    </Overlay>
  );
}

function SearchBar() {
  const { showAlert, setscreen, addRef, openWindow, openFloat } =
    useInterface();
  const [code, setcode] = useState("");

  const go = (windowcode) => {
    const result = codes.find((item) => item.code === windowcode.toLowerCase());
    if (result) {
      openWindow(result.window);
    } else {
      showAlert("The code entered is not yet configured. Please retry!");
    }
    setcode("");
  };

  const insideButtonStyle = {
    background: "none",
    border: "none",
    color: "var(--bluet)",
    boxShadow: "none",
  };

  return (
    <div className="searchbarOverlay">
      <div className="searchbar">
        <Button
          name={<FaHome />}
          functionsArray={[() => setscreen(<Home />)]}
          setRef={(element) => addRef("Home", element)}
        />
        <div className="searchArea" style={{ padding: "0px 5px" }}>
          <button style={insideButtonStyle}>
            <FaSearch />
          </button>
          <AutoSuggestInput
            suggestions={ListItems(codes, "code")}
            value={code}
            process={(value) => setcode(value)}
            placeholder="Go to . . ."
            setRef={(element) => addRef("SearchArea", element)}
            onSelect={(value) => go(value)}
          />
          <button style={insideButtonStyle} onClick={() => go(code)}>
            <FaArrowRight />
          </button>
        </div>

        <Button
          name={<FaDesktop />}
          functionsArray={[() => openFloat(<Accessibility />)]}
          setRef={(element) => addRef("Accessibility", element)}
        />
      </div>
    </div>
  );
}

function Accessibility() {
  const {
    accessibility: { Background, Font },
    changeAccessibility,
    resetAccessibility,
    saveAccessibility,
    closeFloat,
  } = useInterface();

  return (
    <WindowContent>
      <WindowTitle title={"Accessibility"} />
      <RightFlex>
        <Button name="Reset" functionsArray={[() => resetAccessibility()]} />
        <Button
          name="Save"
          functionsArray={[() => saveAccessibility(), () => closeFloat()]}
        />
      </RightFlex>
      <DisplayArea>
        <TopFlex>
          <Label label={"Background"} />
          <Radio
            value={Background}
            process={(value) => changeAccessibility("Background", value)}
            options={["Fabric", "Tech"]}
          />
        </TopFlex>
        <TopFlex>
          <Label label={"Font"} />
          <Radio
            value={Font}
            process={(value) => changeAccessibility("Font", value)}
            options={["Helvetica", "Lexend"]}
          />
        </TopFlex>
      </DisplayArea>
    </WindowContent>
  );
}

export function Home() {
  const { setscreen } = useInterface();
  const Menu = ({ name, drawer, color }) => {
    return (
      <div
        className={`menu ${color}`}
        tabIndex={0}
        onKeyDown={(e) => clickButton(e)}
        onClick={() => setscreen(<Drawer initial={drawer} />)}
      >
        <h3>{name}</h3>
      </div>
    );
  };
  return (
    <div className="home">
      <div className="home-title">
        <h2 className="title">C O M P O U N D S</h2>
      </div>
      <div className="home-menu">
        <Menu name="Record" color="green" drawer="Record" />
        <Menu name="Control" color="red" drawer="Control" />
        <Menu name="Report" color="blue" drawer="Report" />
      </div>
    </div>
  );
}

function Drawer({ initial = "Record" }) {
  const [group, setgroup] = useState(initial);
  const { openWindow, setscreen } = useInterface();
  const transactions = codes.filter((code) => code.group === group);
  const subgroups = ListUniqueItems(transactions, "subgroup");
  const transactionsInSubgroup = (subgroup) => {
    return transactions.filter((code) => code.subgroup === subgroup);
  };
  const NavButton = ({ name }) => {
    return (
      <button
        className="drawerNavButton"
        onClick={() => setgroup(name)}
        style={group === "name" ? { fontWeight: "bold" } : {}}
      >
        {name}
      </button>
    );
  };

  const Icon = ({ name, code, window }) => {
    return (
      <div
        className="icon"
        tabIndex={0}
        onKeyDown={(e) => clickButton(e)}
        onClick={() => openWindow(window)}
      >
        <h4>{name}</h4>
        <p>{code.toUpperCase()}</p>
      </div>
    );
  };

  return (
    <div className="drawer">
      <RightFlex>
        <Button name={`&times;`} functionsArray={[() => setscreen(<Home />)]} />
      </RightFlex>
      <DistributedRow>
        <NavButton name={"Record"} />
        <NavButton name={"Control"} />
        <NavButton name={"Report"} />
        <NavButton name={"Application"} />
      </DistributedRow>
      {subgroups.map((subgroup) => (
        <div>
          <h4>{subgroup}</h4>
          <div>
            {transactionsInSubgroup(subgroup).map((transaction) => (
              <Icon
                name={transaction.name}
                code={transaction.code}
                window={transaction.window}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UserInterface() {
  const {
    screen,
    setscreen,
    window,
    floatingwindow,
    accessibility,
    resetAccessibility,
    keyRefs,
  } = useInterface();

  const { Background, Font } = accessibility;

  useEffect(() => resetAccessibility(), [window, floatingwindow]);

  const style = {
    backgroundImage: `url('../${Background}.png')`,
    fontFamily: `${Font},'Arial', Tahoma, Geneva, Verdana, sans-serif`,
  };

  const shortcuts = [
    { key: "h", action: () => keyRefs.current["Home"].click() },
    { key: "g", action: () => keyRefs.current["SearchArea"].focus() },
    { key: "a", action: () => keyRefs.current["Accessibility"].click() },
    { key: "f", action: () => keyRefs.current["CloseFloat"].click() },
  ];
  const keyDownHandler = (e) => {
    if (e.altKey && ListItems(shortcuts, "key").includes(e.key)) {
      e.preventDefault();
      shortcuts.find((shortcut) => shortcut.key === e.key).action();
    }
  };

  return (
    <div
      style={style}
      className="container"
      onKeyDown={(e) => keyDownHandler(e)}
      tabIndex={0}
    >
      <FloatingWindow />
      <Confirm />
      <Alert />
      <SearchBar />
      <div className="innerContainer">{screen}</div>
    </div>
  );
}

export default UserInterface;
