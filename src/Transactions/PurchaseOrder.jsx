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
  PurchaseOrder,
  Location,
  CompanyCollection,
  Vendor,
  BusinessTaxCode,
} from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";
import { defaultPurchaseOrder } from "../defaults";

export function CreatePurchaseOrder({
  initial = defaultPurchaseOrder,
  meth = "Create",
}) {
  const {
    data: promptData,
    changeData: changePrompt,
    reset: resetPrompt,
  } = useData({ company: "", code: "" });
  const promptCollection = new PurchaseOrder(
    promptData.code,
    promptData.company,
  );
  const [method, setmethod] = useState(meth);
  const {
    data,
    changeData,
    reset,
    setdata,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { openWindow, openConfirm, showAlert } = useInterface();
  const { DisplayHidingError, addError, clearErrors, errorsExist } = useError();
  const process = (inputdata) => {
    const processedData = { ...inputdata };
    const { Company, Code, Date, VendorCode, Description, Items } =
      processedData;
    Items.forEach((item, i) => {
      const Item = new CompanyCollection(Company, item.Type);
      item.Description = Item.exists({ Code: item.Item })
        ? Item.getData({ Code: item.Item }).Description
        : "Not Available";
      item.Value = item.Quantity * item.Rate;
    });
    return processedData;
  };
  const { Company, Code, Date, VendorCode, Description, Items, Status } =
    process(data);
  const collection = new PurchaseOrder(Code, Company);
  const vendor = new Vendor(VendorCode, Company);
  useEffect(() => {
    clearErrors();
    if (method !== "View") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company '${Company}' does not exist.`,
      );
      addError(!vendor.exists(), "Vendor", "Vendor does not exist.");
      addError(
        Items.forEach((item, i) => {
          const {
            Type,
            Item,
            Quantity,
            Rate,
            Due,
            Location,
            OrgAssignmentType,
            Assignment,
            BTC,
          } = item;
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
            Type === "Material" && Location === "",
            `Items/${i + 1}`,
            "Material requires a Location",
          );
          addError(
            Type === "Material" &&
              Location !== "" &&
              !new CompanyCollection(Company, "Location").exists({
                Code: Location,
              }),
            `Items/${i + 1}`,
            `Location ${Location} does not exist.`,
          );
          addError(
            Type === "Service" && Assignment === "",
            `Items/${i + 1}`,
            "Service requires an Organisational Assignment",
          );
          addError(
            Type === "Service" &&
              Assignment !== "" &&
              !new CompanyCollection(Company, OrgAssignmentType).exists({
                Code: Assignment,
              }),
            `Items/${i + 1}`,
            `${OrgAssignmentType} does not exist.`,
          );
          addError(Due === "", `Items/${i + 1}`, "Due Date cannot be blank.");
        }),
      );
    }
  }, [data]);
  return (
    <>
      <WindowTitle
        title={`${method} Purchase Order`}
        menu={[
          <Conditional logic={method !== "Create"}>
            <Button
              name="Create"
              functionsArray={[
                () => setmethod("Create"),
                () => setdata(defaultPurchaseOrder),
              ]}
            />
          </Conditional>,
          <HidingPrompt
            submitLabel="Open"
            result={promptCollection.exists()}
            title={"Open"}
            onClose={[() => resetPrompt()]}
            onSubmitFail={[() => showAlert("Purchase order does not exist.")]}
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
            <DisplayArea>
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
                <Label label={"Purchase Order"} />
                <AutoSuggestInput
                  value={promptData.code}
                  process={(value) => changePrompt("", "code", value)}
                  suggestions={promptCollection.listAllFromCompany("Code")}
                  captions={promptCollection.listAllFromCompany("Description")}
                />
              </Row>
            </DisplayArea>
          </HidingPrompt>,
          <Conditional logic={method === "Create"}>
            <ConditionalButton
              name={"Save"}
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () =>
                  showAlert(collection.add({ ...data, ["Status"]: "Ready" })),
                () => setdata(defaultPurchaseOrder),
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
                () => showAlert(collection.add(data)),
                () => setdata(defaultPurchaseOrder),
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
                    collection.update({ ...data, ["Status"]: "Ready" }),
                  ),
                () => setdata(defaultPurchaseOrder),
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
                () => showAlert(collection.update(data)),
                () => setdata(defaultPurchaseOrder),
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
            <Label label={"Vendor"} />
            <Conditional logic={method !== "View"}>
              <AutoSuggestInput
                value={VendorCode}
                process={(value) => changeData("", "VendorCode", value)}
                placeholder={"Enter Vendor Code"}
                suggestions={vendor.listAllFromCompany("Code")}
                captions={vendor.listAllFromCompany("Name")}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{VendorCode}</label>
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
                        Location: "",
                        OrgAssignmentType: "CostCenter",
                        Assignment: "",
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
                  "Location",
                  "Organisational Assignment",
                  "Assignment",
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
                    value={item.Location}
                    process={(value) =>
                      changeData(`Items/${i}`, `Location`, value)
                    }
                    suggestions={new CompanyCollection(
                      Company,
                      "Location",
                    ).listAllFromCompany("Code")}
                    captions={new CompanyCollection(
                      Company,
                      "Location",
                    ).listAllFromCompany("Description")}
                  />,
                  <Option
                    value={item.OrgAssignmentType}
                    process={(value) =>
                      changeData(`Items/${i}`, `OrgAssignmentType`, value)
                    }
                    options={[
                      "CostCenter",
                      "Location",
                      "Plant",
                      "RevenueCenter",
                    ]}
                  />,
                  <AutoSuggestInput
                    value={item.Assignment}
                    process={(value) =>
                      changeData(`Items/${i}`, `Assignment`, value)
                    }
                    suggestions={new CompanyCollection(
                      Company,
                      item.OrgAssignmentType,
                    ).listAllFromCompany("Code")}
                    captions={new CompanyCollection(
                      Company,
                      item.OrgAssignmentType,
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
                  "Location",
                  "Organisational Assignment",
                  "Assignment",
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
                  <label>{item.Location}</label>,
                  <label>{item.OrgAssignmentType}</label>,
                  <label>{item.Assignment}</label>,
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
