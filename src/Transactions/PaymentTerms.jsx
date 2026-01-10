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
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { Collection } from "../Database";
import { noop, rangeOverlap } from "../functions";
import { PaymentTerms } from "../classes";
import { samplePaymentTerms } from "../samples";
import { defaultPaymentTerms } from "../defaults";

export function ManagePaymentTerms() {
  const [Code, setCode] = useState("");
  const { openWindow, openConfirm, showAlert } = useInterface();
  const collection = new PaymentTerms(Code);

  return (
    <>
      <WindowTitle
        title={"Manage Payment terms"}
        menu={[
          <Button
            name={"New"}
            functionsArray={[() => openWindow(<CreatePaymentTerms />)]}
          />,
          <ConditionalButton
            name={"View"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Payment Terms does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreatePaymentTerms
                    method="View"
                    initial={collection.getData()}
                  />
                ),
            ]}
          />,
          <ConditionalButton
            name={"Update"}
            result={
              collection.exists() && collection.getData().Status === "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Payment Terms does not exist, or it is not in draft stage to be updated."
                ),
            ]}
            whileTrue={[
              () =>
                openWindow(
                  <CreatePaymentTerms
                    initial={collection.getData()}
                    method="Update"
                  />
                ),
            ]}
          />,
          <ConditionalButton
            name={"Delete"}
            result={
              collection.exists() && collection.getData().Status === "Draft"
            }
            whileFalse={[
              () =>
                showAlert(
                  "Either the Payment Terms does not exist, or it is not in draft stage to be updated."
                ),
            ]}
            whileTrue={[
              () =>
                openConfirm(
                  "This action will permanently delete the Payment Terms.",
                  [],
                  [() => showAlert(collection.delete()), () => setCode("")]
                ),
            ]}
          />,
          <ConditionalButton
            name={"Copy"}
            result={collection.exists()}
            whileFalse={[() => showAlert("Payment Terms does not exist.")]}
            whileTrue={[
              () =>
                openWindow(
                  <CreatePaymentTerms
                    initial={collection.getData()}
                    method="Create"
                  />
                ),
            ]}
          />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row overflow="visible">
            <Label label={"Payment Terms"} />
            <AutoSuggestInput
              value={Code}
              process={(value) => setCode(value)}
              onSelect={(value) => setCode(value)}
              placeholder={"Enter Payment terms"}
              suggestions={collection.listAll("Code")}
              captions={collection.listAll("Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function CreatePaymentTerms({
  initial = defaultPaymentTerms,
  method = "Create",
}) {
  const {
    data,
    setdata,
    reset,
    changeData,
    addItemtoArray,
    deleteItemfromArray,
  } = useData(initial);
  const { errorsExist, clearErrors, addError, DisplayHidingError } = useError();
  const { openWindow, showAlert } = useInterface();
  const { Code, Description, Discount, DueWithinDays, Status } = data;
  const collection = new PaymentTerms(Code);
  useEffect(() => {
    clearErrors();
    if (method === "Create") {
      addError(Code === "", "Code", "Code cannot be blank.");
      addError(
        Code !== "" && collection.exists(),
        "Code",
        `Payment terms ${Code} already exists.`
      );
    }
    addError(
      DueWithinDays === "" || DueWithinDays < 0,
      "DueWithinDays",
      `Due Within Days shall be non-negative value.`
    );
    Discount.forEach((discount, d) => {
      const { PaymentInDays, Discount: Disc } = discount;
      addError(
        PaymentInDays === "" || PaymentInDays < 0,
        "Discount",
        `Payment in Days shall be non-negative value at Discount line ${d + 1}`
      );
      addError(
        Disc === "" || Disc < 0,
        "Discount",
        `Discount Rate shall be non-negative value at Discount line ${d + 1}`
      );
    });
  }, [data]);
  if (method === "Create") {
    return (
      <>
        <WindowTitle
          title={"Create Payment Terms"}
          menu={[
            <ConditionalButton
              name="Save"
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[() => showAlert(collection.add(data)), () => reset()]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <Button
              name="Sample"
              functionsArray={[() => setdata(samplePaymentTerms)]}
            />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManagePaymentTerms />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row>
              <Label label={"Code"} />
              <Input
                value={Code}
                process={(value) => changeData("", "Code", value)}
                type={"text"}
                maxLength={4}
              />
            </Row>
            <Row>
              <Label label={"Description"} />
              <Input
                value={Description}
                process={(value) => changeData("", "Description", value)}
                type={"text"}
              />
            </Row>
            <Column>
              <Row>
                <Label label={"Discount"} />
                <Button
                  name="Add"
                  functionsArray={[
                    () =>
                      addItemtoArray("Discount", {
                        PaymentInDays: "",
                        Discount: "",
                      }),
                  ]}
                />
              </Row>
              <Table
                columns={["Payment in Days", "Discount %", ""]}
                rows={Discount.map((discount, d) => [
                  <Input
                    value={discount.PaymentInDays}
                    process={(value) =>
                      changeData(`Discount/${d}`, "PaymentInDays", value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={discount.Discount}
                    process={(value) =>
                      changeData(`Discount/${d}`, "Discount", value)
                    }
                    type={"number"}
                  />,
                  <Button
                    name="Delete"
                    functionsArray={[() => deleteItemfromArray(`Discount`, d)]}
                  />,
                ])}
              />
            </Column>
            <Row>
              <Label label={"Due Within Days"} />
              <Input
                value={DueWithinDays}
                process={(value) => changeData("", "DueWithinDays", value)}
                type={"number"}
              />
            </Row>
            <Row>
              <Label label={"Status"} />
              <Option
                value={Status}
                process={(value) => changeData("", "Status", value)}
                options={["Draft", "Ready", "Blocked"]}
              />
            </Row>
          </DisplayArea>
        </WindowContent>
      </>
    );
  } else if (method === "Update") {
    return (
      <>
        <WindowTitle
          title={"Update Payment Terms"}
          menu={[
            <ConditionalButton
              name="Save"
              result={!errorsExist}
              whileFalse={[() => showAlert("Messages exist. Please check.")]}
              whileTrue={[
                () => showAlert(collection.update(data)),
                () => openWindow(<ManagePaymentTerms />),
              ]}
            />,
            <Button name="Reset" functionsArray={[() => reset()]} />,
            <DisplayHidingError />,
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManagePaymentTerms />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row>
              <Label label={"Code"} />
              <label>{Code}</label>
            </Row>
            <Row>
              <Label label={"Description"} />
              <Input
                value={Description}
                process={(value) => changeData("", "Description", value)}
                type={"text"}
              />
            </Row>
            <Column>
              <Row>
                <Label label={"Discount"} />
                <Button
                  name="Add"
                  functionsArray={[
                    () =>
                      addItemtoArray("Discount", {
                        PaymentInDays: "",
                        Discount: "",
                      }),
                  ]}
                />
              </Row>
              <Table
                columns={["Payment in Days", "Discount %", ""]}
                rows={Discount.map((discount, d) => [
                  <Input
                    value={discount.PaymentInDays}
                    process={(value) =>
                      changeData(`Discount/${d}`, "PaymentInDays", value)
                    }
                    type={"number"}
                  />,
                  <Input
                    value={discount.Discount}
                    process={(value) =>
                      changeData(`Discount/${d}`, "Discount", value)
                    }
                    type={"number"}
                  />,
                  <Button
                    name="Delete"
                    functionsArray={[() => deleteItemfromArray(`Discount`, d)]}
                  />,
                ])}
              />
            </Column>
            <Row>
              <Label label={"Due Within Days"} />
              <Input
                value={DueWithinDays}
                process={(value) => changeData("", "DueWithinDays", value)}
                type={"number"}
              />
            </Row>
            <Row>
              <Label label={"Status"} />
              <Option
                value={Status}
                process={(value) => changeData("", "Status", value)}
                options={["Draft", "Ready", "Blocked"]}
              />
            </Row>
          </DisplayArea>
        </WindowContent>
      </>
    );
  } else {
    return (
      <>
        <WindowTitle
          title={"View Payment Terms"}
          menu={[
            <Button
              name={"Manage"}
              functionsArray={[() => openWindow(<ManagePaymentTerms />)]}
            />,
          ]}
        />
        <WindowContent>
          <DisplayArea>
            <Row>
              <Label label={"Code"} />
              <label>{Code}</label>
            </Row>
            <Row>
              <Label label={"Description"} />
              <label>{Description}</label>
            </Row>
            <Column>
              <Row>
                <Label label={"Discount"} />
              </Row>
              <Table
                columns={["Payment in Days", "Discount %"]}
                rows={Discount.map((discount, d) => [
                  <label>{discount.PaymentInDays}</label>,
                  <label>{discount.Discount}</label>,
                ])}
              />
            </Column>
            <Row>
              <Label label={"Due Within Days"} />
              <label>{DueWithinDays}</label>,
            </Row>
            <Row>
              <Label label={"Status"} />
              <label>{Status}</label>,
            </Row>
          </DisplayArea>
        </WindowContent>
      </>
    );
  }
}
