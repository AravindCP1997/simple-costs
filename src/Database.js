import {
  ListItems,
  existsInCollection,
  filterOutCollection,
} from "./functions";

export class LocalStorage {
  constructor(name) {
    this.name = name;
  }
  load() {
    const result =
      this.name in localStorage
        ? JSON.parse(localStorage.getItem(this.name))
        : null;
    return result;
  }
  async save(data) {
    localStorage.setItem(this.name, JSON.stringify(data));
    return "Saved";
  }
}

export class Dictionary extends LocalStorage {
  constructor(name) {
    super(name);
  }
  getValue(key) {
    const data = super.load();
    const result = data[key];
    return result;
  }
}

export class Collection extends LocalStorage {
  constructor(name) {
    super(name);
  }
  filtered(criteria) {
    const data = super.load();
    if (data === null) {
      return [];
    }
    const keys = Object.keys(criteria);
    let result = data;
    keys.forEach((key) => {
      result = result.filter((item) => item[key] === criteria[key]);
    });
    return result;
  }
  filteredList(criteria, field) {
    const data = this.filtered(criteria);
    const list = ListItems(data, field);
    return list;
  }
  getData(criteria) {
    return this.filtered(criteria)[0];
  }
  exists(criteria) {
    return existsInCollection(super.load(), criteria);
  }
  listAll(field) {
    return ListItems(super.load(), field);
  }
  async add(data) {
    const olddata = super.load();
    const newdata = olddata === null ? [data] : [...olddata, data];
    const result = await super.save(newdata);
    return result;
  }
  async delete(criteria) {
    const data = super.load();
    const newData = filterOutCollection(data, criteria);
    const result = await super.save(newData);
    return result;
  }
  async update(criteria, data) {
    await this.delete(criteria);
    const result = await super.add(data);
    return result;
  }
}
