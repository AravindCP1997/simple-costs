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
  Conditional,
  HidingPrompt,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import {
  SaleOrder,
  RevenueCenter,
  CompanyCollection,
  Customer,
  BusinessTaxCode,
} from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  noop,
  rangeOverlap,
} from "../functions";
import { defaultSaleOrder } from "../defaults";

export function CreateSaleOrder({
  initial = defaultSaleOrder,
  meth = "Create",
}) {
  const {
    data: promptData,
    changeData: changePrompt,
    reset: resetPrompt,
  } = useData({ company: "", code: "" });
  const promptCollection = new SaleOrder(promptData.code, promptData.company);
  const [method, setmethod] = useState(meth);
  const {
    data,
    processed,
    changeData,
    reset,
    setdata,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { openWindow, openConfirm, showAlert } = useInterface();
  const { DisplayHidingError, addError, clearErrors, errorsExist } = useError();
  const { Company, Code, Date, CustomerCode, Description, Items, Status } =
    processed;
  Items.forEach((item, i) => {
    const Item = new CompanyCollection(Company, item.Type);
    item.Description = Item.exists({ Code: item.Item })
      ? Item.getData({ Code: item.Item }).Description
      : "Not Available";
    item.Value = item.Quantity * item.Rate;
  });
  const collection = new SaleOrder(Code, Company);
  const customer = new Customer(CustomerCode, Company);
  useEffect(() => {
    clearErrors();
    if (method !== "View") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company '${Company}' does not exist.`,
      );
      addError(!customer.exists(), "Customer", "Customer does not exist.");
      addError(
        Items.forEach((item, i) => {
          const { Type, Item, Quantity, Rate, Due, RevenueCenterCode, BTC } =
            item;
          addError(
            !new CompanyCollection(Company, Type).exists({ Code: Item }),
            `Items/${i + 1}`,
            `${Type} does not exist.`,
          );
          addError(
            BTC !== "" && !new BusinessTaxCode(BTC, Company).exists(),
            `Items/${i + 1}`,
            `Business Tax Code '${BTC}' does not exist.`,
          );
          addError(
            RevenueCenterCode === "",
            `Items/${i + 1}`,
            "Revenue Center cannot be blank.",
          );
          addError(
            RevenueCenterCode !== "" &&
              !new CompanyCollection(Company, "RevenueCenter").exists({
                Code: RevenueCenterCode,
              }),
            `Items/${i + 1}`,
            `Revenue Center ${RevenueCenterCode} does not exist.`,
          );
          addError(Due === "", `Items/${i + 1}`, "Due Date cannot be blank.");
        }),
      );
    }
  }, [data]);
  return (
    <>
      <WindowTitle
        title={`${method} Sale Order`}
        menu={[
          <Conditional logic={method !== "Create"}>
            <Button
              name="Create"
              functionsArray={[
                () => setmethod("Create"),
                () => setdata(defaultSaleOrder),
              ]}
            />
          </Conditional>,
          <HidingPrompt
            submitLabel="Open"
            result={promptCollection.exists()}
            title={"Open"}
            onClose={[() => resetPrompt()]}
            onSubmitFail={[() => showAlert("Sale order does not exist.")]}
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
                value={promptData.company}
                process={(value) => changePrompt("", "company", value)}
                suggestions={promptCollection.company.listAll("Code")}
                captions={promptCollection.company.listAll("Name")}
              />
            </Row>
            <Row overflow="visible">
              <Label label={"Sale Order"} />
              <AutoSuggestInput
                value={promptData.code}
                process={(value) => changePrompt("", "code", value)}
                suggestions={promptCollection.listAllFromCompany("Code")}
                captions={promptCollection.listAllFromCompany("Description")}
              />
            </Row>
          </HidingPrompt>,
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () =>
                  showAlert(
                    collection.add({ ...processed, ["Status"]: "Ready" }),
                  ),
                () => setdata(defaultSaleOrder),
                () => setmethod("Create"),
              ]}
            />
          </Conditional>,
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Draft"}
              result={collection.company.exists()}
              whileFalse={[() => showAlert("Company does not exist.")]}
              whileTrue={[
                () => showAlert(collection.add(processed)),
                () => setdata(defaultSaleOrder),
                () => setmethod("Create"),
              ]}
            />
          </Conditional>,
          <Conditional logic={method === "Update"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () =>
                  showAlert(
                    collection.update({ ...processed, ["Status"]: "Ready" }),
                  ),
                () => setdata(defaultSaleOrder),
                () => setmethod("Create"),
              ]}
            />
          </Conditional>,
          <Conditional logic={method === "Update"}>
            <ConditionalButton
              name={"Draft"}
              result={collection.company.exists()}
              whileFalse={[() => showAlert("Company does not exist.")]}
              whileTrue={[
                () => showAlert(collection.update(processed)),
                () => setdata(defaultSaleOrder),
                () => setmethod("Create"),
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
                suggestions={collection.company.filteredList(
                  { Status: "Ready" },
                  "Code",
                )}
                captions={collection.company.filteredList(
                  { Status: "Ready" },
                  "Name",
                )}
              />
            </Conditional>
            <Conditional logic={method !== "Create"}>
              <label>{Company}</label>
            </Conditional>
          </Row>
          <Row>
            <Label label={"Code"} />
            <label>{Code}</label>
          </Row>
          <Row>
            <Label label={"Status"} />
            <label>{Status}</label>
          </Row>
          <Row>
            <Label label={"Date"} />
            <Conditional logic={method !== "View"}>
              <Input
                value={Date}
                process={(value) => changeData("", "Date", value)}
                type={"date"}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{Date}</label>
            </Conditional>
          </Row>
          <Row overflow="visible">
            <Label label={"Customer"} />
            <Conditional logic={method !== "View"}>
              <AutoSuggestInput
                value={CustomerCode}
                process={(value) => changeData("", "CustomerCode", value)}
                placeholder={"Enter Customer Code"}
                suggestions={customer.listAllFromCompany("Code")}
                captions={customer.listAllFromCompany("Name")}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{CustomerCode}</label>
            </Conditional>
          </Row>
          <Row>
            <Label label={"Description"} />
            <Conditional logic={method !== "View"}>
              <Input
                value={Description}
                process={(value) => changeData("", "Description", value)}
                type={"text"}
                style={{ width: "100%" }}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{Description}</label>
            </Conditional>
          </Row>
          <Column overflow="visible">
            <Conditional logic={method !== "View"}>
              <Row jc="left">
                <Label label={"Items"} />
                <Button
                  name="Add"
                  functionsArray={[
                    () =>
                      addItemtoArray("Items", {
                        Type: "Material",
                        Item: "",
                        Description: "",
                        Quantity: "",
                        Rate: "",
                        Value: "",
                        Due: "",
                        RevenueCenterCode: "",
                        BTC: "",
                      }),
                  ]}
                />
              </Row>
              <Table
                columns={[
                  "No",
                  "Type",
                  "Item",
                  "Description",
                  "Quantity",
                  "Rate",
                  "Value",
                  "Due Date",
                  "Revenue Center",
                  "Business Tax Code",
                  "",
                ]}
                rows={Items.map((item, i) => [
                  <Input value={i + 1} />,
                  <Option
                    value={item.Type}
                    process={(value) => changeData(`Items/${i}`, `Type`, value)}
                    options={["Material", "Service"]}
                  />,
                  <AutoSuggestInput
                    value={item.Item}
                    process={(value) => changeData(`Items/${i}`, `Item`, value)}
                    suggestions={new CompanyCollection(
                      Company,
                      item.Type,
                    ).listAllFromCompany("Code")}
                    captions={new CompanyCollection(
                      Company,
                      item.Type,
                    ).listAllFromCompany("Description")}
                  />,
                  <Input
                    value={item.Description}
                    process={(value) =>
                      changeData(`Items/${i}`, `Description`, value)
                    }
                    type={"text"}
                  />,
                  <Input
                    value={item.Quantity}
                    process={(value) =>
                      changeData(`Items/${i}`, `Quantity`, value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={item.Rate}
                    process={(value) => changeData(`Items/${i}`, `Rate`, value)}
                    type={"number"}
                  />,
                  <Input value={item.Value} />,
                  <Input
                    value={item.Due}
                    process={(value) => changeData(`Items/${i}`, `Due`, value)}
                    type={"date"}
                  />,
                  <AutoSuggestInput
                    value={item.RevenueCenterCode}
                    process={(value) =>
                      changeData(`Items/${i}`, `RevenueCenterCode`, value)
                    }
                    suggestions={new CompanyCollection(
                      Company,
                      "RevenueCenter",
                    ).listAllFromCompany("Code")}
                    captions={new CompanyCollection(
                      Company,
                      "RevenueCenter",
                    ).listAllFromCompany("Description")}
                  />,
                  <AutoSuggestInput
                    value={item.BTC}
                    process={(value) => changeData(`Items/${i}`, `BTC`, value)}
                    suggestions={new CompanyCollection(
                      Company,
                      "BusinessTaxCode",
                    ).listAllFromCompany("Code")}
                    captions={new CompanyCollection(
                      Company,
                      "BusinessTaxCode",
                    ).listAllFromCompany("Description")}
                  />,
                  <Button
                    name={"-"}
                    functionsArray={[() => deleteItemfromArray(`Items`, i)]}
                  />,
                ])}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <Row jc="left">
                <Label label={"Items"} />
              </Row>
              <Table
                columns={[
                  "No",
                  "Type",
                  "Item",
                  "Description",
                  "Quantity",
                  "Rate",
                  "Value",
                  "Due Date",
                  "RevenueCenter",
                  "Business Tax Code",
                ]}
                rows={Items.map((item, i) => [
                  <label>{i + 1}</label>,
                  <label>{item.Type}</label>,
                  <label>{item.Item}</label>,
                  <label>{item.Description}</label>,
                  <label>{item.Quantity}</label>,
                  <label>{item.Rate}</label>,
                  <label>{item.Value}</label>,
                  <label>{item.Due}</label>,
                  <label>{item.RevenueCenter}</label>,
                  <label>{item.BTC}</label>,
                ])}
              />
            </Conditional>
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
