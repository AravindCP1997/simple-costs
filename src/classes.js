import { List } from "@react-pdf/renderer";
import { Collection, Dictionary } from "./Database";
import {
  dateInYear,
  datesInMonth,
  existsInCollection,
  filterCollection,
  FilteredList,
  ListItems,
  newAutoNumber,
  valueInRange,
} from "./functions";

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
};

export class Company extends Collection {
  constructor(code, name = "Company") {
    super(name);
    this.code = code;
    this.criteria = { Code: this.code };
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
