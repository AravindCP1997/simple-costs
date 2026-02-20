import { useEffect, useState } from "react";
import {
  Label,
  Input,
  Option,
  Radio,
  CheckBox,
  Button,
  ConditionalButton,
  WindowTitle,
  WindowContent,
  DisplayArea,
  Row,
  Column,
  Table,
  AutoSuggestInput,
  HidingDisplay,
  Conditional,
  MultiDisplayArea,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import { FaInstagram, FaPowerOff, FaSignInAlt } from "react-icons/fa";

export function Authentication() {
  const {
    passcode,
    setpasscode,
    savepasscode,
    defaultpasscode,
    showAlert,
    checkauthentication,
  } = useInterface();

  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Lexend",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        background: "var(--grayt)",
        color: "white",
        backgroundImage: `url('../Favicon.png')`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <Label
        label={"Authentication"}
        style={{ fontWeight: "bold", textAlign: "center" }}
      />
      <Row borderBottom="none" jc="center">
        <Input
          value={passcode}
          process={(value) => setpasscode(value)}
          placeholder="Enter Passcode"
          type={"password"}
        />
        <ConditionalButton
          name={"Enter"}
          result={passcode === defaultpasscode}
          whileTrue={[
            () => savepasscode(),
            () => checkauthentication(),
            () => setpasscode(""),
          ]}
          whileFalse={[() => showAlert("Incorrect Passcode. Please retry")]}
        />
      </Row>
      <div
        style={{
          position: "fixed",
          bottom: "15px",
          right: "10px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "calc(100% - 20px)",
        }}
      >
        <Label
          label={"C O M P O U N D S"}
          style={{
            color: "white",
            background: "var(--redt)",
          }}
        />
        <Row jc="right" borderBottom="none" width="fit-content">
          <label
            style={{
              width: "fit-content",
              textAlign: "right",
              opacity: "0.5",
              margin: "0",
              padding: "5px 2px",
            }}
          >
            20 02 2026
          </label>
        </Row>
      </div>
    </div>
  );
}
