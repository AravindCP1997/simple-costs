import { useEffect, useState } from "react";
import useData from "../../useData";
import { useInterface } from "../../useInterface";
import { useError } from "../../useError";
import {
  AutoSuggestInput,
  Button,
  Column,
  ConditionalButton,
  ConditionalDisplay,
  ConditionalDisplays,
  DisplayArea,
  HidingDisplay,
  Input,
  Label,
  MultiDisplayArea,
  Option,
  PsuedoButton,
  Row,
  Table,
  WindowContent,
  WindowTitle,
} from "../../Components";
import { Company, Currencies, ExchangeRates, HSN, Region } from "../../classes";
import { ListItems, perform, transformObject } from "../../functions";
import { useAccounting } from "../../useAccounting";

export function CreateVendorInvoice({
  initial = {
    CompanyCode: "",
    PostingDate: "",
    Year: "",
    Vendor: "",
    VendorName: "",
    Amount: 0,
    BPlace: "",
    BPartner: "",
    PoS: "",
    Text: "",
    Currency: "",
    ExchangeRate: "",
    POBilling: [],
    MRBilling: [],
    Costs: [
      {
        Element: "",
        Amount: 0,
        ObjectType: "CostCenter",
        Object: "",
        From: "",
        To: "",
        Text: "",
        BTC: "",
        HSN: "",
      },
    ],
    General: [
      {
        Ledger: "",
        Amount: 0,
        PC: "",
        BTC: "",
        HSN: "",
      },
    ],
  },
  meth = "Create",
}) {
  const {
    data,
    processed,
    changeData,
    reset,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { openWindow, showAlert } = useInterface();

  const { clearEntries, modify, addEntries, Preview, accountingErrors } =
    useAccounting();
  const { errorsExist, DisplayHidingError, addError, clearErrors, errors } =
    useError(accountingErrors);
  const [method, setmethod] = useState(meth);
  const {
    CompanyCode,
    Costs,
    General,
    POBilling,
    MRBilling,
    PostingDate,
    ExchangeRate,
    Vendor,
    VendorName,
    Amount,
    Year,
    Text,
    Currency,
    PoS,
    BPlace,
    BPartner,
  } = processed;
  const company = new Company(CompanyCode);
  const vendor = company.vendor(Vendor);
  perform(() => {
    if (vendor.exists()) {
      processed.VendorName = vendor.getData().Name;
    }
  });
  useEffect(() => {
    clearErrors();
    clearEntries();
    modify({ CompanyCode, PostingDate, ExchangeRate, Currency });
    addEntries([{ EntryType: "V1", Account: Vendor, Amount }]);
    addEntries([
      ...Costs.map((item) =>
        transformObject(
          item,
          ["Amount", "BTC", "HSN"],
          [["Element", "Account"]],
          {
            EntryType: "G1",
            BPlace: BPlace.toString(),
            BPartnerType: "Vendor",
            BPartner,
            PoS,
          },
        ),
      ),
    ]);
    addEntries([
      ...General.map((item) =>
        transformObject(
          item,
          ["Amount", "PC", "BTC", "HSN"],
          [["Ledger", "Account"]],
          {
            EntryType: "G1",
            BPlace: BPlace.toString(),
            BPartnerType: "Vendor",
            BPartner,
            PoS,
          },
        ),
      ),
    ]);
  }, [data]);
  return (
    <>
      <WindowTitle
        title={"Vendor Invoice"}
        menu={[<Preview />, <DisplayHidingError />]}
      />
      <WindowContent>
        <DisplayArea>
          <MultiDisplayArea
            heads={["General", "Partner"]}
            contents={[
              <Column overflow="visible" borderBottom="none">
                <Row overflow="visible">
                  <Label label={"Company"} />
                  <ConditionalDisplay
                    logic={method === "Create"}
                    whileTrue={
                      <AutoSuggestInput
                        value={CompanyCode}
                        process={(value) =>
                          changeData("", "CompanyCode", value)
                        }
                        placeholder={"Company Code"}
                        suggestions={company.listAll("Code")}
                        captions={company.listAll("Name")}
                      />
                    }
                    whileFalse={<label>{CompanyCode}</label>}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Business Place"} />
                  <ConditionalDisplay
                    logic={method === "Create"}
                    whileTrue={
                      <AutoSuggestInput
                        value={BPlace}
                        process={(value) => changeData("", "BPlace", value)}
                        placeholder={"Business Place"}
                        suggestions={company.bp().listAllFromCompany("Code")}
                        captions={company
                          .bp()
                          .listAllFromCompany("Description")}
                      />
                    }
                    whileFalse={<label>{BPlace}</label>}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Posting Date"} />
                  <ConditionalDisplay
                    logic={method === "Create"}
                    whileTrue={
                      <Input
                        value={PostingDate}
                        process={(value) =>
                          changeData("", "PostingDate", value)
                        }
                        type={"date"}
                      />
                    }
                    whileFalse={<label>{PostingDate}</label>}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Currency"} />
                  <ConditionalDisplay
                    logic={method === "Create"}
                    whileTrue={
                      <AutoSuggestInput
                        value={Currency}
                        process={(value) => changeData("", "Currency", value)}
                        placeholder="Enter Currency"
                        suggestions={ListItems(Currencies.read(), "Code")}
                        captions={ListItems(Currencies.read(), "Description")}
                      />
                    }
                    whileFalse={<label>{Currency}</label>}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Exchange Rate"} />
                  <ConditionalDisplay
                    logic={method === "Create"}
                    whileTrue={
                      <Input
                        value={ExchangeRate}
                        process={(value) =>
                          changeData("", "ExchangeRate", value)
                        }
                        type="number"
                      />
                    }
                    whileFalse={<label>{Currency}</label>}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Invoice Value"} />
                  <ConditionalDisplay
                    logic={method === "Create"}
                    whileTrue={
                      <Input
                        value={Amount}
                        process={(value) => changeData("", "Amount", value)}
                        type={"number"}
                      />
                    }
                    whileFalse={<label>{Amount}</label>}
                  />
                </Row>
                <Row>
                  <Label label={"Text"} />
                  <ConditionalDisplay
                    logic={method === "Create"}
                    whileTrue={
                      <Input
                        value={Text}
                        process={(value) => changeData("", "Text", value)}
                        type={"text"}
                      />
                    }
                    whileFalse={<label>{Text}</label>}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Place of Supply"} />
                  <ConditionalDisplay
                    logic={method === "Create"}
                    whileTrue={
                      <AutoSuggestInput
                        value={PoS}
                        process={(value) => changeData("", "PoS", value)}
                        placeholder={"Region Code"}
                        suggestions={Region.list("Code")}
                        captions={Region.list("Description")}
                      />
                    }
                    whileFalse={<label>{PoS}</label>}
                  />
                </Row>
              </Column>,
              <Column borderBottom="none" overflow="visible">
                <Row overflow="visible">
                  <Label label={"Vendor"} />
                  <ConditionalDisplay
                    logic={method === "Create"}
                    whileTrue={
                      <AutoSuggestInput
                        value={Vendor}
                        process={(value) => changeData("", "Vendor", value)}
                        placeholder={"Vendor Code"}
                        suggestions={vendor.listAll("Code")}
                        captions={vendor.listAll("Name")}
                      />
                    }
                    whileFalse={<label>{Vendor}</label>}
                  />
                </Row>
                <Row overflow="visible">
                  <Label label={"Vendor Name"} />
                  <label>{VendorName}</label>
                </Row>
                <Row overflow="visible">
                  <Label label={"Business Tax Partner"} />
                  <ConditionalDisplay
                    logic={method === "Create"}
                    whileTrue={
                      <AutoSuggestInput
                        value={BPartner}
                        process={(value) => changeData("", "BPartner", value)}
                        placeholder={"Vendor Code"}
                        suggestions={vendor.listAll("Code")}
                        captions={vendor.listAll("Name")}
                      />
                    }
                    whileFalse={<label>{BPartner}</label>}
                  />
                </Row>
              </Column>,
            ]}
          />

          <MultiDisplayArea
            heads={["General", "Cost"]}
            contents={[
              <Column>
                <Row jc="left" borderBottom="none">
                  <Label label={"Items of General Accounting"} />
                  <Button
                    name={"Add"}
                    functionsArray={[
                      () =>
                        addItemtoArray(`General`, {
                          Ledger: "",
                          Amount: "",
                          PC: "",
                          BTC: "",
                          HSN: "",
                        }),
                    ]}
                  />
                </Row>
                <Table
                  columns={[
                    "Ledger",
                    "Amount",
                    "BTC",
                    "Profit Center",
                    "HSN",
                    "",
                  ]}
                  rows={General.map((item, i) => [
                    <AutoSuggestInput
                      value={item.Ledger}
                      process={(value) =>
                        changeData(`General/${i}`, "Ledger", value)
                      }
                      suggestions={company
                        .collection("GeneralLedger")
                        .listAllFromCompany("Code")}
                      captions={company
                        .collection("GeneralLedger")
                        .listAllFromCompany("Description")}
                    />,
                    <Input
                      value={item.Amount}
                      process={(value) =>
                        changeData(`General/${i}`, "Amount", value)
                      }
                    />,
                    <AutoSuggestInput
                      value={item.BTC}
                      process={(value) =>
                        changeData(`General/${i}`, "BTC", value)
                      }
                      suggestions={company
                        .collection("BusinessTaxCode")
                        .listAllFromCompany("Code")}
                      captions={company
                        .collection("BusinessTaxCode")
                        .listAllFromCompany("Description")}
                    />,
                    <AutoSuggestInput
                      value={item.PC}
                      process={(value) =>
                        changeData(`General/${i}`, "PC", value)
                      }
                      suggestions={company
                        .collection("ProfitCenter")
                        .listAllFromCompany("Code")}
                      captions={company
                        .collection("ProfitCenter")
                        .listAllFromCompany("Description")}
                    />,
                    <AutoSuggestInput
                      value={item.HSN}
                      process={(value) =>
                        changeData(`General/${i}`, "HSN", value)
                      }
                      placeholder={""}
                      suggestions={ListItems(HSN.read(), "Code")}
                    />,
                    <Button
                      name={"-"}
                      functionsArray={[() => deleteItemfromArray(`General`, i)]}
                    />,
                  ])}
                />
              </Column>,
              <Column>
                <Row jc="left" borderBottom="none">
                  <Label label={"Items of Cost"} />
                  <Button
                    name={"Add"}
                    functionsArray={[
                      () =>
                        addItemtoArray("Costs", {
                          Element: "",
                          Amount: 0,
                          ObjectType: "CostCenter",
                          Object: "",
                          From: "",
                          To: "",
                        }),
                    ]}
                  />
                </Row>
                <Table
                  columns={[
                    "Cost Element",
                    "Amount",
                    "Object Type",
                    "Object",
                    "Period From",
                    "Period To",
                    "BTC",
                    "HSN",
                    "",
                  ]}
                  rows={Costs.map((cost, c) => [
                    <AutoSuggestInput
                      value={cost.Element}
                      process={(value) =>
                        changeData(`Costs/${c}`, "Element", value)
                      }
                      placeholder={"Element"}
                      suggestions={company.gl("").listAllFromCompany("Code")}
                      captions={company
                        .gl("")
                        .listAllFromCompany("Description")}
                    />,
                    <Input
                      value={cost.Amount}
                      process={(value) =>
                        changeData(`Costs/${c}`, "Amount", value)
                      }
                    />,
                    <Option
                      value={cost.ObjectType}
                      process={(value) =>
                        changeData(`Costs/${c}`, "ObjectType", value)
                      }
                      options={[
                        "CostCenter",
                        "RevenueCenter",
                        "Location",
                        "ProfitCenter",
                        "AssetDevelopmentOrder",
                        "PurchaseOrder",
                        "Plant",
                        "ProcessOrder",
                        "MaintenanceOrder",
                        "StockTransportOrder",
                        "SaleOrder",
                      ]}
                    />,
                    <AutoSuggestInput
                      value={cost.Object}
                      process={(value) =>
                        changeData(`Costs/${c}`, "Object", value)
                      }
                      placeholder={cost.ObjectType}
                      suggestions={company
                        .collection(cost.ObjectType)
                        .listAllFromCompany("Code")}
                      captions={company
                        .collection(cost.ObjectType)
                        .listAllFromCompany("Description")}
                    />,
                    <Input
                      value={cost.From}
                      process={(value) =>
                        changeData(`Costs/${c}`, "From", value)
                      }
                      type={"date"}
                    />,
                    <Input
                      value={cost.To}
                      process={(value) => changeData(`Costs/${c}`, "To", value)}
                      type={"date"}
                    />,
                    <AutoSuggestInput
                      value={cost.BTC}
                      process={(value) =>
                        changeData(`Costs/${c}`, "BTC", value)
                      }
                      placeholder={""}
                      suggestions={company
                        .collection("BusinessTaxCode")
                        .listAllFromCompany("Code")}
                      captions={company
                        .collection("BusinessTaxCode")
                        .listAllFromCompany("Description")}
                    />,
                    <AutoSuggestInput
                      value={cost.HSN}
                      process={(value) =>
                        changeData(`Costs/${c}`, "HSN", value)
                      }
                      placeholder={""}
                      suggestions={ListItems(HSN.read(), "Code")}
                    />,
                    <Button
                      name={"-"}
                      functionsArray={[() => deleteItemfromArray(`Costs`, c)]}
                    />,
                  ])}
                />
              </Column>,
            ]}
          />
        </DisplayArea>
      </WindowContent>
    </>
  );
}
