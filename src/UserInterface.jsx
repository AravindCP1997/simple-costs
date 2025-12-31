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
  CoveredRow,
} from "./Components";
import Draggable from "react-draggable";
import { FocusTrap } from "focus-trap-react";
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
  CreateIncomeTaxCode,
  ManageChartOfAccounts,
  ManageFinancialStatementsCode,
  ManageIncomeTaxCode,
  IncomeTaxSimulate,
  JSONEditor,
} from "./Transactions";
import { CreateChartOfAccounts } from "./Controls";

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
    code: "ccoa",
    screen: <Window />,
    window: <CreateChartOfAccounts />,
    name: "Chart of Accounts",
    group: "Control",
    subgroup: "Global",
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
    addRef,
  } = useInterface();

  if (!visible) {
    return null;
  }

  const style = {
    borderRadius: "20px",
    width: "min(100%, 960px)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    height: "fit-content",
    color: "inherit",
    backdropFilter: "blur(3px)",
    marginBottom: "20px",
  };

  return (
    <div style={style}>
      <Flex>
        <Button
          setRef={(element) => addRef("CloseWindow", element)}
          name={`Back`}
          functionsArray={[() => closeWindow()]}
        />
      </Flex>
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

  const style = {
    position: "fixed",
    zIndex: 999,
    top: "10%",
    maxHeight: "80%",
    padding: "10px",
    background: "var(--bluet)",
    boxShadow: "0px 2px 10px 0px black",
    color: "white",
    width: "min(100%,480px)",
    borderRadius: "15px",
    gap: "10px",
    backdropFilter: "blur(30px)",
    display: "flex",
    flexDirection: "column",
  };

  const contentStyle = {
    padding: "10px",
    resize: "vertical",
    overflow: "auto",
  };

  if (!visible) return null;

  return (
    <Draggable nodeRef={nodeRef} handle=".drag">
      <div style={style} ref={nodeRef}>
        <DistributedRow>
          <button className="drag">
            <FaArrowsAlt />
          </button>
          <button onClick={() => closeFloat()}>&times;</button>
        </DistributedRow>
        <div style={contentStyle} className="floatingWindowContent">
          {window}
        </div>
      </div>
    </Draggable>
  );
}

