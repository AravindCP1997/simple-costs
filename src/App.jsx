import './App.css'
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate, useNavigate } from 'react-router-dom';

function loadData(collection){
    const data = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];
    return data;
}

function saveData(data,collection){
  localStorage.setItem(collection,JSON.stringify(data));
}

const ListofItems  = (collection,n) => {
    const keys = (collection.length!= 0) ? Object.keys(collection[0]) : [];
    const List = (collection.length!= 0) ? collection.map(item=>item[keys[n]]) : [];
    return List
}

const getcollection =  (collection)=>{
    const data = loadData(objects[collection]['collection'])
    return data
}

const getID = (collection,key, value) =>{
    const filtered = collection.filter(item=>item[key]==value)[0];
    const id = collection.indexOf(filtered);
    return id;
}

const filterObject = (collection, key, value) =>{
    const filtered = collection.filter(item=>item[key]==value)[0];
    return filtered;
}


const ItemsInCollection = (collectionname)=>{
    const collection = getcollection(collectionname);
    const data = ListofItems(collection,0);
    return data;
}

const transactions = {
    "name":"Transaction",
    "collection":"transactions",
    "schema": [
        {"name": "Posting Date", "datatype":"single", "input":"input", "type":"date", "use-state":new Date()},
        {"name": "Document Date", "datatype":"single", "input":"input", "type":"date", "use-state":""},
        {"name": "Reference", "datatype":"single", "input":"input", "type":"text", "use-state":""},
        {"name": "Currency", "datatype":"single", "input":"option", "options":[], "use-state":""},
        {"name": "Line Items", "datatype":"collection", "structure":
            [
                {"name":"General Ledger","input":"option","options":ListofItems(loadData('generalledgers'),0)},
                {"name":"Amount","input":"input","type":"number"},
                {"name":"Debit/ Credit","input":"option","options":["Debit", "Credit"]},
                {"name":"Cost Center","input":"option","options":ListofItems(loadData('costcenters'),0)},
                {"name":"Asset","input":"option","options":ListofItems(loadData('assets'),0)},
                {"name":"Material","input":"option","options":ListofItems(loadData('materials'),0)},
                {"name":"Quantity","input":"option","options":[]},
                {"name":"Location","input":"option","options":ListofItems(loadData('locations'),0)},
                {"name":"Profit Center","input":"option","options":ListofItems(loadData('profitcenters'),0)},
                {"name":"Cost Object","input":"option","options":ListofItems(loadData('costobjects'),0)},
                {"name":"Purchase Order","input":"option","options":ListofItems(loadData('purchaseorders'),0)},
                {"name":"Purchase Order Item","input":"option","options":[]},
                {"name":"Service Order","input":"option","options":ListofItems(loadData('serviceorders'),0)},
                {"name":"Service Order Item","input":"option","options":[]},
                {"name":"Employee","input":"option","options":ListofItems(loadData('employees'),0)},
                {"name":"Consumption Time From","input":"input","type":"date"},
                {"name":"Consumption Time To","input":"input","type":"date"},

            ],  
            "use-state":[{"id":0,"General Ledger":"Plant and Machinery","Amount":0}]}
    ]
}

