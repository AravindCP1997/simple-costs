function GenerateInput({
  item,
  k,
  value,
  onthischange,
  label,
  disabled,
  className,
}) {
  return (
    <>
      <label className={className}>
        {label && item["name"]}
        {item["input"] === "input" && (
          <input
            key={k}
            disabled={disabled}
            value={value}
            onChange={onthischange}
            type={item["type"]}
          />
        )}
        {item["input"] === "option" && (
          <select
            key={k}
            value={value}
            onChange={onthischange}
            disabled={disabled}
          >
            {item["options"].map((option) => (
              <option value={option}>{option}</option>
            ))}
          </select>
        )}
        {item["value"] == "calculated" && <p>{value}</p>}
      </label>
    </>
  );
}

function InputRow({ disabled, collection, structure, onchange, fieldname }) {
  return (
    <>
      <label>{fieldname}</label>
      <div>
        {structure.map((field, i) => (
          <GenerateInput
            className="querySingle"
            disabled={disabled}
            item={field}
            k={i}
            data-fieldname={fieldname}
            value={collection[field["name"]]}
            onthischange={(e) => onchange(fieldname, field["name"], e)}
            label={true}
          />
        ))}{" "}
      </div>
    </>
  );
}

export function MultipleEntry({
  disabled,
  collection,
  fieldname,
  structure,
  onchange,
  addfunction,
}) {
  return (
    <>
      <label className="queryTable">
        {fieldname}
        <div className="queryRow">
          {structure.map((field) => (
            <label className="queryCell">{field["name"]}</label>
          ))}
        </div>
        <div>
          {collection.map((item, index) => (
            <div className="queryRow">
              {structure.map((field) => (
                <GenerateInput
                  className="queryCell"
                  disabled={disabled}
                  item={field}
                  k={index}
                  value={collection[index][field["name"]]}
                  label={false}
                  onthischange={(e) =>
                    onchange(fieldname, index, field["name"], e)
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </label>
      <div className="queryButtons">
        <button className="blue" onClick={addfunction}>
          Add
        </button>
      </div>
    </>
  );
}

function ObjectUI({ type, method }) {
  const navigate = useNavigate();
  const { object, id } = useParams();
  const collection =
    type === "Object"
      ? objects[object]["collection"]
      : transactions["collection"];
  const schema =
    type === "Object" ? objects[object]["schema"] : transactions["schema"];
  const usestates = {};
  schema.map((item) => (usestates[item["name"]] = item["use-state"]));
  const existingdata =
    collection in localStorage
      ? JSON.parse(localStorage.getItem(collection))
      : [];
  const defaults = method === "Create" ? usestates : existingdata[id];
  const [masterdata, setmaster] = useState(defaults);

  function addToList(list, defaults, e) {
    e.preventDefault;
    const oldlist = masterdata[list];
    const newentry = { ...defaults, ["id"]: oldlist.length };
    const newlist = [...oldlist, newentry];
    setmaster((prevdata) => ({
      ...prevdata,
      [list]: newlist,
    }));
  }

  function singlechange(field, e) {
    const { value } = e.target;
    setmaster((prevdata) => ({
      ...prevdata,
      [field]: value,
    }));
  }

  function objectchange(field, key, e) {
    e.preventDefault;
    const { value } = e.target;
    e.preventDefault;
    const oldobject = masterdata[field];
    const newobject = { ...oldobject, [key]: value };
    setmaster((prevdata) => ({
      ...prevdata,
      [field]: newobject,
    }));
  }

  function collectionchange(field, index, key, e) {
    e.preventDefault;
    const { value } = e.target;
    const oldlist = masterdata[field];
    const olddata = oldlist[index];
    const newdata = { ...olddata, [key]: value };
    const newlist = oldlist.map((item) => (item.id === index ? newdata : item));
    setmaster((prevdata) => ({
      ...prevdata,
      [field]: newlist,
    }));
  }

  function createObject() {
    const datapack = [...existingdata, masterdata];
    saveData(datapack, collection);
    alert(`${object} Created!`);
    cancel();
  }

  function updateObject() {
    const datapack = existingdata.map((item, index) =>
      index == id ? masterdata : item,
    );
    saveData(datapack, collection);
    alert(`${object} Updated!`);
    cancel();
  }

  function cancel() {
    type == "Object" ? navigate(`/query/${object}`) : navigate(`/document`);
  }

  return (
    <div className="queryDisplay">
      <label className="queryTitle">
        <h2>
          {type == "Object" && `${method} ${object}`}{" "}
          {type == "Transaction" && `${method} Transaction`}
        </h2>
      </label>
      {schema.map((field) => (
        <div className="queryField">
          {field["datatype"] === "single" && (
            <GenerateInput
              className="querySingle"
              disabled={method === "Display"}
              label={true}
              item={field}
              k={0}
              value={masterdata[field["name"]]}
              onthischange={(e) => singlechange(field["name"], e)}
            />
          )}
          {field["datatype"] === "object" && (
            <InputRow
              disabled={method === "Display"}
              collection={masterdata[field["name"]]}
              fieldname={field["name"]}
              structure={field["structure"]}
              onchange={objectchange}
            />
          )}
          {field["datatype"] === "collection" && (
            <MultipleEntry
              disabled={method === "Display"}
              collection={masterdata[field["name"]]}
              fieldname={field["name"]}
              structure={field["structure"]}
              addfunction={(e) =>
                addToList(field["name"], field["use-state"][0], e)
              }
              onchange={collectionchange}
            />
          )}
        </div>
      ))}
      <div className="queryButtons">
        {method != "Display" && (
          <button className="blue" onClick={cancel}>
            Cancel
          </button>
        )}
        {method == "Display" && (
          <button className="blue" onClick={cancel}>
            Back
          </button>
        )}
        {method == "Create" && (
          <button className="green" onClick={createObject}>
            Create
          </button>
        )}
        {method == "Update" && (
          <button className="blue" onClick={updateObject}>
            Update
          </button>
        )}
      </div>
    </div>
  );
}

{
  field["datatype"] == "single" && (
    <div className="querySingle">
      <label>{field["name"]}</label>
      {field["input"] == "input" && (
        <input
          disabled={field["disabled"]}
          type={field["type"]}
          onChange={(e) =>
            setmaster(
              new ControlObject(object, {
                ...data,
                [field["name"]]: e.target.value,
              }),
            )
          }
          value={data[field["name"]]}
        />
      )}
      {field["input"] == "option" && (
        <select
          onChange={(e) =>
            setmaster(
              new ControlObject(object, {
                ...data,
                [field["name"]]: e.target.value,
              }),
            )
          }
          value={data[field["name"]]}
        >
          {field["options"].map((option) => (
            <option value={option}>{option}</option>
          ))}
        </select>
      )}
    </div>
  );
}
{
  field["datatype"] == "object" && (
    <div>
      <label>{field["name"]}</label>
      {field["structure"].map((subfield) => (
        <>
          {subfield["datatype"] == "single" && (
            <div className="querySingle">
              <label>{subfield["name"]}</label>
              {subfield["input"] == "input" && (
                <input
                  type={subfield["type"]}
                  onChange={(e) =>
                    setmaster(
                      new ControlObject(object, {
                        ...data,
                        [field["name"]]: {
                          ...data[field["name"]],
                          [subfield["name"]]: e.target.value,
                        },
                      }),
                    )
                  }
                  value={data[field["name"]][subfield["name"]]}
                />
              )}
              {subfield["input"] == "option" && (
                <select
                  onChange={(e) =>
                    setmaster(
                      new ControlObject(object, {
                        ...data,
                        [field["name"]]: {
                          ...data[field["name"]],
                          [subfield["name"]]: e.target.value,
                        },
                      }),
                    )
                  }
                  value={data[field["name"]][subfield["name"]]}
                >
                  {subfield["options"].map((option) => (
                    <option value={option}>{option}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </>
      ))}
    </div>
  );
}
{
  field["datatype"] == "collection" && (
    <>
      <label>{field["name"]}</label>
      <div className="queryTable">
        <table>
          <thead>
            <tr>
              {field["structure"].map((subfield) => (
                <th className="queryCell">{subfield["name"]}</th>
              ))}
            </tr>
          </thead>
          {data[field["name"]].map((item, index) => (
            <tbody>
              <tr>
                {field["structure"].map((subfield) => (
                  <>
                    {subfield["datatype"] == "single" && (
                      <td>
                        {subfield["value"] == "calculated" && (
                          <input
                            value={data[field["name"]][index][subfield["name"]]}
                            disabled={true}
                          />
                        )}{" "}
                        {subfield["input"] == "input" && (
                          <input
                            className="queryCell"
                            onChange={(e) =>
                              setmaster(
                                new ControlObject(object, {
                                  ...data,
                                  [field["name"]]: data[field["name"]].map(
                                    (item, i) =>
                                      i == index
                                        ? {
                                            ...item,
                                            [subfield["name"]]: e.target.value,
                                          }
                                        : item,
                                  ),
                                }),
                              )
                            }
                            type={subfield["type"]}
                            value={data[field["name"]][index][subfield["name"]]}
                          />
                        )}
                        {subfield["input"] == "option" && (
                          <select
                            onChange={(e) =>
                              setmaster(
                                new ControlObject(object, {
                                  ...data,
                                  [field["name"]]: data[field["name"]].map(
                                    (item, i) =>
                                      i == index
                                        ? {
                                            ...item,
                                            [subfield["name"]]: e.target.value,
                                          }
                                        : item,
                                  ),
                                }),
                              )
                            }
                            value={data[field["name"]][index][subfield["name"]]}
                          >
                            {subfield["options"].map((option) => (
                              <option value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    )}
                  </>
                ))}
              </tr>
            </tbody>
          ))}
        </table>
      </div>
      <div className="queryButtons">
        <button
          onClick={(e) =>
            setmaster(
              new ControlObject(object, {
                ...data,
                [field["name"]]: [
                  ...data[field["name"]],
                  {
                    ...field["use-state"][0],
                    ["id"]: data[field["name"]].length,
                  },
                ],
              }),
            )
          }
          className="blue"
        >
          Add
        </button>
      </div>
    </>
  );
}

function CRUDCollection() {
  const location = useLocation();
  const query = location.state || {};
  const { collection, method, parameters } = query;
  const CRUD = new Collection(collection, method);
  const defaults = CRUD.defaults(parameters);
  const [data, setdata] = useState(defaults);
  const output = CRUD.process(data);
  const schema = CRUD.schema(data);
  const errors = CRUD.errors(data);
  const navigate = useNavigate();

  const singleChange = (field, e) => {
    e.preventDefault;
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: value,
    }));
  };

  function objectChange(field, subfield, e) {
    e.preventDefault;
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: { ...prevdata[field], [subfield]: value },
    }));
  }

  function collectionChange(field, subfield, index, e) {
    e.preventDefault;
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: prevdata[field].map((item, i) =>
        i === index ? { ...item, [subfield]: value } : item,
      ),
    }));
  }

  function nestChange(field, index, subfield, subindex, subsubfield, e) {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: prevdata[field].map((item, i) =>
        i == index
          ? {
              ...item,
              [subfield]: item[subfield].map((subitem, ii) =>
                ii == subindex ? { ...subitem, [subsubfield]: value } : subitem,
              ),
            }
          : item,
      ),
    }));
  }

  function addCollection(field, e) {
    e.preventDefault;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: [...prevdata[field], defaults[field][0]],
    }));
  }

  function removeCollection(field, index, e) {
    e.preventDefault;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: prevdata[field].filter((item, i) => i !== index),
    }));
  }

  function addNest(field, index, subfield) {
    setdata((prevdata) => ({
      ...prevdata,
      [field]: prevdata[field].map((item, i) =>
        i == index
          ? {
              ...item,
              [subfield]: [...item[subfield], defaults[field][0][subfield][0]],
            }
          : item,
      ),
    }));
  }

  function removeNest(field, index, subfield, subindex) {
    setdata((prevdata) => ({
      ...prevdata,
      [field]: prevdata[field].map((item, i) =>
        i == index
          ? {
              ...item,
              [subfield]: item[subfield].filter(
                (subitem, ii) => ii != subindex,
              ),
            }
          : item,
      ),
    }));
  }

  function cancel() {
    navigate(`/c/${collection}`);
    window.location.reload();
  }

  function save() {
    const result = CRUD.save(data);
    alert(result);
    cancel();
  }

  return (
    <div className="crudUI">
      <div className="crudTitle">
        <h2>
          {method} {CRUD.title}
        </h2>
      </div>
      <div className="crudFields">
        {schema.map((field) => (
          <>
            {field["datatype"] == "single" && (
              <SingleInput
                field={field}
                output={output}
                handleChange={singleChange}
              />
            )}
            {field["datatype"] == "collection" && (
              <CollectionInput
                field={field}
                output={output}
                handleChange={collectionChange}
                addItem={addCollection}
                removeItem={removeCollection}
              />
            )}
            {field["datatype"] == "nest" && (
              <NestInput
                field={field}
                output={output}
                handleChange1={collectionChange}
                handleChange2={nestChange}
                addItem1={addCollection}
                addItem2={addNest}
                removeItem1={removeCollection}
                removeItem2={removeNest}
              />
            )}
          </>
        ))}
      </div>
      <div className="crudButtons">
        <button onClick={() => cancel()}>
          <FaArrowLeft />
        </button>
        {method != "Display" && <button onClick={() => save()}>Save</button>}
      </div>
      {errors.length > 0 && method != "Display" && (
        <div className="crudError">
          <h4>Things to Consider:</h4>
          <ul>
            {errors.map((error) => (
              <li>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TransactionUI() {
  const { type } = useParams();
  const transaction = new Transaction(type);
  const navigate = useNavigate();
  const defaults = transaction.defaults();
  const [data, setdata] = useState(defaults);
  const output = transaction.process(data);
  const schema = transaction.schema(output);
  const errors = transaction.errors(output);
  const singleChange = (field, e) => {
    e.preventDefault;
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: value,
    }));
  };

  function objectChange(field, subfield, e) {
    e.preventDefault;
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: { ...prevdata[field], [subfield]: value },
    }));
  }

  function collectionChange(field, subfield, index, e) {
    e.preventDefault;
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: prevdata[field].map((item, i) =>
        i === index ? { ...item, [subfield]: value } : item,
      ),
    }));
  }

  function nestChange(field, index, subfield, subindex, subsubfield, e) {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: prevdata[field].map((item, i) =>
        i == index
          ? {
              ...item,
              [subfield]: item[subfield].map((subitem, ii) =>
                ii == subindex ? { ...subitem, [subsubfield]: value } : subitem,
              ),
            }
          : item,
      ),
    }));
  }

  function addCollection(field, e) {
    e.preventDefault;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: [...prevdata[field], defaults[field][0]],
    }));
  }

  function removeCollection(field, index, e) {
    e.preventDefault;
    setdata((prevdata) => ({
      ...prevdata,
      [field]: prevdata[field].filter((item, i) => i !== index),
    }));
  }

  function addNest(field, index, subfield) {
    setdata((prevdata) => ({
      ...prevdata,
      [field]: prevdata[field].map((item, i) =>
        i == index
          ? {
              ...item,
              [subfield]: [...item[subfield], defaults[field][0][subfield][0]],
            }
          : item,
      ),
    }));
  }

  function removeNest(field, index, subfield, subindex) {
    setdata((prevdata) => ({
      ...prevdata,
      [field]: prevdata[field].map((item, i) =>
        i == index
          ? {
              ...item,
              [subfield]: item[subfield].filter(
                (subitem, ii) => ii != subindex,
              ),
            }
          : item,
      ),
    }));
  }

  function cancel() {
    navigate("/report");
    window.location.reload();
  }

  function save() {
    if (errors.length == 0) {
      const result = transaction.completeTransaction(output);
      alert(result);
      cancel();
    } else {
      alert("Validation unsuccesful with errors!");
    }
  }

  return (
    <div className="crudUI">
      <div className="crudTitle">
        <h2>{type}</h2>
      </div>
      <div className="crudFields">
        {schema.map((field) => (
          <>
            {field["datatype"] == "single" && (
              <SingleInput
                field={field}
                output={output}
                handleChange={singleChange}
              />
            )}
            {field["datatype"] == "object" && (
              <ObjectInput
                field={field}
                output={output}
                handleChange={objectChange}
              />
            )}
            {field["datatype"] == "collection" && (
              <CollectionInput
                field={field}
                output={output}
                handleChange={collectionChange}
                addItem={addCollection}
                removeItem={removeCollection}
              />
            )}
            {field["datatype"] == "nest" && (
              <NestInput
                field={field}
                output={output}
                handleChange1={collectionChange}
                handleChange2={nestChange}
                addItem1={addCollection}
                addItem2={addNest}
                removeItem1={removeCollection}
                removeItem2={removeNest}
              />
            )}
          </>
        ))}
      </div>
      <div className="crudButtons">
        <button onClick={() => cancel()}>
          <FaArrowLeft />
        </button>
        <button onClick={() => save()}>Save</button>
      </div>
      {errors.length > 0 && (
        <div className="crudError">
          <h4>Things to Consider:</h4>
          <ul>
            {errors.map((error) => (
              <li>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const ratios = {
  A: [
    { Type: "Cost Center", To: "B", Ratio: 50 },
    { Type: "General Ledger", To: "A", Ratio: 50 },
  ],
  B: [
    { Type: "Cost Center", To: "C", Ratio: 50 },
    { Type: "General Ledger", To: "B", Ratio: 50 },
  ],
  C: [{ Type: "Cost Center", To: "D", Ratio: 50 }],
  D: [
    { Type: "Cost Center", To: "E", Ratio: 50 },
    { Type: "Cost Center", To: "B", Ratio: 50 },
  ],
  E: [
    { Type: "Cost Center", To: "C", Ratio: 50 },
    { Type: "Cost Center", To: "A", Ratio: 50 },
  ],
};

function Costing() {
  const ratio = (Receiver, Sender, NotThrough) => {
    const data = ratios[Sender];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      let to = data[i];
      if (to["Type"] == "Cost Center" && to["To"] == Receiver) {
        sum += to["Ratio"] / 100;
      } else if (
        to["Type"] == "Cost Center" &&
        !NotThrough.includes(to["To"])
      ) {
        sum +=
          (to["Ratio"] * ratio(Receiver, to["To"], [...NotThrough, Sender])) /
          100;
      }
    }
    sum = sum / (1 - selfRatio(Sender, [Receiver, ...NotThrough]));
    return sum;
  };

  const selfRatio = (Center, NotThrough) => {
    const data = ratios[Center];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      let to = data[i];
      if (to["Type"] == "Cost Center" && to["To"] == "") {
        sum += to["Ratio"] / 100;
      } else if (
        to["Type"] == "Cost Center" &&
        !NotThrough.includes(to["To"])
      ) {
        sum += (to["Ratio"] * ratio(Center, to["To"], NotThrough)) / 100;
      }
    }
    return sum;
  };

  const AllocationRatios = (Center, Weight, Self, NotThrough) => {
    const list = [];
    const data = ratios[Center];
    for (let i = 0; i < data.length; i++) {
      let to = data[i];
      if (to["Type"] !== "Cost Center") {
        list.push({
          ...to,
          ["Absolute Ratio"]:
            (Weight * to["Ratio"]) / 100 / Self / (1 - selfRatio(Center, [])),
        });
      } else if (
        to["Type"] == "Cost Center" &&
        !NotThrough.includes(to["To"])
      ) {
        list.push(
          ...AllocationRatios(
            to["To"],
            to["Ratio"],
            1 - selfRatio(Center, [...NotThrough, Center]),
            [...NotThrough, Center],
          ),
        );
      }
    }

    return list;
  };
}

const defaults = { "General Ledger": { value: "", values: [""] } };
const [data, setdata] = useState(defaults);

function valueChange(itemname, field, e) {
  const { value } = e.target;
  setquery((prevdata) => ({
    ...prevdata,
    [itemname]: { ...prevdata[itemname], [field]: value },
  }));
}

function rangeChange(itemname, field, i, e) {
  const { value } = e.target;
  const prevrange = [...query[itemname][field]];
  const newrange = prevrange.map((item, index) => (i == index ? value : item));
  setquery((prevdata) => ({
    ...prevdata,
    [itemname]: { ...prevdata[itemname], [field]: newrange },
  }));
}

function valuesChange(itemname, field, i, e) {
  const { value } = e.target;
  const prevvalues = [...query[itemname][field]];
  const newvalues = prevvalues.map((item, index) =>
    i == index ? value : item,
  );
  setquery((prevdata) => ({
    ...prevdata,
    [itemname]: { ...prevdata[itemname], [field]: newvalues },
  }));
}

function rangesChange(itemname, field, i, j, e) {
  const { value } = e.target;
  const prevranges = [...query[itemname][field]];
  const prevrange = prevranges[i];
  const newrange = prevrange.map((item, index) => (j == index ? value : item));
  const newranges = prevranges.map((item, index) =>
    i == index ? newrange : item,
  );
  setquery((prevdata) => ({
    ...prevdata,
    [itemname]: { ...prevdata[itemname], [field]: newranges },
  }));
}

function addValues(itemname, field) {
  const defaults = Report.defaults(field);
  const newvalues = [...query[itemname][field], ...defaults];
  setquery((prevdata) => ({
    ...prevdata,
    [itemname]: { ...prevdata[itemname], [field]: newvalues },
  }));
}

function addRanges(itemname, field) {
  const defaults = defaults(field);
  const newvalues = [...query[itemname][field], ...defaults];
  setdata((prevdata) => ({
    ...prevdata,
    [itemname]: { ...prevdata[itemname], [field]: newvalues },
  }));
}

const buildTree = (data, parentId = null) => {
  const list = [];
  const array = ArrayJSON(data).array;
  const parents = array.filter(
    (item) =>
      (item["elementType"] === "index" && item["arrayId"] === parentId) ||
      (item["elementType"] === "key" && item["key"] === parentId),
  );
  for (let i = 0; i < parents.length; i++) {
    let parent = parents[i];
    if (parent["valueType"] === "value") {
      parent = {
        ...parent,
        ["value"]: array.find(
          (item) =>
            item.elementType === "value" &&
            (item["key"] === parent["id"] || item["arrayId"] === parent["id"]),
        ),
      };
    } else {
      parent = { ...parent, ...{ children: buildTree(data, parent["id"]) } };
    }
    list.push(parent);
  }
  return list;
};

const Node = ({ node, setkey, setvalue, schema }) => {
  const keyChange = (id, e) => {
    const { value } = e.target;
    setkey((prevdata) =>
      JSONArray(
        ArrayJSON(prevdata).array.map((item) =>
          item.id === id ? { ...item, ["name"]: value } : item,
        ),
      ),
    );
  };

  const valueChange = (id, field, e) => {
    const { value } = e.target;
    setvalue((prevdata) =>
      prevdata.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  return (
    <>
      {node.elementType === "key" && (
        <>
          {node.valueType === "value" && (
            <tr>
              <td>{node.id}</td>
              <td>
                <input
                  onChange={(e) => keyChange(node["id"], e)}
                  value={node["name"]}
                />
              </td>
              <td>
                <input
                  onChange={(e) => valueChange(node.value["id"], "a", e)}
                  value={node.value["name"]}
                />
              </td>
            </tr>
          )}
          {node.valueType !== "value" && (
            <>
              <tr>
                <td>{node.id}</td>
                <td>
                  <input
                    onChange={(e) => keyChange(node["id"], e)}
                    value={node["name"]}
                  />
                </td>
              </tr>
              {node.children.map((subNode) => (
                <Node node={subNode} schema={schema} setkey={setkey} />
              ))}
            </>
          )}
        </>
      )}
      {node.elementType === "index" && (
        <>
          {node.valueType === "value" && (
            <tr>
              <td>{node.id}</td>
              <td>
                <input
                  onChange={(e) => keyChange(node.value["id"], e)}
                  value={node.value["name"]}
                />
              </td>
            </tr>
          )}
          {node.valueType !== "value" && (
            <>
              <tr>
                <td>{node.id}</td>
                <td>{node["index"]}</td>
              </tr>
              {node.children.map((subNode) => (
                <Node node={subNode} schema={schema} setkey={setkey} />
              ))}
            </>
          )}
        </>
      )}
    </>
  );
};

const TreeInput = () => {
  const [key, setkey] = useState(
    new CompanyCollection("1000", "Employee").getData({ Code: 201052 }),
  );
  const [value, setvalue] = useState([]);
  const treeStructure = buildTree(key);
  const inputSchema = { datatype: "single", input: "input", type: "text" };

  return (
    <table>
      {treeStructure.map((item) => (
        <Node
          node={item}
          setkey={setkey}
          setvalue={setvalue}
          schema={inputSchema}
        />
      ))}
    </table>
  );
};

function Interface() {
  const location = useLocation();
  const inputData = location.state || {};
  const { type } = inputData;
  let defaults = {};
  let Display = {};
  let editable = false;
  let title = "";
  let isTable = false;
  let viewJSON = true;
  if (type == "CollectionQuery") {
    const { collection, method } = inputData;
    Display = new CollectionQuery(collection, method);
    defaults = Display.defaults;
    editable = true;
    viewJSON = false;
    title = `${method} ${new Collection(collection).title}`;
  } else if (type == "Collection") {
    const { collection, method, data } = inputData;
    Display = new Collection(collection, method);
    defaults = Display.defaults(data);
    editable = method == "Create" || method == "Update";
    title = `${method} ${Display.title}`;
  } else if (type == "Table") {
    const { table, method } = inputData;
    Display = new Table(table, method);
    defaults = Display.defaults;
    editable = method == "Update";
    title = Display.title;
    isTable = true;
  } else if (type == "TransactionQuery") {
    const { transaction } = inputData;
    Display = new TransactionQuery(transaction);
    defaults = Display.defaults("");
    editable = true;
    title = transaction;
  } else if (type == "Transaction") {
    const { transaction } = inputData;
    Display = new Transaction(transaction);
    defaults = Display.defaults();
    editable = true;
    title = Transaction.titles[transaction];
  } else if (type == "ReportQuery") {
    const { report } = inputData;
    Display = new ReportQuery(report);
    defaults = Display.defaults();
    editable = true;
    title = new Report(report).title();
  } else if (type == "Report") {
    const { report, data } = inputData;
    Display = new Report(report);
    defaults = Display.defaults(data);
    editable = true;
    title = Display.title();
  } else if (type === "DeviceUI") {
    Display = DeviceUI;
    defaults = Display.data;
    editable = true;
    title = "Device UI Settings";
    viewJSON = false;
  }

  const [data, setdata] = useState(defaults);
  const { schema, output, errors, navigation } = Display.interface(data);

  return (
    <>
      <Viewer
        table={isTable}
        title={title}
        editable={editable}
        output={output}
        schema={schema}
        defaults={defaults}
        setdata={setdata}
        errors={errors}
        navigation={navigation}
        viewJSON={viewJSON}
      />
    </>
  );
}

function Viewer({
  title,
  editable,
  output,
  schema,
  defaults,
  setdata,
  errors,
  navigation,
  table,
  viewJSON,
}) {
  const navigate = useNavigate();

  const runFunction = (func) => {
    if (func["type"] === "navigate") {
      navigate(func["url"], { state: func["state"] });
    } else if (func["type"] === "action") {
      func["onClick"]();
    }
    if (func["refresh"]) {
      window.location.reload();
    }
  };

  return (
    <div className="display">
      <div className="displayTitle">
        <h3>{title}</h3>
      </div>
      <div className="displayInputFields">
        {!table &&
          schema.map((field) => (
            <>
              {field["datatype"] == "single" && (
                <SingleInput field={field} output={output} setdata={setdata} />
              )}
              {field["datatype"] == "list" && (
                <ListInput field={field} output={output} setdata={setdata} />
              )}
              {field["datatype"] === "object" && (
                <ObjectInput output={output} setdata={setdata} field={field} />
              )}
              {field["datatype"] == "collection" && (
                <CollectionInput
                  field={field}
                  output={output}
                  setdata={setdata}
                  defaults={defaults}
                />
              )}
              {field["datatype"] == "nest" && (
                <NestInput
                  field={field}
                  output={output}
                  setdata={setdata}
                  defaults={defaults}
                />
              )}
              {field["datatype"] == "multiple" && (
                <MultipleInput
                  field={field}
                  output={output}
                  setdata={setdata}
                />
              )}
              {field["datatype"] == "table" && (
                <DisplayAsTable collection={output[field["name"]]} />
              )}
              {field["datatype"] === "tree" && (
                <TreeInput
                  data={output}
                  setdata={setdata}
                  schema={field["schema"]}
                />
              )}
            </>
          ))}
        {table && (
          <TableInput
            data={output}
            schema={schema}
            setdata={setdata}
            defaults={defaults}
            editable={editable}
          />
        )}
      </div>
      {editable && errors.length > 0 && (
        <div className="error">
          <Collapsible
            title={`Alert (${errors.length}) `}
            children={
              <ol>
                {errors.map((error) => (
                  <li>{error}</li>
                ))}
              </ol>
            }
          />
        </div>
      )}
      {navigation.length > 0 && (
        <div className="navigation">
          {navigation.map((item) => (
            <>
              <button onClick={() => runFunction(item)}>{item["name"]}</button>
            </>
          ))}
        </div>
      )}
    </div>
  );
}

function FocusableList({ items }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    // Set initial focus
    if (itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault(); // Prevent default browser scroll
      setFocusedIndex((prevIndex) => (prevIndex + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault(); // Prevent default browser scroll
      setFocusedIndex(
        (prevIndex) => (prevIndex - 1 + items.length) % items.length,
      );
    }
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {" "}
      {/* tabIndex on parent to receive focus */}
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={(el) => (itemRefs.current[index] = el)}
          tabIndex={index === focusedIndex ? 0 : -1}
          style={{
            border: index === focusedIndex ? "2px solid blue" : "none",
            padding: "5px",
          }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

class Report {
  constructor(report) {
    this.report = report;
  }
  defaults(data) {
    let defaults = {};
    switch (this.report) {
      case "AccountingDocument":
        const documentData = Transaction.Accountingdoc(
          data["Company Code"],
          Number(data["Year"]),
          Number(data["Document Number"]),
        ).document;
        defaults = documentData;
        break;
      case "IncomeTaxSimulator":
        defaults = {
          "Income Tax Code": "115BAC",
          "Financial Year": 2024,
          "Total Income": 0,
          "Tax on Total Income": 0,
          "Marginal Relief": 0,
          "Net Tax on Total Income": 0,
        };
        break;
      case "MasterCollection":
        defaults = { Collection: "Asset" };
        break;
    }
    if (
      [
        "AssetRegister",
        "MaterialRegister",
        "CustomerRegister",
        "VendorRegister",
        "EmployeeRegister",
      ].includes(this.report)
    ) {
      defaults = { ...data };
    }
    return defaults;
  }
  interface(data) {
    let schema = [];
    let errors = [];
    let navigation = [];
    let result = { ...data };

    //Introducing Back Button
    if (
      [
        "AccountingDocument",
        "AssetRegister",
        "MaterialRegister",
        "CustomerRegister",
        "VendorRegister",
        "EmployeeRegister",
      ].includes(this.report)
    ) {
      navigation = [
        {
          name: "Back",
          type: "navigate",
          url: "/interface",
          state: { type: "ReportQuery", report: this.report },
        },
      ];
    }
    switch (this.report) {
      case "IncomeTaxSimulator":
        //Schema
        schema = [
          {
            name: "Income Tax Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("IncomeTaxCode").listAll("Code")],
          },
          {
            name: "Financial Year",
            datatype: "single",
            input: "input",
            type: "number",
          },
          {
            name: "Total Income",
            datatype: "single",
            input: "input",
            type: "number",
          },
          {
            name: "Tax on Total Income",
            datatype: "single",
            noteditable: true,
          },
          { name: "Marginal Relief", datatype: "single", noteditable: true },
          {
            name: "Net Tax on Total Income",
            datatype: "single",
            noteditable: true,
          },
        ];
        //Errors
        if (data["Income Tax Code"] === "") {
          errors.push(`Incom Tax Code required`);
        } else {
          if (data["Financial Year"] === "") {
            errors.push("Financial Year required");
          } else {
            if (
              !new IncomeTaxCode(data["Income Tax Code"]).yearExists(
                data["Financial Year"],
              )
            ) {
              errors.push(
                `Taxation for specified year not available in Income Tax Code: ${data["Income Tax Code"]}`,
              );
            }
          }
        }
        //Processing
        if (result["Income Tax Code"] !== "" && data["Financial Year"] !== "") {
          const IT = new IncomeTaxCode(result["Income Tax Code"]);
          if (IT.yearExists(data["Financial Year"])) {
            result["Tax on Total Income"] = IT.tax(
              Number(result["Financial Year"]),
              Number(result["Total Income"]),
            );
            result["Marginal Relief"] = IT.marginalRelief(
              result["Financial Year"],
              result["Total Income"],
            );
            result["Net Tax on Total Income"] = IT.netTax(
              Number(result["Financial Year"]),
              Number(result["Total Income"]),
            );
          }
        }
        break;
      case "AccountingDocument":
        schema = [
          { name: "Posting Date", datatype: "single", noteditable: true },
          { name: "Document Number", datatype: "single", noteditable: true },
          { name: "Year", datatype: "single", noteditable: true },
          { name: "Line Items", datatype: "table" },
        ];
        break;
      case "MasterCollection":
        schema = [
          {
            name: "Collection",
            datatype: "single",
            input: "option",
            options: [...Collection.list],
            noteditable: false,
          },
          { name: "Data", datatype: "table" },
        ];
        result["Data"] = new Collection(result["Collection"]).register();
        break;
    }
    if (
      [
        "AssetRegister",
        "MaterialRegister",
        "CustomerRegister",
        "VendorRegister",
        "EmployeeRegister",
      ].includes(this.report)
    ) {
      const collectionname = {
        AssetRegister: "Asset",
        CustomerRegister: "Customer",
        EmployeeRegister: "Employee",
        MaterialRegister: "Material",
        VendorRegister: "Vendor",
      };
      result["Register"] = new CompanyCollection(
        result["Company Code"],
        collectionname[this.report],
      ).register();
      schema = [
        { name: "Company Code", datatype: "single", noteditable: true },
        { name: "Register", datatype: "table" },
      ];
    }
    return {
      schema: schema,
      output: result,
      errors: errors,
      navigation: navigation,
    };
  }
  title() {
    const titles = {
      AccountingDocument: "View Accounting Document",
      IncomeTaxSimulator: "Income Tax Simulate",
      AssetRegister: "Asset Register",
      CustomerRegister: "Customer Register",
      EmployeeRegister: "Employee Register",
      MaterialRegister: "Material Register",
      VendorRegister: "Vendor Register",
      MasterCollection: "Master Collection",
    };
    return titles[this.report];
  }
}

class TransactionQuery {
  constructor(type) {
    this.type = type;
  }
  defaults(data) {
    let defaults = {};
    return defaults;
  }
  interface(data) {
    let schema = [];
    let result = { ...data };
    let navigation = [];
    let errors = [];
    return {
      schema: schema,
      errors: errors,
      output: result,
      navigation: navigation,
    };
  }
}

class Transaction {
  constructor(type) {
    this.type = type;
  }
  defaults(data) {
    let defaults = {};
    if (Transaction.IntraCompanyTransactions.includes(this.type)) {
      defaults = { "Company Code": "" };
      if (this.type === "ACOSettlement") {
        defaults = {
          ...defaults,
          ...{
            "Asset Construction Order": "",
            "Posting Date": "",
            "Asset Value Date": "",
          },
        };
      }
      if (Transaction.AccountingTypes.includes(this.type)) {
        defaults = {
          "Company Code": "",
          "Posting Date": "",
          "Document Date": "",
          Year: "",
          Reference: "",
          Text: "",
          "Line Items": [
            { "Debit/ Credit": "Debit", "Account Type": "", Account: "" },
          ],
        };
        if (["VendorInvoice", "VendorCredtiNote"].includes(this.type)) {
          defaults["Vendor Info"] = {
            Vendor: "",
            Presentation: "",
            Amount: "",
          };
        }
        if (["CustomerInvoice", "CustomerCreditNote"].includes(this.type)) {
          defaults["Customer Info"] = {
            Customer: "",
            Presentation: "",
            Amount: "",
          };
        }
      }
    }
    return defaults;
  }
  interface(data) {
    let schema = [];
    let result = { ...data };
    let errors = [];
    let navigation = [];
    let necessary = [];
    const lineItemProcess = (data, itemData, i) => {
      const company = data["Company Code"];
      const accType = itemData["Account Type"];
      const account = itemData["Account"];
      let noteditables = ["Transaction"];
      let blankfields = [];
      const result = { ...itemData };
      const errors = [];
      const required = ["Account Type", "Account", "Amount", "Debit/ Credit"];
      let schema = [
        {
          name: "Debit/ Credit",
          datatype: "single",
          input: "option",
          options: ["Debit", "Credit"],
        },
        {
          name: "Account Type",
          datatype: "single",
          input: "option",
          options: [
            "",
            "Asset",
            "Bank Account",
            "Customer",
            "General Ledger",
            "Material",
            "Vendor",
          ],
        },
        { name: "Account", datatype: "single", input: "option", options: [""] },
        {
          name: "Presentation",
          datatype: "single",
          input: "option",
          options: [""],
        },
        {
          name: "TransactionType",
          datatype: "single",
          input: "option",
          options: [""],
        },
        { name: "Amount", datatype: "single", input: "input", type: "number" },
        {
          name: "Quantity",
          datatype: "single",
          input: "input",
          type: "number",
        },
        { name: "Text", datatype: "single", input: "input", type: "text" },
        {
          name: "Cost Center",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "CostCenter").listAll("Code"),
          ],
        },
        {
          name: "Location",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "Location").listAll("Code"),
          ],
        },
        {
          name: "Plant",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "Plant").listAll("Code"),
          ],
        },
        {
          name: "Revenue Center",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "RevenueCenter").listAll("Code"),
          ],
        },
        {
          name: "Profit Center",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "ProfitCenter").listAll("Code"),
          ],
        },
        {
          name: "HSN",
          datatype: "single",
          input: "option",
          options: ["", ...new Table("HSN").list],
        },
        {
          name: "Asset Construction Order",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "AssetConstructionOrder").listAll(
              "Code",
            ),
          ],
        },
        {
          name: "Maintenance Order",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "MaintenanceOrder").listAll(
              "Code",
            ),
          ],
        },
        {
          name: "Process Order",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "ProcessOrder").listAll("Code"),
          ],
        },
        {
          name: "Production Order",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "ProductionOrder").listAll(
              "Code",
            ),
          ],
        },
        {
          name: "Purchase Order",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "PurchaseOrder").listAll("Code"),
          ],
        },
        {
          name: "Sale Order",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "SaleOrder").listAll("Code"),
          ],
        },
        {
          name: "Transport Order",
          datatype: "single",
          input: "option",
          options: [
            "",
            ...new CompanyCollection(company, "TransportOrder").listAll("Code"),
          ],
        },
        {
          name: "Value Date",
          datatype: "single",
          input: "input",
          type: "date",
        },
        {
          name: "Asset Value Date",
          datatype: "single",
          input: "input",
          type: "date",
        },
      ];
      if (
        [
          "VendorInvoice",
          "CustomerInvoice",
          "VendorCreditNote",
          "CustomerCreditNote",
        ].includes(this.type)
      ) {
        schema = schema.map((item) =>
          item["name"] === "Account Type"
            ? {
                ...item,
                ["options"]: ["", "Asset", "Material", "General Ledger"],
              }
            : item,
        );
        noteditables.push(...["Debit/ Credit"]);
        if (["VendorCreditNote", "CustomerInvoice"].includes(this.type)) {
          result["Debit/ Credit"] = "Credit";
        }
      }
      if (
        ["Asset", "Bank Account", "Customer", "Material", "Vendor"].includes(
          accType,
        )
      ) {
        const collectionname = {
          Asset: "Asset",
          "Bank Account": "BankAccount",
          Customer: "Customer",
          Material: "Material",
          Vendor: "Vendor",
        };
        schema = schema.map((item) =>
          item["name"] === "Account"
            ? {
                ...item,
                ["options"]: [
                  "",
                  ...new CompanyCollection(
                    company,
                    collectionname[itemData["Account Type"]],
                  ).listAll("Code"),
                ],
              }
            : item,
        );
      } else if (accType === "General Ledger") {
        schema = schema.map((item) =>
          item["name"] === "Account"
            ? {
                ...item,
                ["options"]: [
                  "",
                  ...new CompanyCollection(
                    company,
                    "GeneralLedger",
                  ).filteredList({ "Ledger Type": "General" }, "Code"),
                  ...new CompanyCollection(
                    company,
                    "GeneralLedger",
                  ).filteredList({ "Ledger Type": "Cost Element" }, "Code"),
                ],
              }
            : item,
        );
      }
      if (!["General Ledger", "Material"].includes(accType)) {
        noteditables.push(...["Location", "Quantity", "Value Date"]);
      }
      if (!["Asset", "Material"].includes(accType)) {
        blankfields.push(...["Transaction"]);
      }
      if (!(accType === "General Ledger")) {
        noteditables.push(
          ...[
            "Cost Center",
            "Revenue Center",
            "Plant",
            "Asset Construction Order",
            "Maintenance Order",
            "Process Order",
            "Production Order",
            "Purchase Order",
            "Sale Order",
            "Transport Order",
          ],
        );
      }
      if (
        !["Customer", "Vendor", "General Ledger"].includes(accType) ||
        new CompanyCollection(company, "GeneralLedger")
          .filteredList({ "Ledger Type": "Cost Element" }, "Code")
          .includes(account)
      ) {
        noteditables.push(...["Profit Center"]);
      }
      if (!["Customer", "Vendor"].includes(accType)) {
        noteditables.push(...["Presentation"]);
        blankfields.push(...["Presentation"]);
      }
      if (accType === "Asset") {
        result["Transaction"] = "Cost";
      }
      schema = schema.map((field) =>
        noteditables.includes(field["name"])
          ? { ...field, ["noteditable"]: true }
          : field,
      );
      blankfields.map((field) => (result[field] = ""));
      required.map((field) =>
        itemData[field] === ""
          ? errors.push(`At line item ${i + 1}, ${field} necessary.`)
          : () => {},
      );
      itemData["Amount"] < 0
        ? errors.push(`At line item ${i + 1}, Amount negative.`)
        : () => {};
      return { schema: schema, output: result, errors: errors };
    };
    if (Transaction.IntraCompanyTransactions.includes(this.type)) {
      const company = data["Company Code"];
      schema = [
        {
          name: "Company Code",
          datatype: "single",
          input: "option",
          options: ["", ...new Collection("Company").listAll("Code")],
        },
      ];
      necessary.push("Company Code");
      if (this.type === "ACOSettlement" && company !== "") {
        schema.push(
          ...[
            {
              name: "Asset Construction Order",
              datatype: "single",
              input: "option",
              options: [
                "",
                ...new CompanyCollection(
                  company,
                  "AssetConstructionOrder",
                ).listAll("Code"),
              ],
            },
            {
              name: "Posting Date",
              datatype: "single",
              input: "input",
              type: "date",
            },
            {
              name: "Asset Value Date",
              datatype: "single",
              input: "input",
              type: "date",
            },
            { name: "Text", datatype: "single", input: "input", type: "text" },
          ],
        );
        necessary.push(
          ...["Asset Construction Order", "Posting Date", "Asset Value Date"],
        );
      }
      if (Transaction.AccountingTypes.includes(this.type)) {
        schema = [
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
          {
            name: "Posting Date",
            datatype: "single",
            input: "input",
            type: "date",
          },
          {
            name: "Year",
            datatype: "single",
            input: "input",
            type: "text",
            noteditable: true,
          },
          {
            name: "Document Date",
            datatype: "single",
            input: "input",
            type: "date",
          },
          {
            name: "Reference",
            datatype: "single",
            input: "input",
            type: "text",
          },
          { name: "Text", datatype: "single", input: "input", type: "text" },
          {
            name: "Balance",
            datatype: "single",
            input: "input",
            type: "number",
            noteditable: true,
          },
        ];
        if (data["Company Code"] !== "") {
          !new Company(company).IsPostingOpen(data["Posting Date"])
            ? errors.push(`Posting Period not Open.`)
            : () => {};
          if (["VendorInvoice", "VendorCreditNote"].includes(this.type)) {
            schema.push({
              name: "Vendor Info",
              datatype: "object",
              schema: [
                {
                  name: "Vendor",
                  datatype: "single",
                  input: "option",
                  options: [
                    "",
                    ...new CompanyCollection(company, "Vendor").listAll("Code"),
                  ],
                },
                {
                  name: "Presentation",
                  datatype: "single",
                  input: "option",
                  options: [
                    "",
                    ...new CompanyCollection(
                      company,
                      "GeneralLedger",
                    ).filteredList({ "Ledger Type": "Vendor" }, "Code"),
                  ],
                },
                {
                  name: "Amount",
                  datatype: "single",
                  input: "input",
                  type: "number",
                },
              ],
            });

            necessary = ["Vendor", "Presentation", "Amount"];
            necessary.map((field) =>
              data["Vendor Info"][field] === ""
                ? errors.push(`Vendor ${field} necessary`)
                : () => {},
            );
          }
          if (["CustomerInvoice", "CustomerCreditNote"].includes(this.type)) {
            schema.push({
              name: "Customer Info",
              datatype: "object",
              schema: [
                {
                  name: "Customer",
                  datatype: "single",
                  input: "option",
                  options: [
                    "",
                    ...new CompanyCollection(company, "Customer").listAll(
                      "Code",
                    ),
                  ],
                },
                {
                  name: "Presentation",
                  datatype: "single",
                  input: "option",
                  options: [
                    "",
                    ...new CompanyCollection(
                      company,
                      "GeneralLedger",
                    ).filteredList({ "Ledger Type": "Customer" }, "Code"),
                  ],
                },
                {
                  name: "Amount",
                  datatype: "single",
                  input: "input",
                  type: "number",
                },
              ],
            });
            necessary = ["Customer", "Presentation", "Amount"];
            necessary.map((field) =>
              data["Customer Info"][field] === ""
                ? errors.push(`Cusomer Info ${field} necessary`)
                : () => {},
            );
          }
          schema.push({
            name: "Line Items",
            datatype: "collection",
            schema: data["Line Items"].map(
              (item, i) => lineItemProcess(data, item, i).schema,
            ),
          });
        }
        if (company !== "" && data["Posting Date"] !== "") {
          result["Year"] = new Company(company).PostingYear(
            data["Posting Date"],
          );
        }
        result["Balance"] =
          SumFieldIfs(
            result["Line Items"],
            "Amount",
            ["Debit/ Credit"],
            ["Debit"],
          ) -
          SumFieldIfs(
            result["Line Items"],
            "Amount",
            ["Debit/ Credit"],
            ["Credit"],
          );
        result["Line Items"] = result["Line Items"].map(
          (item, i) => lineItemProcess(data, item, i).output,
        );
        necessary = ["Company Code", "Posting Date", "Document Date"];
        necessary.map((field) =>
          data[field] === "" ? errors.push(`${field} necessary`) : () => {},
        );
        data["Balance"] !== 0 ? errors.push(`Balance not zero`) : () => {};
        data["Line Items"].map((item, i) =>
          errors.push(...lineItemProcess(data, item, i).errors),
        );
        navigation = [
          {
            name: "POST",
            type: "action",
            onClick: () =>
              alert(
                new AccountingDocument(
                  data["Company Code"],
                  data["Year"],
                ).postDocument(data),
              ),
          },
        ];
      }
      if (Transaction.MaterialTransactions.includes(this.type)) {
        schema.push(
          ...[
            {
              name: "Value Date",
              datatype: "single",
              input: "input",
              type: "date",
            },
            {
              name: "Plant/ Location",
              datatype: "single",
              input: "option",
              options: [""],
            },
          ],
        );
      }
      necessary.map((field) =>
        data[field] === "" ? errors.push(`${field} necessary`) : () => {},
      );
    }

    return {
      schema: schema,
      output: result,
      errors: errors,
      navigation: navigation,
    };
  }
  generateAccountingEntry(data, docNo) {
    let result = { ...data };
    const company = new Company(result["Company Code"]);
    result["Year"] = company.PostingYear(data["Posting Date"]);
    result["Document Number"] = docNo;
    return result;
  }
  postAccountingEntries(company, year, listofdata) {
    const oldData = Transaction.Accountingdocuments;
    const documentnumberstart = Transaction.NewAccountingDocNo(company, year);
    const newEntries = listofdata.map((data, i) =>
      this.generateAccountingEntry(data, documentnumberstart + i),
    );
    const newData = [...oldData, ...newEntries];
    saveData(newData, "accountingdocuments");
    return "Success!";
  }
  static Accountingdocuments = loadData("accountingdocuments");
  static Accountingdoc(company, year, documentno) {
    const database = this.Accountingdocuments;
    const document = database.find(
      (item) =>
        item["Company Code"] === company &&
        item["Year"] === Number(year) &&
        item["Document Number"] === Number(documentno),
    );
    const result = document !== undefined;
    return { document: document, result: result };
  }
  static NewAccountingDocNo(company, year) {
    let start = 0;
    do {
      start++;
    } while (this.Accountingdoc(company, year, start).result);
    return start;
  }
  static AccountingTypes = [
    "CustomerInvoice",
    "CustomerCreditNote",
    "GeneralAccounting",
    "VendorInvoice",
    "VendorCreditNote",
  ];
  static MaterialTransactions = [
    "MaterialReceipt",
    "MaterialIssue",
    "MaterialAcceptance",
    "MaterialScrap",
    "MaterialLossInTransit",
    "MaterialReturn",
  ];
  static AssetTransactions = [
    "ACOSettlement",
    "AssetScrap",
    "AssetDisposal",
    "Depreciation",
    "AssetRevaluation",
  ];
  static IntraCompanyTransactions = [
    ...this.MaterialTransactions,
    ...this.AssetTransactions,
    "CustomerInvoice",
    "CustomerCreditNote",
    "CustomerClearing",
    "CustomerPayment",
    "Depreciation",
    "GeneralAccounting",
    "Salary",
    "VendorInvoice",
    "VendorCreditNote",
    "VendorClearing",
    "VendorPayment",
  ];
  static titles = {
    ACOSettlement: "ACO Settlement",
    AssetRevaluation: "Asset Revaluation",
    Depreciation: "Depreciation",
    AssetScrap: "Asset Scrap",
    AssetDisposal: "Asset Disposal",
    CustomerClearing: "Customer Clearing",
    CustomerCreditNote: "Customer Credit Note",
    CustomerInvoice: "Customer Invoice",
    CustomerPayment: "Customer Payment",
    GeneralAccounting: "General Accounting",
    MaterialAcceptance: "Material Acceptance",
    MaterialIssue: "Material Issue",
    MaterialLossInTransit: "Material Loss in Transit",
    MaterialReceipt: "Material Receipt",
    MaterialReturn: "Material Return",
    MaterialScrap: "Material Scrap",
    Salary: "Salary",
    VendorClearing: "Vendor Clearing",
    VendorCreditNote: "Vendor Credit Note",
    VendorInvoice: "Vendor Invoice",
    VendorPayment: "Vendor Payment",
  };
}

