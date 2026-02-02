import { List } from "@react-pdf/renderer";
import { Collection, Dictionary } from "./Database";
import {
  dateInYear,
  datesInMonth,
  dateString,
  existsInCollection,
  filter,
  filterByMultipleSelection,
  filterBySelection,
  filterCollection,
  FilteredList,
  ListItems,
  newAutoNumber,
  perform,
  rangeOverlap,
  refine,
  SumField,
  SumFieldIfs,
  TimeStamp,
  valueInRange,
} from "./functions";
import { MaterialTable } from "./businessFunctions";
import { defaultSelection } from "./defaults";

export class IncomeTaxCode extends Collection {
  constructor(code, name = "IncomeTaxCode") {
    super(name);
    this.code = code;
  }
  exists() {
    return super.exists({ Code: this.code });
  }
  add(data) {
    super.add(data);
    return "Added";
  }
  getData() {
    const result = super.getData({ Code: this.code });
    return result;
  }
  delete() {
    super.delete({ Code: this.code });
    return "Deleted";
  }
  update(data) {
    super.update({ Code: this.code }, data);
  }
  yearExists(year) {
    const result = this.taxation(year) !== undefined;
    return result;
  }
  taxation(year) {
    const data = this.getData().Taxation;
    const taxationForTheYear = data.find((item) =>
      valueInRange(year, [item.YearFrom, item.YearTo]),
    );
    return taxationForTheYear;
  }
  tax(year, income) {
    const slabs = this.taxation(year).SlabRate;
    let tax = 0;
    slabs.forEach((slab) => {
      tax +=
        (slab.Rate / 100) *
        Math.max(0, Math.min(income, slab.To) - slab.From + 1);
    });
    return tax;
  }
  taxExemption(year, income) {
    const limit = Number(this.taxation(year).ExemptionLimit);
    if (limit < income) {
      return 0;
    } else {
      const tax = this.tax(year, income);
      return tax;
    }
  }
  marginalReliefOnExemption(year, income) {
    const applicable = this.taxation(year).CalculateMarginalReliefOnExemption;
    if (!applicable) {
      return 0;
    } else {
      const limit = this.taxation(year).ExemptionLimit;
      const taxOnIncome =
        this.tax(year, income) - this.taxExemption(year, income);
      const taxOnExemptionLimit =
        this.tax(year, limit) - this.taxExemption(year, limit);
      const excessTax = Math.max(0, taxOnIncome - taxOnExemptionLimit);
      const excessIncome = Math.max(0, income - limit);
      const marginaRelief = Math.max(0, excessTax - excessIncome);
      return marginaRelief;
    }
  }
  grossExemption(year, income) {
    const result =
      this.taxExemption(year, income) +
      this.marginalReliefOnExemption(year, income);
    return result;
  }
  surchargeSlab(year, income) {
    const surcharges = this.taxation(year).Surcharge;
    let slab = { Threshold: 0, Rate: 0 };
    surcharges.forEach((surcharge) => {
      if (income > Number(surcharge.Threshold)) {
        slab = surcharge;
      }
    });
    return slab;
  }
  surcharge(year, income) {
    const slab = this.surchargeSlab(year, income);
    const surcharge = (this.tax(year, income) * slab.Rate) / 100;
    return surcharge;
  }
  marginaReliefOnSurcharge(year, income) {
    const applicable = this.taxation(year).CalculateMarginalReliefOnSurcharge;
    if (!applicable) {
      return 0;
    } else {
      const slab = this.surchargeSlab(year, income);
      const Threshold = slab.Threshold;
      const taxOnLimit =
        this.tax(year, Threshold) + this.surcharge(year, Number(Threshold));
      const taxOnIncome = this.tax(year, income) + this.surcharge(year, income);
      const excessIncome = Math.max(0, income - Threshold);
      const excessTax = Math.max(0, taxOnIncome - taxOnLimit);
      const marginalRelief = Math.max(0, excessTax - excessIncome);
      return marginalRelief;
    }
  }
  netSurcharge(year, income) {
    const result =
      this.surcharge(year, income) -
      this.marginaReliefOnSurcharge(year, income);
    return result;
  }
  taxBeforeCess(year, income) {
    const tax =
      this.tax(year, income) -
      this.taxExemption(year, income) -
      this.marginalReliefOnExemption(year, income) +
      this.surcharge(year, income) -
      this.marginaReliefOnSurcharge(year, income);
    return tax;
  }
  cess(year, income) {
    const cessRate = this.taxation(year).Cess;
    const cess = (this.taxBeforeCess(year, income) * cessRate) / 100;
    return cess;
  }
  totalTax(year, income) {
    const tax = this.taxBeforeCess(year, income) + this.cess(year, income);
    return tax;
  }
  taxComputation(year, income) {
    const data = {
      tax: this.tax(year, income),
      taxExemption: this.taxExemption(year, income),
      marginalReliefOnExemption: this.marginalReliefOnExemption(year, income),
      grossExemption: this.grossExemption(year, income),
      surcharge: this.surcharge(year, income),
      marginalReliefOnSurcharge: this.marginaReliefOnSurcharge(year, income),
      netSurcharge: this.netSurcharge(year, income),
      taxBeforeCess: this.taxBeforeCess(year, income),
      cess: this.cess(year, income),
      totalTax: this.totalTax(year, income),
    };
    return data;
  }
  standardDeduction(year, salary) {
    const standardDeduction = this.taxation(year).StandardDeductionSalary;
    if (salary > standardDeduction) {
      return standardDeduction;
    } else {
      return salary;
    }
  }
  taxComputationOnSalary(year, salary) {
    const standardDeduction = this.standardDeduction(year, salary);
    const netSalary = salary - standardDeduction;
    const taxComputation = this.taxComputation(year, netSalary);
    const data = { ...taxComputation, ...{ netSalary, standardDeduction } };
    return data;
  }
}

