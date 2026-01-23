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
  StockTransportOrder,
  Material,
  Location,
  CompanyCollection,
  Vendor,
  VendorGroup,
} from "../classes";

import { defaultStockTransportOrder } from "../defaults";

export function CreateStockTransportOrder({
  initial = defaultStockTransportOrder,
  meth = "Create",
}) {
  const {
    data: promptData,
    changeData: changePrompt,
    reset: resetPrompt,
  } = useData({ company: "", code: "" });
  const promptCollection = new StockTransportOrder(
    promptData.code,
    promptData.company,
  );
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
  const {
    Company,
    Code,
    Date,
    Description,
    VendorCode,
    Transport,
    Items,
    Status,
  } = processed;
  const collection = new StockTransportOrder(Code, Company);
  const vendor = new Vendor(VendorCode, Company);
  Items.forEach((item, i) => {
    item.Value = item.Quantity * item.Rate;
  });
  useEffect(() => {
    clearErrors();
    if (method !== "View") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company '${Company}' does not exist.`,
      );
      addError(Date === "", "Date", "Date cannot be blank.");
      addError(
        Transport === "Hired" && !vendor.exists(),
        "Vendor",
        `Vendor ${VendorCode} does not exist.`,
      );
      Items.forEach((item, i) => {
        const { MaterialCode, From, To, Quantity, Rate, Value } = item;
        addError(
          !new Material(MaterialCode, Company).exists(),
          `Items/${i + 1}`,
          `Material ${MaterialCode} does not exist.`,
        );
        addError(
          !new Location(From, Company).exists(),
          `Items/${i + 1}`,
          `Location ${From} does not exist.`,
        );
        addError(
          !new Location(To, Company).exists(),
          `Items/${i + 1}`,
          `Location ${To} does not exist.`,
        );
        addError(
          Quantity === "" || Quantity < 0,
          `Items/${i + 1}`,
          "Quantity shall be a positive value.",
        );
        addError(
          Rate === "" || Rate < 0,
          `Items/${i + 1}`,
          "Rate shall be a positive value.",
        );
      });
    }
  }, [data]);
  return (
    <>
      <WindowTitle
        title={`${method} Stock Transport Order`}
        menu={[
          <Conditional logic={method !== "Create"}>
            <Button
              name="Create"
              functionsArray={[
                () => setmethod("Create"),
                () => setdata(defaultStockTransportOrder),
              ]}
            />
          </Conditional>,
          <HidingPrompt
            submitLabel="Open"
            result={promptCollection.exists()}
            title={"Open"}
            onClose={[() => resetPrompt()]}
            onSubmitFail={[
              () => showAlert("Stock Transport order does not exist."),
            ]}
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
              <Label label={"Stock Transport Order"} />
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
                () => setdata(defaultStockTransportOrder),
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
                () => setdata(defaultStockTransportOrder),
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
                () => setdata(defaultStockTransportOrder),
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
                () => setdata(defaultStockTransportOrder),
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
          <Row overflow="visible">
            <Label label={"Mode of Transport"} />
            <Conditional logic={method !== "View"}>
              <Option
                value={Transport}
                process={(value) => changeData("", "Transport", value)}
                options={["Own", "Hired"]}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{Transport}</label>
            </Conditional>
          </Row>
          <Conditional logic={Transport === "Hired"}>
            <Row overflow="visible">
              <Label label={"Transport Vendor"} />
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
          </Conditional>
          <Column overflow="visible">
            <Conditional logic={method !== "View"}>
              <Row jc="left">
                <Label label={"Items"} />
                <Button
                  name="Add"
                  functionsArray={[
                    () =>
                      addItemtoArray("Items", {
                        MaterialCode: "",
                        Description: "",
                        From: "",
                        To: "",
                        Quantity: 0,
                        Rate: 0,
                        Value: 0,
                      }),
                  ]}
                />
              </Row>
              <Table
                columns={[
                  "No",
                  "Material",
                  "Description",
                  "From Location",
                  "To Location",
                  "Quantity",
                  "Rate",
                  "Value",
                  "",
                ]}
                rows={Items.map((item, i) => [
                  <label>{i + 1}</label>,
                  <AutoSuggestInput
                    value={item.MaterialCode}
                    process={(value) =>
                      changeData(`Items/${i}`, "MaterialCode", value)
                    }
                    suggestions={new Material("", Company).listAllFromCompany(
                      "Code",
                    )}
                    captions={new Material("", Company).listAllFromCompany(
                      "Description",
                    )}
                    placeholder={"Enter Material Code"}
                  />,
                  <label>{Items.Description}</label>,
                  <AutoSuggestInput
                    value={item.From}
                    process={(value) => changeData(`Items/${i}`, `From`, value)}
                    placeholder={"Enter Location"}
                    suggestions={new Location("", Company).listAllFromCompany(
                      "Code",
                    )}
                    captions={new Location("", Company).listAllFromCompany(
                      "Description",
                    )}
                  />,
                  <AutoSuggestInput
                    value={item.To}
                    process={(value) => changeData(`Items/${i}`, `To`, value)}
                    placeholder={"Enter Location"}
                    suggestions={new Location("", Company).listAllFromCompany(
                      "Code",
                    )}
                    captions={new Location("", Company).listAllFromCompany(
                      "Description",
                    )}
                  />,
                  <Input
                    value={item.Quantity}
                    type={"number"}
                    process={(value) =>
                      changeData(`Items/${i}`, `Quantity`, value)
                    }
                  />,
                  <Input
                    value={item.Rate}
                    type={"number"}
                    process={(value) => changeData(`Items/${i}`, `Rate`, value)}
                  />,
                  <label>{item.Value}</label>,
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
                  "Material",
                  "Description",
                  "From Location",
                  "To Location",
                  "Quantity",
                  "Rate",
                  "Value",
                ]}
                rows={Items.map((item, i) => [
                  <label>{i + 1}</label>,
                  <label>{item.MaterialCode}</label>,
                  <label>{item.Description}</label>,
                  <label>{item.From}</label>,
                  <label>{item.To}</label>,
                  <label>{item.Quantity}</label>,
                  <label>{item.Rate}</label>,
                  <label>{item.Value}</label>,
                ])}
              />
            </Conditional>
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
