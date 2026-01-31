export const noop = () => {};

const FieldsInCollection = (collection) => {
  const fields = [];
  collection.map((item) => fields.push(...Object.keys(item)));
  const result = [...new Set(fields)];
  return result;
};

const TrimCollection = (collection, fields) => {
  const trimmed = [];
  collection.forEach((item) => {
    const data = {};
    fields.forEach((field) => {
      data[field] = item[field];
    });
    trimmed.push(data);
  });
  return trimmed;
};

export const ListItems = (collection, key) => {
  const list = [];
  collection.map((item) => list.push(item[key]));
  return list;
};

export const ListUniqueItems = (collection, key) => {
  const list = [];
  collection.map((item) => list.push(item[key]));
  const uniquelist = [...new Set(list)];
  return uniquelist;
};

export const FilteredList = (collection, criteria, field) => {
  return ListItems(filterCollection(collection, criteria), field);
};

export const updateKeyValue = (object, key, value) => {
  const result = { ...object, [key]: value };
  return result;
};

export const updateIndexValue = (array, index, value) => {
  const result = array.map((item, i) => (i === index ? value : item));
  return result;
};

const ExistsDuplicates = (value, collection, key) => {
  const list = ListItems(collection, key);
  const count = Count(value, list);
  const result = count > 1;
  return result;
};

export function SumField(collection, field) {
  let subtotal = 0;
  collection.map((item) => (subtotal += parseFloat(item[field])));
  return subtotal;
}

export function SumFieldIfs(collection, field, ranges, criteria) {
  let subtotal = 0;
  for (let i = 0; i < collection.length; i++) {
    let logic = true;
    for (let j = 0; j < ranges.length; j++) {
      if (collection[i][ranges[j]] != criteria[j]) {
        logic = false;
      }
    }
    if (logic) {
      subtotal += parseFloat(collection[i][field] || 0);
    }
  }
  return subtotal;
}

function Count(value, Array) {
  let subtotal = 0;
  for (let i = 0; i < Array.length; i++) {
    if (Array[i] == value) {
      subtotal++;
    }
  }
  return subtotal;
}

function CountFieldIfs(collection, ranges, criteria) {
  let subtotal = 0;
  for (let i = 0; i < collection.length; i++) {
    let logic = true;
    for (let j = 0; j < ranges.length; j++) {
      if (collection[i][ranges[j]] != criteria[j]) {
        logic = false;
      }
    }
    if (logic) {
      subtotal++;
    }
  }
  return subtotal;
}

function singleFilter(collection, field, value) {
  const result = collection.filter((item) => item[field] === value);
  return result;
}

function listFilter(collection, field, list) {
  let filtered = [];
  list.map(
    (value) =>
      (filtered = [
        ...filtered,
        ...collection.filter((item) => item[field] === value),
      ]),
  );
  return filtered;
}

function exclListFilter(collection, field, list) {
  let filtered = collection;
  list.map(
    (value) => (filtered = filtered.filter((item) => item[field] !== value)),
  );
  return filtered;
}

function rangeFilter(collection, field, list) {
  let filtered = [];
  list.map(
    (range) =>
      (filtered = [
        ...filtered,
        ...collection.filter(
          (item) => item[field] >= range[0] && item[field] <= range[1],
        ),
      ]),
  );
  return filtered;
}

function exclRangeFilter(collection, field, list) {
  let filtered = collection;
  list.map(
    (range) =>
      (filtered = filtered.filter(
        (item) => item[field] < range[0] || item[field] > range[1],
      )),
  );
  return filtered;
}

export const valueInRange = (value, range) => {
  const [from, to] = range;
  const result = value >= from && value <= to ? true : false;
  return result;
};

export function rangeOverlap(range1, range2) {
  let result = true;
  if (
    (range1[0] < range2[0] && range1[1] < range2[0]) ||
    (range1[0] > range2[1] && range1[1] > range2[1])
  ) {
    result = false;
  }
  return result;
}

function moveDate(date, years, months, days) {
  const olddate = new Date(date);
  const newdate = new Date(
    olddate.getFullYear() + years,
    olddate.getMonth() + months,
    olddate.getDate() + days,
  );
  return numberDay(dayNumber(newdate));
}

