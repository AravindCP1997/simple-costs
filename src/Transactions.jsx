import { useState, useContext } from "react";
import {
  Input,
  Option,
  Radio,
  Button,
  DisplayRow,
  DisplayBox,
  DisplayFieldLabel,
  WindowContent,
  WindowTitle,
  Table,
  HidingInput,
  LabelledInput,
  TableRow,
  NavigationRow,
} from "./App";

import { CheckBox } from "./Components";

import { updateIndexValue, updateKeyValue } from "./functions";
import { collectionChange, singleChange } from "./uiscript";
import { updateObject, addToArray, addToObject } from "./objects";
import useData from "./useData";
import { LocalStorage, Dictionary, Collection } from "./Database";
import { AlertContext } from "./context";

export function CreateAsset() {
  const [data, setdata] = useState({ Code: "", Description: "" });
  return (
    <WindowContent>
      <WindowTitle title={"Create Asset"} />
      <DisplayRow>
        <DisplayFieldLabel label={"Code"} />
        <Input
          value={data["Code"]}
          process={(value) =>
            setdata((pd) => updateKeyValue(pd, "Code", value))
          }
        />
      </DisplayRow>
    </WindowContent>
  );
}

export const CreateIncomeTaxCode = () => {
  const defaults = {
    Code: "",
    Taxation: [
      {
        "Year From": "",
        "Year To": "",
        "Exemption Limit": "",
        "Calculate Marginal Relief": true,
        "Standard Deduction Salary": "",
        "Slab Rate": [{ From: "", To: "", Rate: "" }],
        Surcharge: [{ Threshold: "", Rate: "" }],
      },
      {
        "Year From": "",
        "Year To": "",
        "Exemption Limit": "",
        "Marginal Relief": "",
        "Standard Deduction Salary": "",
        "Slab Rate": [{ From: "", To: "", Rate: "" }],
        Surcharge: [{ Threshold: "", Rate: "" }],
      },
    ],
  };

  const {
    data,
    setdata,
    changeData,
    addItemtoArray,
    addItemtoObject,
    deleteItemfromArray,
  } = useData(defaults);

  const { showAlert } = useContext(AlertContext);

  const { Code, Taxation } = data;
  const TaxationFields = Object.keys(Taxation[0]);

  const slabCells = (taxationIndex, slabIndex) => {
    return [
      <Input
        value={Taxation[taxationIndex]["Slab Rate"][slabIndex]["From"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Slab Rate/${slabIndex}/From`,
            value
          )
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["Slab Rate"][slabIndex]["To"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Slab Rate/${slabIndex}/To`,
            value
          )
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["Slab Rate"][slabIndex]["Rate"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Slab Rate/${slabIndex}/Rate`,
            value
          )
        }
        type="number"
      />,
    ];
  };

  const surchargeCells = (taxationIndex, slabIndex) => {
    return [
      <Input
        value={Taxation[taxationIndex]["Surcharge"][slabIndex]["Threshold"]}
        type="number"
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Surcharge/${slabIndex}/Threshold`,
            value
          )
        }
      />,
      <Input
        value={Taxation[taxationIndex]["Surcharge"][slabIndex]["Rate"]}
        type="number"
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Surcharge/${slabIndex}/Rate`,
            value
          )
        }
      />,
    ];
  };
  const rowCells = (taxationIndex) => {
    return [
      <Input
        value={Taxation[taxationIndex]["Year From"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}/Year From`, value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["Year To"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}/Year To`, value)
        }
        type="number"
      />,
      <Input
        value={Taxation[taxationIndex]["Exemption Limit"]}
        process={(value) =>
          changeData(`Taxation/${taxationIndex}/Exemption Limit`, value)
        }
        type="number"
      />,
      <CheckBox
        value={Taxation[taxationIndex][" Calculate Marginal Relief"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Calculate Marginal Relief`,
            value
          )
        }
      />,
      <Input
        value={Taxation[taxationIndex]["Standard Deduction Salary"]}
        process={(value) =>
          changeData(
            `Taxation/${taxationIndex}/Standard Deduction Salary`,
            value
          )
        }
        type="number"
      />,
      <HidingInput>
        <h3>Slab Rate</h3>
        <Table columns={["From", "To", "Rate"]}>
          {Taxation[taxationIndex]["Slab Rate"].map((slab, s) => (
            <TableRow cells={slabCells(taxationIndex, s)} />
          ))}
        </Table>
        <button
          onClick={() =>
            addItemtoArray(
              `Taxation/${taxationIndex}/Slab Rate`,
              Taxation[0]["Slab Rate"][0]
            )
          }
        >
          Add slab
        </button>
      </HidingInput>,
      <HidingInput>
        <h3>Surcharge</h3>
        <Table columns={["Threshold", "Rate"]}>
          {Taxation[taxationIndex]["Surcharge"].map((slab, s) => (
            <TableRow cells={surchargeCells(taxationIndex, s)} />
          ))}
        </Table>
        <NavigationRow>
          <button
            onClick={() =>
              addItemtoArray(
                `Taxation/${taxationIndex}/Surcharge`,
                defaults.Taxation[0]["Surcharge"][0]
              )
            }
          >
            Add
          </button>
        </NavigationRow>
      </HidingInput>,
      <Button
        name="-"
        functionsArray={[() => deleteItemfromArray(`Taxation`, taxationIndex)]}
      />,
    ];
  };

  return (
    <WindowContent>
      <WindowTitle title={"Create Income Tax Code"} />
      <LabelledInput label="Code">
        <Input
          value={Code}
          process={(value) => changeData("Code", value)}
          maxLength={4}
          type={"text"}
        />
      </LabelledInput>
      <DisplayBox>
        <DisplayFieldLabel label={"Taxation"} />
        <Table columns={[...TaxationFields, ""]}>
          {Taxation.map((item, i) => (
            <TableRow cells={rowCells(i)} />
          ))}
        </Table>
      </DisplayBox>
      <NavigationRow>
        <button
          onClick={() => addItemtoArray("Taxation", defaults.Taxation[0])}
        >
          Add
        </button>
      </NavigationRow>
      <NavigationRow>
        <Button
          name={"Save"}
          functionsArray={[
            () => showAlert(new Collection("IncomeTaxCode").add(data)),
          ]}
        />
      </NavigationRow>
    </WindowContent>
  );
};
