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
  PsuedoButton,
  Row,
  Table,
  WindowContent,
  WindowTitle,
} from "../../Components";
import { Company, ReceiptForInspection } from "../../classes";
import { isPositive, perform, transformObject } from "../../functions";

export function LossfromInspection() {
  const defaults = {
    CompanyCode: "",
    ValueDate: "",
    MatYear: "",
    Vendor: "",
    Location: "",
    PO: "",
    InspectionNo: "",
    InspectionYear: "",
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
  const {
    CompanyCode,
    ValueDate,
    Vendor,
    Location,
    Items,
    MatYear,
    PO,
    InspectionNo,
    InspectionYear,
  } = processed;
  const company = new Company(CompanyCode);
  const md = company.materialdocument("", MatYear);
  const po = company.po(PO);
  const vendor = company.vendor(Vendor);
  const location = company.location(Location);
  const inspection = company.receiptForInspection(InspectionNo, InspectionYear);
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
      const { MaterialCode, Quantity, Rate } = item;
      perform(() => {
        item.Value = Quantity * Rate;
      }, isPositive(Quantity));
      const material = company.material(MaterialCode);
      perform(() => {
        item.Description = material.group().getData().Description;
      }, material.exists());
      matData.Movements.push(
        ...[
          transformObject(
            item,
            [
              "MaterialCode",
              "Quantity",
              "Rate",
              "Value",
              "PurchaseOrder",
              "Item",
              "Vendor",
              "RefDocNo",
              "RefYear",
              "RefItem",
            ],
            [],
            { LocationCode: Location, MovementType: "08", Block: "Inspection" },
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
      const { Quantity, RefDocNo, RefItem, RefYear } = item;
      const RI = new ReceiptForInspection(CompanyCode, RefYear, RefDocNo);
      addError(
        Quantity === "" || Quantity <= 0,
        `Items/${i + 1}`,
        "Quantity shall be positive value.",
      );
      addError(
        RI.inBlockQuantity(RefItem) < Quantity,
        `Items/${i + 1}`,
        "Quantity more than actual quantity in Inspection block.",
      );
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Loss from Inspection Block"}
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
          <Column overflow="visible" bg="var(--lightredt)" padding="10px">
            <Row jc="left" borderBottom="none">
              <Label style={{ fontWeight: "bold" }} label={"Selection"} />
              <Button
                name={"Clear"}
                functionsArray={[() => changeData("", "Items", [])]}
              />
            </Row>
            <Column overflow="visible" borderBottom="none">
              <Row borderBottom="none" overflow="visible" jc="left">
                <Label label={"Vendor"} />
                <AutoSuggestInput
                  value={Vendor}
                  process={(value) => changeData("", "Vendor", value)}
                  suggestions={vendor.listAllFromCompany("Code")}
                  captions={vendor.listAllFromCompany("Name")}
                />
                <ConditionalButton
                  name={"Get"}
                  result={vendor.exists()}
                  whileFalse={[() => showAlert("Vendor does not exist")]}
                  whileTrue={[
                    () =>
                      changeData(
                        "",
                        "Items",
                        vendor.receiptForInspection().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "PurchaseOrder",
                              "Item",
                              "Vendor",
                              "Rate",
                            ],
                            [
                              ["DocumentNo", "RefDocNo"],
                              ["Year", "RefYear"],
                              ["No", "RefItem"],
                            ],
                            {
                              Remarks: "",
                              Quantity: new ReceiptForInspection(
                                item.Company,
                                item.Year,
                                item.DocumentNo,
                              ).inBlockQuantity(item.No),
                              Value: 0,
                            },
                          ),
                        ),
                      ),
                  ]}
                />
              </Row>
            </Column>
            <Column overflow="visible" borderBottom="none">
              <Row borderBottom="none" overflow="visible" jc="left">
                <Label label={"Purchase Order"} />
                <AutoSuggestInput
                  value={PO}
                  process={(value) => changeData("", "PO", value)}
                  suggestions={po.listAllFromCompany("Code")}
                  captions={po.listAllFromCompany("Description")}
                />
                <ConditionalButton
                  name={"Get"}
                  result={po.exists()}
                  whileFalse={[
                    () => showAlert("Purchase Order does not exist"),
                  ]}
                  whileTrue={[
                    () =>
                      changeData(
                        "",
                        "Items",
                        po.receiptForInspection().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "PurchaseOrder",
                              "Rate",
                              "Item",
                              "Vendor",
                            ],
                            [
                              ["DocumentNo", "RefDocNo"],
                              ["Year", "RefYear"],
                              ["No", "RefItem"],
                            ],
                            {
                              Remarks: "",
                              Quantity: new ReceiptForInspection(
                                item.Company,
                                item.Year,
                                item.DocumentNo,
                              ).inBlockQuantity(item.No),
                              Value: 0,
                            },
                          ),
                        ),
                      ),
                  ]}
                />
              </Row>
            </Column>
            <Column overflow="visible" borderBottom="none">
              <Row borderBottom="none" overflow="visible" jc="left">
                <Label label={"Inspection"} />
                <Input
                  value={InspectionNo}
                  process={(value) => changeData("", "InspectionNo", value)}
                  type={"number"}
                  placeholder="Inspection No"
                />
                <Input
                  value={InspectionYear}
                  process={(value) => changeData("", "InspectionYear", value)}
                  type={"number"}
                  placeholder="Year"
                />
                <ConditionalButton
                  name={"Get"}
                  result={inspection.exists()}
                  whileFalse={[() => showAlert("Inspection does not exist")]}
                  whileTrue={[
                    () =>
                      changeData(
                        "",
                        "Items",
                        inspection.origins().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "PurchaseOrder",
                              "Item",
                              "Rate",
                              "Vendor",
                            ],
                            [
                              ["DocumentNo", "RefDocNo"],
                              ["Year", "RefYear"],
                              ["No", "RefItem"],
                            ],
                            {
                              Remarks: "",
                              Quantity: new ReceiptForInspection(
                                item.Company,
                                item.Year,
                                item.DocumentNo,
                              ).inBlockQuantity(item.No),
                              Value: 0,
                            },
                          ),
                        ),
                      ),
                  ]}
                />
              </Row>
            </Column>
          </Column>
          <Column>
            <Row jc="left" borderBottom="none">
              <Label label={"Materials"} />
            </Row>
            <Table
              columns={[
                "No",
                "Material",
                "Description",
                "Location",
                "Quantity",
                "Rate",
                "Value",
                "Purchase Order",
                "Item",
                "Vendor",
                "Remarks",
                "Inspection No.",
                "Inspection Year",
                "Inspection Item",
                "",
              ]}
              rows={Items.map((item, i) => [
                <label>{i + 1}</label>,
                <label>{item.MaterialCode}</label>,
                <label>{item.Description}</label>,
                <label>{item.LocationCode}</label>,
                <Input
                  value={item.Quantity}
                  process={(value) =>
                    changeData(`Items/${i}`, "Quantity", value)
                  }
                  type="number"
                />,
                <label>{item.Rate}</label>,
                <label>{item.Value}</label>,
                <label>{item.PurchaseOrder}</label>,
                <label>{item.Item}</label>,
                <label>{item.Vendor}</label>,
                <Input
                  value={item.Remarks}
                  process={(value) =>
                    changeData(`Items/${i}`, "Remarks", value)
                  }
                  type="text"
                />,
                <label>{item.RefDocNo}</label>,
                <label>{item.RefYear}</label>,
                <label>{item.RefItem}</label>,
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
