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
import { Location, Material, MaterialDocument } from "../classes";
import { noop } from "../functions";

export function QueryMaterialDocument() {
  const { data, changeData } = useData({
    Company: "",
    Year: 0,
    DocumentNo: 0,
  });
  const { Company, Year, DocumentNo } = data;
  const { openWindow, showAlert } = useInterface();

  const collection = new MaterialDocument(DocumentNo, Year, Company);

  return (
    <>
      <WindowTitle
        title={"View Material Document"}
        menu={[
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Material Document does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <ViewMaterialDocument data={collection.getData()} />,
                ),
            ]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row overflow="visible">
            <Label label={"Company"} />
            <AutoSuggestInput
              value={Company}
              process={(value) => changeData("", "Company", value)}
              placeholder={"Enter Company Code"}
              suggestions={collection.company.listAll("Code")}
              captions={collection.company.listAll("Name")}
            />
          </Row>
          <Row>
            <Label label={"Year"} />
            <Input
              value={Year}
              process={(value) => changeData("", "Year", value)}
              type={"number"}
            />
          </Row>
          <Row>
            <Label label={"Document Number"} />
            <Input
              value={DocumentNo}
              process={(value) => changeData("", "DocumentNo", value)}
              type={"number"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function ViewMaterialDocument({ data }) {
  const { openWindow } = useInterface();
  const float = useWindowType() === "float";
  const { Company, ValueDate, Year, Text, EntryDate, Reversed, Movements } =
    data;
  return (
    <>
      <WindowTitle
        title={"View Material Document"}
        menu={
          float
            ? []
            : [
                <Button
                  name="Other"
                  functionsArray={[() => openWindow(<QueryMaterialDocument />)]}
                />,
              ]
        }
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Company"} />
            <label>{Company}</label>
          </Row>
          <Row>
            <Label label={"Value Date"} />
            <label>{ValueDate}</label>
          </Row>
          <Row>
            <Label label={"Entry Date"} />
            <label>{EntryDate}</label>
          </Row>
          <Row>
            <Label label={"Year"} />
            <label>{Year}</label>
          </Row>
          <Conditional logic={Reversed}>
            <Row jc="left">
              <Label label={"Reversed"} />
              <CheckBox value={Reversed} />
            </Row>
          </Conditional>
          <Row>
            <Label label={"Text"} />
            <label>{Text}</label>
          </Row>
          <Column>
            <Label label={"Movements"} />
            <Table
              columns={[
                "Movement Type",
                "Material",
                "Material Desc.",
                "Location",
                "Location Desc.",
                "Block",
                "Quantity",
                "Text",
                "Purchase Order",
                "Stock Transport Order",
                "Item",
                "Vendor",
              ]}
              rows={Movements.map((item, i) => [
                <label>{item.MovementType}</label>,
                <label>{item.MaterialCode}</label>,
                <label>
                  {
                    new Material(item.MaterialCode, Company).getData()
                      .Description
                  }
                </label>,
                <label>{item.LocationCode}</label>,
                <label>
                  {new Location(item.LocationCode, Company).exists() &&
                    new Location(item.LocationCode, Company).getData()
                      .Description}
                </label>,
                <label>{item.Block}</label>,
                <label>{item.Quantity}</label>,
                <label>{item.Text}</label>,
                <label>{item.PurchaseOrder}</label>,
                <label>{item.StockTransportOrder}</label>,
                <label>{item.Item}</label>,
                <label>{item.Vendor}</label>,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
