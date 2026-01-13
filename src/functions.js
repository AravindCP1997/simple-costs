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

function SumField(collection, field) {
  let subtotal = 0;
  collection.map((item) => (subtotal += parseFloat(item[field])));
  return subtotal;
}

function SumFieldIfs(collection, field, ranges, criteria) {
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
      ])
  );
  return filtered;
}

function exclListFilter(collection, field, list) {
  let filtered = collection;
  list.map(
    (value) => (filtered = filtered.filter((item) => item[field] !== value))
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
          (item) => item[field] >= range[0] && item[field] <= range[1]
        ),
      ])
  );
  return filtered;
}

function exclRangeFilter(collection, field, list) {
  let filtered = collection;
  list.map(
    (range) =>
      (filtered = filtered.filter(
        (item) => item[field] < range[0] || item[field] > range[1]
      ))
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
    olddate.getDate() + days
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
    (item) => item[from] <= range[0] && item[to] >= range[1]
  );
  return filtered;
}

function dayNumber(date) {
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

function datesInMonth(year, month) {
  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
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
    0
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
  FirstDate = "9999-12-31"
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
  Tofield = ""
) {
  const list = [];
  Collection.forEach((item, i) => {
    if (item[Fromfield] !== "" && item[Tofield] !== "") {
      if (Number(item[Fromfield]) > Number(item[Tofield])) {
        list.push(
          `At ${Name} ${i + 1} ${Fromfield} is greater than ${Tofield}`
        );
      }
      Collection.forEach((counteritem, j) => {
        if (
          i !== j &&
          rangeOverlap(
            [Number(item[Fromfield]), Number(item[Tofield])],
            [Number(counteritem[Fromfield]), Number(counteritem[Tofield])]
          )
        ) {
          list.push(
            `${Name} overlaps between item ${Math.min(i, j) + 1} and ${
              Math.max(i, j) + 1
            }`
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

function totalError(Name, Collection, Field, Maximum) {
  if (SumField(Collection, Field) > Maximum) {
    return `Total of ${Name} ${Field} cannot be more than ${Maximum}`;
  }
}

function maxError(Name, Value, Maximum) {
  let list = [];
  if (Value > Maximum) {
    list.push(`${Name} cannot be more than ${Maximum}.`);
  }
  return list;
}

function setBlank(data, fields) {
  fields.map((item) => (data[item] = ""));
  return data;
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
  let start = startNumber;
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
