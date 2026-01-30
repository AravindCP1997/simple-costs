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
  HidingPrompt,
  Conditional,
  MultiDisplayArea,
  ConditionalDisplays,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import {
  AccountingDocument,
  Asset,
  CompanyCollection,
  Location,
  Material,
  MaterialDocument,
  MaterialReceipt,
  ProfitCenter,
  PurchaseOrder,
  StockTransportOrder,
  Transaction,
  Vendor,
} from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  perform,
  rangeOverlap,
  transformObject,
} from "../functions";

import { defaultMaterialReceipt } from "../defaults";
import { poReceipt } from "../businessFunctions";

export function CreateMaterialReceipt({
  initial = defaultMaterialReceipt,
  meth = "Create",
}) {
  const {
    data: promptData,
    changeData: changePrompt,
    reset: resetPrompt,
  } = useData({ Company: "", Year: 0, TransactionNo: 0 });
  const promptCollection = new MaterialReceipt(
    promptData.Company,
    Number(promptData.Year),
    Number(promptData.TransactionNo),
  );
  const [method, setmethod] = useState(meth);
  const {
    data,
    processed,
    setdata,
    changeData,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { showAlert, openWindow } = useInterface();
  const { errorsExist, clearErrors, addError, DisplayHidingError } = useError();
  const {
    Company,
    Year,
    AccYear,
    TransactionNo,
    MaterialDocNo,
    AccountingDocNo,
    ValueDate,
    PostingDate,
    LocationCode,
    ReceiptType,
    Text,
    PO,
    STO,
    ConsignmentPO,
    VendorCode,
    POReceipts,
    Consignments,
    VendorReceipts,
    STOReceipts,
  } = processed;
  const collection = new MaterialReceipt(
    Company,
    Year,
    TransactionNo,
    AccountingDocNo,
    MaterialDocNo,
    "MaterialReceipt",
  );
  const location = new Location(LocationCode, Company);
  const po = new PurchaseOrder(PO, Company);
  const sto = new StockTransportOrder(STO, Company);
  const vendor = new Vendor(VendorCode, Company);
  const consignment = new PurchaseOrder(ConsignmentPO, Company);
  const MaterialData = {
    Company,
    Year,
    DocumentNo: MaterialDocNo,
    ValueDate,
    Text,
    Movements: [],
  };
  const AccountsData = {
    Company,
    PostingDate,
    DocumentNo: AccountingDocNo,
    AccYear,
    Entries: [],
    Text,
  };
  perform(() => {
    perform(
      () => {
        processed.Year = collection.company.year(ValueDate);
      },
      collection.company.exists() && ValueDate !== "",
    );
    perform(() => {
      processed.POReceipts = [];
    }, ReceiptType !== "Purchase Order");
    perform(() => {
      processed.Consignments = [];
    }, ReceiptType !== "Purchase Order Consignment");
    perform(() => {
      processed.STOReceipts = [];
    }, ReceiptType !== "Stock Transport Order");
    perform(() => {
      processed.VendorReceipts = [];
    }, ReceiptType !== "Miscellaneous");

    [...STOReceipts, ...POReceipts, ...Consignments, ...VendorReceipts].forEach(
      (item, i) => {
        perform(
          () => {
            item.Value = item.Quantity * item.Rate;
          },
          item.Quantity !== "" && item.Quantity > 0,
        );
        perform(
          () => {
            item.Value = 0;
          },
          item.Quantity === "" || item.Quantity <= 0,
        );
      },
    );
    POReceipts.forEach((item, i) => {
      const {
        Quantity,
        MaterialCode,
        No,
        Description,
        Value: Amount,
        Inspection,
        Remarks: Text,
        PO: PurchaseOrder,
      } = item;
      const material = new Material(MaterialCode, Company);
      MaterialData.Movements.push({
        MaterialCode,
        LocationCode,
        Block: Inspection === "Pending" ? "For Inspection" : "Free",
        Quantity,
        Text,
        PurchaseOrder,
        Item: No,
        MovementType: "Receipt",
      });
      AccountsData.Entries.push(
        ...[
          {
            Account: material.group().getData().GLMat,
            Amount,
            Type: "Debit",
            ProfitCenter: location.exists()
              ? location.getData().ProfitCenter
              : "",
            Text,
          },
          {
            Account: material.group().getData().GLClearing,
            Amount,
            Type: "Credit",
            ProfitCenter: location.exists()
              ? location.getData().ProfitCenter
              : "",
            Text,
          },
        ],
      );
    });
    Consignments.forEach((item, i) => {
      const {
        Quantity,
        MaterialCode,
        No,
        Description,
        Value: Amount,
        Inspection,
        Remarks: Text,
        ConsignmentPO: PurchaseOrder,
      } = item;
      const material = new Material(MaterialCode, Company);
      MaterialData.Movements.push(
        ...[
          {
            MaterialCode,
            LocationCode,
            Block: Inspection === "Pending" ? "For Inspection" : "Free",
            Quantity,
            Text,
            MovementType: "Receipt",
            PurchaseOrder,
            Item: No,
          },
          {
            MaterialCode,
            LocationCode,
            Block: "In Transit",
            Quantity: -Number(Quantity),
            Text,
            MovementType: "Consignment Inwards Clearing",
            PurchaseOrder,
            Item: No,
          },
        ],
      );
      AccountsData.Entries.push(
        ...[
          {
            Account: material.group().getData().GLMat,
            Amount,
            Type: "Debit",
            ProfitCenter: location.exists()
              ? location.getData().ProfitCenter
              : "",
            Text,
          },
          {
            Account: material.group().getData().GLClearing,
            Amount,
            Type: "Credit",
            ProfitCenter: location.exists()
              ? location.getData().ProfitCenter
              : "",
            Text,
          },
        ],
      );
    });
    STOReceipts.forEach((item, i) => {
      const {
        Quantity,
        MaterialCode,
        No,
        Inspection,
        Remarks: Text,
        STO: StockTransportOrder,
      } = item;
      MaterialData.Movements.push(
        ...[
          {
            MaterialCode,
            LocationCode,
            Block: Inspection === "Pending" ? "For Inspection" : "Free",
            Quantity,
            Text,
            StockTransportOrder,
            Item: No,
            MovementType: "Receipt",
          },
          {
            MaterialCode,
            Quantity: -Number(Quantity),
            Block: "In Transit",
            Text,
            StockTransportOrder,
            Item: No,
            MovementType: "Stock Transfer Delivery",
          },
        ],
      );
    });
    VendorReceipts.forEach((item, i) => {
      const { Quantity, MaterialCode, Rate, Value: Amount, Inspection } = item;
      const material = new Material(MaterialCode, Company);
      MaterialData.Movements.push({
        MaterialCode,
        LocationCode,
        Block: Inspection === "Pending" ? "For Inspection" : "Free",
        Quantity,
        Text,
        Vendor: VendorCode,
      });
      AccountsData.Entries.push(
        ...[
          {
            Account: material.exists() ? material.group().getData().GLMat : "",
            Amount,
            Type: "Debit",
            ProfitCenter: location.exists()
              ? location.getData().ProfitCenter
              : "",
            Text,
          },
          {
            Account: material.exists() ? material.group().getData().GLMat : "",
            Amount,
            Type: "Credit",
            ProfitCenter: location.exists()
              ? location.getData().ProfitCenter
              : "",
            Text,
          },
        ],
      );
    });
  });
  useEffect(() => {
    clearErrors();
    addError(
      !collection.company.exists(),
      "Company",
      "Company does not exist.",
    );
    addError(!location.exists(), "Location", "Location does not exist.");
    addError(ValueDate === "", "ValueDate", "Value date cannot be blank.");
    addError(
      collection.company.exists() &&
        ValueDate !== "" &&
        !collection.company.openperiods.materialOpen(ValueDate),
      "ValueDate",
      "Value date not open for Material Posting.",
    );
    addError(
      collection.company.exists() &&
        PostingDate !== "" &&
        !collection.company.openperiods.accountingOpen(PostingDate),
      "PostingDate",
      "Posting date not open.",
    );
    addError(
      PostingDate === "",
      "PostingDate",
      "Posting date cannot be blank.",
    );
    addError(
      VendorReceipts.length > 0 && !vendor.exists(),
      "Vendor",
      "Vendor does not exist.",
    );
    VendorReceipts.forEach((item, i) => {
      const { MaterialCode, Value } = item;
      addError(
        !new Material(MaterialCode, Company).exists(),
        `Misc./${i + 1}`,
        "Material does not exist.",
      );
      addError(Value === 0, `Misc./${i + 1}`, "Value zero.");
    });
    POReceipts.forEach((item, i) => {
      const { Quantity } = item;
      addError(Quantity === 0, `POReceipts/${i + 1}`, "Quantity zero.");
    });
    STOReceipts.forEach((item, i) => {
      const { Quantity } = item;
      addError(Quantity === 0, `STOReceipts/${i + 1}`, "Quantity zero.");
    });
    Consignments.forEach((item, i) => {
      const { Quantity } = item;
      addError(Quantity === 0, `Consignments/${i + 1}`, "Quantity zero.");
    });
  }, [data]);

  return (
    <>
      <WindowTitle
        title={`Material Receipt`}
        menu={[
          <Conditional logic={method !== "Create"}>
            <Button
              name="New"
              functionsArray={[
                () => setmethod("Create"),
                () => setdata(defaultMaterialReceipt),
              ]}
            />
          </Conditional>,
          <HidingPrompt
            submitLabel="Open"
            result={promptCollection.exists()}
            title={"Open"}
            onClose={[() => resetPrompt()]}
            onSubmitFail={[() => showAlert("Material Receipt does not exist.")]}
            onSubmitSuccess={[
              () => setdata(promptCollection.getData()),
              () =>
                setmethod(
                  promptCollection.getData().Status === "Draft"
                    ? "Update"
                    : "View",
                ),
              () => resetPrompt(),
            ]}
          >
            <Row overflow="visible">
              <Label label={"Company"} />
              <AutoSuggestInput
                value={promptData.Company}
                process={(value) => changePrompt("", "Company", value)}
                suggestions={promptCollection.company.listAll("Code")}
                captions={promptCollection.company.listAll("Name")}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Year"} />
              <Input
                value={promptData.Year}
                process={(value) => changePrompt("", "Year", value)}
                type={"number"}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Material Receipt"} />
              <Input
                value={promptData.TransactionNo}
                process={(value) => changePrompt("", "TransactionNo", value)}
                type={"number"}
              />
            </Row>
          </HidingPrompt>,
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages Exist. Please check.")]}
              whileTrue={[
                () =>
                  showAlert(
                    collection.add(processed, MaterialData, AccountsData),
                  ),
                () => setmethod("Create"),
                () => setdata(defaultMaterialReceipt),
              ]}
            />
          </Conditional>,
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Draft"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages Exist. Please check.")]}
              whileTrue={[
                () =>
                  showAlert(
                    collection.add(
                      processed,
                      MaterialData,
                      AccountsData,
                      "Draft",
                    ),
                  ),
                () => setmethod("Create"),
                () => setdata(defaultMaterialReceipt),
              ]}
            />
          </Conditional>,
          <Conditional logic={method === "Update"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages Exist. Please check.")]}
              whileTrue={[
                () =>
                  showAlert(
                    collection.update(processed, MaterialData, AccountsData),
                  ),
                () => setmethod("Create"),
                () => setdata(defaultMaterialReceipt),
              ]}
            />
          </Conditional>,
          <Conditional logic={method === "Update"}>
            <ConditionalButton
              name={"Draft"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages Exist. Please check.")]}
              whileTrue={[
                () =>
                  showAlert(
                    collection.update(
                      processed,
                      MaterialData,
                      AccountsData,
                      "Draft",
                    ),
                  ),
                () => setmethod("Create"),
                () => setdata(defaultMaterialReceipt),
              ]}
            />
          </Conditional>,
          <Conditional logic={method !== "View"}>
            <DisplayHidingError />
          </Conditional>,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row overflow="visible">
            <Label label={"Company"} />
            <Conditional logic={method === "Create"}>
              <AutoSuggestInput
                value={Company}
                process={(value) => changeData("", "Company", value)}
                placeholder={"Enter Company Code"}
                suggestions={collection.company.listAll("Code")}
                captions={collection.company.listAll("Name")}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{Company}</label>
            </Conditional>
          </Row>
          <Row overflow="visible">
            <Label label={"Location"} />
            <Conditional logic={method !== "View"}>
              <AutoSuggestInput
                value={LocationCode}
                process={(value) => changeData("", "LocationCode", value)}
                placeholder={"Enter Location"}
                suggestions={location.listAllFromCompany("Code")}
                captions={location.listAllFromCompany("Description")}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{LocationCode}</label>
            </Conditional>
          </Row>
          <Row overflow="visible">
            <Label label={"Value Date"} />
            <Conditional logic={method !== "View"}>
              <Input
                value={ValueDate}
                process={(value) => changeData("", "ValueDate", value)}
                type={"date"}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{ValueDate}</label>
            </Conditional>
          </Row>
          <Row overflow="visible">
            <Label label={"Posting Date"} />
            <Conditional logic={method !== "View"}>
              <Input
                value={PostingDate}
                process={(value) => changeData("", "PostingDate", value)}
                type={"date"}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{PostingDate}</label>
            </Conditional>
          </Row>
          <Row>
            <Label label={"Year"} />
            <label>{Year}</label>
          </Row>
          <Row overflow="visible">
            <Label label={"Text"} />
            <Conditional logic={method !== "View"}>
              <Input
                value={Text}
                process={(value) => changeData("", "Text", value)}
                type={"text"}
                style={{ width: "min(100%,600px)" }}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{Text}</label>
            </Conditional>
          </Row>
          <Row overflow="visible">
            <Label label={"Receipt Type"} />
            <Conditional logic={method !== "View"}>
              <Option
                value={ReceiptType}
                process={(value) => changeData("", "ReceiptType", value)}
                options={[
                  "Purchase Order",
                  "Purchase Order Consignment",
                  "Stock Transport Order",
                  "Miscellaneous",
                ]}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{ReceiptType}</label>
            </Conditional>
          </Row>
          <Column>
            <Row jc="left" borderBottom="none">
              <Label label={"Materials"} />
              <Conditional
                logic={method !== "View" && ReceiptType === "Miscellaneous"}
              >
                <Button
                  name={"Add"}
                  functionsArray={[
                    () =>
                      addItemtoArray(`VendorReceipts`, {
                        MaterialCode: "",
                        Description: "",
                        Quantity: 0,
                        Rate: 0,
                        Value: 0,
                        Inspection: "",
                        Remarks: "",
                      }),
                  ]}
                />
              </Conditional>
            </Row>
            <ConditionalDisplays
              displays={[
                [
                  ReceiptType === "Purchase Order" && method !== "View",
                  <Column>
                    <Row jc="center" overflow="visible" borderBottom="none">
                      <AutoSuggestInput
                        value={PO}
                        process={(value) => changeData("", "PO", value)}
                        suggestions={po.listAllFromCompany("Code")}
                        captions={po.listAllFromCompany("Description")}
                        placeholder={"Enter Purchase Order"}
                      />
                      <ConditionalButton
                        name={"Load"}
                        result={po.exists()}
                        whileFalse={[
                          () => showAlert("Purchase Order does not exist"),
                        ]}
                        whileTrue={[
                          () => {
                            changeData("", "POReceipts", []);
                            changeData(
                              "",
                              "POReceipts",
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
                                    Inspection: "Not Required",
                                    PO,
                                  },
                                ),
                              ),
                            );
                          },
                          () => changeData("", "PO", ""),
                        ]}
                      />
                    </Row>
                    <Table
                      columns={[
                        "PO",
                        "Item No",
                        "Material",
                        "Item Description",
                        "Quantity",
                        "Rate",
                        "Value",
                        "Inspection",
                        "Remarks",
                        "",
                      ]}
                      rows={POReceipts.map((item, i) => [
                        <label>{item.PO}</label>,
                        <label>{item.No}</label>,
                        <label>{item.MaterialCode}</label>,
                        <label>{item.Description}</label>,
                        <Input
                          value={item.Quantity}
                          process={(value) =>
                            changeData(`POReceipts/${i}`, "Quantity", value)
                          }
                          type={"number"}
                        />,
                        <label>{item.Rate}</label>,
                        <label>{item.Value}</label>,
                        <Option
                          value={item.Inspection}
                          process={(value) =>
                            changeData(`POReceipts/${i}`, "Inspection", value)
                          }
                          options={["Not Required", "Complete", "Pending"]}
                        />,
                        <Input
                          value={item.Remarks}
                          process={(value) =>
                            changeData(`POReceipts/${i}`, "Remarks", value)
                          }
                          type={"text"}
                        />,
                        <Button
                          name={"-"}
                          functionsArray={[
                            () => deleteItemfromArray("POReceipts", i),
                          ]}
                        />,
                      ])}
                    />
                  </Column>,
                ],
                [
                  ReceiptType === "Purchase Order" && method === "View",
                  <Table
                    columns={[
                      "PO",
                      "Item No",
                      "Material",
                      "Item Description",
                      "Quantity",
                      "Inspection",
                      "Remarks",
                    ]}
                    rows={POReceipts.map((item, i) => [
                      <label>{item.PO}</label>,
                      <label>{item.No}</label>,
                      <label>{item.MaterialCode}</label>,
                      <label>{item.Description}</label>,
                      <label>{item.Quantity}</label>,
                      <label>{item.Inspection}</label>,
                      <label>{item.Remarks}</label>,
                    ])}
                  />,
                ],
                ,
                [
                  ReceiptType === "Purchase Order Consignment" &&
                    method !== "View",
                  <Column>
                    <Row jc="center" overflow="visible" borderBottom="none">
                      <AutoSuggestInput
                        value={ConsignmentPO}
                        process={(value) =>
                          changeData("", "ConsignmentPO", value)
                        }
                        suggestions={consignment.listAllFromCompany("Code")}
                        captions={consignment.listAllFromCompany("Description")}
                        placeholder={"Enter Purchase Order"}
                      />
                      <ConditionalButton
                        name={"Load"}
                        result={consignment.exists()}
                        whileFalse={[
                          () => showAlert("Purchase Order does not exist"),
                        ]}
                        whileTrue={[
                          () => {
                            changeData("", "Consignments", []);
                            changeData(
                              "",
                              "Consignments",
                              consignment.summary().map((item, i) =>
                                transformObject(
                                  item,
                                  ["Rate", "Description"],
                                  [
                                    ["Item", "MaterialCode"],
                                    ["InTransit", "Quantity"],
                                  ],
                                  {
                                    No: i + 1,
                                    Value: item.InTransit * item.Rate,
                                    Remarks: "",
                                    Inspection: "Not Required",
                                    ConsignmentPO,
                                  },
                                ),
                              ),
                            );
                          },
                          () => changeData("", "ConsignmentPO", ""),
                        ]}
                      />
                    </Row>
                    <Table
                      columns={[
                        "PO",
                        "Item No",
                        "Material",
                        "Item Description",
                        "Quantity",
                        "Rate",
                        "Value",
                        "Inspection",
                        "Remarks",
                        "",
                      ]}
                      rows={Consignments.map((item, i) => [
                        <label>{item.ConsignmentPO}</label>,
                        <label>{item.No}</label>,
                        <label>{item.MaterialCode}</label>,
                        <label>{item.Description}</label>,
                        <Input
                          value={item.Quantity}
                          process={(value) =>
                            changeData(`Consignments/${i}`, "Quantity", value)
                          }
                          type={"number"}
                        />,
                        <label>{item.Rate}</label>,
                        <label>{item.Value}</label>,
                        <Option
                          value={item.Inspection}
                          process={(value) =>
                            changeData(`Consignments/${i}`, "Inspection", value)
                          }
                          options={["Not Required", "Complete", "Pending"]}
                        />,
                        <Input
                          value={item.Remarks}
                          process={(value) =>
                            changeData(`Consignments/${i}`, "Remarks", value)
                          }
                          type={"text"}
                        />,
                        <Button
                          name={"-"}
                          functionsArray={[
                            () => deleteItemfromArray("Consignments", i),
                          ]}
                        />,
                      ])}
                    />
                  </Column>,
                ],
                [
                  ReceiptType === "Purchase Order Consignment" &&
                    method === "View",
                  <Table
                    columns={[
                      "PO",
                      "Item No",
                      "Material",
                      "Item Description",
                      "Quantity",
                      "Inspection",
                      "Remarks",
                    ]}
                    rows={Consignments.map((item, i) => [
                      <label>{item.ConsignmentPO}</label>,
                      <label>{item.No}</label>,
                      <label>{item.MaterialCode}</label>,
                      <label>{item.Description}</label>,
                      <label>{item.Quantity}</label>,
                      <label>{item.Inspection}</label>,
                      <label>{item.Remarks}</label>,
                    ])}
                  />,
                ],
                [
                  ReceiptType === "Stock Transport Order" && method !== "View",
                  <Column>
                    <Row jc="center" overflow="visible" borderBottom="none">
                      <AutoSuggestInput
                        value={STO}
                        process={(value) => changeData("", "STO", value)}
                        suggestions={sto.listAllFromCompany("Code")}
                        captions={sto.listAllFromCompany("Description")}
                        placeholder={"Enter Stock Transport Order"}
                      />
                      <ConditionalButton
                        name={"Load"}
                        result={sto.exists()}
                        whileFalse={[
                          () =>
                            showAlert("Stock Transport Order does not exist"),
                        ]}
                        whileTrue={[
                          () => {
                            changeData("", "STOReceipts", []);
                            changeData(
                              "",
                              "STOReceipts",
                              sto.summary().map((item, i) =>
                                transformObject(
                                  item,
                                  ["MaterialCode", "Rate", "Description"],
                                  [["InTransit", "Quantity"]],
                                  {
                                    No: i + 1,
                                    Value: item.InTransit * item.Rate,
                                    Inspection: "Not Required",
                                    Remarks: "",
                                    STO,
                                  },
                                ),
                              ),
                            );
                          },
                          () => changeData("", "STO", ""),
                        ]}
                      />
                    </Row>
                    <Conditional logic={method !== "View"}>
                      <Table
                        columns={[
                          "STO",
                          "Item No",
                          "Material",
                          "Item Description",
                          "Quantity",
                          "Rate",
                          "Value",
                          "Remarks",
                          "",
                        ]}
                        rows={STOReceipts.map((item, i) => [
                          <label>{item.STO}</label>,
                          <label>{item.No}</label>,
                          <label>{item.MaterialCode}</label>,
                          <label>{item.Description}</label>,
                          <Input
                            value={item.Quantity}
                            process={(value) =>
                              changeData(`STOReceipts/${i}`, "Quantity", value)
                            }
                            type={"number"}
                          />,
                          <label>{item.Rate}</label>,
                          <label>{item.Value}</label>,
                          <Input
                            value={item.Remarks}
                            process={(value) =>
                              changeData(`STOReceipts/${i}`, "Remarks", value)
                            }
                            type={"text"}
                          />,
                          <Button
                            name={"-"}
                            functionsArray={[
                              () => deleteItemfromArray("STOReceipts", i),
                            ]}
                          />,
                        ])}
                      />
                    </Conditional>
                  </Column>,
                ],
                [
                  ReceiptType === "Stock Transport Order" && method === "View",
                  <Table
                    columns={[
                      "STO",
                      "Item No",
                      "Material",
                      "Item Description",
                      "Quantity",
                      "Remarks",
                    ]}
                    rows={STOReceipts.map((item, i) => [
                      <label>{item.STO}</label>,
                      <label>{item.No}</label>,
                      <label>{item.MaterialCode}</label>,
                      <label>{item.Description}</label>,
                      <label>{item.Quantity}</label>,
                      <label>{item.Remarks}</label>,
                    ])}
                  />,
                ],
                [
                  ReceiptType === "Miscellaneous" && method !== "View",
                  <Column>
                    <Row overflow="visible" jc="left" borderBottom="none">
                      <Label label={"Vendor"} />
                      <AutoSuggestInput
                        value={VendorCode}
                        process={(value) => changeData("", "VendorCode", value)}
                        suggestions={vendor.listAllFromCompany("Code")}
                        captions={vendor.listAllFromCompany("Name")}
                        placeholder={"Enter Vendor Code"}
                      />
                    </Row>
                    <Table
                      columns={[
                        "Material",
                        "Item Description",
                        "Quantity",
                        "Rate (Est)",
                        "Value (Est)",
                        "Inspection",
                        "Remarks",
                        "",
                      ]}
                      rows={VendorReceipts.map((item, i) => [
                        <AutoSuggestInput
                          value={item.MaterialCode}
                          process={(value) =>
                            changeData(
                              `VendorReceipts/${i}`,
                              "MaterialCode",
                              value,
                            )
                          }
                          suggestions={new CompanyCollection(
                            Company,
                            "Material",
                          ).listAllFromCompany("Code")}
                          captions={new CompanyCollection(
                            Company,
                            "Material",
                          ).listAllFromCompany("Description")}
                        />,
                        <label>{item.Description}</label>,
                        <Input
                          value={item.Quantity}
                          process={(value) =>
                            changeData(`VendorReceipts/${i}`, "Quantity", value)
                          }
                          type={"number"}
                        />,
                        <Input
                          value={item.Rate}
                          process={(value) =>
                            changeData(`VendorReceipts/${i}`, "Rate", value)
                          }
                          type={"number"}
                        />,
                        <label>{item.Value}</label>,
                        <Option
                          value={item.Inspection}
                          process={(value) =>
                            changeData(
                              `VendorReceipts/${i}`,
                              "Inspection",
                              value,
                            )
                          }
                          options={["Not required", "Completed", "Pending"]}
                        />,
                        <Input
                          value={item.Remarks}
                          process={(value) =>
                            changeData(`VendorReceipts/${i}`, "Remarks", value)
                          }
                          type={"text"}
                        />,
                        <Button
                          name="-"
                          functionsArray={[
                            () => deleteItemfromArray(`VendorReceipts`, i),
                          ]}
                        />,
                      ])}
                    />
                  </Column>,
                ],
                [
                  ReceiptType === "Miscellaneous" && method === "View",
                  <Table
                    columns={[
                      "Material",
                      "Item Description",
                      "Quantity",
                      "Remarks",
                      "Inspection",
                      "Vendor",
                    ]}
                    rows={VendorReceipts.map((item, i) => [
                      <label>{item.MaterialCode}</label>,
                      <label>{item.Description}</label>,
                      <label>{item.Quantity}</label>,
                      <label>{item.Inspection}</label>,
                      <label>{item.Remarks}</label>,
                      <label>{VendorCode}</label>,
                    ])}
                  />,
                ],
              ]}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
