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
import { Company, STOIssue } from "../../classes";
import { isPositive, perform, transformObject } from "../../functions";

export function STOReturn() {
  const defaults = {
    CompanyCode: "",
    ValueDate: "",
    MatYear: "",
    Location: "",
    STO: "",
    IssueNo: "",
    IssueYear: "",
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
    Location,
    Items,
    MatYear,
    STO,
    IssueNo,
    IssueYear,
  } = processed;
  const company = new Company(CompanyCode);
  const md = company.materialdocument("", MatYear);
  const sto = company.sto(STO);
  const location = company.location(Location);
  const issue = company.stoIssue(IssueNo, IssueYear);
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
              "StockTransportOrder",
              "Item",
              "RefDocNo",
              "RefYear",
              "RefItem",
            ],
            [],
            { LocationCode: Location, MovementType: "18" },
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
      const si = company.stoIssue(RefDocNo, RefYear);
      addError(
        Quantity === "" || Quantity <= 0,
        `Items/${i + 1}`,
        "Quantity shall be positive value.",
      );
      addError(
        si.inTransitQuantity(RefItem) < Quantity,
        `Items/${i + 1}`,
        "Quantity exceeds Quantity in Transit Stage.",
      );
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Return from STO"}
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
                <Label label={"Stock Transport Order"} />
                <AutoSuggestInput
                  value={STO}
                  process={(value) => changeData("", "STO", value)}
                  suggestions={sto.listAllFromCompany("Code")}
                  captions={sto.listAllFromCompany("Description")}
                />
                <ConditionalButton
                  name={"Get"}
                  result={sto.exists()}
                  whileFalse={[
                    () => showAlert("Stock Transport Order does not exist"),
                  ]}
                  whileTrue={[
                    () =>
                      changeData(
                        "",
                        "Items",
                        sto.allIssues().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "StockTransportOrder",
                              "Rate",
                              "Item",
                            ],
                            [
                              ["DocumentNo", "RefDocNo"],
                              ["Year", "RefYear"],
                              ["No", "RefItem"],
                            ],
                            {
                              Remarks: "",
                              Quantity: new STOIssue(
                                item.Company,
                                item.DocumentNo,
                                item.Year,
                              ).inTransitQuantity(item.No),
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
                <Label label={"Material Issue STO"} />
                <Input
                  value={IssueNo}
                  process={(value) => changeData("", "IssueNo", value)}
                  type={"number"}
                  placeholder="Issue No"
                />
                <Input
                  value={IssueYear}
                  process={(value) => changeData("", "IssueYear", value)}
                  type={"number"}
                  placeholder="Year"
                />
                <ConditionalButton
                  name={"Get"}
                  result={issue.exists()}
                  whileFalse={[
                    () => showAlert("Material Issue does not exist"),
                  ]}
                  whileTrue={[
                    () =>
                      changeData(
                        "",
                        "Items",
                        issue.issues().map((item, i) =>
                          transformObject(
                            item,
                            [
                              "MaterialCode",
                              "LocationCode",
                              "StockTransportOrder",
                              "Item",
                              "Rate",
                            ],
                            [
                              ["DocumentNo", "RefDocNo"],
                              ["Year", "RefYear"],
                              ["No", "RefItem"],
                            ],
                            {
                              Remarks: "",
                              Quantity: new STOIssue(
                                item.Company,
                                item.DocumentNo,
                                item.Year,
                              ).inTransitQuantity(item.No),
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
                "Stock Transport Order",
                "Item",
                "Remarks",
                "Issue No.",
                "Issue Year",
                "Issue Item",
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
                <label>{item.StockTransportOrder}</label>,
                <label>{item.Item}</label>,
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
