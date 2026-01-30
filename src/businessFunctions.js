import { FcInspection } from "react-icons/fc";
import { InputJSONFile } from "./Components";
import { Collection } from "./Database";
import { TimeStamp } from "./functions";

export function MaterialTable() {
  const data = new Collection("MaterialDocument").load();
  if (data === null) {
    return [];
  }
  const result = data.reduce(
    (initial, current) => [
      ...initial,
      ...current.Movements.reduce(
        (list, value) => [
          ...list,
          {
            ...{
              Company: current.Company,
              Year: current.Year,
              DocumentNo: current.DocumentNo,
              ValueDate: current.ValueDate,
              Text: current.Text,
              EntryDate: current.EntryDate,
              TimeStamp: current.TimeStamp,
            },
            ...value,
          },
        ],
        [],
      ),
    ],
    [],
  );
  return result;
}

export function poReceipt(data, d) {
  const {
    Item: MaterialCode,
    Description,
    Undispatched: Quantity,
    Rate,
  } = data;
  return {
    No: d + 1,
    MaterialCode,
    Description,
    Quantity,
    Rate,
    Value: Quantity * Rate,
    Inspection: "Not Required",
    Remarks: "",
  };
}