function Alert() {
  const {
    alert: { visible, message, type },
  } = useInterface();

  if (!visible) return null;

  const style = {
    position: "fixed",
    zIndex: "1010",
    top: "10%",
    maxHeight: "80%",
    padding: "20px",
    background: "var(--blue)",
    color: "white",
    boxShadow: "0px 2px 10px 0px black",
    width: "min(100%,480px)",
    borderRadius: "15px",
    gap: "20px",
    backdropFilter: "blur(30px)",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <Overlay>
      <div style={style}>
        <h2 style={{ margin: "0" }}>{type}</h2>
        <h4 style={{ margin: "0" }}>{message}</h4>
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

  const style = {
    position: "fixed",
    zIndex: "1010",
    top: "10%",
    maxHeight: "80%",
    padding: "20px",
    background: "var(--blue)",
    color: "white",
    boxShadow: "0px 2px 10px 0px black",
    width: "min(100%,480px)",
    borderRadius: "15px",
    gap: "20px",
    backdropFilter: "blur(30px)",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <Overlay>
      <FocusTrap
        focusTrapOptions={{
          escapeDeactivates: false,
          clickOutsideDeactivates: false,
        }}
      >
        <div style={style}>
          <h2 style={{ margin: "0" }}>Are your sure?</h2>
          <h4 style={{ margin: "0" }}>{message}</h4>
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
      </FocusTrap>
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

  const overlayStyle = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };

  const style = {
    padding: "10px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "100%",
    gap: "10px",
    overflow: "visible",
    border: "5px solid var(--whitet)",
    boxShadow: "0px 2px 5px 0px gray",
    borderTop: "none",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
  };

  const searchAreaStyle = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0px 5px",
    borderRadius: "15px",
    gap: "5px",
    background: "white",
    height: "100%",
  };

  const buttonStyle = {
    borderRadius: "50%",
    aspectRatio: "1/1",
  };

  const insideButtonStyle = {
    borderRadius: "50%",
    aspectRatio: "1/1",
    background: "none",
    border: "none",
    color: "var(--bluet)",
    boxShadow: "none",
  };

  return (
    <div style={overlayStyle}>
      <div style={style}>
        <Button
          style={buttonStyle}
          name={<FaHome />}
          functionsArray={[() => setscreen(<Home />)]}
          setRef={(element) => addRef("Home", element)}
        />
        <div className="searchArea" style={searchAreaStyle}>
          <button tabIndex={-1} style={insideButtonStyle}>
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
          style={buttonStyle}
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

  const style = {
    borderRadius: "25px",
    padding: "20px",
    minHeight: "400px",
    maxHeight: "100%",
    overflow: "auto",
    gap: "35px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };

  const titleStyle = {
    borderBottom: "2px solid var(--bluet)",
    width: "min(100%,400px)",
    textAlign: "left",
    cursor: "pointer",
    margin: "0",
    padding: "10px 5px",
    color: "var(--blue)",
  };

  const menusStyle = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  };

  const menuStyle = {
    aspectRatio: "1/1",
    borderRadius: "50%",
    width: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    cursor: "pointer",
    transition: "0.5s",
    padding: "5px",
    color: "white",
  };

  const Menu = ({ name, drawer, color }) => {
    return (
      <div
        className={`menu`}
        style={{
          ...menuStyle,
          ...{
            background: `var(--${color}t)`,
          },
        }}
        tabIndex={0}
        onKeyDown={(e) => clickButton(e)}
        onClick={() => setscreen(<Drawer initial={drawer} />)}
      >
        <h3>{name}</h3>
      </div>
    );
  };
  return (
    <div style={style}>
      <div>
        <h2 style={titleStyle}>C O M P O U N D S</h2>
      </div>
      <div style={menusStyle}>
        <Menu name="Record" color="green" drawer="Record" />
        <Menu name="Control" color="red" drawer="Control" />
        <Menu name="Report" color="blue" drawer="Report" />
      </div>
    </div>
  );
}

export function Drawer({ initial = "Record" }) {
  const [group, setgroup] = useState(initial);
  const { openWindow, setscreen } = useInterface();
  const transactions = codes.filter((code) => code.group === group);
  const subgroups = ListUniqueItems(transactions, "subgroup");
  const transactionsInSubgroup = (subgroup) => {
    return transactions.filter((code) => code.subgroup === subgroup);
  };

  const style = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    gap: "10px",
    padding: "10px",
    width: "min(100%,960px)",
    height: "fit-content",
    color: "var(--blue)",
  };

  const buttonStyle = {
    background: "none",
    boxShadow: "none",
    color: "var(--blue)",
    border: "2px solid transparent",
    transition: "0.5s",
    padding: "10px",
    borderRadius: "10px",
    fontSize: "14px",
  };

  const selectedButtonStyle = {
    ...buttonStyle,
    ...{
      background: "var(--bluet)",
      color: "white",
      border: "2px solid var(--bluet)",
    },
  };

  const titleStyle = {
    width: "min(100%,450px)",
    borderBottom: "2px solid var(--bluet)",
    textAlign: "left",
    padding: "10px",
  };

  const subgroupsStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    alignItems: "start",
    gap: "10px",
    padding: "20px 0px",
    transition: "0.5s",
    borderBottom: "2px solid var(--bluet)",
    width: "100%",
  };

  const transactionsStyle = {
    display: "flex",
    flexDirection: "row",
    overflow: "auto",
    gap: "15px",
    height: "fit-content",
    padding: "15px",
  };

  const iconStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    backdropFilter: "blur(10x)",
    borderRadius: "15px",
    border: "5px solid var(--whitet)",
    boxShadow: "0px 1px 5px 0px var(--gray)",
    transition: "0.5s",
    cursor: "pointer",
    textAlign: "center",
    aspectRatio: "1 / 1",
    padding: "10px",
  };

  const NavButton = ({ name }) => {
    return (
      <button
        className="drawerButton"
        onClick={() => setgroup(name)}
        style={group === name ? selectedButtonStyle : buttonStyle}
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
        style={iconStyle}
      >
        <h4 style={{ width: "120px", margin: "0" }}>{name}</h4>
        <p
          style={{
            background: "var(--goldt)",
            margin: "0",
            fontSize: "80%",
            borderRadius: "5px",
            padding: "5px",
          }}
        >
          {code.toUpperCase()}
        </p>
      </div>
    );
  };

  return (
    <div style={style}>
      <RightFlex>
        <Button name={`&times;`} functionsArray={[() => setscreen(<Home />)]} />
      </RightFlex>
      <CoveredRow>
        <NavButton name={"Record"} />
        <NavButton name={"Control"} />
        <NavButton name={"Report"} />
        <NavButton name={"Application"} />
      </CoveredRow>
      {subgroups.map((subgroup) => (
        <div style={subgroupsStyle}>
          <h4 style={titleStyle}>{subgroup}</h4>
          <div style={transactionsStyle}>
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
    position: "fixed",
    top: "0",
    left: "0",
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    alignItems: "center",
    backgroundSize: "20%",
    backgroundColor: "var(--lightgray)",
    backgroundImage: `url('../${Background}.png')`,
    fontFamily: `${Font},'Arial', Tahoma, Geneva, Verdana, sans-serif`,
  };

  const screenStyle = {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    alignItems: "center",
    overflow: "auto",
    width: "100%",
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
      <div className="screen" style={screenStyle}>
        {screen}
      </div>
    </div>
  );
}

export default UserInterface;
