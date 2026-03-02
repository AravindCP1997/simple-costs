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
  HidingPrompt,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import {
  Company,
  CompanyCollection,
  CostingDocument,
  Currencies,
  GeneralLedger,
  ProcessCostingDocument,
} from "../classes";
import { isPositive, noop, transformObject } from "../functions";
import { Collection } from "../Database";

export function CostTransfer() {
  const { openWindow, showAlert } = useInterface();
  const {
    data,
    setdata,
    reset,
    changeData,
    addItemtoArray,
    deleteItemfromArray,
  } = useData({
    CompanyCode: "",
    PostingDate: "",
    Text: "",
    Transfers: [
      {
        Element: "",
        FromObjectType: "CostCenter",
        FromObject: "",
        ToObjectType: "CostCenter",
        ToObject: "",
        From: "",
        To: "",
        Amount: "",
      },
    ],
    Currency: "",
    ExchangeRate: 1,
  });
  const { CompanyCode, PostingDate, Text, Currency, Transfers, ExchangeRate } =
    data;
  const costData = {
    Company: CompanyCode,
    PostingDate,
    Currency,
    ExchangeRate,
    Text,
    Entries: [
      ...Transfers.map((item, i) =>
        transformObject(
          item,
          ["Element", "From", "To", "Amount"],
          [
            ["ToObjectType", "ObjectType"],
            ["ToObject", "Object"],
          ],
        ),
      ),
      ...Transfers.map((item, i) =>
        transformObject(
          item,
          ["Element", "From", "To"],
          [
            ["FromObjectType", "ObjectType"],
            ["FromObject", "Object"],
          ],
          { Amount: -Number(item.Amount) },
        ),
      ),
    ],
  };
  const processor = new ProcessCostingDocument(costData, CompanyCode);
  const { addError, clearErrors, DisplayHidingError, errorsExist } = useError();
  useEffect(() => {
    clearErrors();
    const company = new Company(CompanyCode);
    addError(!company.exists(), "CompanyCode", "Company does not exist.");
    addError(
      PostingDate === "",
      "PostingDate",
      "Posting Date cannot be blank.",
    );
    addError(
      !company.openperiods.costingOpen(PostingDate),
      "PostingDate",
      "Posting Date not open for Costing.",
    );
    addError(
      !Currencies.currencyExists(Currency),
      "Currency",
      "Currency does not exist.",
    );
    Transfers.forEach((transfer, t) => {
      const {
        Element,
        FromObject,
        FromObjectType,
        ToObject,
        ToObjectType,
        From,
        To,
        Amount,
      } = transfer;
      const path = `Transfers/${t + 1}`;
      addError(!company.gl(Element).exists(), path, "Element does not exist.");
      addError(
        !company.collection(FromObjectType).exists({ Code: FromObject }),
        path,
        `From ${FromObjectType} does not exist.`,
      );
      addError(
        !company.collection(ToObjectType).exists({ Code: ToObject }),
        path,
        `To ${ToObjectType} does not exist.`,
      );
      addError(!isPositive(Amount), path, "Amount shall be positive.");
      addError(From === "" || To === "" || From > To, path, "Period invalid.");
    });
  }, [data]);
  return (
    <>
      <WindowTitle
        title={"Cost Transfer"}
        menu={[
          <ConditionalButton
            name={"Post"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check.")]}
            whileTrue={[
              () => {
                const { DocumentNo } = processor.add();
                showAlert(`Post Success, Costing Document ${DocumentNo}`);
                reset();
              },
            ]}
          />,
          <DisplayHidingError />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row overflow="visible">
            <Label label={"Company"} />
            <AutoSuggestInput
              value={CompanyCode}
              process={(value) => changeData("", "CompanyCode", value)}
              suggestions={new Collection("Company").listAll("Code")}
              captions={new Collection("Company").listAll("Name")}
              placeholder={"Company Code"}
            />
          </Row>
          <Row>
            <Label label={"Posting Date"} />
            <Input
              value={PostingDate}
              process={(value) => changeData("", "PostingDate", value)}
              type={"date"}
            />
          </Row>{" "}
          <Row overflow="visible">
            <Label label={"Currency"} />
            <AutoSuggestInput
              value={Currency}
              process={(value) => changeData("", "Currency", value)}
              suggestions={Currencies.list()}
            />
          </Row>
          <Row>
            <Label label={"Exchange Rate"} />
            <Input
              value={ExchangeRate}
              process={(value) => changeData("", "ExchangeRate", value)}
              type={"number"}
            />
          </Row>
          <Row>
            <Label label={"Text"} />
            <Input
              value={Text}
              process={(value) => changeData("", "Text", value)}
              type={"text"}
            />
          </Row>
          <Column>
            <Row borderBottom="none" jc="left">
              <Label label={"Transfers"} />
              <Button
                name={"Add"}
                functionsArray={[
                  () =>
                    addItemtoArray("Transfers", {
                      Element: "",
                      FromObjectType: "CostCenter",
                      FromObject: "",
                      ToObjectType: "CostCenter",
                      ToObject: "",
                      From: "",
                      To: "",
                      Amount: "",
                    }),
                ]}
              />
            </Row>
            <Table
              columns={[
                "Element",
                "From Object Type",
                "From Object",
                "To Object Type",
                "To Object",
                "From",
                "To",
                "Amount",
                "",
              ]}
              rows={Transfers.map((item, i) => [
                <AutoSuggestInput
                  value={item.Element}
                  process={(value) =>
                    changeData(`Transfers/${i}`, "Element", value)
                  }
                  suggestions={new CompanyCollection(
                    CompanyCode,
                    "GeneralLedger",
                  ).listAll("Code")}
                  captions={new CompanyCollection(
                    CompanyCode,
                    "GeneralLedger",
                  ).listAll("Description")}
                  placeholder={"General Ledger"}
                />,
                <Option
                  value={item.FromObjectType}
                  process={(value) =>
                    changeData(`Transfers/${i}`, "FromObjectType", value)
                  }
                  options={[
                    "Asset",
                    "CostCenter",
                    "Employee",
                    "Location",
                    "Plant",
                    "RevenueCenter",
                  ]}
                />,
                <AutoSuggestInput
                  value={item.FromObject}
                  process={(value) =>
                    changeData(`Transfers/${i}`, "FromObject", value)
                  }
                  suggestions={new CompanyCollection(
                    CompanyCode,
                    item.FromObjectType,
                  ).listAll("Code")}
                  captions={new CompanyCollection(
                    CompanyCode,
                    item.FromObjectType,
                  ).listAll("Description")}
                  placeholder={item.FromObjectType}
                />,
                <Option
                  value={item.ToObjectType}
                  process={(value) =>
                    changeData(`Transfers/${i}`, "ToObjectType", value)
                  }
                  options={[
                    "Asset",
                    "CostCenter",
                    "Employee",
                    "Location",
                    "Plant",
                    "RevenueCenter",
                  ]}
                />,
                <AutoSuggestInput
                  value={item.ToObject}
                  process={(value) =>
                    changeData(`Transfers/${i}`, "ToObject", value)
                  }
                  suggestions={new CompanyCollection(
                    CompanyCode,
                    item.ToObjectType,
                  ).listAll("Code")}
                  captions={new CompanyCollection(
                    CompanyCode,
                    item.ToObjectType,
                  ).listAll("Description")}
                  placeholder={item.ToObjectType}
                />,
                <Input
                  value={item.From}
                  process={(value) =>
                    changeData(`Transfers/${i}`, "From", value)
                  }
                  type={"date"}
                />,
                <Input
                  value={item.To}
                  process={(value) => changeData(`Transfers/${i}`, "To", value)}
                  type={"date"}
                />,
                <Input
                  value={item.Amount}
                  process={(value) =>
                    changeData(`Transfers/${i}`, "Amount", value)
                  }
                  type={"number"}
                />,
                <Button
                  name={"-"}
                  functionsArray={[() => deleteItemfromArray("Transfers", i)]}
                />,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