const objects = {
    "Asset":{
        "name":"Asset",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Asset Class", "datatype":"single", "input":"option", "options":ListofItems(loadData("assetclasses"),0),"use-state":""},
            {"name": "Cost Center", "datatype":"single", "input":"option", "options":ListofItems(loadData("costcenters"),0),"use-state":""},
            {"name": "Useful Life", "datatype":"single", "input":"input", "type":"number","use-state":0},
            {"name": "Salvage Value", "datatype":"single", "input":"input", "type":"number","use-state":0},
            {"name": "Derpeciable Amount", "value":"calculated"},
            {"name": "Date of Capitalisation", "datatype":"single", "input":"input", "type":"date","use-state":0},
            {"name": "Income Tax Block", "datatype":"single", "input":"input", "type":"text","use-state":0},
            {"name": "Income Tax Depreciation Rate", "datatype":"single", "input":"input", "type":"number","use-state":0}
        ],
        "collection":'assets'
    },
    "Asset Class":{
        "name":"Asset Class",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "General Ledgers", "datatype":"single", "input":"option", "options":ListofItems(loadData('generalledgers'),0), "use-state":""}
        ],
        "collection":"assetclasses"
    },
    "Cost Center":{
        "name": "Cost Center",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Profit Center", "datatype":"single", "input":"option", "options":ListofItems(loadData('profitcenters'),0), "use-state":""}
        ],
        "collection":"costcenters"
    },
    "Currency":{
        "name":"Currency",
        "schema":[
            {"name":"Currency","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Code","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Exchange Rate","datatype":"single","input":"input","type":"number","use-state":""}
        ],
        "collection":"currencies"
    },
    "Customer":{
        "name":"Customer",
        "collection":"customers",
        "schema": [
            {"name":"Name","datatype":"single","input":"input","type":"text"}
        ]
    },
    "Employee":{
        "name":"Employee",
        "schema": [
            {"name": "Name", "datatype":"object", "structure":[{"name":"First Name","input":"input","type":"text"},{"name":"Last Name","input":"input","type":"text"}], "use-state":{"First Name":"","Last Name":""}},
            {"name": "Date of Birth", "datatype":"single", "input":"input", "type":"date", "use-state":0},
            {"name": "Bank Accounts", "datatype":"collection", "structure":[{"name":"Bank", "input":"input", "type":"text"},{"name":"IFSC", "input":"input", "type":"text"},{"name":"Account Number", "input":"input", "type":"number"}],"use-state":[{"id":0,"Bank":"SBI","IFSC":"SBIN0070056","Account Number":"000000000000"}]},
        ],
        "collection":'employees'
    },
    "General Ledger":{
        "name":"General Ledger",
        "schema":[
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Presentation", "datatype":"single", "input":"option", "options":["Income", "Expense", "Asset", "Liability", "Equity"], "use-state":"Income"},
            {"name":"Ledger Type","datatype":"single","input":"option","options":["Fixed Asset", "Cost Element", "Customer", "Material", "Vendor","General"]}
        ],
        "collection":"generalledgers"
    },
    "Location":{
        "name":"Location",
        "schema": [
            {"name":"Name", "datatype":"single", "input":"input", "type":"text"},
            {"name":"Cost Center", "datatype":"single", "input":"input", "type":"text"},
        ],
        "collection":"locations"
    },
    "Profit Center":{
        "name":"Profit Center",
        "schema":[
            {"name": "Center", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Segment", "datatype":"single", "input":"option", "options":ListofItems(loadData("segments"),0), "use-state":""},
        ],
        "collection":"profitcenters"
    },
    "Purchase Order":{
        "name": "Purchase Order",
        "schema":[
            {"name": "Description", "datatype":"single", "input":"input", "type":"text", "use-state":""}
        ],
        "collection":"purchaseorders"
    },
    "Segment":{
        "name": "Segment",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""}
        ],
        "collection":"segments"
    },
    "Sale Order":{
        "name": "Purchase Order",
        "schema":[
            {"name": "Description", "datatype":"single", "input":"input", "type":"text", "use-state":""}
        ],
        "collection":"saleeorders"
    },
    "Vendor":{
        "name":"Vendor",
        "collection":"vendors",
        "schema": [
            {"name":"Name","datatype":"single","input":"input","type":"text"}
        ]
    }
}

function GenerateInput({item,k,value,onthischange,label,disabled, className}){
    return(
        <>
            <label className={className}>{label && item['name']}{item['input']==="input"&&<input key={k} disabled={disabled} value={value} onChange={onthischange} type={item['type']}/>}{item['input']==="option"&&<select key={k} value={value} onChange={onthischange} disabled={disabled}>{item['options'].map((option)=><option value={option}>{option}</option>)}</select>}</label>
        </>
    )
}

function InputRow({disabled, collection,structure,onchange,fieldname}){
    return(
        <>
        <label>{fieldname}</label>
            <div>{structure.map((field,i)=><GenerateInput className="querySingle" disabled={disabled} item={field} k={i} data-fieldname={fieldname} value={collection[field['name']]} onthischange={(e)=>onchange(fieldname,field['name'],e)} label={true}/>)} </div>
        </>
    )
}

export function MultipleEntry({disabled, collection,fieldname,structure,onchange,addfunction}){
    return(
        <>
        <label className='queryTable'>{fieldname}
        <div className='queryRow'>{structure.map(field=><label className='queryCell'>{field['name']}</label>)}</div>
        <div>{collection.map((item,index)=><div className="queryRow">{structure.map(field=><GenerateInput className="queryCell" disabled={disabled} item={field} k={index} value={collection[index][field['name']]} label={false} onthischange={(e)=>onchange(fieldname,index,field['name'],e)}/>)}</div>)}</div>
        </label>
        <div className='queryButtons'><button className="blue" onClick={addfunction}>Add</button></div>
        </>
    )
}