class CollectionQuery {
  constructor(collection, method) {
    this.collection = collection;
    this.method = method;
    this.title = this.collection;
    this.mandatory = new Collection(this.collection).identifiers;
    this.createRequirements =
      CollectionQuery.createRequirements[this.collection];
    this.defaults = CollectionQuery.defaults[this.collection];
  }
  interface(data) {
    let schema = [];
    switch (this.collection) {
      case "Asset":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "AssetGroup":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "AssetConstructionOrder":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "Attendance":
        schema = [
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
          {
            name: "Employee",
            datatype: "single",
            input: "option",
            options: [
              "",
              ...new CompanyCollection(
                data["Company Code"],
                "Employee",
              ).listAll("Code"),
            ],
          },
          {
            name: "Year",
            datatype: "single",
            input: "input",
            type: "text",
            maxLength: 4,
          },
          {
            name: "Month",
            datatype: "single",
            input: "input",
            type: "text",
            maxLength: 2,
          },
        ];
        break;
      case "BankAccount":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "ChartOfAccounts":
        schema = [
          {
            name: "Code",
            datatype: "single",
            input: "input",
            type: "text",
            maxLength: 4,
          },
        ];
        break;
      case "Company":
        schema = [
          {
            name: "Code",
            datatype: "single",
            input: "input",
            type: "text",
            maxLength: 4,
          },
        ];
        break;
      case "CostCenter":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "Customer":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "Customisation":
        schema = [
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "Employee":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "ExchangeRate":
        schema = [
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
          {
            name: "Currency",
            datatype: "single",
            input: "option",
            options: ["", ...new Table("Currencies").list],
          },
        ];
        break;
      case "FinancialStatement":
        schema = [
          {
            name: "Code",
            datatype: "single",
            input: "input",
            type: "text",
            maxLength: 4,
          },
        ];
        break;
      case "GeneralLedger":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "GroupChartOfAccounts":
        schema = [
          {
            name: "Code",
            datatype: "single",
            input: "input",
            type: "text",
            maxLength: 6,
          },
        ];
        break;
      case "GroupGeneralLedger":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Chart of Accounts",
            datatype: "single",
            input: "option",
            options: [
              "",
              ...new Collection("GroupChartOfAccounts").listAll("Code"),
            ],
          },
        ];
        break;
      case "Holidays":
        schema = [
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
          {
            name: "Year",
            datatype: "single",
            input: "input",
            type: "text",
            maxLength: 4,
          },
        ];
        break;
      case "IncomeTaxCode":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
        ];
        break;
      case "Location":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "MaintenanceOrder":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "Material":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "MaterialGroup":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "PaymentTerms":
        schema = [
          {
            name: "Code",
            datatype: "single",
            input: "input",
            type: "text",
            maxLength: 4,
          },
        ];
        break;
      case "Plant":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "ProcessOrder":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "ProductionOrder":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "ProfitCenter":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "PurchaseOrder":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "RevenueCenter":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "SaleOrder":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "Service":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "ServiceGroup":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "TimeControl":
        schema = [
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "TransportOrder":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
      case "Vendor":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
        ];
        break;
    }
    if (this.method == "Create") {
      schema = schema.filter((field) =>
        this.createRequirements.includes(field["name"]),
      );
    }
    const missing = [];
    const errors = [];
    let fields = [];
    if (this.method !== "Create") {
      fields = ListItems(schema, "name");
      const query = {};
      fields.map((field) => (query[field] = data[field]));
      if (!new Collection(this.collection).exists(query)) {
        errors.push(
          `Record of ${this.collection} with ${JSON.stringify(
            query,
          )} does not exist.`,
        );
      }
    } else if (this.method === "Create") {
      fields = this.createRequirements;
      if (["Holidays", "Attendance"].includes(this.collection)) {
        const query = {};
        fields.map((field) => (query[field] = data[field]));
        if (new Collection(this.collection).exists(query)) {
          errors.push(
            `Record of ${this.collection} with ${JSON.stringify(
              query,
            )} already exists.`,
          );
        }
      }
    }
    fields.map((field) => (data[field] == "" ? missing.push(field) : () => {}));
    fields.includes("Employee") &&
    new Collection("Employee").exists({
      "Company Code": data["Company Code"],
      Code: data["Employee"],
    }) == false
      ? errors.push(
          `Employee with Code ${data["Employee"]} does not exist in Company ${data["Company Code"]}.`,
        )
      : () => {};
    missing.length > 0
      ? errors.push(`${missing.join(", ")} required.`)
      : () => {};
    let result = { ...data };
    let navigation = [
      {
        name: "Back",
        type: "navigate",
        url: "/control",
        state: {},
        refresh: true,
      },
      {
        name: this.method,
        type: "navigate",
        url: "/interface",
        state: {
          type: "Collection",
          collection: this.collection,
          method: this.method,
          data: data,
        },
        refresh: true,
      },
    ];

    return {
      schema: schema,
      output: result,
      navigation: navigation,
      errors: errors,
    };
  }
  checkAvailability(data) {
    const availability = new Collection(this.collection).exists(data);
    return availability;
  }
  static createRequirements = {
    Asset: ["Company Code"],
    AssetGroup: ["Company Code"],
    AssetConstructionOrder: ["Company Code"],
    Attendance: ["Company Code", "Year", "Month", "Employee"],
    BankAccount: ["Company Code"],
    ChartOfAccounts: [],
    Company: [],
    CostCenter: ["Company Code"],
    Customer: ["Company Code"],
    Customisation: ["Company Code"],
    Employee: ["Company Code"],
    ExchangeRate: ["Company Code", "Currency"],
    FinancialStatement: [],
    GeneralLedger: ["Company Code"],
    GroupChartOfAccounts: [],
    GroupGeneralLedger: ["Chart of Accounts"],
    Holidays: ["Company Code", "Year"],
    IncomeTaxCode: [],
    Location: ["Company Code"],
    MaintenanceOrder: ["Company Code"],
    Material: ["Company Code"],
    MaterialGroup: ["Company Code"],
    PaymentTerms: [],
    Plant: ["Company Code"],
    ProcessOrder: ["Company Code"],
    ProductionOrder: ["Company Code"],
    ProfitCenter: ["Company Code"],
    PurchaseOrder: ["Company Code"],
    RevenueCenter: ["Company Code"],
    SaleOrder: ["Company Code"],
    Service: ["Company Code"],
    ServiceGroup: ["Company Code"],
    TimeControl: ["Company Code"],
    TransportOrder: ["Company Code"],
    Vendor: ["Company Code"],
  };
  static defaults = {
    Asset: { Code: "", "Company Code": "" },
    AssetGroup: { Code: "", "Company Code": "" },
    AssetConstructionOrder: { Code: "", "Company Code": "" },
    Attendance: { "Company Code": "", Year: "", Month: "", Employee: "" },
    BankAccount: { Code: "", "Company Code": "" },
    ChartOfAccounts: { Code: "" },
    Company: { Code: "" },
    CostCenter: { Code: "", "Company Code": "" },
    Customer: { Code: "", "Company Code": "" },
    Customisation: { "Company Code": "" },
    Employee: { Code: "", "Company Code": "" },
    FinancialStatement: { Code: "" },
    GeneralLedger: { Code: "", "Company Code": "" },
    GroupChartOfAccounts: { Code: "" },
    GroupGeneralLedger: { Code: "", "Chart of Accounts": "" },
    Holidays: { "Company Code": "", Year: "" },
    IncomeTaxCode: { Code: "" },
    Location: { Code: "", "Company Code": "" },
    MaintenanceOrder: { Code: "", "Company Code": "" },
    Material: { Code: "", "Company Code": "" },
    MaterialGroup: { Code: "", "Company Code": "" },
    PaymentTerms: { Code: "" },
    Plant: { "Company Code": "", Code: "" },
    ProcessOrder: { Code: "", "Company Code": "" },
    ProductionOrder: { Code: "", "Company Code": "" },
    ProfitCenter: { Code: "", "Company Code": "" },
    PurchaseOrder: { Code: "", "Company Code": "" },
    RevenueCenter: { Code: "", "Company Code": "" },
    SaleOrder: { Code: "", "Company Code": "" },
    Service: { Code: "", "Company Code": "" },
    ServiceGroup: { Code: "", "Company Code": "" },
    TimeControl: { "Company Code": "" },
    TransportOrder: { Code: "", "Company Code": "" },
    Vendor: { Code: "", "Company Code": "" },
  };
}