export class ChartOfAccounts extends Collection {
  constructor(Code, name = "ChartofAccounts") {
    super(name);
    this.Code = Code;
    this.criteria = { Code: this.Code };
  }
  add(data) {
    super.add(data);
    return "Added";
  }
  getData() {
    return super.getData(this.criteria);
  }
  exists() {
    return super.exists(this.criteria);
  }
  async delete() {
    if (this.Code === "") {
      return null;
    }
    return super.delete(this.criteria);
  }
  async update(data) {
    if (!this.Code) {
      return null;
    }
    await super.update(this.criteria, data);
    return "Updated";
  }
  groups() {
    if (!this.exists()) {
      return [];
    }
    return ListItems(this.getData().AccountGroups, "Group");
  }
  groupExists(group) {
    return this.groups().includes(group);
  }
  groupRange(group) {
    const numberings = this.getData().AccountGroups;
    const result = numberings.find((item) => item.Group === group);
    return [result.From, result.To];
  }
}

export class FinancialStatementStructure extends Collection {
  constructor(Chart, Code, name = "FinancialStatementStructure") {
    super(name);
    this.Chart = Chart;
    this.Code = Code;
    this.criteria = { Chart: this.Chart, Code: this.Code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class GroupGeneralLedger extends Collection {
  constructor(chart, generalledger, name = "GroupGeneralLedger") {
    super(name);
    this.chart = chart;
    this.generalledger = generalledger;
    this.criteria = {
      ChartofAccounts: this.chart,
      GeneralLedger: this.generalledger,
    };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class InterestCode extends Collection {
  constructor(Code, name = "InterestCode") {
    super(name);
    this.Code = Code;
    this.criteria = { Code: this.Code };
  }
  add(data) {
    super.add(data);
    return "Added";
  }
  getData() {
    return super.getData(this.criteria);
  }
  exists() {
    return super.exists(this.criteria);
  }
  async delete() {
    if (this.Code === "") {
      return null;
    }
    return super.delete(this.criteria);
  }
  async update(data) {
    if (!this.Code) {
      return null;
    }
    await super.update(this.criteria, data);
    return "Updated";
  }
}

export class PaymentTerms extends Collection {
  constructor(code, name = "PaymentTerms") {
    super(name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export const HSN = {
  object: new Dictionary("HSN"),
  defaults: [{ Code: "", Description: "" }],
  sample: [
    { Code: "998328", Description: "Landscape and Architectural Services" },
  ],
  read: function () {
    const stored = this.object.load();
    const result = stored === null ? this.defaults : stored;
    return result;
  },
  save: function (data) {
    return this.object.save(data);
  },
};

export const Currencies = {
  object: new Dictionary("Currencies"),
  defaults: [{ Code: "", Description: "" }],
  sample: [
    { Code: "INR", Description: "Indian Rupee" },
    { Code: "USD", Description: "US Dollar" },
    { Code: "MYR", Description: "Malaysian Ringgit" },
    { Code: "AED", Description: "UAE Dirham" },
  ],
  read: function () {
    const stored = this.object.load();
    const result = stored === null ? this.defaults : stored;
    return result;
  },
  save: function (data) {
    return this.object.save(data);
  },
  list: function () {
    return ListItems(this.read(), "Code");
  },
  currencyExists: function (currency) {
    return this.list().includes(currency);
  },
};

export const Segments = {
  object: new Dictionary("Segments"),
  defaults: [{ Segment: "", Description: "" }],
  sample: [
    { Segment: "ETRS", Description: "Electronics" },
    { Segment: "FMCG", Description: "Consumer Goods" },
  ],
  read: function () {
    const stored = this.object.load();
    const result = stored === null ? this.defaults : stored;
    return result;
  },
  save: function (data) {
    return this.object.save(data);
  },
  list: function () {
    return ListItems(this.read(), "Segment");
  },
  segmentExists: function (segment) {
    return this.list().includes(segment);
  },
};

export const Units = {
  object: new Dictionary("Units"),
  defaults: [{ Unit: "", Description: "" }],
  sample: [
    { Unit: "Kg", Description: "Kilogram" },
    { Unit: "L", Description: "Litre" },
    { Unit: "m", Description: "Meter" },
  ],
  read: function () {
    const stored = this.object.load();
    const result = stored === null ? this.defaults : stored;
    return result;
  },
  save: function (data) {
    return this.object.save(data);
  },
  list: function () {
    return ListItems(this.read(), "Unit");
  },
  unitExists: function (unit) {
    return this.list().includes(unit);
  },
};

export class Company extends Collection {
  constructor(code, name = "Company") {
    super(name);
    this.code = code;
    this.criteria = { Code: this.code };
    this.openperiods = new OpenPeriods(this.code);
  }
  getData() {
    return super.getData(this.criteria);
  }
  exists() {
    return super.exists(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
  existsGL(gl) {
    return new GeneralLedger(gl, this.code).exists();
  }
  dateInYear(date, year) {
    return dateInYear(date, year, this.getData().FYBeginning);
  }
  year(date) {
    const givenDate = new Date(date);
    const givenYear = givenDate.getFullYear();
    const result = this.dateInYear(date, givenYear) ? givenYear : givenYear - 1;
    return result;
  }
  collection(name) {
    return new CompanyCollection(this.code, name);
  }
  consignmentInwards(number, year) {
    return new ConsignmentInwards(this.code, year, number);
  }
  consignmentOutwards(number, year) {
    return new ConsignmentOutwards(this.code, year, number);
  }
  customer(code) {
    return new Customer(code, this.code);
  }
  gl(code) {
    return new GeneralLedger(code, this.code);
  }
  location(code) {
    return new Location(code, this.code);
  }
  material(code) {
    return new Material(code, this.code);
  }
  materialdocument(documentNo, year) {
    return new MaterialDocument(documentNo, year, this.code);
  }
  materialdelivery(number, year) {
    return new MaterialDelivery(this.code, year, number);
  }
  materialreceipt(number, year) {
    return new MaterialReceipt(this.code, year, number);
  }
  materialBlockInLocation(material, block, location) {
    return new MaterialBlockInLocation(this.code, material, block, location);
  }
  accountingdocument(documentNo, year) {
    return new AccountingDocument(documentNo, year, this.code);
  }
  po(code) {
    return new PurchaseOrder(code, this.code);
  }
  receiptForInspection(number, year) {
    return new ReceiptForInspection(this.code, year, number);
  }
  so(code) {
    return new SaleOrder(code, this.code);
  }
  sto(code) {
    return new StockTransportOrder(code, this.code);
  }
  stoIssue(number, year) {
    return new STOIssue(this.code, number, year);
  }
  vendor(code) {
    return new Vendor(code, this.code);
  }
}

export class OpenPeriods extends Collection {
  constructor(Company, name = "OpenPeriods") {
    super(name);
    this.Company = Company;
    this.defaults = {
      Company: this.Company,
      Accounting: [],
      Costing: [],
      Material: [],
    };
  }
  getData() {
    if (!super.exists({ Company: this.Company })) {
      return this.defaults;
    } else {
      return super.getData({ Company: this.Company });
    }
  }
  update(data) {
    if (!super.exists({ Company: this.Company })) {
      return super.add(data);
    }
    return super.update({ Company: this.Company }, data);
  }
  accountingOpen(date) {
    const result = this.getData().Accounting.reduce(
      (prevresult, period) =>
        prevresult === false
          ? valueInRange(date, [period.From, period.To])
          : prevresult,
      false,
    );
    return result;
  }
  costingOpen(date) {
    const result = this.getData().Costing.reduce(
      (prevresult, period) =>
        prevresult === false
          ? valueInRange(date, [period.From, period.To])
          : prevresult,
      false,
    );
    return result;
  }
  materialOpen(date) {
    const result = this.getData().Material.reduce(
      (prevresult, period) =>
        prevresult === false
          ? valueInRange(date, [period.From, period.To])
          : prevresult,
      false,
    );
    return result;
  }
}

export class CompanyCollection extends Collection {
  constructor(company, name) {
    super(name);
    this.companycode = company;
    this.companyCriteria = { Company: this.companycode };
    this.company = new Company(this.companycode);
  }
  loadFromCompany() {
    if (super.load() === null) {
      return [];
    }
    return filterCollection(super.load(), this.companyCriteria);
  }
  filtered(criteria) {
    return filterCollection(this.loadFromCompany(), criteria);
  }
  getData(criteria) {
    return this.filtered(criteria)[0];
  }
  exists(criteria) {
    return existsInCollection(this.loadFromCompany(), criteria);
  }
  listAllFromCompany(field) {
    return super.filteredList(this.companyCriteria, field);
  }
  filterFromCompany(criteria, field) {
    return FilteredList(this.loadFromCompany(), criteria, field);
  }
  mergedCriteria(criteria) {
    return { ...criteria, ...this.companyCriteria };
  }
  delete(criteria) {
    return super.delete(this.mergedCriteria(criteria));
  }
  update(criteria, data) {
    return super.update(this.mergedCriteria(criteria), data);
  }
  autoNumber(criteria, field, start) {
    return newAutoNumber(
      this.loadFromCompany(),
      this.mergedCriteria(criteria),
      field,
      start,
    );
  }
}

export class ProfitCenter extends CompanyCollection {
  constructor(code, company, name = "ProfitCenter") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class GeneralLedger extends CompanyCollection {
  constructor(code, company, name = "GeneralLedger") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
  getChart() {
    if (!this.company.exists()) {
      return new ChartOfAccounts("");
    }
    return new ChartOfAccounts(this.company.getData().ChartofAccounts);
  }
}

export class BusinessPlace extends CompanyCollection {
  constructor(code, company, name = "BusinessPlace") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class CostCenter extends CompanyCollection {
  constructor(code, company, name = "CostCenter") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class Location extends CompanyCollection {
  constructor(code, company, name = "Location") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
  pc() {
    return new ProfitCenter(this.getData().ProfitCenter, this.companycode);
  }
  materialBlock(material, block) {
    return new MaterialBlockInLocation(
      this.companycode,
      material,
      block,
      this.code,
    );
  }
}

export class Plant extends CompanyCollection {
  constructor(code, company, name = "Plant") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class RevenueCenter extends CompanyCollection {
  constructor(code, company, name = "RevenueCenter") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class AssetGroup extends CompanyCollection {
  constructor(code, company, name = "AssetGroup") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
  depreciable() {
    if (!this.exists()) {
      return false;
    }
    return this.getData().Depreciable;
  }
}

export class Asset extends CompanyCollection {
  constructor(code = "", company = "", name = "Asset") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Asset").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Asset Saved, Code: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Asset Updated";
  }
}

export class AssetDevelopmentOrder extends CompanyCollection {
  constructor(code = "", company = "", name = "AssetDevelopmentOrder") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Asset Development Order").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Asset Development Order saved, Code: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Order Updated";
  }
}

export class WageType extends CompanyCollection {
  constructor(code, company, name = "WageType") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class Employee extends CompanyCollection {
  constructor(code = "", company = "", name = "Employee") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Employee").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Employee saved, Code: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Employee Updated";
  }
}

export class Holidays extends CompanyCollection {
  constructor(year, company, name = "Holidays") {
    super(company, name);
    this.year = year;
    this.criteria = { Company: this.companycode, Year: this.year };
    this.defaults = {
      Company: this.companycode,
      Year: this.year,
      WeekHolidays: [
        { Day: "Sunday", Holiday: false },
        { Day: "Monday", Holiday: false },
        { Day: "Tuesday", Holiday: false },
        { Day: "Wednesday", Holiday: false },
        { Day: "Thursday", Holiday: false },
        { Day: "Friday", Holiday: false },
        { Day: "Saturday", Holiday: false },
      ],
      Holidays: [{ Date: "", Description: "" }],
    };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    if (!this.exists()) {
      return this.defaults;
    }
    return super.getData(this.criteria);
  }
  update(data) {
    if (!this.exists()) {
      return super.add(data);
    }
    return super.update(this.criteria, data);
  }
}

export class Attendance extends CompanyCollection {
  constructor(employee, year, month, company, name = "Attendance") {
    super(company, name);
    this.year = year;
    this.employeecode = employee;
    this.employee = new Employee(this.employeecode, this.companycode);
    this.month = month;
    this.criteria = {
      EmployeeCode: this.employeecode,
      Year: this.year,
      Month: this.month,
    };
    this.defaults = {
      ...super.mergedCriteria(this.criteria),
      ["Attendance"]: datesInMonth(this.year, this.month).map((date, d) => ({
        Date: date,
        Status: "Absent",
        Remarks: "",
      })),
    };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    if (!this.exists()) {
      return this.defaults;
    }
    return super.getData(this.criteria);
  }
  update(data) {
    if (!this.exists()) {
      return super.add(data);
    }
    return super.update(this.criteria, data);
  }
}

export class FreightGroup extends CompanyCollection {
  constructor(code, company, name = "FreightGroup") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class MaterialGroup extends CompanyCollection {
  constructor(code, company, name = "MaterialGroup") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class Material extends CompanyCollection {
  constructor(code, company, name = "Material") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Material").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Material saved, Code: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Material Updated";
  }
  group() {
    return new MaterialGroup(
      this.getData().MaterialGroupCode,
      this.companycode,
    );
  }
}

export class Service extends CompanyCollection {
  constructor(code, company, name = "Service") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Service").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Service saved, Code: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Service Updated";
  }
}

export class ServiceGroup extends CompanyCollection {
  constructor(code, company, name = "ServiceGroup") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class EmployeeGroup extends CompanyCollection {
  constructor(code, company, name = "EmployeeGroup") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class CustomerGroup extends CompanyCollection {
  constructor(code, company, name = "CustomerGroup") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class VendorGroup extends CompanyCollection {
  constructor(code, company, name = "VendorGroup") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class WithholdingTax extends CompanyCollection {
  constructor(code, company, name = "WithholdingTax") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class BusinessTaxCode extends CompanyCollection {
  constructor(code, company, name = "BusinessTaxCode") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class ExchangeRates extends CompanyCollection {
  constructor(currency, company, name = "ExchangeRates") {
    super(company, name);
    this.currencycode = currency;
    this.criteria = { Currency: this.currencycode };
    this.defaults = {
      Currency: this.currencycode,
      Company: this.companycode,
      Rates: [{ From: "", To: "", Rate: "" }],
    };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    if (!this.exists()) {
      return this.defaults;
    }
    return super.getData(this.criteria);
  }
  update(data) {
    if (!this.exists()) {
      return super.add(data);
    }
    return super.update(this.criteria, data);
  }
}

export class Customer extends CompanyCollection {
  constructor(code, company, name = "Customer") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Customer").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Customer saved, Code: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Customer Updated";
  }
  deliveries() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["20"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("Customer", "Number", [this.code]),
    ]);
    return result;
  }
  consignmentOutwards() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["22"]),
      filter("Customer", "Number", [this.code]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
    ]);
    return result;
  }
}

export class Vendor extends CompanyCollection {
  constructor(code, company, name = "Vendor") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Vendor").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Vendor saved, Code: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Vendor Updated";
  }
  consignmentInwards() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["01"]),
      filter("Vendor", "Number", [this.code]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
    ]);
    return result;
  }
  receiptForInspection() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["05"]),
      filter("Vendor", "Number", [this.code]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
    ]);
    return result;
  }
  materialReceipt() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["09"]),
      filter("Vendor", "Number", [this.code]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
    ]);
    return result;
  }
}

export class BankAccount extends CompanyCollection {
  constructor(code, company, name = "BankAccount") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class VirtualAccount extends CompanyCollection {
  constructor(code, company, name = "VirtualAccount") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class LedgerAssignment extends CompanyCollection {
  constructor(company, name = "LedgerAssignment") {
    super(company, name);
    this.defaults = {
      Company: this.companycode,
      GLDisc: "",
      GLIntC: "",
      GLIntD: "",
      GLForexG: "",
      GLForexL: "",
    };
  }
  exists() {
    return super.exists({});
  }
  getData() {
    if (!this.exists()) {
      return this.defaults;
    }
    return super.getData({});
  }
}

export class PurchaseOrder extends CompanyCollection {
  constructor(code, company, name = "PurchaseOrder") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Purchase Order").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Purchase Order saved, Number: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Purchase Order Updated";
  }
  items() {
    if (!this.exists()) {
      return [];
    }
    return this.getData().Items;
  }
  itemExists(item) {
    return this.items().length >= item;
  }
  itemData(item) {
    return this.items()[item - 1];
  }
  ordered(item) {
    const result = this.itemData(item).Quantity;
    return result;
  }
  materialMovements(items = [], movementTypes = []) {
    return MaterialTable().filter(
      (movement) =>
        (items.includes(movement.Item) || items.length === 0) &&
        (movementTypes.includes(movement.MovementType) ||
          movementTypes.length === 0) &&
        movement.Company === this.companycode &&
        movement.PurchaseOrder === this.code,
    );
  }
  inTransit(item) {
    const result = SumField(
      this.materialMovements(
        [item],
        [
          "Consignment Inwards Collection",
          "Consignment Inwards Return",
          "Consignment Inwards Cancellation",
        ],
      ),
      "Quantity",
    );
    return result;
  }
  receipt(item) {
    const result = SumField(
      this.materialMovements([item], ["Receipt"]),
      "Quantity",
    );
    return result;
  }
  return(item) {
    const result = SumField(
      this.materialMovements([item], ["Return Outwards"]),
      "Quantity",
    );
    return result;
  }
  undispatched(item) {
    const result =
      this.ordered(item) -
      this.receipt(item) -
      this.inTransit(item) +
      this.return(item);
    return result;
  }
  summary() {
    const result = this.items().map((item, i) => ({
      ...this.itemData(i + 1),
      ...{
        InTransit: this.inTransit(i + 1),
        Delivered: this.receipt(i + 1),
        Returned: this.return(i + 1),
        Undispatched: this.undispatched(i + 1),
      },
    }));
    return result;
  }
  consignmentInwards() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["01"]),
      filter("PurchaseOrder", "Number", [this.code]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
    ]);
    return result;
  }
  receiptForInspection() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["05"]),
      filter("PurchaseOrder", "Number", [this.code]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
    ]);
    return result;
  }
  materialReceipt() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["09"]),
      filter("PurchaseOrder", "Number", [this.code]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
    ]);
    return result;
  }
}

