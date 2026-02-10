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
import { FaInstagram } from "react-icons/fa";

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
        background: "var(--redt)",
        color: "white",
        backgroundImage: `url('../Favicon.png')`,
        backgroundSize: "90%",
        backgroundRepeat: "no-repeat",
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
          name={"Login"}
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
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "end",
        }}
      >
        <Label
          label={"C O M P O U N D S"}
          style={{
            color: "white",
            background: "var(--bluet)",
            width: "fit-content",
          }}
        />
        <Row jc="left" borderBottom="none">
          <label
            style={{
              width: "100%",
              textAlign: "right",
              opacity: "0.3",
              margin: "0",
              fontSize: "80%",
              padding: "5px 2px",
            }}
          >
            Pilot Ver. 10.02.2026
          </label>
        </Row>
      </div>
    </div>
  );
}
