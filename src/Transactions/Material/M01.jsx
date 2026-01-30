import { useEffect, useState } from "react";
import useData from "../../useData";
import { useInterface } from "../../useInterface";
import { useError } from "../../useError";
import {
  AutoSuggestInput,
  Column,
  ConditionalButton,
  DisplayArea,
  Input,
  Label,
  PsuedoButton,
  Row,
  Table,
  WindowContent,
  WindowTitle,
} from "../../Components";
import { Company, MaterialDocument } from "../../classes";
import { perform, transformObject } from "../../functions";

export function ConsignmentInwardsOriginPO() {
  const defaults = {
    CompanyCode: "",
    ValueDate: "",
    AccYear: "",
    MatYear: "",
    PostingDate: "",
    PO: "",
    Location: "",
    Items: [],
  };
  const { data, processed, changeData, deleteItemfromArray } =
    useData(defaults);
  const { showAlert, openWindow } = useInterface();
  const { errorsExist, DisplayHidingError, clearErrors, addError } = useError();
  const {
    CompanyCode,
    ValueDate,
    PostingDate,
    PO,
    Location,
    Items,
    AccYear,
    MatYear,
  } = processed;
  const company = new Company(CompanyCode);
  const md = company.materialdocument("", MatYear);
  const ad = company.accountingdocument("", AccYear);
  const po = company.po(PO);
  const location = company.location(Location);
  const matData = transformObject(
    processed,
    ["ValueDate"],
    [
      ["CompanyCode", "Company"],
      ["MatYear", "Year"],
    ],
    {
      Movements: Items.map((item, i) =>
        transformObject(
          item,
          ["MaterialCode", "Quantity", "Rate", "Value"],
          [
            ["PO", "PurchaseOrder"],
            ["No", "Item"],
          ],
          { MovementType: "01", LocationCode: Location },
        ),
      ),
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
      perform(
        () => {
          item.Value = item.Quantity * item.Rate;
        },
        item.Quantity !== "" && item.Quantity > 0,
        () => {
          item.Value = 0;
        },
      );
    });
    Items.forEach((item, i) => {
      const { MaterialCode } = item;
      accData.Entries.push(
        ...[
          transformObject(
            item,
            [],
            [
              ["Remarks", "Text"],
              ["Value", "Amount"],
            ],
            {
              Account: company.material(MaterialCode).group().getData().GLMat,
              ProfitCenter: location.pc().code,
            },
          ),
          transformObject(item, [], [["Remarks", "Text"]], {
            Account: company.material(MaterialCode).group().getData()
              .GLClearing,
            ProfitCenter: location.pc().code,
            Amount: -Number(item.Value),
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
      company.exists() && !company.openperiods.accountingOpen(PostingDate),
      "PostingDate",
      "Posting Date not open.",
    );
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
        title={"M01 - Consignment Inwards Origin - Against PO"}
        menu={[
          <ConditionalButton
            name={"Post"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check!")]}
            whileTrue={[
              () => {
                const { DocumentNo: matDocNo } = md.add(matData);
                const { DocumentNo: accDocNo } = ad.add({
                  ...accData,
                  ["MatDoc"]: { DocumentNo: matDocNo, Year: AccYear },
                });
                showAlert(`Post Success!
                    Material Document: ${matDocNo}
                    Accounting Document: ${accDocNo}`);
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
          <Column>
            <Label label={"Materials"} />
            <Row jc="left" borderBottom="none" overflow="visible">
              <Label label={"Purchase Order"} />
              <AutoSuggestInput
                value={PO}
                process={(value) => changeData("", "PO", value)}
                suggestions={po.listAllFromCompany("Code")}
                captions={po.listAllFromCompany("Description")}
              />
              <ConditionalButton
                name={"Load"}
                result={po.exists()}
                whileFalse={[() => showAlert("Purchase Order does not exist.")]}
                whileTrue={[
                  () =>
                    changeData(
                      "",
                      "Items",
                      po.summary().map((item, i) =>
                        transformObject(
                          item,
                          ["Rate", "Description"],
                          [
                            ["Item", "MaterialCode"],
                            ["Undispatched", "Quantity"],
                          ],
                          {
                            No: i + 1,
                            Value: item.Undispatched * item.Rate,
                            Remarks: "",
                            PO,
                          },
                        ),
                      ),
                    ),
                  () => changeData("", "PO", ""),
                ]}
              />
            </Row>
            <Table
              columns={[
                "PO",
                "Item No",
                "Material",
                "Description",
                "Quantity",
                "Rate",
                "Value",
                "Remarks",
                "",
              ]}
              rows={Items.map((item, i) => [
                <label>{item.PO}</label>,
                <label>{item.No}</label>,
                <label>{item.MaterialCode}</label>,
                <label>{item.Description}</label>,
                <Input
                  value={item.Quantity}
                  process={(value) =>
                    changeData(`Items/${i}`, "Quantity", value)
                  }
                  type="number"
                />,
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
                  name={"-"}
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