export class SaleOrder extends CompanyCollection {
  constructor(code, company, name = "SaleOrder") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }

  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Sale Order").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Sale Order saved, Number: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Sale Order Updated";
  }
  items() {
    return this.getData().Items;
  }
  allIssues() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["20"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("SaleOrder", "Number", [this.code]),
    ]);
    return result;
  }
  issues(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["20", "22"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("SaleOrder", "Number", [this.code]),
      filter("Item", "Number", [item]),
    ]);
    return result;
  }
  returns(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["21", "24"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("SaleOrder", "Number", [this.code]),
      filter("Item", "Number", [item]),
    ]);
    return result;
  }
  delivery(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["21", "23"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("SaleOrder", "Number", [this.code]),
      filter("Item", "Number", [item]),
    ]);
    return result;
  }
  loss(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["25"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("SaleOrder", "Number", [this.code]),
      filter("Item", "Number", [item]),
    ]);
    return result;
  }
  orderedQuantity(item) {
    return this.items()[item - 1].Quantity;
  }
  issueQuantity(item) {
    return SumField(this.issues(item), "Quantity");
  }
  deliveryQuantity(item) {
    return SumField(this.delivery(item), "Quantity");
  }
  returnQuantity(item) {
    return SumField(this.returns(item), "Quantity");
  }
  lossQuantity(item) {
    return SumField(this.loss(item), "Quantity");
  }
  undispatchedQuantity(item) {
    return (
      this.orderedQuantity(item) -
      this.issueQuantity(item) +
      this.returnQuantity(item)
    );
  }
  undispatched() {
    return this.items().map((item, i) => ({
      ...item,
      ["Undispatched"]: this.undispatchedQuantity(i + 1),
    }));
  }
  inTransitQuantity(item) {
    return (
      this.issueQuantity(item) -
      this.returnQuantity(item) -
      this.deliveryQuantity(item) -
      this.lossQuantity(item)
    );
  }
  inTransit() {
    return this.items().map((item, i) => ({
      ...item,
      ["InTransit"]: this.inTransitQuantity(i + 1),
    }));
  }
}

