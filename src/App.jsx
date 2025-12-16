import "./App.css";
import {
  useEffect,
  useState,
  useRef,
  useContext,
  createContext,
  useMemo,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  FaDesktop,
  FaPlus,
  FaHome,
  FaArrowRight,
  FaArrowLeft,
  FaCopy,
  FaChevronUp,
  FaChevronDown,
  FaAccessibleIcon,
} from "react-icons/fa";
import { MdComputer } from "react-icons/md";
import exportFromJSON from "export-from-json";
import { PiTreeView } from "react-icons/pi";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Canvas,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import Draggable from "react-draggable";

class LocalStorage {
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

class Dictionary extends LocalStorage {
  constructor(name) {
    super(name);
  }
  getValue(key) {
    const data = super.load();
    const result = data[key];
    return result;
  }
}

const Option = ({ output, name, options, setdata }) => {
  const handleChange = (e) => {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [name]: value,
    }));
  };

  return (
    <div className="displayField">
      <label>{name}</label>
      <select onChange={(e) => handleChange(e)} value={output[name]}>
        {options.map((option) => (
          <option value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

const Input = ({ output, name, type, maxLength, setdata }) => {
  const handleChange = (e) => {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [name]: value,
    }));
  };

  return (
    <div className="displayField">
      <label>{name}</label>
      <input
        onChange={(e) => handleChange(e)}
        value={output[name]}
        type={type}
        maxLength={maxLength}
      />
    </div>
  );
};

const Label = ({ output, name }) => {
  const handleChange = (e) => {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [name]: value,
    }));
  };

  return (
    <div className="displayField">
      <label>{name}</label>
      <label>{output[name]}</label>
    </div>
  );
};

