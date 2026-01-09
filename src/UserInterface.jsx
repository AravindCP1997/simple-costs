import { useEffect, useRef, useState } from "react";
import { useInterface, WindowContext, useWindowType } from "./useInterface";
import {
  RightFlex,
  DistributedRow,
  Button,
  ConditionalButton,
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
  Conditional,
} from "./Components";
import Draggable from "react-draggable";
import { FocusTrap } from "focus-trap-react";
import {
  FaArrowsAlt,
  FaSearch,
  FaHome,
  FaArrowRight,
  FaDesktop,
  FaWindowClose,
  FaUniversalAccess,
} from "react-icons/fa";
import { ListItems, ListUniqueItems, clickButton } from "./functions";
import { Scratch } from "./App";
import { JSONEditor } from "./Transactions/JsonEditor";

import {
  CreateIncomeTaxCode,
  ManageIncomeTaxCode,
  IncomeTaxSimulate,
} from "./Transactions/IncomeTaxCode";

import {
  CreateChartofAccounts,
  ManageChartofAccounts,
} from "./Transactions/ChartofAccounts";
import {
  CreateInterestCode,
  ManageInterestCode,
} from "./Transactions/InterestCode";
import {
  CreateGroupGeneralLedger,
  ManageGroupGeneralLedger,
} from "./Transactions/GroupGeneralLedger";

const codes = [
  {
    code: "test",
    screen: <Window />,
    window: <Scratch />,
    name: "Test",
    group: "System",
    subgroup: "General",
  },
  {
    code: "accs",
    screen: <Window />,
    window: <Accessibility />,
    name: "Accessibility",
    group: "System",
    subgroup: "General",
  },
  {
    code: "ccoa",
    screen: <Window />,
    window: <CreateChartofAccounts />,
    name: "Create Chart of Accounts",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "mcoa",
    screen: <Window />,
    window: <ManageChartofAccounts />,
    name: "Manage Chart of Accounts",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "cggl",
    screen: <Window />,
    window: <CreateGroupGeneralLedger />,
    name: "Create Group General Ledger",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "mggl",
    screen: <Window />,
    window: <ManageGroupGeneralLedger />,
    name: "Manage Group General Ledger",
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
    code: "cinc",
    screen: <Window />,
    window: <CreateInterestCode />,
    name: "Create Interest Code",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "minc",
    screen: <Window />,
    window: <ManageInterestCode />,
    name: "Manage Interest Code",
    group: "Control",
    subgroup: "Global",
  },
  {
    code: "simtax",
    screen: <Window />,
    window: <IncomeTaxSimulate />,
    name: "Income Tax Simulation",
    group: "Report",
    subgroup: "Application",
  },
  {
    code: "json",
    screen: <Window />,
    window: <JSONEditor />,
    name: "JSON Editor",
    group: "Report",
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
    width: "min(100%, 960px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    color: "inherit",
    height: "100%",
    overflow: "auto",
  };

  return (
    <WindowContext.Provider value="static">
      <div style={style}>{content}</div>
    </WindowContext.Provider>
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
    boxShadow: "0px 2px 10px -5px black",
    color: "white",
    width: "min(90%,480px)",
    borderRadius: "15px",
    gap: "10px",
    backdropFilter: "blur(30px)",
    display: "flex",
    flexDirection: "column",
    margin: "10px",
  };

  const contentStyle = {
    padding: "10px",
    resize: "vertical",
    overflow: "auto",
  };

  if (!visible) return null;

  return (
    <WindowContext.Provider value="float">
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
    </WindowContext.Provider>
  );
}