export class StockTransportOrder extends CompanyCollection {
  constructor(code, company, name = "StockTransportOrder") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }

  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Stock Transport Order").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Stock Transport Order saved, Number: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Stock Transport Order Updated";
  }
  items() {
    if (!this.exists()) {
      return [];
    }
    return this.getData().Items;
  }
  itemExists(item) {
    return this.items().length >= item;
  }
  itemData(item) {
    return this.items()[item - 1];
  }
  orderedQuantity(item) {
    const result = this.itemData(item).Quantity;
    return result;
  }
  issues(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["16"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("StockTransportOrder", "Number", [this.code]),
      filter("Item", "Number", [item]),
    ]);
    return result;
  }
  receipts(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["17"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("StockTransportOrder", "Number", [this.code]),
      filter("Item", "Number", [item]),
    ]);
    return result;
  }
  returns(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["18"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("StockTransportOrder", "Number", [this.code]),
      filter("Item", "Number", [item]),
    ]);
    return result;
  }
  loss(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["19"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("StockTransportOrder", "Number", [this.code]),
      filter("Item", "Number", [item]),
    ]);
    return result;
  }
  issueQuantity(item) {
    return SumField(this.issues(item), "Quantity");
  }
  receiptQuantity(item) {
    return SumField(this.receipts(item), "Quantity");
  }
  returnQuantity(item) {
    return SumField(this.returns(item), "Quantity");
  }
  lossQuantity(item) {
    return SumField(this.loss(item), "Quantity");
  }
  inTransitQuantity(item) {
    return (
      this.issueQuantity(item) -
      this.receiptQuantity(item) -
      this.returnQuantity(item) -
      this.lossQuantity(item)
    );
  }
  undispatchedQuantity(item) {
    return (
      this.orderedQuantity(item) -
      this.issueQuantity(item) +
      this.returnQuantity(item)
    );
  }
  undispatched() {
    return this.items().map((ordereditem, i) => ({
      ...ordereditem,
      ["Undispatched"]: this.undispatchedQuantity(i + 1),
    }));
  }
  undispatchedByLocation(location) {
    return this.undispatched().filter((item) => item.From === location);
  }
  allIssues() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["16"]),
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("StockTransportOrder", "Number", [this.code]),
    ]);
    return result;
  }
}