function SingleInput({ field, output, setdata }) {
  const handleChange = (e) => {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: value,
    }));
  };

  return (
    <div className="displayField">
      <div className="displayRow">
        <label>{field["name"]}</label>
        {field["noteditable"] && <p>{output[field["name"]]}</p>}
        {field["input"] == "input" && !field["noteditable"] && (
          <input
            type={field["type"]}
            maxLength={field["maxLength"]}
            placeholder={field["placeholder"]}
            onChange={(e) => handleChange(e)}
            value={output[field["name"]]}
            max={field["max"]}
            min={field["min"]}
            step={field["step"]}
          />
        )}
        {field["input"] == "option" && !field["noteditable"] && (
          <select
            onChange={(e) => handleChange(e)}
            value={output[field["name"]]}
          >
            {field["options"].map((option) => (
              <option value={option}>{option}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

function ObjectInput({ field, setdata, output }) {
  const handleChange = (subfield, e) => {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: { ...prevdata[field["name"]], [subfield]: value },
    }));
  };
  return (
    <div className="displayField">
      <div className="displayObject">
        <label>{field["name"]}</label>
        {field["schema"].map((subfield) => (
          <>
            {subfield["datatype"] == "single" && (
              <div className="displayRow">
                <label>{subfield["name"]}</label>
                {!field["noteditable"] && subfield["input"] == "input" && (
                  <input
                    type={subfield["type"]}
                    onChange={(e) => handleChange(subfield["name"], e)}
                    value={output[field["name"]][subfield["name"]]}
                  />
                )}
                {!field["noteditable"] && subfield["input"] == "option" && (
                  <select
                    onChange={(e) => handleChange(subfield["name"], e)}
                    value={output[field["name"]][subfield["name"]]}
                  >
                    {subfield["options"].map((option) => (
                      <option value={option}>{option}</option>
                    ))}
                  </select>
                )}
                {field["noteditable"] && (
                  <p>{output[field["name"]][subfield["name"]]}</p>
                )}
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}

function ListInput({ field, setdata, output }) {
  const handleChange = (i, e) => {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: prevdata[field["name"]].map((item, index) =>
        i == index ? value : item
      ),
    }));
  };

  function addItem() {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: [...prevdata[field["name"]], ""],
    }));
  }

  function removeItem(i) {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: prevdata[field["name"]].filter(
        (item, index) => i !== index
      ),
    }));
  }

  return (
    <div className="displayField">
      <div className="displayObject">
        <div className="displayObjectHead">
          <label>{field["name"]}</label>
          <button onClick={() => addItem()}>+</button>
        </div>
        <div className="displayList">
          {output[field["name"]].length > 0 &&
            output[field["name"]].map((item, i) => (
              <div>
                {field["noteditable"] && <p>{item}</p>}
                {field["input"] == "input" && !field["noteditable"] && (
                  <div>
                    <input
                      type={field["type"]}
                      maxLength={field["maxLength"]}
                      placeholder={field["placeholder"]}
                      onChange={(e) => handleChange(i, e)}
                      value={item}
                    />
                    <button onClick={() => removeItem(i)}>-</button>
                  </div>
                )}
                {field["input"] == "option" && !field["noteditable"] && (
                  <div>
                    <select onChange={(e) => handleChange(i, e)} value={item}>
                      {field["options"].map((option) => (
                        <option value={option}>{option}</option>
                      ))}
                    </select>
                    <button onClick={() => removeItem(i)}>-</button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function CollectionInput({ field, output, setdata, defaults }) {
  function handleChange(subfield, index, e) {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: prevdata[field["name"]].map((item, i) =>
        i === index ? { ...item, [subfield]: value } : item
      ),
    }));
  }

  function addItem() {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: [...prevdata[field["name"]], defaults[field["name"]][0]],
    }));
  }

  function removeItem(index) {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: prevdata[field["name"]].filter((item, i) => i !== index),
    }));
  }

  return (
    <div className="displayField">
      <div className="displayObject">
        <div className="displayObjectHead">
          <label>{field["name"]}</label>
          <div className="displayObjectButtons">
            {!field["noteditable"] && (
              <button className="blue" onClick={() => addItem()}>
                Add
              </button>
            )}
          </div>
        </div>

        <div className="displayTable">
          {field["schema"].length > 0 && (
            <table>
              <thead>
                <tr>
                  {!field["noteditable"] && (
                    <th className="displayTableCell"></th>
                  )}
                  {field["schema"][0].map((subfield) => (
                    <th className="displayTableCell">{subfield["name"]}</th>
                  ))}
                </tr>
              </thead>
              {output[field["name"]].map((item, index) => (
                <tbody>
                  <tr>
                    {!field["noteditable"] && (
                      <td className="displayTableCell">
                        <button onClick={() => removeItem(index)}>-</button>
                      </td>
                    )}
                    {field["schema"][index].map((subfield) => (
                      <>
                        {subfield["datatype"] == "single" && (
                          <td className="displayTableCell">
                            {subfield["noteditable"] && (
                              <input
                                disabled
                                value={
                                  output[field["name"]][index][subfield["name"]]
                                }
                              />
                            )}
                            {subfield["input"] == "input" &&
                              !subfield["noteditable"] && (
                                <input
                                  onChange={(e) =>
                                    handleChange(subfield["name"], index, e)
                                  }
                                  type={subfield["type"]}
                                  placeholder={subfield["placeholder"]}
                                  value={
                                    output[field["name"]][index][
                                      subfield["name"]
                                    ]
                                  }
                                  maxLength={subfield["maxLength"]}
                                />
                              )}
                            {subfield["input"] == "option" &&
                              !subfield["noteditable"] && (
                                <select
                                  onChange={(e) =>
                                    handleChange(subfield["name"], index, e)
                                  }
                                  value={
                                    output[field["name"]][index][
                                      subfield["name"]
                                    ]
                                  }
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
          )}
        </div>
      </div>
    </div>
  );
}

function NestInput({ field, output, setdata, defaults }) {
  function collectionChange(subfield, index, e) {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: prevdata[field["name"]].map((item, i) =>
        i === index ? { ...item, [subfield]: value } : item
      ),
    }));
  }

  function nestChange(index, subfield, subindex, subsubfield, e) {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: prevdata[field["name"]].map((item, i) =>
        i == index
          ? {
              ...item,
              [subfield]: item[subfield].map((subitem, ii) =>
                ii == subindex ? { ...subitem, [subsubfield]: value } : subitem
              ),
            }
          : item
      ),
    }));
  }

  function addCollection() {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: [...prevdata[field["name"]], defaults[field["name"]][0]],
    }));
  }

  function removeCollection(index) {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: prevdata[field["name"]].filter((item, i) => i !== index),
    }));
  }

  function addNest(index, subfield) {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: prevdata[field["name"]].map((item, i) =>
        i == index
          ? {
              ...item,
              [subfield]: [
                ...item[subfield],
                defaults[field["name"]][0][subfield][0],
              ],
            }
          : item
      ),
    }));
  }

  function removeNest(index, subfield, subindex) {
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: prevdata[field["name"]].map((item, i) =>
        i == index
          ? {
              ...item,
              [subfield]: item[subfield].filter(
                (subitem, ii) => ii != subindex
              ),
            }
          : item
      ),
    }));
  }

  return (
    <div className="displayField">
      <div className="displayObject">
        <div className="displayObjectHead">
          <label>{field["name"]}</label>
          <div className="displayObjectButtons">
            <button onClick={() => addCollection()}>Add</button>
          </div>
        </div>
        <div className="displayGrid">
          {output[field["name"]].map((item, index) => (
            <div className="displayFields">
              {field["schema"][index].map((subfield) => (
                <div className="displayField">
                  {subfield["datatype"] == "single" && (
                    <div className="displayRow">
                      <label>{subfield["name"]}</label>
                      {subfield["input"] == "input" && (
                        <input
                          onChange={(e) =>
                            collectionChange(subfield["name"], index, e)
                          }
                          value={output[field["name"]][index][subfield["name"]]}
                          type={subfield["type"]}
                        />
                      )}
                      {subfield["input"] == "option" && (
                        <select
                          onChange={(e) =>
                            collectionChange(subfield["name"], index, e)
                          }
                          value={output[field["name"]][index][subfield["name"]]}
                        >
                          {subfield["options"].map((option) => (
                            <option value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                  {subfield["datatype"] == "collection" && (
                    <div className="displayObject">
                      <div className="displayObjectHead">
                        <label>{subfield["name"]}</label>
                        <div className="displayObjectButtons">
                          <button
                            onClick={() => addNest(index, subfield["name"])}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="displayTable">
                        {subfield["schema"].length > 0 && (
                          <table>
                            <thead>
                              <tr>
                                <th className="displayTableCell"></th>
                                {subfield["schema"][0].map((subsubfield) => (
                                  <th className="displayTableCell">
                                    {subsubfield["name"]}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {output[field["name"]][index][
                                subfield["name"]
                              ].map((subitem, subindex) => (
                                <tr>
                                  <td>
                                    <div className="displayTableCell">
                                      <button
                                        onClick={() =>
                                          removeNest(
                                            index,
                                            subfield["name"],
                                            subindex
                                          )
                                        }
                                      >
                                        -
                                      </button>
                                    </div>
                                  </td>
                                  {subfield["schema"][subindex].map(
                                    (subsubfield) => (
                                      <td>
                                        <div className="displayTableCell">
                                          {subsubfield["input"] === "input" && (
                                            <input
                                              value={
                                                output[field["name"]][index][
                                                  subfield["name"]
                                                ][subindex][subsubfield["name"]]
                                              }
                                              onChange={(e) =>
                                                nestChange(
                                                  index,
                                                  subfield["name"],
                                                  subindex,
                                                  subsubfield["name"],
                                                  e
                                                )
                                              }
                                              type={subsubfield["type"]}
                                            />
                                          )}
                                          {subsubfield["input"] ===
                                            "option" && (
                                            <select
                                              value={
                                                output[field["name"]][index][
                                                  subfield["name"]
                                                ][subindex][subsubfield["name"]]
                                              }
                                              onChange={(e) =>
                                                nestChange(
                                                  index,
                                                  subfield["name"],
                                                  subindex,
                                                  subsubfield["name"],
                                                  e
                                                )
                                              }
                                            >
                                              {subsubfield["options"].map(
                                                (option) => (
                                                  <option value={option}>
                                                    {option}
                                                  </option>
                                                )
                                              )}
                                            </select>
                                          )}
                                        </div>
                                      </td>
                                    )
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => removeCollection(index)}>-</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MultipleInput = ({ field, output, setdata }) => {
  const valueChange = (req, i, e) => {
    const { value } = e.target;
    setdata((prevdata) => ({
      ...prevdata,
      [field["name"]]: {
        ...prevdata[field["name"]],
        [req]: prevdata[field["name"]][req].map((item, index) =>
          i == index ? value : item
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
          i == index ? { ...item, [subfield]: value } : item
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

const TableInput = ({ schema, data, setdata, defaults, editable }) => {
  const handleChange = (i, field, e) => {
    const { value } = e.target;
    setdata((prevdata) =>
      prevdata.map((item, index) =>
        i == index ? { ...item, [field]: value } : item
      )
    );
  };

  const addRow = () => {
    setdata((prevdata) => [...prevdata, defaults[0]]);
  };
  const removeRow = (i) => {
    setdata((prevdata) => prevdata.filter((item, index) => i != index));
  };
  return (
    <div className="displayTable">
      <table>
        <thead>
          <tr>
            {editable && <th className="displayTableCell"></th>}
            {schema.map((field) => (
              <th className="displayTableCell">{field["name"]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr>
              {editable && (
                <td className="displayTableCell">
                  <button onClick={() => removeRow(i)}>-</button>
                </td>
              )}
              {schema.map((field) => (
                <td className="displayTableCell">
                  {editable && (
                    <>
                      {field["input"] == "input" && (
                        <input
                          value={item[field["name"]]}
                          onChange={(e) => handleChange(i, field["name"], e)}
                          maxLength={field["maxLength"]}
                        />
                      )}
                      {field["input"] == "option" && (
                        <select
                          value={item[field["name"]]}
                          onChange={(e) => handleChange(i, field["name"], e)}
                        >
                          {field["options"].map((option) => (
                            <option value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </>
                  )}
                  {!editable && <input disabled value={item[field["name"]]} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {editable && (
        <div className="tableButtons">
          <button onClick={() => addRow()}>+</button>
        </div>
      )}
    </div>
  );
};

const DropDown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setselectedOption] = useState(null);
  const toggleDropDown = () => {
    setIsOpen(!isOpen);
  };
  const handleOptionClick = (option) => {
    setselectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="dropDown">
      <div className="dropDownHead" onClick={() => toggleDropDown()}>
        {selectedOption ? selectedOption.value : "Select"}
        {isOpen ? <FaChevronUp /> : <FaChevronDown className="dropArrow" />}
      </div>
      {isOpen && (
        <div className="dropDownList">
          {options.map((option) => (
            <label key={option.value} onClick={() => handleOptionClick(option)}>
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const Collapsible = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div className="left">
        <button onClick={toggleCollapse} aria-expanded={isOpen}>
          {isOpen && (
            <>
              {`${title} `}
              <FaChevronUp />
            </>
          )}
          {!isOpen && (
            <>
              {`${title} `}
              <FaChevronDown />
            </>
          )}
        </button>
      </div>
      <div
        ref={contentRef}
        style={{
          maxHeight: isOpen ? `${contentRef.current.scrollHeight}px` : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease-in-out",
        }}
      >
        {children}
      </div>
    </div>
  );
};

function DisplayAsTable({ collection }) {
  if (collection.length != 0) {
    const allfields = [];
    collection.map((item) => allfields.push(...Object.keys(item)));
    const fields = [...new Set(allfields)];
    const CSV = () => {
      Operations.downloadCSV(collection, "Table");
    };
    return (
      <div className="displayField">
        <div className="displayTable">
          <table>
            <thead>
              <tr>
                {fields.map((field) => (
                  <th className="displayTableCell">{field}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collection.map((data) => (
                <tr>
                  {fields.map((field) => (
                    <td className="displayTableCell">{data[field]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="left">
          <button onClick={() => CSV()}>&darr; CSV</button>
        </div>
      </div>
    );
  } else {
    return <div className="displayAsTable">Sorry! No data found.</div>;
  }
}

const AutoCompleteInput = ({ options }) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (inputValue.length > 0) {
      const newSuggestions = options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(newSuggestions);
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, options]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() =>
          setTimeout(() => {
            setShowSuggestions(false);
          }, 100)
        }
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul>
          {filteredSuggestions.map((suggestion, i) => (
            <li key={i} onClick={() => handleSelectSuggestion(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function JsonFileReader() {
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const parsedData = JSON.parse(content);
          setJsonData(parsedData);
          setError(null);
        } catch (err) {
          setError(
            "Error parsing JSON file. Please ensure it is a valid JSON format"
          );
          setJsonData(null);
        }
      };
      reader.onerror = () => {
        setError("Error reading the File");
        setJsonData(null);
      };
      reader.readAsText(file);
    } else {
      setJsonData(null);
      setError("No file selected.");
    }
  };

  return (
    <div>
      <input type="file" accept=".json" onChange={handleFileChange} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {jsonData && (
        <div>
          <h3>JSON Data: </h3>
          <pre>{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

class Operations {
  static downloadJSON(data, fileName) {
    const exportType = exportFromJSON.types.json;
    exportFromJSON({ data, fileName, exportType });
  }
  static downloadCSV(data, fileName) {
    const exportType = exportFromJSON.types.csv;
    exportFromJSON({ data, fileName, exportType });
  }
}

const Button = ({ name, functionsArray }) => {
  const perform = () => {
    functionsArray.forEach((func) => {
      func();
    });
  };

  return <button onClick={perform}>{name}</button>;
};

const buildTree = (data, parentId = null) => {
  const list = [];
  const keys = data.filter(
    (item) => item["parentId"] === parentId && item["type"] == "key"
  );
  for (let i = 0; i < keys.length; i++) {
    const key = { ...keys[i] };
    key["children"] = buildTree(data, key["id"]);
    key["value"] = data.find(
      (item) => item["type"] === "value" && item["parentId"] === key.id
    );
    list.push(key);
  }
  return list;
};

const TreeInput = ({ data, setdata, schema }) => {
  const treeStructure = buildTree(data);
  return (
    <ol>
      {treeStructure.map((node) => (
        <Node schema={schema} setdata={setdata} node={node} />
      ))}
    </ol>
  );
};

const Node = ({ node, schema, setdata }) => {
  const keyChange = (id, e) => {
    const { value } = e.target;
    setdata((prevdata) =>
      prevdata.map((item) =>
        item.id === id ? { ...item, ["name"]: value } : item
      )
    );
  };

  const singleChange = (parentId, e) => {
    const { value } = e.target;
    setdata((prevdata) =>
      prevdata.map((item) =>
        item.parentId === parentId ? { ...item, ["value"]: value } : item
      )
    );
  };
  const listChange = (parentId, index, e) => {
    const { value } = e.target;
    setdata((prevdata) =>
      prevdata.map((item) =>
        item.parentId === parentId
          ? {
              ...item,
              ["value"]: item["value"].map((subitem, i) =>
                i === index ? value : subitem
              ),
            }
          : item
      )
    );
  };
  const tableChange = (parentId, index, field, e) => {
    const { value } = e.target;
    setdata((prevdata) =>
      prevdata.map((item) =>
        item.parentId === parentId
          ? {
              ...item,
              ["value"]: item["value"].map((subitem, i) =>
                i === index ? { ...subitem, [field]: value } : subitem
              ),
            }
          : item
      )
    );
  };
  const addNode = (id) => {
    let defaults = "";
    switch (schema.datatype) {
      case "single":
        defaults = "";
        break;
      case "list":
        defaults = [""];
        break;
      case "table":
        const item = {};
        schema.schema.map((field) => (item[field.name] = ""));
        defaults = [item];
        break;
    }
    setdata((prevdata) => [
      ...prevdata,
      ...[
        { type: "key", id: prevdata.length, parentId: id, name: "" },
        { type: "value", parentId: prevdata.length, value: defaults },
      ],
    ]);
  };

  const listAdd = (parentId) => {
    setdata((prevdata) =>
      prevdata.map((item) =>
        item.parentId === parentId
          ? { ...item, ["value"]: [...item["value"], ""] }
          : item
      )
    );
  };

  const tableAdd = (parentId) => {
    const defaults = {};
    schema.schema.map((field) => (defaults[field.name] = ""));
    setdata((prevdata) =>
      prevdata.map((item) =>
        item.parentId === parentId
          ? { ...item, ["value"]: [...item["value"], defaults] }
          : item
      )
    );
  };

  return (
    <>
      {node.children.length === 0 && (
        <li>
          <input value={node.name} onChange={(e) => keyChange(node.id, e)} />
          <button onClick={() => addNode(node.id)}>Node +</button>
          <div>
            {schema.datatype === "single" && (
              <input
                value={node.value.value}
                onChange={(e) => singleChange(node.id, e)}
              />
            )}
            {schema.datatype === "list" && (
              <div>
                {node.value.value.map((item, i) => (
                  <input
                    type={schema.type}
                    value={item}
                    onChange={(e) => listChange(node.id, i, e)}
                  />
                ))}
                <button onClick={() => listAdd(node.id)}>+</button>
              </div>
            )}
            {schema.datatype === "table" && (
              <div className="displayTable">
                <table>
                  <thead>
                    <tr>
                      {schema.schema.map((field) => (
                        <td className="displayTableCell">{field.name}</td>
                      ))}
                    </tr>
                    {node.value.value.map((item, i) => (
                      <tr>
                        {schema.schema.map((field) => (
                          <td className="displayTableCell">
                            <input
                              onChange={(e) =>
                                tableChange(node.id, i, field.name, e)
                              }
                              value={item[field.name]}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </thead>
                </table>
                <button onClick={() => tableAdd(node.id)}>+</button>
              </div>
            )}
          </div>
        </li>
      )}
      {node.children.length > 0 && (
        <li>
          <input value={node.name} onChange={(e) => keyChange(node.id, e)} />
          <button onClick={() => addNode(node.id)}>N</button>
          <ul>
            {node.children.map((child) => (
              <Node node={child} schema={schema} setdata={setdata} />
            ))}
          </ul>
        </li>
      )}
    </>
  );
};

function Title({ title }) {
  return (
    <div className="displayTitle">
      <h3>{title}</h3>
    </div>
  );
}

function CreateAsset() {
  const [data, setdata] = useState({ Code: "", Description: "" });
  return (
    <Window>
      <Title title={"Create Asset"} />
      <Button
        name={"Create Asset Class"}
        functionsArray={[() => alert("Coming Soon")]}
      />
      <SingleInput
        output={data}
        setdata={setdata}
        field={{ name: "Code", input: "input", type: "text", maxLength: 6 }}
      />
      <SingleInput
        output={data}
        setdata={setdata}
        field={{ name: "Description", input: "input", type: "textarea" }}
      />
    </Window>
  );
}

const Section = ({ children }) => {
  return <div className="displayInputFields">{children}</div>;
};

function Random() {
  return <Window>This is a random window.</Window>;
}

function Scratch() {
  const [window, setWindow] = useState("home");
  return (
    <>
      <UserInterface />
    </>
  );
}

const codes = [
  { code: "home", screen: <Home />, window: null },
  { coee: "sc", screen: <Window />, window: <Scratch /> },
];

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function ArrayJSON(data, parentId = null, id = 0) {
  const array = [];
  if (isPlainObject(data)) {
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = data[key];
      const keyinfo = {
        id: id,
        elementType: "key",
        elementOf: "object",
        key: parentId,
        name: key,
      };
      if (typeof value !== "object") {
        keyinfo["valueType"] = "value";
        const valueinfo = {
          id: id + 1,
          elementType: "value",
          elementOf: "object",
          key: id,
          name: value,
        };
        array.push(valueinfo);
        id += 2;
      } else if (isPlainObject(value)) {
        keyinfo["valueType"] = "object";
        const valuesinfo = ArrayJSON(value, id, id + 1);
        id = valuesinfo.id;
        array.push(...valuesinfo.array);
      } else if (Array.isArray(value)) {
        keyinfo["valueType"] = "array";
        const valuesinfo = ArrayJSON(value, id, id + 1);
        id = valuesinfo.id;
        array.push(...valuesinfo.array);
      }
      array.push(keyinfo);
    }
  } else if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const indexinfo = {
        id: id,
        elementType: "index",
        index: i,
        elementOf: "array",
        arrayId: parentId,
        name: "",
      };
      if (typeof value !== "object") {
        indexinfo["valueType"] = "value";
        const valueinfo = {
          id: id + 1,
          elementType: "value",
          elementOf: "array",
          arrayId: parentId,
          index: i,
          name: value,
        };
        array.push(valueinfo);
        id += 2;
      } else if (isPlainObject(value)) {
        indexinfo["valueType"] = "object";
        const valuesinfo = ArrayJSON(value, id, id + 1);
        id = valuesinfo.id;
        array.push(...valuesinfo.array);
      } else if (Array.isArray(value)) {
        indexinfo["valueType"] = "array";
        const valuesinfo = ArrayJSON(value, id, id + 1);
        id = valuesinfo.id;
        array.push(...valuesinfo.array);
      }
      array.push(indexinfo);
    }
  }
  return { array: array.sort((a, b) => a.id - b.id), id: id };
}

function JSONArray(array, parentId = null) {
  const type = array.find(
    (item) =>
      (item["elementType"] === "key" && item["key"] === parentId) ||
      (item["elementType"] === "index" && item["arrayId"] === parentId)
  )["elementOf"];
  let result = {};
  if (type === "object") {
    const keys = array.filter(
      (item) => item["key"] == parentId && item["elementType"] == "key"
    );
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const valueType = key["valueType"];
      if (valueType == "value") {
        result[key["name"]] = array.find(
          (item) => item["elementType"] == "value" && item["key"] == key["id"]
        )["name"];
      } else if (valueType == "object" || valueType == "array") {
        result[key["name"]] = JSONArray(array, key["id"]);
      }
    }
  } else if (type === "array") {
    result = [];
    const indexes = array.filter(
      (item) => item["arrayId"] == parentId && item["elementType"] == "index"
    );
    for (let i = 0; i < indexes.length; i++) {
      const index = indexes[i];
      const valueType = index["valueType"];
      if (valueType == "value") {
        result[index["index"]] = array.find(
          (item) =>
            item["elementType"] == "value" &&
            item["index"] == index["index"] &&
            item["arrayId"] == parentId
        )["name"];
      } else if (valueType == "object" || valueType == "array") {
        result[index["index"]] = JSONArray(array, index["id"]);
      }
    }
  }
  return result;
}

const AccessibilityContext = createContext();
const FloatingWindowContext = createContext();
const WindowContext = createContext();
const PopupContext = createContext();
const AlertContext = createContext();
const PromptFormContext = createContext();
const ScreenContext = createContext();

const accessibilityData = {
  object: new Dictionary("Accessibility"),
  read: function () {
    const stored = this.object.load();
    const defaults = { Background: "Tech", Font: "Lexend" };
    const result = stored === null ? defaults : stored;
    return result;
  },
  save: function (data) {
    this.object.save(data);
  },
};

const PopupBox = () => {
  const { popup, setPopup } = useContext(PopupContext);
  const closePopup = () => {
    setPopup({ visible: false, message: null, cancel: null, confirm: null });
  };
  const perform = (functionsArray) => {
    functionsArray.forEach((func) => {
      func();
    });
    closePopup();
  };
  if (!popup.visible) {
    return null;
  }
  return (
    <div className="popupOverlay" onClick={() => perform(popup.cancel)}>
      <div className="popupContent">
        <p>{popup.message}</p>
        <div className="popupButtons">
          <Button
            name="Cancel"
            functionsArray={[() => perform(popup.cancel)]}
          />
          <Button
            name="Confirm"
            functionsArray={[() => perform(popup.confirm)]}
          />
        </div>
      </div>
    </div>
  );
};

const AlertBox = () => {
  const { alert, setAlert } = useContext(AlertContext);
  const perform = () => {
    alert.onClose.forEach((func) => {
      func();
    });
    setAlert({ visible: false, message: null });
  };
  if (!alert.visible) {
    return null;
  }
  return (
    <div className="alertOverlay" onClick={() => perform()}>
      <div className="alertContent" onClick={(e) => e.stopPropagation()}>
        <p>{alert.message}</p>
        <div className="alertButtons">
          <Button name="OK" functionsArray={[() => perform()]} />
        </div>
      </div>
    </div>
  );
};

function Window() {
  const { window, setWindow } = useContext(WindowContext);
  const { screen, setScreen } = useContext(ScreenContext);
  const onClose = () => {
    setScreen(<TransactionsMenu initial={"Control"} />);
    setWindow(null);
  };
  return (
    <div className="window">
      <Button name={`&times;`} functionsArray={[() => onClose()]} />
      {window}
    </div>
  );
}

function Clock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateString = currentTime.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div tabIndex={0} className="clock">
      <h4>{dateString}</h4>
      <h4>{timeString}</h4>
    </div>
  );
}

function SearchBar() {
  const { setAlert } = useContext(AlertContext);
  const { setScreen } = useContext(ScreenContext);
  const { setWindow } = useContext(WindowContext);
  const { setFloatingWindow } = useContext(FloatingWindowContext);
  const [code, setcode] = useState("");

  const go = () => {
    const result = codes.find((item) => item.code === code.toLowerCase());
    if (result) {
      setScreen(result.screen);
      setWindow(result.window);
    } else {
      setAlert({
        visible: true,
        message: "The code is not configured. Please retry!",
        onClose: [],
      });
    }
    setcode("");
  };

  const inputRef = useRef();
  const buttonRef = useRef([]);

  const keyDownHandler = (e) => {
    if (e.altKey && e.key === "g") {
      e.preventDefault();
      inputRef.current.focus();
    } else if (e.altKey && e.key === "h") {
      e.preventDefault();
      buttonRef.current[0].click();
      window.location.reload();
    } else if (e.altKey && e.key === "+") {
      e.preventDefault();
      window.open(window.location.href, "_blank");
    } else if (e.altKey && e.key === "Backspace") {
      e.preventDefault();
      buttonRef.current[1].click();
    } else if (e.altKey && e.key === "r") {
      e.preventDefault();
      navigate("/record");
    } else if (e.altKey && e.key === "R") {
      e.preventDefault();
      navigate("/reports");
    } else if (e.altKey && e.key === "c") {
      e.preventDefault();
      navigate("/control");
    } else if (e.altKey && e.key === "d") {
      e.preventDefault();
      buttonRef.current[3].click();
    }
  };

  const inputKeyDownHandler = (e) => {
    if (e.key === "Enter") {
      go();
    }
  };

  useEffect(() => {
    const handle = document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", handle);
    };
  }, []);

  return (
    <div className="searchbarOverlay">
      <div className="searchbar">
        <Button
          name={<FaHome />}
          functionsArray={[() => setScreen(<Home />), () => setWindow(null)]}
        />
        <div className="searchArea">
          <input
            value={code}
            onChange={(e) => setcode(e.target.value)}
            onKeyDown={(e) => inputKeyDownHandler(e)}
          />
        </div>
        <Button name={<FaArrowRight />} functionsArray={[() => go()]} />
        <Button
          name={<FaDesktop />}
          functionsArray={[
            () =>
              setFloatingWindow({
                visible: true,
                window: <Accessibility />,
              }),
          ]}
        />
      </div>
    </div>
  );
}

function TitleCard({ title }) {
  return <h1 className="title">{title}</h1>;
}

function Home() {
  const { setWindow } = useContext(WindowContext);
  const keyDownHandler = (e, path) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setWindow(path);
    }
  };

  return (
    <div className="homeOuter">
      <div className="home">
        <TitleCard title={"Simple Costs"} />
        <div className="actions">
          <div
            tabIndex={0}
            onKeyDown={(e) => keyDownHandler(e, "record")}
            className="menu green"
            onClick={() => setWindow("Record")}
          >
            <h2>Record</h2>
          </div>
          <div
            tabIndex={0}
            onKeyDown={(e) => keyDownHandler(e, "control")}
            className="menu red"
            onClick={() => setWindow("Control")}
          >
            <h2>Control</h2>
          </div>
          <div
            tabIndex={0}
            onKeyDown={(e) => keyDownHandler(e, "reports")}
            className="menu blue"
            onClick={() => setWindow("Report")}
          >
            <h2>Reports</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

const Icon = ({ name, code }) => {
  const { setWindow } = useContext(WindowContext);
  const keyDownHandler = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setWindow(code);
    }
  };
  return (
    <div
      className="menuItem"
      tabIndex={0}
      onKeyDown={(e) => keyDownHandler(e)}
      onClick={() => setWindow(code)}
    >
      <h4>{name}</h4>
      <p>{code.toUpperCase()}</p>
    </div>
  );
};

const TransactionsMenu = ({ initial }) => {
  const [type, settype] = useState(initial);
  const filteredTransactions = transactions.filter(
    (item) => item["type"] === type
  );
  const groups = ListUniqueItems(filteredTransactions, "group");
  const groupTransactions = (group) => {
    const grouped = filteredTransactions.filter(
      (item) => item["group"] === group
    );
    return ListItems(grouped, "icon");
  };
  const MenuList = ({ group, transactions }) => {
    return (
      <div className="menuList">
        <div className="menuTitle">
          <h4>{group}</h4>
        </div>
        <div className="menuItems">{transactions}</div>
      </div>
    );
  };
  return (
    <Window>
      <div className="transactionTypes">
        <button
          className={
            type === "Record" ? "transactionTypeSelected" : "transactionType"
          }
          onClick={() => settype("Record")}
        >
          Record
        </button>
        <button
          className={
            type === "Control" ? "transactionTypeSelected" : "transactionType"
          }
          onClick={() => settype("Control")}
        >
          Control
        </button>
        <button
          className={
            type === "Report" ? "transactionTypeSelected" : "transactionType"
          }
          onClick={() => settype("Report")}
        >
          Report
        </button>
        <button
          className={
            type === "Intelligence"
              ? "transactionTypeSelected"
              : "transactionType"
          }
          onClick={() => settype("Intelligence")}
        >
          Intelligence
        </button>
      </div>
      {groups.length > 0 &&
        groups.map((group) => (
          <MenuList group={group} transactions={groupTransactions(group)} />
        ))}
    </Window>
  );
};

const Accessibility = () => {
  const {
    accessibility,
    setAccessibility,
    resetAccessibility,
    saveAccessibility,
  } = useContext(AccessibilityContext);
  const { closeFloatingWindow } = useContext(FloatingWindowContext);
  return (
    <div className="accessibility">
      <div className="displayInputFields">
        <Option
          output={accessibility}
          name="Background"
          options={["Tech", "Fabric", "Intersect"]}
          setdata={setAccessibility}
        />
        <Option
          output={accessibility}
          name="Font"
          options={["Helvetica", "Lexend", "Times New Roman", "Trebuchet MS"]}
          setdata={setAccessibility}
        />
      </div>
      <div className="navigation">
        <Button name={"Reset"} functionsArray={[() => resetAccessibility()]} />
        <Button
          name={"Cancel"}
          functionsArray={[() => closeFloatingWindow()]}
        />
        <Button
          name={"Save"}
          functionsArray={[
            () => saveAccessibility(),
            () => closeFloatingWindow(),
          ]}
        />
      </div>
    </div>
  );
};

const FloatingWindow = () => {
  const { floatingWindow, closeFloatingWindow } = useContext(
    FloatingWindowContext
  );

  const onClose = () => {
    closeFloatingWindow();
  };

  const nodeRef = useRef(null);

  if (!floatingWindow.visible) {
    return null;
  }

  return (
    <Draggable nodeRef={nodeRef}>
      <div
        tabIndex={0}
        ref={nodeRef}
        className="floatingWindow"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="floatingWindowClose" onClick={() => onClose()}>
          &times;
        </button>
        <div onClick={(e) => e.stopPropagation()}>{floatingWindow.window}</div>
      </div>
    </Draggable>
  );
};

const UserInterface = () => {
  const [accessibility, setAccessibility] = useState(accessibilityData.read());
  const { Background, Font } = accessibility;
  const style = {
    backgroundImage: `url('../${Background}.png')`,
    fontFamily: `${Font},'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
  };
  const resetAccessibility = () => {
    setAccessibility(accessibilityData.read());
  };
  const saveAccessibility = () => {
    accessibilityData.save(accessibility);
  };
  const AccessibilityContextValue = {
    accessibility,
    setAccessibility,
    resetAccessibility,
    saveAccessibility,
  };

  const [window, setWindow] = useState(null);
  const WindowContextValue = { window, setWindow };

  const [screen, setScreen] = useState(<Home />);
  const ScreenContextValue = { screen, setScreen };

  const [floatingWindow, setFloatingWindow] = useState({
    visible: false,
    window: null,
  });
  const closeFloatingWindow = () => {
    setFloatingWindow({ visible: false, window: null });
  };
  const FloatingWindowContextValue = {
    floatingWindow,
    setFloatingWindow,
    closeFloatingWindow,
  };

  const [popup, setPopup] = useState({
    visible: false,
    message: null,
    cancel: [],
    confirm: [],
  });
  const PopupContextValue = { popup, setPopup };

  const [alert, setAlert] = useState({
    visible: false,
    message: null,
    onClose: [],
  });
  const AlertContextValue = { alert, setAlert };

  const [promptForm, setPromptForm] = useState({
    visible: false,
    defaults: null,
    fields: null,
  });
  const [promptData, setPromptData] = useState(null);
  const PromptContextValue = {
    promptForm,
    setPromptForm,
    promptData,
    setPromptData,
  };

  useEffect(() => {
    resetAccessibility();
  }, [floatingWindow.visible]);

  return (
    <AccessibilityContext.Provider value={AccessibilityContextValue}>
      <ScreenContext.Provider value={ScreenContextValue}>
        <PopupContext.Provider value={PopupContextValue}>
          <AlertContext.Provider value={AlertContextValue}>
            <PromptFormContext.Provider value={PromptContextValue}>
              <FloatingWindowContext.Provider
                value={FloatingWindowContextValue}
              >
                <WindowContext.Provider value={WindowContextValue}>
                  <div className="container" style={style}>
                    <SearchBar />
                    <div className="screen innerContainer">
                      <PopupBox />
                      <AlertBox />
                      <FloatingWindow />
                      {screen}
                    </div>
                  </div>
                </WindowContext.Provider>
              </FloatingWindowContext.Provider>
            </PromptFormContext.Provider>
          </AlertContext.Provider>
        </PopupContext.Provider>
      </ScreenContext.Provider>
    </AccessibilityContext.Provider>
  );
};

function App() {
  return <UserInterface />;
}

export default App;