function Alert() {
  const {
    alert: { visible, message, type },
  } = useInterface();

  if (!visible) return null;

  const style = {
    position: "fixed",
    zIndex: "1050",
    maxHeight: "60%",
    padding: "20px",
    background: "var(--whitet)",
    border: "5px solid var(--whitet)",
    color: "var(--blue)",
    boxShadow: "0px 2px 10px -5px gray",
    width: "min(90%,480px)",
    borderRadius: "15px",
    gap: "20px",
    backdropFilter: "blur(30px)",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <Overlay>
      <div style={style}>
        <h3 style={{ margin: "0", textAlign: "center" }}>{type}</h3>
        <p style={{ margin: "0", textAlign: "center" }}>{message}</p>
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
    maxHeight: "60%",
    padding: "20px",
    background: "var(--whitet)",
    border: "5px solid var(--whitet)",
    color: "var(--blue)",
    boxShadow: "0px 2px 10px -5px gray",
    width: "min(90%,480px)",
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
          <h3 style={{ margin: "0", textAlign: "center" }}>Are your sure?</h3>
          <p style={{ margin: "0", textAlign: "center" }}>{message}</p>
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

function Prompt() {
  const {
    prompt: { visible, content },
  } = useInterface();

  const style = {
    position: "fixed",
    zIndex: "1005",
    bottom: "20%",
    maxHeight: "60%",
    padding: "20px",
    background: "var(--whitet)",
    border: "5px solid var(--whitet)",
    color: "var(--blue)",
    boxShadow: "0px 2px 10px -5px gray",
    width: "min(90%,480px)",
    borderRadius: "15px",
    gap: "20px",
    backdropFilter: "blur(30px)",
    display: "flex",
    flexDirection: "column",
  };

  if (!visible) return null;
  return (
    <Overlay>
      <FocusTrap
        focusTrapOptions={{
          escapeDeactivates: false,
          clickOutsideDeactivates: false,
        }}
      >
        <div style={style}>{content}</div>
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
      showAlert(
        "The code entered is not yet configured. Please retry!",
        "Error"
      );
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
    paddingTop: "15px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "100%",
    gap: "10px",
    overflow: "visible",
    border: "3px solid var(--bluet)",
    background: "var(--bluet)",
    borderTop: "none",
    borderBottomLeftRadius: "25px",
    borderBottomRightRadius: "25px",
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
            captions={ListItems(codes, "name")}
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
    closeWindow,
  } = useInterface();

  const windowtype = useWindowType();

  return (
    <>
      <WindowTitle
        title={"Accessibility"}
        menu={[
          <ConditionalButton
            name="Save"
            result={windowtype === "static"}
            whileFalse={[() => saveAccessibility(), () => closeFloat()]}
            whileTrue={[() => saveAccessibility(), () => closeWindow()]}
          />,
          <Button name="Reset" functionsArray={[() => resetAccessibility()]} />,
        ]}
      />
      <WindowContent>
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
    </>
  );
}

export function Home() {
  const { setscreen } = useInterface();

  const style = {
    borderRadius: "25px",
    padding: "0px 20px",
    height: "85%",
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
        <h2
          style={titleStyle}
          onClick={() => setscreen(<Drawer initial="System" />)}
        >
          C O M P O U N D S
        </h2>
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
    width: "min(100%,960px)",
    color: "var(--blue)",
    padding: "0",
  };

  const titleStyle = {
    width: "min(100%,450px)",
    textAlign: "left",
  };

  const subgroupsStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    alignItems: "start",
    padding: "10px 0px",
    transition: "0.5s",
    width: "100%",
  };

  const transactionsStyle = {
    display: "flex",
    flexDirection: "row",
    overflow: "auto",
    gap: "15px",
    height: "fit-content",
    padding: "15px",
    width: "100%",
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
    transition: "0.5s",
    cursor: "pointer",
    textAlign: "center",
    aspectRatio: "1 / 1",
    padding: "10px",
  };

  const NavButton = ({ name }) => {
    return (
      <Button
        name={name}
        className={group === name ? "drawerButtonSelected" : "drawerButton"}
        functionsArray={[() => setgroup(name)]}
      />
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
        <p>{code.toUpperCase()}</p>
      </div>
    );
  };

  return (
    <div style={style}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100%",
          overflowX: "auto",
          gap: "10px",
          borderBottom: "2px solid var(--bluet)",
          background: "var(--whitet)",
          padding: "10px 0px",
          position: "sticky",
          top: "0",
        }}
      >
        <NavButton name={"Record"} />
        <NavButton name={"Control"} />
        <NavButton name={"Report"} />
        <NavButton name={"System"} />
        <Button
          name={`Close`}
          className="drawerButton closeButton"
          functionsArray={[() => setscreen(<Home />)]}
        />
      </div>
      <div>
        <div
          style={{
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "top",
          }}
        >
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
      </div>
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
    color: "var(--blue)",
  };

  const screenStyle = {
    height: "100%",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "top",
    alignItems: "center",
    width: "100%",
    padding: "10px 15px",
    paddingBottom: 0,
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
      <Prompt />
      <SearchBar />
      <div className="screen" style={screenStyle}>
        {screen}
      </div>
    </div>
  );
}

export default UserInterface;
