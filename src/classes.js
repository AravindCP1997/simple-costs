import { Collection } from "./Database";
import { valueInRange } from "./functions";

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
  yearExists(year) {
    const result = this.taxation(year) !== undefined;
    return result;
  }
  taxation(year) {
    const data = this.getData().Taxation;
    const taxationForTheYear = data.find((item) =>
      valueInRange(year, [item.YearFrom, item.YearTo])
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
  numbering(group) {
    const numberings = this.getData().GLNumbering;
    const result = numberings.find((item) => item.LedgerType === group);
    return [result.From, result.To];
  }
}