class CompanyCollection extends Collection {
  constructor(company, name, method = "Display") {
    super(name, method);
    this.company = company;
  }
  load() {
    const data = super.load();
    const filtered = singleFilter(data, "Company Code", this.company);
    return filtered;
  }
  listAll(key) {
    const data = super.listAll(key);
    return data;
  }
  exists(data) {
    const result = super.exists({ ...data, ["Company Code"]: this.company });
    return result;
  }
  getData(data) {
    const result = super.getData({ ...data, ["Company Code"]: this.company });
    return result;
  }
}

class AccountingDocument {
  constructor(company, year) {
    this.company = company;
    this.year = year;
  }
  load() {
    const data = AccountingDocument.database;
    const result = data.filter(
      (item) =>
        item["Company Code"] === this.company && item["Year"] === this.year,
    );
    return result;
  }
  getDocument(docNo) {
    const data = this.load();
    const document = data.find((item) => item["Document Number"] === docNo);
    const result = document !== undefined;
    return { result: result, document: document };
  }
  newDocumentNumber() {
    let start = 0;
    do {
      start++;
    } while (this.getDocument(start).result);
    return start;
  }
  postDocument(data) {
    let result = { ...data };
    result["Document Number"] = this.newDocumentNumber();
    const updatedDB = [...AccountingDocument.database, result];
    const status = AccountingDocument.updatedatabase(updatedDB);
    if (status) {
      return `Success, Document ${result["Document Number"]} created!`;
    } else {
      return `Could not process the request`;
    }
  }
  tabular() {
    const data = this.load();
    const list = [];
    data.forEach((item) => {
      const fields = Object.keys(item).filter(
        (field) => field !== "Line Items",
      );
      const datapack = {};
      fields.map((field) => (datapack[field] = item[field]));
      item["Line Items"].map((line) => list.push({ ...datapack, ...line }));
    });
    return list;
  }
  lineItemProcess(data) {
    let result = { ...data };
    const accType = data["Account Type"];
    if (accType === "Asset") {
      const asset = new Asset(data["Account"], this.company);
      result["Account Description"] = asset.data["Description"];
      result["General Ledger"] =
        asset.assetgroup.data["General Ledger  - Asset"];
      result["General Ledger Description"] = asset.assetgroup.GLData(
        "General Ledger - Asset",
      ).data["Description"];
      result["Profit Center"] = asset.orgassignment(
        data["Asset Value Date"],
      ).assignment.profitcenter.code;
    }
  }
  static collectionname = "accountingdocuments";
  static database = loadData(this.collectionname);
  static updatedatabase(data) {
    saveData(data, this.collectionname);
    return true;
  }
}

