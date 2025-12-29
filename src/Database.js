import { ListItems } from "./functions";

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
  save(data) {
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
  getAll(criteria) {
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
  getData(criteria) {
    const result = this.getAll(criteria);
    return result[0];
  }
  exists(criteria) {
    const alldata = this.getAll(criteria);
    const result = alldata.length > 0;
    return result;
  }
  list(field) {
    const items = super.load();
    const list = ListItems(items, field);
    return list;
  }
  add(data) {
    const olddata = this.load();
    const newdata = olddata === null ? [data] : [...olddata, data];
    this.save(newdata);
    return "Success";
  }
  delete(criteria) {
    const data = super.load();
    const itemForDeletion = this.getData(criteria);
    const newData = data.filter(
      (item) => JSON.stringify(item) !== JSON.stringify(itemForDeletion)
    );
    super.save(newData);
    return "Success";
  }
  update(criteria, data) {
    this.delete(criteria);
    super.add(data);
    return "Success";
  }
}