export class MaintenanceOrder extends CompanyCollection {
  constructor(code, company, name = "MaintenanceOrder") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }

  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Maintenance Order").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Maintenance Order saved, Number: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Maintenance Order Updated";
  }
}

export class ProductionOrder extends CompanyCollection {
  constructor(code, company, name = "ProductionOrder") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }

  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Production Order").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Production Order saved, Number: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Production Order Updated";
  }
}

export class ProcessOrder extends CompanyCollection {
  constructor(code, company, name = "ProcessOrder") {
    super(company, name);
    this.code = code;
    this.criteria = { Code: this.code };
  }

  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Process Order").From;
    const Code = super.autoNumber(this.criteria, "Code", numberingStart);
    super.add({ ...data, ["Code"]: Code });
    return `Process Order saved, Number: ${Code}`;
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    this.delete();
    super.add(data);
    return "Process Order Updated";
  }
}

export class YearlyCompanyCollection extends CompanyCollection {
  constructor(year, company, name) {
    super(company, name);
    this.year = Number(year);
    this.Yearcriteria = { Year: this.year };
  }
  loadFromCompany() {
    return filterCollection(super.loadFromCompany(), this.Yearcriteria);
  }
  filtered(criteria) {
    return filterCollection(this.loadFromCompany(), criteria);
  }
  getData(criteria) {
    return this.filtered(criteria)[0];
  }
  exists(criteria) {
    return existsInCollection(this.loadFromCompany(), criteria);
  }
  mergedCriteria(criteria) {
    return super.mergedCriteria({ ...criteria, ...this.Yearcriteria });
  }
  delete(criteria) {
    return super.delete(this.mergedCriteria(criteria));
  }
  update(criteria, data) {
    return super.update(this.mergedCriteria(criteria), data);
  }
  autoNumber(criteria, field, start) {
    return newAutoNumber(
      this.loadFromCompany(),
      this.mergedCriteria(criteria),
      field,
      start,
    );
  }
}