class MaterialDocument {
  constructor(company, year) {
    this.company = company;
    this.year = year;
  }
  static collectionname = "materialdocuments";
  static database = loadData(this.collectionname);
  static updatedatabase(data) {
    saveData(data, this.collectionname);
    return true;
  }
}

class CostDocument {
  constructor(company, year) {
    this.company = company;
    this.year = year;
  }
  static collectionname = "costdocuments";
  static database = loadData(this.collectionname);
  static updatedatabase(data) {
    saveData(data, this.collectionname);
    return true;
  }
}

class AssetGroup extends CompanyCollection {
  constructor(code, company, name = "AssetGroup") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
  }
  GLData(type) {
    const GL = new GeneralLedger(this.data[type], this.company);
    return GL;
  }
}

class Asset extends CompanyCollection {
  constructor(code, company, name = "Asset") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
    this.assetgroup = new AssetGroup(this.data["Asset Group"], this.company);
  }
  orgassignment(date) {
    const assignments = this.data["Organisational Assignment"];
    const result = assignments.find((item) =>
      valueInRange(new Date(date), [
        new Date(item["From"]),
        new Date(item["To"]),
      ]),
    );
    if (result) {
      const type = result["Assignment Type"];
      let assignment = {};
      switch (type) {
        case "CostCenter":
          assignment = new CostCenter(result["Assignment"], this.company);
          break;
        case "Location":
          assignment = new Location(result["Assignment"], this.company);
          break;
        case "Plant":
          assignment = new Plant(result["Assignment"], this.company);
          break;
        case "RevenueCenter":
          assignment = new RevenueCenter(result["Assignment"], this.company);
          break;
      }
      return { result: true, type: type, assignment: assignment };
    } else {
      return { result: false };
    }
  }
  depreciationUpTo(date) {
    if (
      this.data["Date of Capitalisation"] <= date &&
      this.assetgroup.data["Depreciable"] === "Yes"
    ) {
      if (this.data["Depreciation Method"] === "Straight Line") {
      } else if (this.data["Depreciation Method"] === "Reducing Balance") {
        return "Reducing Balance";
      }
    } else {
      return 0;
    }
  }
  SLMDepreciation(date, Opening) {
    const year = new Company(this.company).PostingYear(date);
    const costdata = new AccountingDocument(this.company, year)
      .tabular()
      .filter(
        (item) =>
          item["Account"] === this.code &&
          item["Transaction"] === "Cost" &&
          new Date(item["Asset Value Date"]) <= new Date(date),
      );
    const cost =
      SumFieldIfs(costdata, "Amount", ["Debit/ Credit"], ["Debit"]) -
      SumFieldIfs(costdata, "Amount", ["Debit/ Credit"], ["Credit"]);
    const sv = this.data["Salvage Value"];
    return sv;
  }
  RBDepreciationUpto(date) {}
}

