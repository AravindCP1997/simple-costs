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
  Option,
  PsuedoButton,
  Row,
  Table,
  WindowContent,
  WindowTitle,
} from "../../Components";
import { Company } from "../../classes";
import { perform, transformObject } from "../../functions";

export function ServiceReceiptVendor() {
  const defaults = {
    CompanyCode: "",
    Vendor: "",
    PostingDate: "",
    Year: "",
    Items: [
      {
        ServiceCode: "",
        Description: "",
        Quantity: "",
        Rate: "",
        Value: "",
        From: "",
        To: "",
        Remarks: "",
        UnitType: "CostCenter",
        Unit: "",
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
  const { CompanyCode, PostingDate, Items, Year, Vendor } = processed;
  const company = new Company(CompanyCode);
  const ad = company.accountingdocument("", Year);
  const vendor = company.vendor(Vendor);
  const accData = transformObject(
    processed,
    ["PostingDate", "Year"],
    [["CompanyCode", "Company"]],
    { Entries: [] },
  );
  perform(() => {
    perform(
      () => {
        processed.Year = company.year(PostingDate);
      },
      company.exists() && PostingDate !== "",
    );
    Items.forEach((item, i) => {
      const { ServiceCode, Quantity, Rate, From, To } = item;
      const service = company.service(ServiceCode);
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
        item.Description = service.exists()
          ? service.group().getData().Description
          : "";
      });
      Items.forEach((item, i) => {
        const { ServiceCode, Quantity, Rate, From, To, UnitType, Unit } = item;
        const service = company.service(ServiceCode);
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
                Account: service.exists()
                  ? service.group().getData().GLExpense
                  : "",
              },
            ),
            transformObject(item, [], [["Remarks", "Text"]], {
              Account: service.exists()
                ? service.group().getData().GLExpense
                : "",
              Amount: -Number(item.Value),
            }),
          ],
        );
      });
    });
  });
  useEffect(() => {
    clearErrors();
    addError(!company.exists(), "Company", "Company does not exist.");
    addError(
      company.exists() && !company.openperiods.accountingOpen(PostingDate),
      "PostingDate",
      "Posting Date not open.",
    );
    addError(Items.length === 0, "Services", "No service added.");
    Items.forEach((item, i) => {
      const { ServiceCode, Quantity, Rate, From, To, UnitType, Unit } = item;
      addError(
        !company.service(ServiceCode).exists(),
        `Items/${i + 1}`,
        "Service does not exist.",
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
        title={"Service Receipt from Vendors"}
        menu={[
          <ConditionalButton
            name={"Post"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check!")]}
            whileTrue={[
              () => {
                const { DocumentNo: accDocNo } = ad.add(accData);
                showAlert(`Post Success!
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
          <Row>
            <Label label={"Posting Date"} />
            <Input
              value={PostingDate}
              process={(value) => changeData("", "PostingDate", value)}
              type="date"
            />
          </Row>
          <Row>
            <Label label={"Accounting Year"} />
            <label>{Year}</label>
          </Row>
          <Row overflow="visible">
            <Label label={"Vendor"} />
            <AutoSuggestInput
              value={Vendor}
              process={(value) => changeData("", "Vendor", value)}
              suggestions={vendor.listAllFromCompany("Code")}
              captions={vendor.listAllFromCompany("Name")}
            />
          </Row>
          <Column>
            <Row jc="left">
              <Label label={"Services"} />
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
                "Service",
                "Description",
                "Quantity",
                "Rate",
                "Value",
                "Organisational Unit Type",
                "Organisational Unit",
                "Remarks",
                "Period From",
                "Period To",
                "",
              ]}
              rows={Items.map((item, i) => [
                <label>{i + 1}</label>,
                <AutoSuggestInput
                  value={item.ServiceCode}
                  process={(value) =>
                    changeData(`Items/${i}`, "ServiceCode", value)
                  }
                  suggestions={company
                    .service(item.ServiceCode)
                    .listAllFromCompany("Code")}
                  captions={company
                    .service(item.ServiceCode)
                    .listAllFromCompany("Description")}
                  placeholder={"Service Code"}
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
                <Option
                  value={item.UnitType}
                  process={(value) =>
                    changeData(`Items/${i}`, "UnitType", value)
                  }
                  options={["CostCenter", "Location", "Plant", "RevenueCenter"]}
                />,
                <AutoSuggestInput
                  value={item.Unit}
                  process={(value) => changeData(`Items/${i}`, "Unit", value)}
                  suggestions={company
                    .collection(item.UnitType)
                    .listAllFromCompany("Code")}
                  captions={company
                    .collection(item.UnitType)
                    .listAllFromCompany("Description")}
                  placeholder={item.UnitType}
                />,
                <Input
                  value={item.Remarks}
                  process={(value) =>
                    changeData(`Items/${i}`, "Remarks", value)
                  }
                  type="text"
                />,
                <Input
                  value={item.From}
                  process={(value) => changeData(`Items/${i}`, "Rate", value)}
                  type="date"
                />,
                <Input
                  value={item.To}
                  process={(value) => changeData(`Items/${i}`, "Rate", value)}
                  type="date"
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