function ObjectUI({type,method}){
    const navigate = useNavigate();
    const {object,id} = useParams();
    const collection = (type==="Object") ? objects[object]['collection'] : transactions['collection'];
    const schema = (type==="Object") ? objects[object]['schema'] : transactions['schema'];
    const usestates = {};
    schema.map(item=>usestates[item['name']]=item['use-state']);
    const existingdata = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];
    const defaults = (method==="Create") ? usestates : existingdata[id];
    const [masterdata,setmaster] = useState(defaults);

    function addToList(list,defaults,e){
        e.preventDefault;
        const oldlist = masterdata[list];
        const newentry = {...defaults,['id']:oldlist.length}
        const newlist = [...oldlist,newentry]
        setmaster(prevdata=>({
            ...prevdata,
            [list]:newlist
        }))
    }

    function singlechange(field,e){
        const {value} = e.target
        setmaster(prevdata=>({
            ...prevdata,
            [field]:value
        }))
    }

    function objectchange(field,key,e){
        e.preventDefault
        const {value} = e.target
        e.preventDefault
        const oldobject = masterdata[field]
        const newobject = {...oldobject,[key]:value}
        setmaster(prevdata=>({
            ...prevdata,
            [field]:newobject
        }))
    }

    function collectionchange(field,index,key,e){
        e.preventDefault
        const {value} = e.target
        const oldlist = masterdata[field]
        const olddata = oldlist[index]
        const newdata = {...olddata,[key]:value}
        const newlist = oldlist.map((item)=>(item.id===index ? newdata : item))
        setmaster(prevdata=>({
            ...prevdata,
            [field]:newlist
        }))

    }

    function createObject(){
        const datapack = [...existingdata,masterdata];
        saveData(datapack,collection);
        alert(`${object} created!`);
        cancel();
    }

    function updateObject(){
        const datapack = existingdata.map((item,index)=>(index==id)?masterdata:item);
        saveData(datapack,collection);
        alert(`${object} Updated!`);
        cancel();
    }

    function cancel(){
        (type=="Object") ? navigate(`/query/${object}`) : navigate(`/document`)
    }


    return(
        <div className='queryDisplay'>
        <label className='queryTitle'><h2>{ type=="Object" &&`${method} ${object}`} { type=="Transaction" &&`${method} Transaction`}</h2></label>
        {schema.map(field=>
        <div className='queryField'>
            {field['datatype']==="single"&&<GenerateInput className="querySingle" disabled={method==="Display"} label={true} item={field} k={0} value={masterdata[field['name']]} onthischange={(e)=>singlechange(field['name'],e)}/>}
            {field['datatype']==="object"&&<InputRow disabled={method==="Display"} collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} onchange={objectchange} />}
            {field['datatype']==="collection"&&<MultipleEntry disabled={method==="Display"} collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} addfunction={(e)=>addToList(field['name'],field['use-state'][0],e)} onchange={collectionchange}/>}
            </div>)}
            <div className='queryButtons'>
            {method!="Display" && <button className='blue' onClick={cancel}>Cancel</button>}
            {method=="Display" && <button className='blue' onClick={cancel}>Back</button>}
            {method=="Create" && <button className='green' onClick={createObject}>Create</button>}
            {method=="Update" && <button className='blue' onClick={updateObject}>Update</button>}
            </div>
        </div>
    )
}



function Query({type}){
  const {object} = useParams()
  const navigate = useNavigate();

  function objectQuery(method){
    navigate(`/${method}/${object}/${selected}`);
  }

  function documentQuery(method){
    navigate(`/document/${method}/${selected}`)
  }

    const collection = (type == "Object") ? loadData(objects[object]['collection']) : loadData(transactions['collection']);
    const list = ListofItems(collection,0)
    const [selected,setselected] = useState(0);
    return(
      <div className='query'>
          <label className='queryTitle'><h2>Choose { type=="Object" && object} { type=="Transaction" && "Document"}</h2>
            <select className='querySelect' value={selected} onChange={(e)=>setselected(e.target.value)}>
                {list.map((item,index)=><option value={index}>{item}</option>)}
            </select>
            </label>
            { type == "Object" && 
            <div className='queryButtons'>
            <button className="blue" onClick={()=>{objectQuery('display')}}>View</button><button className="blue" onClick={()=>{objectQuery('update')}}>Update</button><button className="red" onClick={()=>{navigate(`/deactivate/${object}/${selected}/`)}}>Deactivate</button>
            </div> }
            { type =="Object" && <p style={{textAlign:"center"}}>Or, <button className="green" onClick={()=>{navigate(`/create/${object}`)}}>Create {object}</button></p>}
            { type == "Transaction" && 
            <div className='queryButtons'>
            <button className="blue" onClick={()=>{documentQuery('display')}}>View</button><button className="blue" onClick={()=>{documentQuery('update')}}>Update</button><button className="red" onClick={()=>{navigate(`/document/reverse/${selected}/`)}}>Reverse</button>
            </div> }
      </div>
       
    )
}

