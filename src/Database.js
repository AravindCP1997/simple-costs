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
}
