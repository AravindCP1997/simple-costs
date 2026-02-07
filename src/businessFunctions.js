import { FcInspection } from "react-icons/fc";
import { InputJSONFile } from "./Components";
import { Collection } from "./Database";
import { TimeStamp } from "./functions";
import { Region } from "./classes";

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

export function BusinessTaxType(SupplierRegion, PlaceofSupply) {
  const supplierRegionData = Region.getData(SupplierRegion);
  const placeofSupplyData = Region.getData(PlaceofSupply);
  let result;
  if (supplierRegionData.Country !== placeofSupplyData.Country) {
    result = "InterCountry";
  } else if (supplierRegionData.State !== placeofSupplyData.State) {
    result = "InterState";
  } else if (SupplierRegion !== PlaceofSupply) {
    result = "InterRegion";
  } else {
    result = "IntraRegion";
  }
  return result;
}

export function BusinessTaxTypeByType(
  Type,
  BusinessPlaceRegion,
  SupplierRegion,
  PlaceofSupply,
) {
  const result =
    Type === "Output"
      ? BusinessTaxType(BusinessPlaceRegion, PlaceofSupply)
      : BusinessTaxType(SupplierRegion, PlaceofSupply);
  return result;
}
