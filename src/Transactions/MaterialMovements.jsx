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
  Selection,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import { MaterialTable } from "../businessFunctions";
import { defaultSelection } from "../defaults";
import useData from "../useData";
import {
  filterByMultipleSelection,
  filterBySelection,
  perform,
  trimSelection,
} from "../functions";
import { ViewMaterialDocument } from "./MaterialDocument";
import { Material, MaterialDocument } from "../classes";
import { CreateMaterial } from "./Material";

export function QueryMaterialMovements() {
  const { openWindow } = useInterface();
  const { data, processed, changeData } = useData({
    Company: defaultSelection("Company"),
    Year: defaultSelection("Year", "Number"),
    DocumentNo: defaultSelection("DocumentNo", "Number"),
    MaterialCode: defaultSelection("MaterialCode", "Number"),
    LocationCode: defaultSelection("LocationCode"),
    ValueDate: defaultSelection("ValueDate"),
  });
  const { Company, Year, DocumentNo, MaterialCode, LocationCode, ValueDate } =
    processed;

  const filter = {
    Company: trimSelection(Company),
    Year: trimSelection(Year),
    MaterialCode: trimSelection(MaterialCode),
    DocumentNo: trimSelection(DocumentNo),
    LocationCode: trimSelection(LocationCode),
    ValueDate: trimSelection(ValueDate),
  };

  return (
    <>
      <WindowTitle
        title={"Material Movements"}
        menu={[
          <Button
            name={"Search"}
            functionsArray={[
              () => openWindow(<MaterialMovements filter={filter} />),
            ]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Company"} />
            <Selection
              value={Company}
              changeData={changeData}
              path={"Company"}
            />
          </Row>
          <Row>
            <Label label={"Year"} />
            <Selection value={Year} changeData={changeData} path={"Year"} />
          </Row>
          <Row>
            <Label label={"Document No"} />
            <Selection
              value={DocumentNo}
              changeData={changeData}
              path={"DocumentNo"}
            />
          </Row>
          <Row>
            <Label label={"Material"} />
            <Selection
              value={MaterialCode}
              changeData={changeData}
              path={"MaterialCode"}
            />
          </Row>
          <Row>
            <Label label={"Value Date"} />
            <Selection
              value={ValueDate}
              changeData={changeData}
              path={"ValueDate"}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
export function MaterialMovements({ filter }) {
  if (MaterialTable() === null) {
    return (
      <>
        <WindowTitle title={"Material Movements"} />
        <WindowContent>
          <DisplayArea>
            <p>No Material Movements exist.</p>
          </DisplayArea>
        </WindowContent>
      </>
    );
  }
  const { openFloat, openWindow } = useInterface();
  const data = MaterialTable();
  const { Company, Year, MaterialCode, LocationCode, ValueDate, DocumentNo } =
    filter;
  const filtered = filterByMultipleSelection(data, [
    Company,
    Year,
    MaterialCode,
    LocationCode,
    ValueDate,
    DocumentNo,
  ]);

  return (
    <>
      <WindowTitle
        title={"Material Movements"}
        menu={[
          <Button
            name={"Back"}
            functionsArray={[() => openWindow(<QueryMaterialMovements />)]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Table
            columns={[
              "Company",
              "Year",
              "Value Date",
              "Document No.",
              "Movement Type",
              "Location",
              "Material",
              "Quantity",
              "Rate",
              "Value",
              "Block",
              "Purchase Order",
              "Sale Order",
              "Stock Transport Order",
              "Customer",
              "Vendor",
              "Item",
              "Ref. Doc.",
              "Ref. Year",
              "Ref. Item",
            ]}
            rows={filtered.map((item, i) => [
              <label>{item.Company}</label>,
              <label>{item.Year}</label>,
              <label>{item.ValueDate}</label>,
              <Button
                name={item.DocumentNo}
                functionsArray={[
                  () =>
                    openFloat(
                      <ViewMaterialDocument
                        data={new MaterialDocument(
                          item.DocumentNo,
                          item.Year,
                          item.Company,
                        ).getData()}
                      />,
                    ),
                ]}
              />,
              <label>{item.MovementType}</label>,
              <label>{item.LocationCode}</label>,
              <Button
                name={item.MaterialCode}
                functionsArray={[
                  () =>
                    openFloat(
                      <CreateMaterial
                        method="View"
                        initial={new Material(
                          item.MaterialCode,
                          item.Company,
                        ).getData()}
                      />,
                    ),
                ]}
              />,
              <label>{item.Quantity}</label>,
              <label>{item.Rate}</label>,
              <label>{item.Value}</label>,
              <label>{item.Block}</label>,
              <label>{item.PurchaseOrder}</label>,
              <label>{item.SaleOrder}</label>,
              <label>{item.StockTransportOrder}</label>,
              <label>{item.Customer}</label>,
              <label>{item.Vendor}</label>,
              <label>{item.Item}</label>,
              <label>{item.RefDocNo}</label>,
              <label>{item.RefYear}</label>,
              <label>{item.RefItem}</label>,
            ])}
          />
        </DisplayArea>
      </WindowContent>
    </>
  );
}