class AssetConstructionOrder extends CompanyCollection {
  constructor(code, company, name = "AssetConstructionOrder") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
  }
  accumulatedCost(date) {
    const year = new Company(this.company).PostingYear(date);
    const data = new AccountingDocument(this.company, year).load();
    const result = data.filter(
      (item) =>
        item["Asset Construction Order"] === this.code &&
        item["Posting Date"] <= date,
    );
    const cost =
      SumFieldIfs(result, "Amount", ["Debit/ Credit"], ["Debit"]) -
      SumFieldIfs(result, "Amount", ["Debit/ Credit"], ["Credit"]);
    return { data: result, cost: cost };
  }
  settlement(date) {
    const ratio = this.data["Settlement Ratio"];
    const cost = this.accumulatedCost(date).cost;
    const list = [];
    ratio.map((item) =>
      list.push({
        Asset: item["Asset"],
        Percentage: item["Percentage"],
        Amount: (cost * item["Percentage"]) / 100,
      }),
    );
    return list;
  }
}

class BankAccount extends CompanyCollection {
  constructor(code, company, name = "BankAccount") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
  }
}

class Company extends Collection {
  constructor(Code, name = "Company") {
    super(name);
    this.code = Code;
    this.data = super.getData({ Code: this.code });
    this.BusinessPlaces = ListItems(this.data["Places of Business"], "Place");
  }
  yearData(year) {
    const beginMonth = this.data["Financial Year Beginning"];
    const yearBeginning = KB.YearStart(year, beginMonth);
    const yearEnd = KB.YearEnd(year, beginMonth);
    return { begin: yearBeginning, end: yearEnd };
  }
  collection(collectionname) {
    const data = new Collection(collectionname).filtered({
      "Company Code": this.code,
    });
    return data;
  }
  listCollection(collectionname, key) {
    const data = this.collection(collectionname);
    return ListItems(data, key);
  }
  filteredCollection(collectionname, data) {
    const collection = this.collection(collectionname);
    const fields = Object.keys(data);
    let filtered = collection;
    for (let i = 0; i < fields.length; i++) {
      filtered = singleFilter(filtered, fields[i], data[fields[i]]);
    }
    return filtered;
  }
  filteredList(collectionname, data, key) {
    const filtered = this.filteredCollection(collectionname, data);
    return ListItems(filtered, key);
  }
  AccountSettings() {
    return new Collection("FinancialAccountsSettings").getData({
      "Company Code": this.code,
    });
  }
  CollectionRange(collection) {
    const settings = this.AccountSettings();
    const range = settings["Code Range"].filter(
      (item) => item["Collection"] === collection,
    )[0];
    const result = [range["From"], range["To"]];
    return result;
  }
  TimeControl() {
    const data = new Collection("TimeControl").getData({
      "Company Code": this.code,
    });
    const timeControlData = data["Open Periods"];
    return timeControlData;
  }
  IsPostingOpen(date) {
    let result = false;
    this.TimeControl().map((time) =>
      new Date(date) <= new Date(time["To"]) &&
      new Date(date) >= new Date(time["From"])
        ? (result = true)
        : () => {},
    );
    return result;
  }
  PostingYear(PostingDate) {
    const pdate = new Date(PostingDate);
    const reference = `${pdate.getFullYear()}-${
      this.data["Financial Year Beginning"]
    }-01`;
    const result =
      new Date(reference) > pdate
        ? pdate.getFullYear() - 1
        : pdate.getFullYear();
    return result;
  }
  static timeMaintained = "timecontrol" in localStorage;
  static timeControls = JSON.parse(localStorage.getItem("timecontrol"));
  static isPostingDateOpen(date) {
    const firstPeriod = [
      this.timeControls["First"]["From"],
      this.timeControls["First"]["To"],
    ];
    const secondPeriod = [
      this.timeControls["Second"]["From"],
      this.timeControls["Second"]["To"],
    ];
    const result =
      valueInRange(new Date(date), [
        new Date(firstPeriod[0]),
        new Date(firstPeriod[1]),
      ]) ||
      valueInRange(new Date(date), [
        new Date(secondPeriod[0]),
        new Date(secondPeriod[1]),
      ]);
    return result;
  }
  static setTimeControl(periods) {
    localStorage.setItem("timecontrol", JSON.stringify(periods));
  }
  static removeTimeControl() {
    localStorage.removeItem("timecontrol");
  }
  static data = new Collection("Company").load();
  static listAll = ListItems(this.data, "Code");
}