export class AccountingDocument extends YearlyCompanyCollection {
  constructor(documentNo, year, company, name = "AccountingDocument") {
    super(year, company, name);
    this.documentNo = Number(documentNo);
    this.criteria = { DocumentNo: this.documentNo };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Accounting Document").From;
    const DocumentNo = super.autoNumber(
      this.criteria,
      "DocumentNo",
      numberingStart,
    );
    const preparedData = { ...this.prepared(data), ...{ DocumentNo } };
    super.add(preparedData);
    const result = super.exists({ ...this.criteria, ...{ DocumentNo } });
    return { result, DocumentNo };
  }
  update(data) {
    super.update(this.criteria, data);
  }
  defaultDocument() {
    return {
      Company: this.companycode,
      Year: this.year,
      DocumentNo: this.documentNo,
      DocumentDate: "",
      Text: "",
      PostingDate: "",
      EntryDate: dateString(new Date()),
      TimeStamp: TimeStamp(),
      Entries: [this.defaultEntry()],
      Reversed: false,
      ReversalDocumentNo: "",
      ReversalDate: "",
    };
  }
  prepared(data) {
    return {
      ...refine(data, this.defaultDocument()),
      ["Entries"]: data.Entries.map((entry, e) => this.preparedEntry(entry)),
    };
  }
  defaultEntry() {
    return {
      Account: "",
      ProfitCenter: "",
      Amount: 0,
      BTC: "",
      Text: "",
    };
  }
  preparedEntry(data) {
    return { ...this.defaultEntry(), ...data };
  }
}

