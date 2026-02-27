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
        background: "var(--goldt)",
        color: "white",
        backgroundImage: `url('../Favicon.png')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <Row borderBottom="none" jc="center">
        <Button
          name={"Enter"}
          functionsArray={[
            () => setpasscode("iaravind_12"),
            () => savepasscode(),
            () => checkauthentication(),
          ]}
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
          justifyContent: "right",
          width: "calc(100% - 20px)",
        }}
      >
        <Label
          label={"C O M P O U N D S"}
          style={{
            color: "white",
            background: "var(--bluet)",
          }}
        />
      </div>
    </div>
  );
}