class ChartOfAccounts {
  constructor(code) {
    this.code = code;
    this.data = ChartOfAccounts.allData.find(
      (item) => item["Code"] == this.code,
    );
  }
  range(group) {
    const data = this.data["General Ledger Numbering"];
    const filtered = data.find((item) => item["Group"] == group);
    const result = [filtered["From"], filtered["To"]];
    return result;
  }
  static company = new Collection("ChartOfAccounts").load();
  static group = new Collection("GroupChartOfAccounts").load();
  static allData = [...this.company, ...this.group];
  static listCompanyCoA = ListItems(this.company, "Code");
  static listGroupCoA = ListItems(this.group, "Code");
  static listAllCoA = [...this.listCompanyCoA, ...this.listGroupCoA];
  static type(CoA) {
    if (this.listCompanyCoA.includes(CoA)) {
      return "Company";
    } else if (this.listGroupCoA.includes(CoA)) {
      return "Group";
    } else {
      return "NA";
    }
  }
}

class CostCenter extends CompanyCollection {
  constructor(code, company, name = "CostCenter") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
    this.profitcenter = new ProfitCenter(
      this.data["Profit Center"],
      this.company,
    );
  }
}

class Employee extends CompanyCollection {
  constructor(code, company, name = "Employee") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
  }
  wage(date) {
    const vwages = this.data["Variable Wages"].filter((item) =>
      valueInRange(new Date(date), [
        new Date(item["From"]),
        new Date(item["To"]),
      ]),
    );
    const fwages = this.data["Fixed Wages"].filter((item) =>
      valueInRange(new Date(date), [
        new Date(monthStructure(item["From Year"], item["From Month"]).start),
        new Date(monthStructure(item["To Year"], item["To Month"]).end),
      ]),
    );
    const owages = this.data["One Time Wages"].filter(
      (item) => item["Date"] === date,
    );
    return owages;
  }
}

