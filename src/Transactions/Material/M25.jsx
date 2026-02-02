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
import { Company, ConsignmentOutwards } from "../../classes";
import { isPositive, perform, transformObject } from "../../functions";

export function ConsignmentOutwardsLoss() {
  const defaults = {
    CompanyCode: "",
    ValueDate: "",
    MatYear: "",
    Customer: "",
    Location: "",
    PostingDate: "",
    AccYear: "",
    SO: "",
    ConsignmentNo: "",
    ConsignmentYear: "",
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
    PostingDate,
    AccYear,
    SO,
    ConsignmentNo,
    ConsignmentYear,
  } = processed;
  const company = new Company(CompanyCode);
  const md = company.materialdocument("", MatYear);
  const so = company.so(SO);
  const customer = company.customer(Customer);
  const location = company.location(Location);
  const consignment = company.consignmentOutwards(
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
  const accData = transformObject(
    processed,
    ["PostingDate"],
    [
      ["CompanyCode", "Company"],
      ["AccYear", "Year"],
    ],
    { Entries: [] },
  );
  perform(() => {
    perform(
      () => {
        processed.AccYear = company.year(PostingDate);
      },
      company.exists() && PostingDate !== "",
    );
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
              "SaleOrder",
              "Item",
              "Customer",
              "Rate",
              "Value",
              "RefDocNo",
              "RefYear",
              "RefItem",
            ],
            [],
            { LocationCode: Location, MovementType: "25", Block: "Free" },
          ),
        ],
      );
      accData.Entries.push(
        ...[
          transformObject(item, [], [["Remarks", "Text"]], {
            Account: company.material(MaterialCode).group().getData().GLMat,
            ProfitCenter: location.pc().code,
            Amount: -Number(item.Value),
          }),
          transformObject(item, [], [["Remarks", "Text"]], {
            Account: company.material(MaterialCode).group().getData()
              .GLClearing,
            ProfitCenter: location.pc().code,
            Amount: Number(item.Value),
          }),
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
      const CO = new ConsignmentOutwards(CompanyCode, RefYear, RefDocNo);
      addError(
        Quantity === "" || Quantity <= 0,
        `Items/${i + 1}`,
        "Quantity shall be positive value.",
      );
      addError(
        CO.inTransitQuantity(RefItem) < Quantity,
        `Items/${i + 1}`,
        "Quantity more than actual quantity in transit stage of consignment.",
      );
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Consignment Outwards Loss"}
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
            <Label label={"Posting Date"} />
            <Input
              value={PostingDate}
              process={(value) => changeData("", "PostingDate", value)}
              type="date"
            />
          </Row>
          <Row>
            <Label label={"Material Year"} />
            <label>{MatYear}</label>
          </Row>
          <Row>
            <Label label={"Accounting Year"} />
            <label>{AccYear}</label>
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
                        customer.consignmentOutwards().map((item, i) =>
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
                              Quantity: new ConsignmentOutwards(
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
                <Label label={"Sale Order"} />
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
                        so.consignmentOutwards().map((item, i) =>
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
                              Quantity: new ConsignmentOutwards(
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
                              Quantity: new ConsignmentOutwards(
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
                "Rate",
                "Value",
                "Sale Order",
                "Item",
                "Customer",
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
