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
import { Company, ConsignmentInwards } from "../../classes";
import { perform, transformObject } from "../../functions";

export function ConsignmentInwardsReceipt() {
  const defaults = {
    CompanyCode: "",
    ValueDate: "",
    MatYear: "",
    Vendor: "",
    Location: "",
    PO: "",
    ConsignmentNo: "",
    ConsignmentYear: "",
    Items: [],
  };
  const { data, processed, changeData, deleteItemfromArray, addItemtoArray } =
    useData(defaults);
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
    ConsignmentNo,
    ConsignmentYear,
  } = processed;
  const company = new Company(CompanyCode);
  const md = company.materialdocument("", MatYear);
  const po = company.po(PO);
  const vendor = company.vendor(Vendor);
  const location = company.location(Location);
  const consignment = company.consignmentInwards(
    ConsignmentNo,
    ConsignmentYear,
  );
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
      const { MaterialCode, Quantity } = item;
      const material = company.material(MaterialCode);
      perform(() => {
        item.Description = material.group().getData().Description;
      }, material.exists());
      matData.Movements.push(
        ...[
          transformObject(
            item,
            ["MaterialCode", "Quantity", "PurchaseOrder", "Item", "Vendor"],
            [],
            { LocationCode: Location, MovementType: "02", Block: "Free" },
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
      const { Quantity } = item;
      addError(
        Quantity === "" || Quantity <= 0,
        `Items/${i + 1}`,
        "Quantity shall be positive value.",
      );
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"M02 - Consignment Inwards Receipt"}
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
          <Column overflow="visible">
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
                        vendor.consignmentInwards().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "PurchaseOrder",
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
                              Quantity: new ConsignmentInwards(
                                item.Company,
                                item.Year,
                                item.DocumentNo,
                              ).inTransitQuantity(item.No),
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
                        po.consignmentInwards().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "PurchaseOrder",
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
                              Quantity: new ConsignmentInwards(
                                item.Company,
                                item.Year,
                                item.DocumentNo,
                              ).inTransitQuantity(item.No),
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
                <Label label={"Consignment"} />
                <Input
                  value={ConsignmentNo}
                  process={(value) => changeData("", "ConsignmentNo", value)}
                  type={"number"}
                  placeholder="Consignment No"
                />
                <Input
                  value={ConsignmentYear}
                  process={(value) => changeData("", "ConsignmentYear", value)}
                  type={"number"}
                  placeholder="Year"
                />
                <ConditionalButton
                  name={"Get"}
                  result={consignment.exists()}
                  whileFalse={[() => showAlert("Consignment does not exist")]}
                  whileTrue={[
                    () =>
                      changeData(
                        "",
                        "Items",
                        consignment.origins().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "PurchaseOrder",
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
                              Quantity: new ConsignmentInwards(
                                item.Company,
                                item.Year,
                                item.DocumentNo,
                              ).inTransitQuantity(item.No),
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
                "Purchase Order",
                "Item",
                "Vendor",
                "Remarks",
                "Consignment No.",
                "Consignment Year",
                "Consignment Item",
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
