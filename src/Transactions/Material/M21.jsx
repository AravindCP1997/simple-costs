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
import { Company, MaterialDelivery } from "../../classes";
import { isPositive, perform, transformObject } from "../../functions";

export function ReturnInwards() {
  const defaults = {
    CompanyCode: "",
    ValueDate: "",
    MatYear: "",
    AccYear: "",
    PostingDate: "",
    Customer: "",
    Location: "",
    SO: "",
    DeliveryNo: "",
    DeliveryYear: "",
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
    Customer,
    Location,
    Items,
    MatYear,
    SO,
    DeliveryNo,
    DeliveryYear,
    AccYear,
    PostingDate,
  } = processed;
  const company = new Company(CompanyCode);
  const md = company.materialdocument("", MatYear);
  const so = company.so(SO);
  const customer = company.customer(Customer);
  const location = company.location(Location);
  const delivery = company.materialdelivery(DeliveryNo, DeliveryYear);
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
              "SaleOrder",
              "Item",
              "Vendor",
              "RefDocNo",
              "RefYear",
              "RefItem",
            ],
            [],
            { LocationCode: Location, MovementType: "21", Block: "Free" },
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
      const md = company.materialdelivery(RefDocNo, RefYear);
      addError(
        Quantity === "" || Quantity <= 0,
        `Items/${i + 1}`,
        "Quantity shall be positive value.",
      );
      addError(
        md.netIssueQuantity(RefItem) < Quantity,
        `Items/${i + 1}`,
        "Quantity more than net delivery under the delivery document.",
      );
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Return Inwards"}
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
                <Label label={"Customer"} />
                <AutoSuggestInput
                  value={Customer}
                  process={(value) => changeData("", "Customer", value)}
                  suggestions={customer.listAllFromCompany("Code")}
                  captions={customer.listAllFromCompany("Name")}
                />
                <ConditionalButton
                  name={"Get"}
                  result={customer.exists()}
                  whileFalse={[() => showAlert("Customer does not exist")]}
                  whileTrue={[
                    () =>
                      changeData(
                        "",
                        "Items",
                        customer.deliveries().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "SaleOrder",
                              "Item",
                              "Customer",
                              "Rate",
                            ],
                            [
                              ["DocumentNo", "RefDocNo"],
                              ["Year", "RefYear"],
                              ["No", "RefItem"],
                            ],
                            {
                              Remarks: "",
                              Quantity: new MaterialDelivery(
                                item.Company,
                                item.Year,
                                item.DocumentNo,
                              ).netIssueQuantity(item.No),
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
                  value={SO}
                  process={(value) => changeData("", "SO", value)}
                  suggestions={so.listAllFromCompany("Code")}
                  captions={so.listAllFromCompany("Description")}
                />
                <ConditionalButton
                  name={"Get"}
                  result={so.exists()}
                  whileFalse={[() => showAlert("Sale Order does not exist")]}
                  whileTrue={[
                    () =>
                      changeData(
                        "",
                        "Items",
                        so.allIssues().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "SaleOrder",
                              "Rate",
                              "Item",
                              "Customer",
                            ],
                            [
                              ["DocumentNo", "RefDocNo"],
                              ["Year", "RefYear"],
                              ["No", "RefItem"],
                            ],
                            {
                              Remarks: "",
                              Quantity: new MaterialDelivery(
                                item.Company,
                                item.Year,
                                item.DocumentNo,
                              ).netIssueQuantity(item.No),
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
                <Label label={"Delivery Document"} />
                <Input
                  value={DeliveryNo}
                  process={(value) => changeData("", "DeliveryNo", value)}
                  type={"number"}
                  placeholder="Receipt No"
                />
                <Input
                  value={DeliveryYear}
                  process={(value) => changeData("", "DeliveryYear", value)}
                  type={"number"}
                  placeholder="Year"
                />
                <ConditionalButton
                  name={"Get"}
                  result={delivery.exists()}
                  whileFalse={[
                    () => showAlert("Delivery document does not exist"),
                  ]}
                  whileTrue={[
                    () =>
                      changeData(
                        "",
                        "Items",
                        delivery.items().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "SaleOrder",
                              "Item",
                              "Rate",
                              "Customer",
                            ],
                            [
                              ["DocumentNo", "RefDocNo"],
                              ["Year", "RefYear"],
                              ["No", "RefItem"],
                            ],
                            {
                              Remarks: "",
                              Quantity: new MaterialDelivery(
                                item.Company,
                                item.Year,
                                item.DocumentNo,
                              ).netIssueQuantity(item.No),
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
                "Sale Order",
                "Item",
                "Customer",
                "Remarks",
                "Delivery No.",
                "Delivery Year",
                "Delivery Item",
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
                <label>{item.SaleOrder}</label>,
                <label>{item.Item}</label>,
                <label>{item.Customer}</label>,
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