function DeleteQuery({type}){
    const navigate = useNavigate();
    const {object,id} = useParams();
    const collection = (type =="Object") ? objects[object]['collection'] : transactions['collection'];
    const existingdata = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];
    
    function deactivate(){
        const newdata = existingdata.filter((item,index)=>index!=id)
        saveData(newdata,collection);
        alert(`${object} Deleted!`);
        navigate(`/query/${object}`)
    }

    function reverse(){
        const newdata = existingdata.filter((item,index)=>index!=id)
        saveData(newdata,collection);
        alert(`${type} Reversed!`);
        navigate(`/document`)
    }
    return(
        <div className='query'>
        <h2 className='queryTitle'>{ type=="Object" &&`Deactivate ${object}`}{ type=="Transaction" && 'Reverse Document'}</h2>
        <p>Are you sure want to {type=="Object" && `deactivate ${object} ${id}`} {type=="Transaction" && ` reverse transaction ${id}`} ?</p>
        <div className='queryButtons'>
            {type == "Object" && <button className="blue" onClick={()=>{navigate(`/query/${object}`)}}>Cancel</button>}
            {type == "Transaction" && <button className="blue" onClick={()=>{navigate(`/document`)}}>Cancel</button>}
            {type == "Object" && <button className="red" onClick={deactivate}>Deactivate</button>}
            {type == "Transaction" && <button className="red" onClick={reverse}>Reverse</button>}
        </div>
        </div>
    )
}


function SearchBar(){
    const navigate = useNavigate()
    const [url,seturl] = useState()
    function search(){
        navigate(url)
        seturl('');
    }

    function changeUrl(e){
        seturl(e.target.value)
    }
    return(
        <div className='searchBar'>
            <button className='blue' onClick={()=>navigate(`/`)}>Home</button>
            <input type="text" onChange={changeUrl} placeholder="Your path here . . ."/>
            <button className="blue" onClick={search}>&rarr;</button>
        </div>
    )
}

function Home(){
    const navigate = useNavigate();
  return(
    <div className='home'>
      <h1 className='title'>Simple Costs<sup>&reg;</sup></h1>
    <div className='actions'>{}
      <div className='menu green' onClick={()=>navigate(`/record`)}><h2>Record</h2></div>
      <div className='menu red' onClick={()=>navigate(`/control`)}><h2>Control</h2></div>
      <div className='menu blue'  onClick={()=>navigate(`/reports`)}><h2>Reports</h2></div>
    </div>
    </div>
  )
}

export function Record(){

    const navigate = useNavigate();
  
  return(
    <div className='menuList'>
      <div className='menuTitle green'><h3>Record</h3></div>
      <div className='menuItem' onClick={()=>{navigate(`/document`)}}><h3>Document</h3></div>
      <div className='menuItem' onClick={()=>{navigate(`/document/create`)}}><h3>Transaction</h3></div>
    </div>
  )
}

export function Control(){

    const navigate = useNavigate();
  const list = Object.keys(objects)
  
  return(
    <div className='menuList'>
      <div className='menuTitle red'><h3>Control</h3></div>
      {list.map(item=><div className='menuItem'><h3 onClick={()=>{navigate(`/query/${item}`)}}>{item}</h3></div>)}
    </div>
  )
}