class GeneralLedger extends CompanyCollection {
  constructor(code, company, name = "GeneralLedger") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
  }
}

class Location extends CompanyCollection {
  constructor(code, company, name = "Location") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
    this.profitcenter = new ProfitCenter(
      this.data["Profit Center"],
      this.company,
    );
  }
}

class Plant extends CompanyCollection {
  constructor(code, company, name = "Plant") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
    this.profitcenter = new ProfitCenter(
      this.data["Profit Center"],
      this.company,
    );
  }
}

class ProfitCenter extends CompanyCollection {
  constructor(code, company, name = "ProfitCenter") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
  }
}

class RevenueCenter extends CompanyCollection {
  constructor(code, company, name = "RevenueCenter") {
    super(company, name);
    this.code = code;
    this.data = super.getData({ Code: this.code });
    this.profitcenter = new ProfitCenter(
      this.data["Profit Center"],
      this.company,
    );
  }
}

class Table {
  constructor(name, method = "Display") {
    this.name = name;
    this.title = Table.title[this.name];
    this.method = method;
    this.key = Table.keys[this.name];
    this.data =
      this.name in localStorage
        ? JSON.parse(localStorage.getItem(this.name))
        : Table.defaults[this.name];
    this.list = ListItems(this.data, this.key);
    this.defaults =
      this.method == "Create" ? Table.defaults[this.name] : this.data;
    this.mandatory = Table.mandatory[this.name];
  }
  errors(data) {
    const list = [];
    data.map((item, i) =>
      this.mandatory.map((field) =>
        item[field] == ""
          ? list.push(`Item ${i + 1} requires ${field}`)
          : () => {},
      ),
    );
    data.map((item) =>
      Count(item[this.key], ListItems(data, this.key)) > 1
        ? list.push(
            `${this.key} ${item[this.key]} exists ${Count(
              item[this.key],
              ListItems(data, this.key),
            )} times.`,
          )
        : () => {},
    );
    const uniquelist = [...new Set(list)];
    return uniquelist;
  }
  process(data) {
    return data;
  }
  navigation(data) {
    const navigation = [
      { name: "Back", type: "navigate", url: "/control", state: {} },
    ];
    if (this.method != "Update") {
      navigation.push({
        name: "CSV",
        type: "action",
        onClick: () => Operations.downloadCSV(data, this.name),
      });
      navigation.push({
        name: "Update",
        type: "navigate",
        url: "/interface",
        state: { type: "Table", method: "Update", table: this.name },
      });
    }
    this.method == "Update"
      ? navigation.push({
          name: "Update",
          type: "action",
          onClick: () => alert(this.save(data)),
        })
      : () => {};
    return navigation;
  }
  save(data) {
    localStorage.setItem(this.name, JSON.stringify(data));
    return "Success";
  }
  schema(data) {
    let schema = [];
    switch (this.name) {
      case "Currencies":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Description",
            datatype: "single",
            input: "input",
            type: "text",
          },
        ];
        break;
      case "HSN":
        schema = [
          { name: "Code", datatype: "single", input: "input", type: "text" },
          {
            name: "Type",
            datatype: "single",
            input: "option",
            options: ["", "Goods", "Services"],
          },
          {
            name: "Description",
            datatype: "single",
            input: "input",
            type: "text",
          },
        ];
        break;
      case "Segments":
        schema = [
          {
            name: "Segment",
            datatype: "single",
            input: "input",
            type: "text",
            maxLength: 6,
          },
          {
            name: "Description",
            datatype: "single",
            input: "input",
            type: "text",
          },
        ];
        break;
      case "Units":
        schema = [
          { name: "Symbol", datatype: "single", input: "input", type: "text" },
          { name: "Name", datatype: "single", input: "input", type: "text" },
          {
            name: "Quantity",
            datatype: "single",
            input: "input",
            type: "text",
          },
          {
            name: "Description",
            datatype: "single",
            input: "input",
            type: "text",
          },
        ];
        break;
      case "WageTypes":
        schema = [
          {
            name: "Wage Type",
            datatype: "single",
            input: "input",
            type: "text",
            maxLength: 6,
          },
          {
            name: "Description",
            datatype: "single",
            input: "input",
            type: "text",
          },
          {
            name: "Type",
            datatype: "single",
            input: "option",
            options: ["", "Earning", "Deduction"],
          },
          {
            name: "Nature",
            datatype: "single",
            input: "option",
            options: ["", "One Time", "Fixed", "Variable"],
          },
        ];
    }
    return schema;
  }
  static defaults = {
    Currencies: [{ Code: "", Description: "" }],
    HSN: [{ Code: "", Type: "", Description: "" }],
    Units: [{ Symbol: "", Name: "", Quantity: "", Description: "" }],
    Segments: [{ Segment: "", Description: "" }],
    WageTypes: [{ "Wage Type": "", Description: "", Type: "", Nature: "" }],
  };
  static keys = {
    Currencies: "Code",
    HSN: "Code",
    Segments: "Segment",
    Units: "Symbol",
    WageTypes: "Wage Type",
  };
  static mandatory = {
    Currencies: ["Code"],
    HSN: ["Code", "Type"],
    Segments: ["Segment"],
    Units: ["Symbol", "Name", "Quantity"],
    WageTypes: ["Wage Type", "Type", "Nature"],
  };
  static title = {
    Currencies: "Currencies",
    HSN: "HSN",
    Segments: "Segments",
    Units: "Units",
    WageTypes: "Wage Types",
  };
}