function ageInYears(d, t) {
  const dob = new Date(d);
  const today = new Date(t);
  const delta = today.getFullYear() - dob.getFullYear();
  const result =
    today >= new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
      ? delta
      : delta - 1;
  return result;
}

function ageInDays(d, t) {
  const result = dayNumber(t) - dayNumber(d) + 1;
  return result;
}

function SuperRange(collection, range, from, to) {
  const filtered = collection.filter(
    (item) => item[from] <= range[0] && item[to] >= range[1],
  );
  return filtered;
}

export function dayNumber(date) {
  const time = new Date(date).getTime();
  const day = time / 86400000;
  return day;
}

function numberDay(number) {
  const milliseconds = number * 86400000;
  const date = new Date(milliseconds);
  const text = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}`;
  return text;
}

function datesInPeriod(period) {
  const [from, to] = period;
  const interval = dayNumber(to) - dayNumber(from);
  const list = [];
  for (let i = 0; i <= interval; i++) {
    list.push(numberDay(dayNumber(from) + i));
  }
  return list;
}

function daysInPeriod(period) {
  const [from, to] = period;
  const interval = dayNumber(to) - dayNumber(from) + 1;
  return interval;
}

export function datesInMonth(year, month) {
  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0,
  );
  const list = datesInPeriod([
    `${startDate.getFullYear()}-${startDate.getMonth() + 1}-01`,
    `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`,
  ]);
  return list;
}

function daysInMonth(year, month) {
  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0,
  );
  const interval = daysInPeriod([
    `${startDate.getFullYear()}-${startDate.getMonth() + 1}-01`,
    `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`,
  ]);
  return interval;
}

function monthStructure(year, month) {
  const start = new Date(`${year}-${month.toString().padStart(2, 0)}-01`);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  const days = daysInPeriod([
    `${start.getFullYear()}-${start.getMonth() + 1}-01`,
    `${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()}`,
  ]);
  const dates = datesInPeriod([
    `${start.getFullYear()}-${start.getMonth() + 1}-01`,
    `${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()}`,
  ]);
  const startDate = numberDay(dayNumber(start));
  const endDate = numberDay(dayNumber(end));
  return { start: startDate, end: endDate, days: days, dates: dates };
}

function negativeError(data, fields) {
  const list = [];
  fields.forEach((field) => {
    if (data[field] < 0) {
      list.push(`${field} cannot be negative.`);
    }
  });
  return list;
}

function blankError(data, fields) {
  const list = [];
  fields.forEach((field) => {
    if (data[field] === "") {
      list.push(`${field} cannot be blank.`);
    }
  });
  return list;
}

function futureDateError(data, fields) {
  const list = [];
  fields.forEach((field) => {
    if (new Date(data[field]) > new Date()) {
      list.push(`${field} cannot be future date.`);
    }
  });
  return list;
}

function timeSeriesError(
  Name,
  Collection,
  Fromfield,
  Tofield,
  LastDate = "9999-12-31",
  FirstDate = "9999-12-31",
) {
  const list = [];
  const ToDateStrings = ListUniqueItems(Collection, Tofield);
  const ToDateNumbers = ToDateStrings.map((date) => dayNumber(date));
  const maxToDateNumber = Math.max(...ToDateNumbers);
  const maxToDateString = numberDay(maxToDateNumber);
  const FromDateStrings = ListUniqueItems(Collection, Fromfield);
  const FromDateNumbers = FromDateStrings.map((date) => dayNumber(date));
  const minToDateNumber = Math.min(...FromDateNumbers);
  const minToDateString = numberDay(minToDateNumber);
  if (new Date(LastDate) > new Date(maxToDateString)) {
    list.push(`At least one ${Name} should have period up to ${LastDate}.`);
  }
  if (new Date(FirstDate) < new Date(minToDateString)) {
    list.push(`At least one ${Name} should have period from ${FirstDate}.`);
  }
  Collection.forEach((item, i) => {
    if (item[Fromfield] > item[Tofield]) {
      list.push(`At ${Name} ${i + 1}, 'From' is greater than 'To'.`);
    }
  });
  return list;
}

function collectionError(
  Name,
  Collection,
  nonBlanks,
  Fromfield = "",
  Tofield = "",
) {
  const list = [];
  Collection.forEach((item, i) => {
    if (item[Fromfield] !== "" && item[Tofield] !== "") {
      if (Number(item[Fromfield]) > Number(item[Tofield])) {
        list.push(
          `At ${Name} ${i + 1} ${Fromfield} is greater than ${Tofield}`,
        );
      }
      Collection.forEach((counteritem, j) => {
        if (
          i !== j &&
          rangeOverlap(
            [Number(item[Fromfield]), Number(item[Tofield])],
            [Number(counteritem[Fromfield]), Number(counteritem[Tofield])],
          )
        ) {
          list.push(
            `${Name} overlaps between item ${Math.min(i, j) + 1} and ${
              Math.max(i, j) + 1
            }`,
          );
        }
      });
    }
    if (nonBlanks.length !== 0) {
      nonBlanks.forEach((field) => {
        if (item[field] === "") {
          list.push(`At ${Name} ${i + 1}, ${field} is necessary`);
        }
      });
    }
  });
  return list;
}

export function isObject(value) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}
export function filterCollection(collection, criteria) {
  const keys = Object.keys(criteria);
  let result = collection;
  keys.forEach((key) => {
    result = result.filter((item) => item[key] === criteria[key]);
  });
  return result;
}

export function filterOutCollection(collection, criteria) {
  let result = [];
  const keys = Object.keys(criteria);
  collection.forEach((item) => {
    let status = true;
    keys.forEach((key) => {
      if (item[key] !== criteria[key]) {
        status = false;
      }
    });
    if (!status) result.push(item);
  });
  return result;
}

export function existsInCollection(collection, criteria) {
  return filterCollection(collection, criteria).length > 0;
}

export function newAutoNumber(collection, criteria, field, startNumber) {
  let start = startNumber - 1;
  do {
    start++;
  } while (existsInCollection(collection, { ...criteria, [field]: start }));
  return start;
}

export const clickButton = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.target.click();
  }
};

export function dateString(date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}`;
}

