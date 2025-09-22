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
                {"name":"General Ledger","input":"option","options":ListofItems(loadData('assets'),0)},
                {"name":"Amount","input":"input","type":"number"},
                {"name":"Debit/ Credit","input":"option","options":["Debit", "Credit"]},
                {"name":"Cost Center","input":"option","options":[]},
                {"name":"Asset","input":"option","options":[]},
                {"name":"Material","input":"option","options":ListofItems(loadData('materials'),0)},
                {"name":"Quantity","input":"option","options":[]},
                {"name":"Location","input":"option","options":[]},
                {"name":"Profit Center","input":"option","options":[]},
                {"name":"Cost Object","input":"option","options":[]},
                {"name":"Purchase Order","input":"option","options":[]},
                {"name":"Purchase Order Item","input":"option","options":[]},
                {"name":"Service Order","input":"option","options":[]},
                {"name":"Service Order Item","input":"option","options":[]},
                {"name":"Employee","input":"option","options":[]},
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
            {"name": "Asset Class", "datatype":"single", "input":"option", "options":ListofItems(loadData("assetclasses"),0),"use-state":"Computer & Accessories"},
            {"name": "Cost Center", "datatype":"single", "input":"option", "options":ListofItems(loadData("costcenters"),0),"use-state":0},
            {"name": "Useful Life", "datatype":"single", "input":"input", "type":"number","use-state":0},
            {"name": "Salvage Value", "datatype":"single", "input":"input", "type":"number","use-state":0},
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
    "Employee":{
        "name":"Employee",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
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
        "name":"Profit center",
        "schema":[
            {"name": "Center", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Segment", "datatype":"single", "input":"option", "options":ListofItems(loadData("segments"),0), "use-state":""},
        ],
        "collection":"profitcenters"
    },
    "Segment":{
        "name": "Segment",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""}
        ],
        "collection":"segments"
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
        <button onClick={addfunction}>Add</button>
        </label>
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
        {schema.map(field=>
        <div className='queryField'>
            {field['datatype']==="single"&&<GenerateInput className="querySingle" disabled={method==="Display"} label={true} item={field} k={0} value={masterdata[field['name']]} onthischange={(e)=>singlechange(field['name'],e)}/>}
            {field['datatype']==="object"&&<InputRow disabled={method==="Display"} collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} onchange={objectchange} />}
            {field['datatype']==="collection"&&<MultipleEntry disabled={method==="Display"} collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} addfunction={(e)=>addToList(field['name'],field['use-state'][0],e)} onchange={collectionchange}/>}
            </div>)}
            <div className='queryButtons'>
            {method!="Display" && <button onClick={cancel}>Cancel</button>}
            {method=="Display" && <button onClick={cancel}>Back</button>}
            {method=="Create" && <button onClick={createObject}>Create</button>}
            {method=="Update" && <button onClick={updateObject}>Update</button>}
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
            <button onClick={()=>{objectQuery('display')}}>View</button><button onClick={()=>{objectQuery('update')}}>Update</button><button onClick={()=>{navigate(`/deactivate/${object}/${selected}/`)}}>Deactivate</button>
            </div> }
            { type =="Object" && <p style={{textAlign:"center"}}>Or, <button onClick={()=>{navigate(`/create/${object}`)}}>Create {object}</button></p>}
            { type == "Transaction" && 
            <div className='queryButtons'>
            <button onClick={()=>{documentQuery('display')}}>View</button><button onClick={()=>{documentQuery('update')}}>Update</button><button onClick={()=>{navigate(`/document/reverse/${selected}/`)}}>Reverse</button>
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
        <div>
        <h2>{ type=="Object" &&`Deactivate ${object}`}{ type=="Transaction" && 'Reverse Document'}</h2>
        <p>Are you sure want to {type=="Object" && `deactivate ${object} ${id}`} {type=="Transaction" && ` reverse transaction ${id}`}</p>
        <div>
            {type == "Object" && <button onClick={()=>{navigate(`/query/${object}`)}}>Cancel</button>}
            {type == "Transaction" && <button onClick={()=>{navigate(`/document`)}}>Cancel</button>}
            {type == "Object" && <button onClick={deactivate}>Deactivate</button>}
            {type == "Transaction" && <button onClick={reverse}>Reverse</button>}
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
            <button onClick={()=>navigate(`/`)}>Home</button>
            <input type="text" onChange={changeUrl} placeholder="Your path here . . ."/>
            <button onClick={search}>&rarr;</button>
        </div>
    )
}

function Home(){

  return(
    <div className='home'>
      <h1 className='title'>Simple Costs<sup>&reg;</sup></h1>
    <div className='actions'>{}
      <div className='menu'><Link to="/record">Record</Link></div>
      <div className='menu'><Link to="/control">Control</Link></div>
      <div className='menu'><Link to="/reports">Reports</Link></div>
    </div>
    </div>
  )
}

export function Record(){

    const navigate = useNavigate();
  
  return(
    <div className='menuList'>
      <div className='menuTitle'><h3>Record</h3></div>
      <div className='menuItem'><h3 onClick={()=>{navigate(`/document`)}}>Document</h3></div>
      <div className='menuItem'><h3 onClick={()=>{navigate(`/document/create`)}}>Transaction</h3></div>
    </div>
  )
}

export function Control(){

    const navigate = useNavigate();
  const list = Object.keys(objects)
  
  return(
    <div className='menuList'>
      <div className='menuTitle'><h3>Control</h3></div>
      {list.map(item=><div className='menuItem'><h3 onClick={()=>{navigate(`/query/${item}`)}}>{item}</h3></div>)}
    </div>
  )
}

function Reports(){

    const navigate = useNavigate();
    return(
    <div className='menuList'>
    <div className='menuTitle'><h3>Reports</h3></div><div className='menuItem'><h3 onClick={()=>{navigate(`/assets`)}}>Assets</h3></div>
    </div>
    )
}



function DisplayAsTable({collection}){
    const fields = Object.keys(collection[0]);

    return (
        <div className='table'>
            <div className='row'>{fields.map(field=><div className='cell'><p>{field}</p></div>)}</div>
            {collection.map(data=><div className='row'>{fields.map(field=><div className='cell'><p>{data[field]}</p></div>)}</div>)}
        </div>
    )
}

function Assets(){
    const data = loadData('assets');
    return(
        <>
        <DisplayAsTable collection={data}/>
        </>
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
      <Route path="/assets" element={<Assets/>}/>
    </Routes>
    </div>
    </BrowserRouter>
    </div>
  )
}

export default App;