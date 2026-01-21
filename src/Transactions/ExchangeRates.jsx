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
  MultiDisplayArea,
} from "../Components";
import { useWindowType, useInterface } from "../useInterface";
import useData from "../useData";
import { useError } from "../useError";
import { Company, ExchangeRates, Currencies } from "../classes";
import { Collection } from "../Database";
import {
  FilteredList,
  ListItems,
  ListUniqueItems,
  rangeOverlap,
} from "../functions";

export function ManageExchangeRates() {
  const [company, setcompany] = useState("");
  const [currency, setcurrency] = useState("");
  const { errorsExist, clearErrors, addError, DisplayHidingError } = useError();
  const collection = new ExchangeRates(currency, company);
  const { showAlert, openWindow } = useInterface();
  useEffect(() => {
    clearErrors();
    addError(
      !collection.company.exists(),
      "Company",
      "Company does not exist.",
    );
    addError(
      !Currencies.currencyExists(currency),
      "Currency",
      "Currency does not exist.",
    );
  }, [company, currency]);

  return (
    <>
      <WindowTitle
        title={"Exchange Rates"}
        menu={[
          <ConditionalButton
            name={"Set"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check.")]}
            whileTrue={[
              () =>
                openWindow(<SetExchangeRates initial={collection.getData()} />),
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
              value={company}
              process={(value) => setcompany(value)}
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
          </Row>
          <Row overflow="visible">
            <Label label={"Currency"} />
            <AutoSuggestInput
              value={currency}
              process={(value) => setcurrency(value)}
              placeholder={"Enter Currency"}
              suggestions={Currencies.list()}
              captions={ListItems(Currencies.read(), "Description")}
            />
          </Row>
        </DisplayArea>
      </WindowContent>
    </>
  );
}

export function SetExchangeRates({ initial }) {
  const { data, reset, changeData, addItemtoArray, deleteItemfromArray } =
    useData(initial);
  const { openWindow, showAlert } = useInterface();
  const { errorsExist, DisplayHidingError, addError, clearErrors } = useError();
  const { Company, Currency, Rates } = data;
  const collection = new ExchangeRates(Currency, Company);
  useEffect(() => {
    clearErrors();
    Rates.forEach((rate, r) => {
      const { From, To, Rate } = rate;
      addError(
        From === "" || To === "" || From > To,
        `Rates/${r + 1}`,
        "Period invalid.",
      );
      addError(
        Rate === "" || Rate < 0,
        `Rates/${r + 1}`,
        `Rate shall be a non-negative value.`,
      );
      Rates.forEach((ratetwo, rtwo) => {
        const { From: Fromtwo, To: Totwo, Rate: Ratetwo } = ratetwo;
        addError(
          r < rtwo && rangeOverlap([From, To], [Fromtwo, Totwo]),
          `Rates/${rtwo + 1}`,
          `Period overlaps between rate ${r + 1} & ${rtwo + 1}`,
        );
      });
    });
  }, [data]);
  return (
    <>
      <WindowTitle
        title={"Set Exchange Rates"}
        menu={[
          <ConditionalButton
            name={"Set"}
            result={!errorsExist}
            whileFalse={[() => showAlert("Messages exist. Please check")]}
            whileTrue={[
              () => showAlert(collection.update(data)),
              () => openWindow(<ManageExchangeRates />),
            ]}
          />,
          <Button name={"Reset"} functionsArray={[() => reset()]} />,
          <DisplayHidingError />,
        ]}
      />
      <WindowContent>
        <DisplayArea>
          <Row>
            <Label label={"Company"} />
            <label>{Company}</label>
          </Row>
          <Row>
            <Label label={"Currency"} />
            <label>{Currency}</label>
          </Row>
          <Column>
            <Row jc="left">
              <Label label={"Exchange Rates"} />
              <Button
                name="Add"
                functionsArray={[
                  () => addItemtoArray(`Rates`, { From: "", To: "", Rate: "" }),
                ]}
              />
            </Row>
            <Table
              columns={["From", "To", "Rate", ""]}
              rows={Rates.map((rate, r) => [
                <Input
                  value={rate.From}
                  process={(value) => changeData(`Rates/${r}`, "From", value)}
                  type={"date"}
                />,
                <Input
                  value={rate.To}
                  process={(value) => changeData(`Rates/${r}`, "To", value)}
                  type={"date"}
                />,
                <Input
                  value={rate.Rate}
                  process={(value) => changeData(`Rates/${r}`, "Rate", value)}
                  type={"number"}
                />,
                <Button
                  name="-"
                  functionsArray={[() => deleteItemfromArray(`Rates`, r)]}
                />,
              ])}
            />
          </Column>
        </DisplayArea>
      </WindowContent>
    </>
  );
}
