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
  PsuedoButton,
  Row,
  Table,
  WindowContent,
  WindowTitle,
} from "../../Components";
import { Company } from "../../classes";
import { perform, transformObject } from "../../functions";

export function ReceiptForInspectionVendor() {
  const defaults = {
    CompanyCode: "",
    ValueDate: "",
    AccYear: "",
    MatYear: "",
    PostingDate: "",
    Vendor: "",
    Location: "",
    Items: [
      {
        MaterialCode: "",
        Description: "",
        Quantity: "",
        Rate: "",
        Value: "",
        Remarks: "",
      },
    ],
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
    PostingDate,
    Vendor,
    Location,
    Items,
    AccYear,
    MatYear,
  } = processed;
  const company = new Company(CompanyCode);
  const md = company.materialdocument("", MatYear);
  const ad = company.accountingdocument("", AccYear);
  const vendor = company.vendor(Vendor);
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
            ["No", "Item"],
            ["Remarks", "Text"],
          ],
          {
            MovementType: "05",
            LocationCode: Location,
            Vendor,
            No: i + 1,
            Block: "For Inspection",
          },
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
      const { MaterialCode, Quantity, Rate } = item;
      const material = company.material(MaterialCode);
      perform(
        () => {
          item.Value = Quantity * Rate;
        },
        item.Quantity !== "" &&
          item.Quantity > 0 &&
          item.Rate !== "" &&
          item.Rate > 0,
        () => {
          item.Value = 0;
        },
      );
      perform(() => {
        item.Description = material.group().getData().Description;
      }, material.exists());
    });
    Items.forEach((item, i) => {
      const { MaterialCode } = item;
      const material = company.material(MaterialCode);
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
              Account: material.exists()
                ? material.group().getData().GLMat
                : "",
              ProfitCenter: location.exists() ? location.pc().code : "",
            },
          ),
          transformObject(item, [], [["Remarks", "Text"]], {
            Account: material.exists()
              ? material.group().getData().GLClearing
              : "",
            ProfitCenter: location.exists() ? location.pc().code : "",
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
    addError(Items.length === 0, "Materials", "No materials added.");
    addError(!vendor.exists(), "Vendor", "Vendor does not exist.");
    addError(
      company.exists() && !company.openperiods.materialOpen(ValueDate),
      "ValueDate",
      "Value Date not open.",
    );
    Items.forEach((item, i) => {
      const { MaterialCode, Quantity, Rate } = item;
      addError(
        !company.material(MaterialCode).exists(),
        `Items/${i + 1}`,
        "Material does not exist.",
      );
      addError(
        Quantity === "" || Quantity <= 0,
        `Items/${i + 1}`,
        "Quantity shall be positive value.",
      );
      addError(
        Rate === "" || Rate <= 0,
        `Items/${i + 1}`,
        "Rate shall be positive value.",
      );
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={"Receipt for Inspection - Against Vendor"}
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
          <Column>
            <Row overflow="visible">
              <Label label={"Vendor"} />
              <AutoSuggestInput
                value={Vendor}
                process={(value) => changeData("", "Vendor", value)}
                suggestions={vendor.listAllFromCompany("Code")}
                captions={vendor.listAllFromCompany("Name")}
              />
            </Row>
            <Row jc="left">
              <Label label={"Materials"} />
              <Button
                name={"Add"}
                functionsArray={[
                  () => addItemtoArray("Items", defaults.Items[0]),
                ]}
              />
            </Row>
            <Table
              columns={[
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
                <label>{i + 1}</label>,
                <AutoSuggestInput
                  value={item.MaterialCode}
                  process={(value) =>
                    changeData(`Items/${i}`, "MaterialCode", value)
                  }
                  suggestions={company
                    .material(item.MaterialCode)
                    .listAllFromCompany("Code")}
                  captions={company
                    .material(item.MaterialCode)
                    .listAllFromCompany("Description")}
                  placeholder={"Material Code"}
                />,
                <label>{item.Description}</label>,
                <Input
                  value={item.Quantity}
                  process={(value) =>
                    changeData(`Items/${i}`, "Quantity", value)
                  }
                  type="number"
                />,
                <Input
                  value={item.Rate}
                  process={(value) => changeData(`Items/${i}`, "Rate", value)}
                  type="number"
                />,
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