export class MaterialDocument extends YearlyCompanyCollection {
  constructor(documentNo, year, company, name = "MaterialDocument") {
    super(year, company, name);
    this.documentNo = Number(documentNo);
    this.criteria = { DocumentNo: this.documentNo };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Material Document").From;
    const DocumentNo = super.autoNumber(
      this.criteria,
      "DocumentNo",
      numberingStart,
    );
    const preparedData = { ...this.prepared(data), ...{ DocumentNo } };
    super.add(preparedData);
    const result = super.exists({ ...this.criteria, ...{ DocumentNo } });
    return { result, DocumentNo };
  }
  update(data) {
    super.update(this.criteria, data);
  }
  defaultDocument() {
    return {
      Company: this.companycode,
      Year: this.year,
      DocumentNo: this.documentNo,
      Text: "",
      ValueDate: "",
      DocumentType: "",
      EntryDate: dateString(new Date()),
      TimeStamp: TimeStamp(),
      Movements: [this.defaultMovement()],
      Reversed: false,
      ReversalDocumentNo: "",
      ReversalDate: "",
    };
  }
  prepared(data) {
    return {
      ...this.defaultDocument(),
      ...refine(data, this.defaultDocument()),
      ["Movements"]: data.Movements.map((movement, m) =>
        this.prepareMovement(movement),
      ),
    };
  }
  defaultMovement() {
    return {
      No: "",
      MovementType: "",
      MaterialCode: "",
      LocationCode: "",
      Block: "Free",
      Quantity: 0,
      Rate: 0,
      Value: 0,
      PurchaseOrder: "",
      StockTransportOrder: "",
      SaleOrder: "",
      Item: "",
      Customer: "",
      Vendor: "",
      Text: "",
      RefDocNo: "",
      RefYear: "",
      RefItem: "",
    };
  }
  prepareMovement(data) {
    return {
      ...this.defaultMovement(),
      ...refine(data, this.defaultMovement()),
    };
  }
}

export class CostingDocument extends YearlyCompanyCollection {
  constructor(documentNo, year, company, name = "CostingDocument") {
    super(year, company, name);
    this.documentNo = documentNo;
    this.criteria = { DocumentNo: this.documentNo };
  }
  exists() {
    return super.exists(this.criteria);
  }
  getData() {
    return super.getData(this.criteria);
  }
  delete() {
    return super.delete(this.criteria);
  }
  update(data) {
    return super.update(this.criteria, data);
  }
  add(data) {
    const numberingStart = this.company
      .getData()
      .Numbering.find((item) => item.Item === "Costing Document").From;
    const Number = super.autoNumber(
      this.criteria,
      "DocumentNo",
      numberingStart,
    );
    super.add({ ...data, ["DocumentNo"]: Number });
    return `Costing Document created, Number: ${Number}`;
  }
}

export class Transaction extends Collection {
  constructor(company, year, number, type, name = "Transaction") {
    super(name);
    this.companycode = company;
    this.company = new Company(this.companycode);
    this.year = year;
    this.number = number;
    this.type = type;
    this.criteria = {
      Company: this.companycode,
      Year: this.year,
      TransactionNo: this.number,
      Type: this.type,
    };
  }
  getData() {
    return super.getData(this.criteria);
  }
  exists() {
    return super.exists(this.criteria);
  }
  add(data) {
    super.add({ ...data, ...{ Type: this.type } });
    return true;
  }
  update(data) {
    return super.update(this.criteria, data);
  }
}