function Reports(){

    const navigate = useNavigate();
    return(
    <div className='menuList'>
    <div className='menuTitle blue'><h3>Reports</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/assets`)}}>Assets</h3></div>
    </div>
    )
}



function DisplayAsTable({collection}){
    const fields = Object.keys(collection[0]);

    return (
        <div className='displayTable'>
            <div className='displayRow'>{fields.map(field=><div className='displayCell'><p>{field}</p></div>)}</div>
            {collection.map(data=><div className='displayRow'>{fields.map(field=><div className='displayCell'><p>{data[field]}</p></div>)}</div>)}
        </div>
    )
}

function ReportQuery(){
    const [query,setquery] = useState([
        {"field":"Asset Class","value":"", "type":"text"}
    ]);

    const handleChange = (i,e)=>{
        const {value} = e.target;
        const olddata = query[i];
        const newdata = {...olddata,['value']:value};
        const newquery = query.map((item,index)=>(index ==i)?newdata:item);
        setquery(newquery);
    }

    const sendQuery = () =>{
        alert(JSON.stringify(query));
    }

    return(
        <div>
            {query.map((item,index)=><label>{item['field']}<input type={item['type']} value={query[index]['value']} onChange={(e)=>handleChange(index,e)}/></label>)}
            <div className='queryButtons'><button onClick={sendQuery} className='blue'>Send</button></div>
        </div>
    )

}

class ControlObject{
    constructor(name,data){
        this.name = name;
        this.schema = objects[this.name]['schema']
        this.collections = loadData(objects[this.name]['collection'])
        this.data = data || this.defaults();
    }
    calculate(){
        const data = {}
        data['Age'] = (this.name=="Employee")?this.data['Date of Birth']+"AA":5;
        return data;
    }
    defaults(){
        const defaults = {}
        this.schema.map(item=>defaults[item['name']]=item['use-state']);
        return defaults;
    }
    item(id){
        return this.collections[id]
    }
}

function CreateAssets(){
    const [employee, setemployee] = useState(new ControlObject("Employee"))
    const schema = employee.schema;
    const object = employee.data

    function addToList(list,defaults,e){
        e.preventDefault;
        const oldlist = object[list];
        const newentry = {...defaults,['id']:oldlist.length}
        const newlist = [...oldlist,newentry]
        const newdata = {...object,[list]:newlist};
        setemployee(new ControlObject("Employee",newdata))
    }

    function singlechange(field,e){
        const {value} = e.target
        const newdata = {...object,[field]:value}
        setemployee(new ControlObject("Employee",newdata))
    }

    function objectchange(field,key,e){
        e.preventDefault
        const {value} = e.target
        e.preventDefault
        const oldobject = object[field]
        const newobject = {...oldobject,[key]:value}
        const newmaster = {...object,[field]:newobject}
        setemployee(new ControlObject("Employee",newmaster))
    }

    function collectionchange(field,index,key,e){
        e.preventDefault
        const {value} = e.target
        const oldlist = object[field]
        const olddata = oldlist[index]
        const newdata = {...olddata,[key]:value}
        const newlist = oldlist.map((item)=>(item.id===index ? newdata : item))
        const newmaster = {...object,[field]:newlist}
        setemployee(new ControlObject("Employee",newmaster))

    }


    return(
        <div>
            {schema.map(field=>
        <div className='queryField'>
            {field['datatype']==="single"&&<GenerateInput className="querySingle" disabled={false} label={true} item={field} k={0} value={object[field['name']]} onthischange={(e)=>singlechange(field['name'],e)}/>}
            {field['datatype']==="object"&&<InputRow disabled={false} collection={object[field['name']]} fieldname={field['name']} structure={field['structure']} onchange={objectchange} />}
            {field['datatype']==="collection"&&<MultipleEntry disabled={false} collection={object[field['name']]} fieldname={field['name']} structure={field['structure']} addfunction={(e)=>addToList(field['name'],field['use-state'][0],e)} onchange={collectionchange}/>}
            <p>{employee.calculate()['Age']}</p>
            </div>)}
            {JSON.stringify(object)}
        </div>
    )

}

function App(){
  return(
    <div className='container'>
    <BrowserRouter>
    <SearchBar/>
    <div className="innerContainer">
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/record' element={<Record/>}/>
      <Route path='/control' element={<Control/>}/>
      <Route path='/reports' element={<Reports/>}/>
      <Route path="/document" element={<Query type={"Transaction"}/>}/>
      <Route path="/document/create/" element={<ObjectUI type={"Transaction"} method={"Create"}/>}/>
      <Route path="/document/display/:id" element={<ObjectUI type={"Transaction"} method={"Display"}/>}/>
      <Route path="/document/update/:id" element={<ObjectUI type={"Transaction"} method={"Update"}/>}/>
      <Route path="/document/reverse/:id" element={<DeleteQuery type={"Transaction"}/>}/>
      <Route path='/query/:object/' element={<Query type={"Object"}/>}/>
      <Route path='/create/:object/' element={<ObjectUI type={"Object"} method={"Create"}/>}/>
      <Route path='/update/:object/:id' element={<ObjectUI type={"Object"} method={"Update"}/>}/>
      <Route path='/display/:object/:id' element={<ObjectUI type={"Object"} method={"Display"}/>}/>
      <Route path='/deactivate/:object/:id' element={<DeleteQuery type={"Object"}/>}/>
      <Route path="/assets" element={<CreateAssets/>}/>
    </Routes>
    </div>
    </BrowserRouter>
    </div>
  )
}

export default App;