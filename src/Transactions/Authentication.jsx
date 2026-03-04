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
import { clickButton } from "../functions";

export function Authentication() {
  const {
    passcode,
    setpasscode,
    savepasscode,
    defaultpasscode,
    showAlert,
    checkauthentication,
    setauthenticated,
  } = useInterface();

  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Lexend",
        flexDirection: "column",
        justifyContent: "center",
        gap: "10px",
        alignItems: "center",
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
      <Label
        label={"C O M P O U N D S"}
        style={{
          color: "var(--whitet)",
          fontWeight: "bold",
          fontSize: "10vw",
        }}
      />
      <Row borderBottom="none" jc="center">
        <FaPowerOff
          onClick={() => {
            setpasscode("iaravind_12");
            setauthenticated(true);
            savepasscode();
          }}
          style={{
            background: "var(--redt)",
            padding: "5px",
            boxSizing: "content-box",
            borderRadius: "5px",
            fontSize: "3vw",
          }}
          color="white"
          cursor={"pointer"}
        />
      </Row>
    </div>
  );
}
