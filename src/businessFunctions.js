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

export function PostedRemunerationTable() {
  const data = new Collection("RemunerationResult").load();
  if (data === null) {
    return [];
  }
  const result = [];
  data.forEach((record) => {
    const { Company, Year, Month, Employee, Wages, Type, Date, BankAccount } =
      record;
    const { Account, SWIFT, Bank } = BankAccount;
    Wages.forEach((wageRecord) => {
      result.push({
        ...wageRecord,
        ...{ Company, Year, Employee, Month, Type, Date, Account, SWIFT, Bank },
      });
    });
  });
  return result;
}

export function EmployeeTable() {
  const data = new Collection("Employee").load();
  if (data === null) {
    return [];
  }
  const result = [];
  data.forEach((employee) => {
    result.push({
      Employee: employee.Code,
      Company: employee.Company,
      Group: employee.EmployeeGroupCode,
    });
  });
  return result;
}

export function RemunerationPaymentTable() {
  const data = new Collection("RemunerationPayment").load();
  if (data === null) {
    return [];
  }
  const result = [];
  data.forEach((record) => {
    const { Company, Year, Month, Type, Date, PaymentData } = record;
    PaymentData.forEach((paymentrecord) => {
      result.push({
        ...paymentrecord,
        ...{ Company, Year, Month, Type, Date },
      });
    });
  });
  return result;
}