class ReportQuery {
  constructor(report) {
    this.report = report;
  }
  defaults(data) {
    let defaults = {};
    switch (this.report) {
      case "AccountingDocument":
        defaults = { "Company Code": "", Year: "", "Document Number": "" };
        break;
    }
    if (
      [
        "AssetRegister",
        "MaterialRegister",
        "EmployeeRegister",
        "VendorRegister",
        "CustomerRegister",
      ].includes(this.report)
    ) {
      defaults["Company Code"] = "";
    }
    return defaults;
  }
  interface(data) {
    let schema = [];
    let result = { ...data };
    let navigation = [
      { name: "Back", type: "navigate", url: "/reports", state: {} },
      {
        name: "Get",
        type: "navigate",
        url: "/interface",
        state: { type: "Report", report: this.report, data: result },
      },
    ];
    let errors = [];

    switch (this.report) {
      case "AccountingDocument":
        schema = [
          {
            name: "Company Code",
            datatype: "single",
            input: "option",
            options: ["", ...new Collection("Company").listAll("Code")],
          },
          { name: "Year", datatype: "single", input: "input", type: "text" },
          {
            name: "Document Number",
            datatype: "single",
            input: "input",
            type: "number",
          },
        ];
        !Transaction.Accountingdoc(
          data["Company Code"],
          data["Year"],
          data["Document Number"],
        ).result
          ? errors.push(`Document does not exist!`)
          : () => {};
        break;
    }
    if (
      [
        "AssetRegister",
        "MaterialRegister",
        "EmployeeRegister",
        "VendorRegister",
        "CustomerRegister",
      ].includes(this.report)
    ) {
      schema = [
        {
          name: "Company Code",
          datatype: "single",
          input: "option",
          options: ["", ...new Collection("Company").listAll("Code")],
        },
      ];
      if (data["Company Code"] === "") {
        errors.push(`Company Code necessary.`);
      }
    }
    return {
      schema: schema,
      output: result,
      errors: errors,
      navigation: navigation,
    };
  }
}

class KB {
  constructor() {}
  static States = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bengal",
    "Bihar",
    "Chattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu & Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telengana",
    "Tripura",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
  ];
  static UTs = [
    "Andaman Nicobar",
    "Chandigarh",
    "Dadra Nagar Haveli and Daman Diu",
    "Lakshadweep",
    "Ladakh",
  ];
  static Currency = [
    { Name: "US Dollar", Code: "USD" },
    { Name: "Euro", Code: "EUR" },
    { Name: "Canadian Dollar", Code: "CAD" },
    { Name: "Yuan", Code: "CNY" },
    { Name: "Indian Rupee", Code: "INR" },
    { Name: "Pound Sterling", Code: "GBP" },
    { Name: "Yen", Code: "JPY" },
    { Name: "Swiss Franc", Code: "CHF" },
    { Name: "Australian Dollar", Code: "AUD" },
    { Name: "Qatari Rial", Code: "QAR" },
  ];
  static AccountTypes = [
    "Asset",
    "Asset Group",
    "Asset Development",
    "Bank Account",
    "Cost Center",
    "Cost Object",
    "Customer",
    "Employee",
    "Location",
    "Material",
    "Organisational Unit",
    "Profit Center",
    "Purchase Order",
    "Sale Order",
    "Service",
    "Vendor",
  ];
  static PostingAccounts = [
    "Asset",
    "Asset Development",
    "Bank Account",
    "Customer",
    "General Ledger",
    "Material",
    "Service",
    "Vendor",
  ];
  static GeneralLedgerGroups = [
    "Asset",
    "Liability",
    "Equity",
    "Income",
    "Expense",
  ];
  static LedgerTypes = [
    "Asset",
    "Bank Account",
    "Cost Element",
    "Customer",
    "General",
    "Depreciation",
    "Material",
    "Vendor",
  ];
  static Numbering = [
    "Asset",
    "AssetConstructionOrder",
    "BankAccount",
    "CostCenter",
    "Customer",
    "Employee",
    "Location",
    "MaintenanceOrder",
    "Material",
    "Plant",
    "ProcessOrder",
    "ProductionOrder",
    "ProfitCenter",
    "PurchaseOrder",
    "RevenueCenter",
    "SaleOrder",
    "Service",
    "TransportOrder",
    "Vendor",
  ];
  static YearStart(year, firstMonth) {
    const result = `${year}-${firstMonth}-01`;
    return result;
  }
  static YearEnd(year, firstMonth) {
    const yearStart = new Date(this.YearStart(year, firstMonth));
    const yearEnd = new Date(
      yearStart.getFullYear() + 1,
      yearStart.getMonth(),
      0,
    );
    const result = `${yearEnd.getFullYear()}-${(yearEnd.getMonth() + 1)
      .toString()
      .padStart(2, 0)}-${yearEnd.getDate()}`;
    return result;
  }
}
const MultipleInput = ({ field, output, setdata }) => {
  const valueChange = (req, i, e) => {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: {
        ...prevdata[field["name"]],
        [req]: prevdata[field["name"]][req].map((item, index) =>
          i == index ? value : item,
        ),
      },
    }));
  };

  const removeItem = (req, i) => {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: {
        ...prevdata[field["name"]],
        [req]: prevdata[field["name"]][req].filter((item, index) => i != index),
      },
    }));
  };

  const addValue = (req) => {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: {
        ...prevdata[field["name"]],
        [req]: [...prevdata[field["name"]][req], ""],
      },
    }));
  };

  const addRange = (req) => {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: {
        ...prevdata[field["name"]],
        [req]: [...prevdata[field["name"]][req], { from: "", to: "" }],
      },
    }));
  };

  const rangeChange = (req, i, subfield, e) => {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: {
        ...prevdata[field["name"]],
        [req]: prevdata[field["name"]][req].map((item, index) =>
          i == index ? { ...item, [subfield]: value } : item,
        ),
      },
    }));
  };

  return (
    <div className="displayField">
      <label>{field["name"]}</label>
      {field["req"].map((req) => (
        <div className="displayObject">
          <div className="displayRow">
            <label>{req}</label>
          </div>
          {(req == "values" || req == "exclValues") && (
            <div className="displayList">
              <button onClick={() => addValue(req)}>+</button>
              {output[field["name"]][req].map((item, i) => (
                <div>
                  {field["noteditable"] && <p>{item}</p>}
                  {field["input"] == "input" && !field["noteditable"] && (
                    <div>
                      <input
                        type={field["type"]}
                        maxLength={field["maxLength"]}
                        placeholder={field["placeholder"]}
                        onChange={(e) => valueChange(req, i, e)}
                        value={item}
                      />
                      <button onClick={() => removeItem(req, i)}>-</button>
                    </div>
                  )}
                  {field["input"] == "option" && !field["noteditable"] && (
                    <div>
                      <select onChange={(e) => valueChange(i, e)} value={item}>
                        {field["options"].map((option) => (
                          <option value={option}>{option}</option>
                        ))}
                      </select>
                      <button onClick={() => removeItem(req, i)}>-</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {(req == "ranges" || req == "exclRanges") && (
            <div className="displayList">
              <button onClick={() => addRange(req)}>+</button>
              {output[field["name"]][req].map((item, i) => (
                <div>
                  {field["noteditable"] && <p>{item}</p>}
                  {field["input"] == "input" && !field["noteditable"] && (
                    <div>
                      <input
                        type={field["type"]}
                        maxLength={field["maxLength"]}
                        placeholder={field["placeholder"]}
                        onChange={(e) => rangeChange(req, i, "from", e)}
                        value={item["from"]}
                      />
                      <input
                        type={field["type"]}
                        maxLength={field["maxLength"]}
                        placeholder={field["placeholder"]}
                        onChange={(e) => rangeChange(req, i, "to", e)}
                        value={item["to"]}
                      />
                      <button onClick={() => removeItem(req, i)}>-</button>
                    </div>
                  )}
                  {field["input"] == "option" && !field["noteditable"] && (
                    <div>
                      <select
                        onChange={(e) => rangeChange(req, i, "from", e)}
                        value={item["from"]}
                      >
                        {field["options"].map((option) => (
                          <option value={option}>{option}</option>
                        ))}
                      </select>
                      <select
                        onChange={(e) => rangeChange(req, i, "to", e)}
                        value={item["to"]}
                      >
                        {field["options"].map((option) => (
                          <option value={option}>{option}</option>
                        ))}
                      </select>
                      <button onClick={() => removeItem(req, i)}>-</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
