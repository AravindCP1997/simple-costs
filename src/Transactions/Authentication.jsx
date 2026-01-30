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
      <label style={{ textAlign: "center", opacity: "0.5", fontSize: "80%" }}>
        Use Instagram ID of author.
      </label>

      <div
        style={{
          position: "fixed",
          bottom: "10px",
          left: "5%",
          height: "calc(100% - 20px)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <Label
          label={"C O M P O U N D S"}
          style={{
            color: "white",
            background: "var(--redt)",
            width: "fit-content",
          }}
        />
        <Row jc="left" borderBottom="none">
          <Button
            name={"Clear Data"}
            functionsArray={[
              () => localStorage.clear(),
              () => showAlert("All compounding data cleared."),
            ]}
          />
          <label
            style={{ textAlign: "center", opacity: "0.5", fontSize: "80%" }}
          >
            Last updated 30.01.2026
          </label>
        </Row>
      </div>
    </div>
  );
}
