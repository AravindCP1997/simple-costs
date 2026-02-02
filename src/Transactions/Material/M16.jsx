import { useEffect, useState } from "react";
import useData from "../../useData";
import { useInterface } from "../../useInterface";
import { useError } from "../../useError";
import {
  AutoSuggestInput,
  Button,
  Column,
  ConditionalButton,
  DisplayArea,
  Input,
  Label,
  MultiDisplayArea,
  Option,
  PsuedoButton,
  Row,
  Table,
  WindowContent,
  WindowTitle,
} from "../../Components";
import { Company, Material } from "../../classes";
import { isPositive, perform, transformObject } from "../../functions";

export function MaterialIssueSTO() {
  const defaults = {
    CompanyCode: "",
    ValueDate: "",
    MatYear: "",
    Location: "",
    STO: "",
    Items: [],
  };
  const {
    data,
    processed,
    changeData,
    deleteItemfromArray,
    addItemtoArray,
    reset,
  } = useData(defaults);
  const { showAlert, openWindow } = useInterface();
  const { errorsExist, DisplayHidingError, clearErrors, addError } = useError();
  const { CompanyCode, ValueDate, Location, Items, STO, MatYear } = processed;
  const company = new Company(CompanyCode);
  const md = company.materialdocument("", MatYear);
  const location = company.location(Location);
  const matData = transformObject(
    processed,
    ["ValueDate"],
    [
      ["CompanyCode", "Company"],
      ["MatYear", "Year"],
    ],
    {
      Movements: [],
    },
  );
  perform(() => {
    perform(
      () => {
        processed.MatYear = company.year(ValueDate);
      },
      company.exists() && ValueDate !== "",
    );
    Items.forEach((item, i) => {
      const { MaterialCode, Quantity, Rate, Block } = item;

      const material = company.material(MaterialCode);
      perform(() => {
        item.Description = material.group().getData().Description;
        item.Balance = location
          .materialBlock(MaterialCode, Block)
          .balance(ValueDate);
        item.Rate = location.materialBlock(MaterialCode, Block).rate(ValueDate);
      }, material.exists());
      perform(() => {
        item.Value = Quantity * item.Rate;
      }, isPositive(Quantity));
      matData.Movements.push(
        ...[
          transformObject(
            item,
            ["MaterialCode", "Rate", "Value"],
            [
              ["Remarks", "Text"],
              ["STO", "StockTransportOrder"],
              ["No", "Item"],
            ],
            {
              MovementType: "16",
              Block: "In Transit",
              Quantity: Number(item.Quantity),
              No: i + 1,
            },
          ),
          transformObject(
            item,
            ["MaterialCode", "Rate", "Value", "Block"],
            [["Remarks", "Text"]],
            {
              LocationCode: Location,
              MovementType: "16",
              Quantity: -Number(item.Quantity),
            },
          ),
        ],
      );
    });
  });
  useEffect(() => {
    clearErrors();
    addError(!company.exists(), "Company", "Company does not exist.");
    addError(!location.exists(), "Location", "Location does not exist.");
    addError(
      company.exists() && !company.openperiods.materialOpen(ValueDate),
      "ValueDate",
      "Value Date not open.",
    );
    Items.forEach((item, i) => {
      const { Quantity, MaterialCode, Block } = item;
      const material = company.material(MaterialCode);
      addError(
        !material.exists(),
        `Items/${i + 1}`,
        "Material does not exist.",
      );
      addError(
        Quantity === "" || Quantity <= 0,
        `Items/${i + 1}`,
        "Quantity shall be positive value.",
      );
      addError(
        material.exists() &&
          location.materialBlock(MaterialCode, Block).balance() < Quantity,
        `Items/${i + 1}`,
        "Material quantity in block in location less than the quantity specified.",
      );
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Material Issue Against STO"}
        menu={[
          <ConditionalButton
            name={"Post"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check!")]}
            whileTrue={[
              () => {
                const { DocumentNo: matDocNo } = md.add(matData);
                showAlert(`Post Success!
                    Material Document: ${matDocNo}`);
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
              suggestions={company.listAll("Code")}
              captions={company.listAll("Name")}
              placeholder={"Company Code"}
            />
          </Row>
          <Row overflow="visible">
            <Label label={"Location"} />
            <AutoSuggestInput
              value={Location}
              process={(value) => changeData("", "Location", value)}
              suggestions={company
                .location(Location)
                .listAllFromCompany("Code")}
              captions={company
                .location(Location)
                .listAllFromCompany("Description")}
              placeholder={"Location"}
            />
          </Row>
          <Row>
            <Label label={"Value Date"} />
            <Input
              value={ValueDate}
              process={(value) => changeData("", "ValueDate", value)}
              type="date"
            />
          </Row>
          <Row>
            <Label label={"Material Year"} />
            <label>{MatYear}</label>
          </Row>
          <Column>
            <Row jc="left" borderBottom="none">
              <Label label={"Materials"} />
            </Row>
            <Row overflow="visible" jc="left">
              <Label label={"Stock Transport Order"} />
              <AutoSuggestInput
                value={STO}
                process={(value) => changeData("", "STO", value)}
                suggestions={company.sto(STO).listAllFromCompany("Code")}
                captions={company.sto(STO).listAllFromCompany("Description")}
                placeholder={"Stock Transport Order"}
              />
              <ConditionalButton
                name={"Get"}
                result={location.exists() && company.sto(STO).exists()}
                whileFalse={[
                  () => showAlert("Stock Transport Order does not exist."),
                ]}
                whileTrue={[
                  () =>
                    changeData(
                      "",
                      "Items",
                      company
                        .sto(STO)
                        .undispatchedByLocation(Location)
                        .map((item, i) =>
                          transformObject(
                            item,
                            ["MaterialCode"],
                            [["Undispatched", "Quantity"]],
                            {
                              Remarks: "",
                              Block: "Free",
                              Balance: "",
                            },
                          ),
                        ),
                    ),
                  () => changeData("", "STO", ""),
                  () => showAlert("Data Imported"),
                ]}
              />
            </Row>
            <Table
              columns={[
                "STO",
                "No",
                "Material",
                "Description",
                "Quantity",
                "Block",
                "InBlock",
                "Rate",
                "Value",
                "Remarks",
                "",
              ]}
              rows={Items.map((item, i) => [
                <label>{item.STO}</label>,
                <label>{i + 1}</label>,
                <label>{item.MaterialCode}</label>,
                <label>{item.Description}</label>,
                <Input
                  value={item.Quantity}
                  process={(value) =>
                    changeData(`Items/${i}`, "Quantity", value)
                  }
                  type="number"
                />,
                <Option
                  value={item.Block}
                  process={(value) => changeData(`Items/${i}`, "Block", value)}
                  options={["Free", "Reserved"]}
                />,
                <label>{item.Balance}</label>,
                <label>{item.Rate}</label>,
                <label>{item.Value}</label>,
                <Input
                  value={item.Remarks}
                  process={(value) =>
                    changeData(`Items/${i}`, "Remarks", value)
                  }
                  type="text"
                />,
                <PsuedoButton
                  name={""}
                  onClick={() => deleteItemfromArray(`Items`, i)}
                />,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
