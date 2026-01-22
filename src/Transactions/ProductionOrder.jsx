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
  ProductionOrder,
  Plant,
  CompanyCollection,
  Material,
} from "../classes";

import { defaultProductionOrder } from "../defaults";

export function CreateProductionOrder({
  initial = defaultProductionOrder,
  meth = "Create",
}) {
  const {
    data: promptData,
    changeData: changePrompt,
    reset: resetPrompt,
  } = useData({ company: "", code: "" });
  const promptCollection = new ProductionOrder(
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
  const { Company, Code, Date, PlantCode, Description, Products, Status } =
    processed;
  const collection = new ProductionOrder(Code, Company);
  const plant = new Plant(PlantCode, Company);
  useEffect(() => {
    clearErrors();
    if (method !== "View") {
      addError(
        !collection.company.exists(),
        "Company",
        `Company '${Company}' does not exist.`,
      );
      addError(!plant.exists(), "Plant", `Plant ${PlantCode} does not exist.`);
      addError(Date === "", "Date", "Date cannot be blank.");
      Products.forEach((product, p) => {
        const { MaterialCode, Quantity } = product;
        addError(
          MaterialCode === "",
          `Products/${p + 1}`,
          "Material Code cannot be blank.",
        );
        addError(
          MaterialCode !== "" && !new Material(MaterialCode, Company).exists(),
          `Products/${p + 1}`,
          `Material ${MaterialCode} does not exist.`,
        );
        addError(
          Quantity === "" || Quantity <= 0,
          `Products/${p + 1}`,
          "Quantity shall be a positive value",
        );
      });
    }
  }, [data]);
  return (
    <>
      <WindowTitle
        title={`${method} Production Order`}
        menu={[
          <Conditional logic={method !== "Create"}>
            <Button
              name="Create"
              functionsArray={[
                () => setmethod("Create"),
                () => setdata(defaultProductionOrder),
              ]}
            />
          </Conditional>,
          <HidingPrompt
            submitLabel="Open"
            result={promptCollection.exists()}
            title={"Open"}
            onClose={[() => resetPrompt()]}
            onSubmitFail={[() => showAlert("Production order does not exist.")]}
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
              <Label label={"Production Order"} />
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
                () => setdata(defaultProductionOrder),
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
                () => setdata(defaultProductionOrder),
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
                () => setdata(defaultProductionOrder),
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
                () => setdata(defaultProductionOrder),
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
            <Label label={"Plant"} />
            <Conditional logic={method !== "View"}>
              <AutoSuggestInput
                value={PlantCode}
                process={(value) => changeData("", "PlantCode", value)}
                placeholder={"Enter PlantCode"}
                suggestions={plant.listAllFromCompany("Code")}
                captions={plant.listAllFromCompany("Description")}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <label>{PlantCode}</label>
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
                <Label label={"Products"} />
                <Button
                  name="Add"
                  functionsArray={[
                    () =>
                      addItemtoArray("Products", {
                        MaterialCode: "",
                        Quantity: "",
                      }),
                  ]}
                />
              </Row>
              <Table
                columns={["No", "Material", "Description", "Quantity", ""]}
                rows={Products.map((item, i) => [
                  <Input value={i + 1} />,
                  <AutoSuggestInput
                    value={item.MaterialCode}
                    process={(value) =>
                      changeData(`Products/${i}`, `MaterialCode`, value)
                    }
                    suggestions={new Material("", Company).listAllFromCompany(
                      "Code",
                    )}
                    captions={new Material("", Company).listAllFromCompany(
                      "Description",
                    )}
                  />,
                  <Input value={item.Description} />,
                  <Input
                    value={item.Quantity}
                    process={(value) =>
                      changeData(`Products/${i}`, `Quantity`, value)
                    }
                    type={"number"}
                  />,
                  <Button
                    name={"-"}
                    functionsArray={[() => deleteItemfromArray(`Products`, i)]}
                  />,
                ])}
              />
            </Conditional>
            <Conditional logic={method === "View"}>
              <Row jc="left">
                <Label label={"Items"} />
              </Row>
              <Table
                columns={["No", "Material", "Description", "Quantity"]}
                rows={Products.map((item, i) => [
                  <label>{i + 1}</label>,
                  <label>{item.Material}</label>,
                  <label>{item.Description}</label>,
                  <label>{item.Quantity}</label>,
                ])}
              />
            </Conditional>
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