export class ConsignmentInwards {
  constructor(company, year, documentNo) {
    this.company = company;
    this.year = year;
    this.documentNo = documentNo;
  }
  exists() {
    return this.origins().length > 0;
  }
  origins() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["01"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("DocumentNo", "Number", [this.documentNo]),
      filter("Year", "Number", [this.year]),
    ]);
    return result;
  }
  origin(item) {
    return this.origins()[item - 1];
  }
  receipts(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["02"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  returns(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["03"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  losses(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["04"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  originQuantity(item) {
    return this.origin(item).Quantity;
  }
  receiptQuantity(item) {
    return SumField(this.receipts(item), "Quantity");
  }
  lossQuantity(item) {
    return SumField(this.losses(item), "Quantity");
  }
  returnQuantity(item) {
    return SumField(this.returns(item), "Quantity");
  }
  inTransitQuantity(item) {
    return (
      this.originQuantity(item) -
      this.receiptQuantity(item) -
      this.lossQuantity(item) -
      this.returnQuantity(item)
    );
  }
  inTransits() {
    return this.origins().map((item, i) => ({
      ...item,
      ["InTransit"]: this.inTransitQuantity(i + 1),
    }));
  }
}

export class ReceiptForInspection {
  constructor(company, year, documentNo) {
    this.company = company;
    this.year = year;
    this.documentNo = documentNo;
  }
  exists() {
    return this.origins().length > 0;
  }
  origins() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["05"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("DocumentNo", "Number", [this.documentNo]),
      filter("Year", "Number", [this.year]),
    ]);
    return result;
  }
  origin(item) {
    return this.origins()[item - 1];
  }
  acceptance(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["06"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  returns(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["07"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  losses(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["08"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  originQuantity(item) {
    return this.origin(item).Quantity;
  }
  acceptanceQuantity(item) {
    return SumField(this.acceptance(item), "Quantity");
  }
  lossQuantity(item) {
    return SumField(this.losses(item), "Quantity");
  }
  returnQuantity(item) {
    return SumField(this.returns(item), "Quantity");
  }
  inBlockQuantity(item) {
    return (
      this.originQuantity(item) -
      this.acceptanceQuantity(item) -
      this.lossQuantity(item) -
      this.returnQuantity(item)
    );
  }
  inBlock() {
    return this.origins().map((item, i) => ({
      ...item,
      ["InBlock"]: this.inBlockQuantity(i + 1),
    }));
  }
}

export class MaterialReceipt {
  constructor(company, year, documentNo) {
    this.company = company;
    this.year = year;
    this.documentNo = documentNo;
  }
  exists() {
    return this.items().length > 0;
  }
  items() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["09"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("DocumentNo", "Number", [this.documentNo]),
      filter("Year", "Number", [this.year]),
    ]);
    return result;
  }
  receipts(item) {
    return this.items()[item - 1];
  }
  returns(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["10"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  receiptQuantity(item) {
    return this.receipts(item).Quantity;
  }
  returnQuantity(item) {
    return SumField(this.returns(item), "Quantity");
  }
  netReceiptQuantity(item) {
    return this.receiptQuantity(item) - this.returnQuantity(item);
  }
  netReceipts() {
    return this.items().map((item, i) => ({
      ...item,
      ["NetReceipt"]: this.netReceiptQuantity(i + 1),
    }));
  }
}

export class MaterialBlockInLocation {
  constructor(company, material, block, location) {
    this.companycode = company;
    this.materialcode = material;
    this.block = block;
    this.locationcode = location;
  }
  movements(from = "1900-01-01", to = dateString(new Date())) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("Company", "StringCaseInsensitive", [this.companycode]),
      filter("ValueDate", "StringCaseInsensitive", [], [], [[from, to]]),
      filter("MaterialCode", "Number", [this.materialcode]),
      filter("Block", "StringCaseInsensitive", [this.block]),
      filter("LocationCode", "StringCaseInsensitive", [this.locationcode]),
    ]);
    return result;
  }
  balance(date = dateString(new Date())) {
    return SumField(this.movements("1900-01-01", date), "Quantity");
  }
  value(date = dateString(new Date())) {
    return SumField(this.movements("1900-01-01", date), "Value");
  }
  rate(date = dateString(new Date())) {
    if (Number(this.balance(date)) === 0) {
      return 0;
    }
    return Number(this.value(date)) / Number(this.balance(date));
  }
}

export class STOIssue {
  constructor(company, number, year) {
    this.company = company;
    this.documentNo = number;
    this.year = year;
  }
  exists() {
    return this.issues().length > 0;
  }
  issues() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["16"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("DocumentNo", "Number", [this.documentNo]),
      filter("Year", "Number", [this.year]),
    ]);
    return result;
  }
  issue(item) {
    return this.issues()[item - 1];
  }
  receipts(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["17"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  returns(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["18"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  loss(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["19"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  issueQuantity(item) {
    return this.issue(item).Quantity;
  }
  receiptQuantity(item) {
    return SumField(this.receipts(item), "Quantity");
  }
  returnQuantity(item) {
    return SumField(this.returns(item), "Quantity");
  }
  lossQuantity(item) {
    return SumField(this.loss(item), "Quantity");
  }
  inTransitQuantity(item) {
    return (
      this.issueQuantity(item) -
      this.receiptQuantity(item) -
      this.returnQuantity(item) -
      this.lossQuantity(item)
    );
  }
}

export class MaterialDelivery {
  constructor(company, year, documentNo) {
    this.company = company;
    this.year = year;
    this.documentNo = documentNo;
  }
  exists() {
    return this.items().length > 0;
  }
  items() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["20"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("DocumentNo", "Number", [this.documentNo]),
      filter("Year", "Number", [this.year]),
    ]);
    return result;
  }
  issues(item) {
    return this.items()[item - 1];
  }
  returns(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["21"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  issueQuantity(item) {
    return this.issues(item).Quantity;
  }
  returnQuantity(item) {
    return SumField(this.returns(item), "Quantity");
  }
  netIssueQuantity(item) {
    return this.issueQuantity(item) - this.returnQuantity(item);
  }
  netIssues() {
    return this.items().map((item, i) => ({
      ...item,
      ["NetIssue"]: this.netIssueQuantity(i + 1),
    }));
  }
}

export class ConsignmentOutwards {
  constructor(company, year, documentNo) {
    this.company = company;
    this.year = year;
    this.documentNo = documentNo;
  }
  exists() {
    return this.origins().length > 0;
  }
  origins() {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["22"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("DocumentNo", "Number", [this.documentNo]),
      filter("Year", "Number", [this.year]),
    ]);
    return result;
  }
  origin(item) {
    return this.origins()[item - 1];
  }
  delivery(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["23"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  returns(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["24"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  losses(item) {
    const result = filterByMultipleSelection(MaterialTable(), [
      filter("MovementType", "StringCaseInsensitive", ["25"]),
      filter("Company", "StringCaseInsensitive", [this.company]),
      filter("RefDocNo", "Number", [this.documentNo]),
      filter("RefYear", "Number", [this.year]),
      filter("RefItem", "Number", [item]),
    ]);
    return result;
  }
  originQuantity(item) {
    return this.origin(item).Quantity;
  }
  deliveryQuantity(item) {
    return SumField(this.delivery(item), "Quantity");
  }
  lossQuantity(item) {
    return SumField(this.losses(item), "Quantity");
  }
  returnQuantity(item) {
    return SumField(this.returns(item), "Quantity");
  }
  inTransitQuantity(item) {
    return (
      this.originQuantity(item) -
      this.deliveryQuantity(item) -
      this.lossQuantity(item) -
      this.returnQuantity(item)
    );
  }
  inTransits() {
    return this.origins().map((item, i) => ({
      ...item,
      ["InTransit"]: this.inTransitQuantity(i + 1),
    }));
  }
}
