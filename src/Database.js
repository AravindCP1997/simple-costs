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
  add(data) {
    const olddata = this.load();
    const newdata = olddata === null ? [data] : [...olddata, data];
    this.save(newdata);
    return "Success";
  }
  getData(criteria) {
    const data = super.load();
    const keys = Object.keys(criteria);
    let result = data;
    keys.forEach((key) => {
      result = result.filter((item) => item[key] === criteria[key]);
    });
    return result[0];
  }
  delete(criteria) {
    const data = super.load();
    const itemForDeletion = this.getData(criteria);
    const newData = data.filter(
      (item) => JSON.stringify(item) !== JSON.stringify(itemForDeletion)
    );
    super.save(newData);
  }
}