export function TimeStamp() {
  const date = new Date();
  const ds = dateString(date);
  const timestamp = `${ds}/${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  return timestamp;
}

export function dateInYear(date, year, beginMonth) {
  const startDate = new Date(
    `${year}-${beginMonth.toString().padStart(2, 0)}-01`,
  );
  const endDate = new Date(
    startDate.getFullYear() + 1,
    startDate.getMonth(),
    0,
  );
  const result = valueInRange(dayNumber(new Date(date)), [
    dayNumber(dateString(startDate)),
    dayNumber(dateString(endDate)),
  ]);
  return result;
}

export function refine(data, sample) {
  const result = { ...data };
  const required = Object.keys(sample);
  const existing = Object.keys(data);
  existing.forEach((key) => {
    if (!required.includes(key)) {
      delete result[key];
    }
  });
  return result;
}

export function perform(whileTrue, logic = true, whileFalse = noop) {
  if (logic) {
    whileTrue();
  } else {
    whileFalse();
  }
}

export function trimArray(array) {
  const result = [];
  array.forEach((item, i) => {
    if (item !== "") {
      result.push(item.trim());
    }
  });
  return result;
}

export function trimSelection(selection) {
  const result = {
    List: [],
    ExclList: [],
    Range: [],
    ExclRange: [],
    field: selection.field,
    type: selection.type,
  };
  result.List = trimArray(selection.List);
  result.ExclList = trimArray(selection.ExclList);
  selection.Range.forEach((range, r) => {
    const [From, To] = range;
    if (From !== "" && To !== "") {
      result.Range.push(trimArray(range));
    }
    if (From !== "" && To === "") {
      result.Range.push(trimArray([From, From]));
    }
    if (To !== "" && From === "") {
      result.Range.push(trimArray([To, To]));
    }
  });
  selection.ExclRange.forEach((range, r) => {
    const [From, To] = range;
    if (From !== "" && To !== "") {
      result.ExclRange.push(trimArray(range));
    }
    if (From !== "" && To === "") {
      result.ExclRange.push(trimArray([From, From]));
    }
    if (To !== "" && From === "") {
      result.ExclRange.push(trimArray([To, To]));
    }
  });
  return result;
}

export function convertArrayToNumber(array) {
  return array.map((item) => Number(item));
}

export function changeCaseArray(array, lowercase = true) {
  if (lowercase) {
    return array.map((item) => item.toLowerCase());
  }
  return array.map((item) => item.toUpperCase());
}

export function filterBySelection(collection, filter) {
  const { List, ExclList, Range, ExclRange, field, type } = filter;
  let listFiltered = [];
  let exclListFiltered = [];
  let rangeFiltered = [];
  let exclRangeFiltered = [];

  collection.forEach((item, i) => {
    switch (type) {
      case "StringCaseInsensitive":
        if (changeCaseArray(List).includes(item[field].toLowerCase())) {
          listFiltered.push(i);
        }
        if (changeCaseArray(ExclList).includes(item[field].toLowerCase())) {
          exclListFiltered.push(i);
        }
        Range.forEach((range) => {
          const [From, To] = range;
          if (
            item[field].toLowerCase() >= From.toLowerCase() &&
            item[field].toLowerCase() <= To.toLowerCase()
          ) {
            rangeFiltered.push(i);
          }
        });
        ExclRange.forEach((range) => {
          const [From, To] = range;
          if (
            item[field].toLowerCase() >= From.toLowerCase() &&
            item[field].toLowerCase() <= To.toLowerCase()
          ) {
            exclRangeFiltered.push(i);
          }
        });
        break;
      case "StringCaseSensitive":
        if (List.includes(item[field])) {
          listFiltered.push(i);
        }
        if (ExclList.includes(item[field])) {
          exclListFiltered.push(i);
        }
        Range.forEach((range) => {
          const [From, To] = range;
          if (item[field] >= From && item[field] <= To) {
            rangeFiltered.push(i);
          }
        });
        ExclRange.forEach((range) => {
          const [From, To] = range;
          if (item[field] >= From && item[field] <= To) {
            exclRangeFiltered.push(i);
          }
        });
        break;
      case "Number":
        if (convertArrayToNumber(List).includes(Number(item[field]))) {
          listFiltered.push(i);
        }
        if (convertArrayToNumber(ExclList).includes(Number(item[field]))) {
          exclListFiltered.push(i);
        }
        Range.forEach((range) => {
          const [From, To] = range;
          if (
            Number(item[field]) >= Number(From) &&
            Number(item[field]) <= Number(To)
          ) {
            rangeFiltered.push(i);
          }
        });
        ExclRange.forEach((range) => {
          const [From, To] = range;
          if (
            Number(item[field]) >= Number(From) &&
            Number(item[field]) <= Number(To)
          ) {
            exclRangeFiltered.push(i);
          }
        });
        break;
    }
  });

  const result =
    List.length > 0 || Range.length > 0
      ? collection.filter(
          (item, i) =>
            (listFiltered.includes(i) || rangeFiltered.includes(i)) &&
            !(exclListFiltered.includes(i) || exclRangeFiltered.includes(i)),
        )
      : collection.filter(
          (item, i) =>
            !(exclListFiltered.includes(i) || exclRangeFiltered.includes(i)),
        );

  return result;
}

export function filterByMultipleSelection(collection, filters = []) {
  let result = [...collection];
  filters.forEach((filter) => {
    result = filterBySelection(result, filter);
  });
  return result;
}

export function transformObject(
  oldObject,
  mergeKeys = [],
  renamekeys = [],
  mergeObject = {},
) {
  const result = {};
  mergeKeys.forEach((key) => {
    result[key] = oldObject[key];
  });
  renamekeys.forEach((key) => (result[key[1]] = oldObject[key[0]]));
  return { ...result, ...mergeObject };
}

export const logout = () => {
  localStorage.removeItem("Authentication");
};

export function filter(
  field = "",
  type = "StringCaseInsensitive",
  List = [],
  ExclList = [],
  Range = [],
  ExclRange = [],
) {
  return { field, type, List, ExclList, ExclRange, Range };
}

export function isPositive(number) {
  return number !== "" && number > 0;
}
