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
    const keys = Object.keys(collection[0]);
    const List = collection.map(item=>item[keys[n]]);
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

const objects = {
    "Asset":{
        "name":"Asset",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Asset Class", "datatype":"single", "input":"option", "options":ListofItems(loadData("assetclasses"),0),"use-state":"Computer & Accessories"},
            {"name": "Cost Center", "datatype":"single", "input":"input", "type":"text","use-state":0},
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
                {"name":"Material","input":"option","options":[]},
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

function GenerateInput({item,k,value,onthischange,label,disabled}){
    return(
        <>
            <label className='input'>{label && item['name']}{item['input']==="input"&&<input key={k} disabled={disabled} value={value} onChange={onthischange} type={item['type']}/>}{item['input']==="option"&&<select key={k} value={value} onChange={onthischange} disabled={disabled}>{item['options'].map((option)=><option value={option}>{option}</option>)}</select>}</label>
        </>
    )
}

function InputRow({disabled, collection,structure,onchange,fieldname}){
    return(
        <>
        <label>{fieldname}</label>
            <div className='row'>{structure.map((field,i)=><GenerateInput disabled={disabled} item={field} k={i} data-fieldname={fieldname} value={collection[field['name']]} onthischange={(e)=>onchange(fieldname,field['name'],e)} label={true}/>)} </div>
        </>
    )
}

export function MultipleEntry({disabled, collection,fieldname,structure,onchange,addfunction}){
    return(
        <>
        <label>{fieldname}</label>
        <div className='row'>{structure.map(field=><label>{field['name']}</label>)}</div>
        <div className='row'>{collection.map((item,index)=><>{structure.map(field=><GenerateInput disabled={disabled} item={field} k={index} value={collection[index][field['name']]} label={false} onthischange={(e)=>onchange(fieldname,index,field['name'],e)}/>)}</>)}</div>
        <button onClick={addfunction}>Add</button>
        </>
    )
}


function ObjectUI({method}){

    const {object,id} = useParams();
    const navigate = useNavigate();
    const collection = objects[object]['collection'];
    const schema = objects[object]['schema'];
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
        navigate(`/query/${object}`)
    }

    

 

    return(
        <div className='objectDisplay'>
        {schema.map(field=>
        <div className='objectField'>
            {field['datatype']==="single"&&<GenerateInput disabled={method==="Display"} label={true} item={field} k={0} value={masterdata[field['name']]} onthischange={(e)=>singlechange(field['name'],e)}/>}
            {field['datatype']==="object"&&<InputRow disabled={method==="Display"} collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} onchange={objectchange} />}
            {field['datatype']==="collection"&&<MultipleEntry disabled={method==="Display"} collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} addfunction={(e)=>addToList(field['name'],field['use-state'][0],e)} onchange={collectionchange}/>}
            
            </div>)}
            <div>
            {method!="Display" && <button onClick={cancel}>Cancel</button>}
            {method=="Display" && <button onClick={cancel}>Back</button>}
            {method=="Create" && <button onClick={createObject}>Create</button>}
            {method=="Update" && <button onClick={updateObject}>Update</button>}
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
      <div className='cell'><Link to="/record">Record</Link></div>
      <div className='cell'><Link to="/control">Control</Link></div>
      <div className='cell'><Link to="/reports">Reports</Link></div>
    </div>
    </div>
  )
}

export function Control(){

    const navigate = useNavigate();
  const list = Object.keys(objects)
  
  return(
    <div className='manage'>
      <div className='title'><h3>Control</h3></div>
      {list.map(item=><div className='object'>
        <h3 onClick={()=>{navigate(`/query/${item}`)}}>{item}</h3>
        </div>)}
    </div>
  )
}

function Query(){
  const {object} = useParams()
  const navigate = useNavigate();

  function sendQuery(method){
    navigate(`/${method}/${object}/${selected}`);
  }

    const collection = getcollection(object);
    const list = ListofItems(collection,0)
    const field = Object.keys(collection[0])[0];
    const [selected,setselected] = useState(0);
    return(
      <div>
          <label className='query'><h2>Choose {object}</h2>
            <select value={selected} onChange={(e)=>setselected(e.target.value)}>
                {list.map((item,index)=><option value={index}>{item}</option>)}
            </select>
            </label>
            <div style={{display:"flex",flexDirection:"row",gap:"10px",justifyContent:"center",padding:"10px"}}>
            <button onClick={()=>{sendQuery('display')}}>View</button><button onClick={()=>{sendQuery('update')}}>Update</button><button onClick={()=>{navigate(`/deactivate/${object}/${selected}/`)}}>Deactivate</button>
            </div>
            <p style={{textAlign:"center"}}>Or, <button onClick={()=>{navigate(`/create/${object}`)}}>Create {object}</button></p>
      </div>
       
    )
}

function DeleteQuery(){
    const navigate = useNavigate();
    const {object,id} = useParams();
    const collection = objects[object]['collection'];
    const existingdata = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];
    
    function deactivate(){
        const newdata = existingdata.filter((item,index)=>index!=id)
        saveData(newdata,collection);
        alert(`${object} Deleted!`);
        navigate(`/query/${object}`)
    }
    return(
        <div>
        <h2>Deactivate {object}</h2>
        <p>Are you sure want to deactivate {object} {id}</p>
        <div>
            <button onClick={()=>{navigate(`/query/${object}`)}}>Cancel</button>
            <button onClick={deactivate}>Delete</button>
        </div>
        </div>
    )
}

function Record(){
    const navigate = useNavigate();
    return (
        <div className='manage'>
        <div className='title'><h3>Record</h3></div>
            <div className='object'>
                <h3 onClick={()=>navigate(`/viewrecord`)}>View</h3>
            </div>
            <div className='object'>
                <h3 onClick={()=>navigate(`/transaction`)}>Transaction</h3>
            </div>
        </div>
    )
}

export function Transaction(){
    const navigate = useNavigate()
    const collection = transactions['collection']
    const schema = transactions['schema']
    const usestates = {}
    schema.map(item=>usestates[item['name']]=item['use-state'])

    const existingdata = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];

    const defaults = usestates;

    function sendObject(e,data){
        let datapack;
        datapack = [...existingdata,data];
        saveData(datapack,collection);
        
    }
    return(
        <div className='display'>
        <h2 style={{textAlign:'center'}}>Record a Transaction</h2>
        <Create schema={schema} defaults={defaults} collection={collection} send={sendObject}/>
        <button onClick={()=>{navigate("/viewrecord")}}>View</button>
        <button onClick={()=>{navigate("/")}}>Home</button>
        </div>
    )
}

function QueryRecord(){
    const navigate = useNavigate();

  function sendQuery(){
    navigate('/viewrecord/'+selected);
  }

    const collection = loadData('transactions');
    const list = ListofItems(collection,2)
    const field = Object.keys(collection[0])[0];
    const [selected,setselected] = useState(0);
    return(
      <div>
        <form onSubmit={sendQuery}>
          <label className='query'><h2>Choose Transaction</h2>
            <select value={selected} onChange={(e)=>setselected(e.target.value)}>
                {list.map((item,index)=><option value={index}>{item}</option>)}
            </select>
            </label>
            <input type="submit"/>
        </form>
      </div>
       
    )
}

function ViewRecord(){
    const navigate = useNavigate()
    const {id} = useParams()
    const collection = 'transactions'
    const schema = transactions['schema']
    const usestates = {}
    schema.map(item=>usestates[item['name']]=item['use-state'])

    const existingdata = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];

    const defaults = existingdata[id];
    function sendObject(e,data){
        alert('This is view only!')
    }

    return(
        <div>
        <QueryRecord/>
        <Create schema={schema} defaults={defaults} collection={collection} send={sendObject}/>
        <button onClick={()=>{navigate("/record")}}>Record</button>
        <button onClick={()=>{navigate("/")}}>Home</button>
        </div>
    )
}



function Reports(){

    const navigate = useNavigate();
    return(
    <div className='manage'>
    <div className='title'><h3>Reports</h3></div><div className='object'>
    <h3 onClick={()=>{navigate(`/assets`)}}>Assets</h3>
    </div>
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
      <Route path='/control' element={<Control/>}/>
      <Route path='/record' element={<Record/>}/>
      <Route path="/transaction" element={<Transaction/>}/>
      <Route path="/viewrecord" element={<QueryRecord/>}/>
      <Route path="/viewrecord/:id" element={<ViewRecord/>}/>
      <Route path='/reports' element={<Reports/>}/>
      <Route path="/assets" element={<Assets/>}/>
      <Route path='/query/:object/' element={<Query/>}/>
      <Route path='/create/:object/' element={<ObjectUI method={"Create"}/>}/>
      <Route path='/update/:object/:id' element={<ObjectUI method={"Update"}/>}/>
      <Route path='/display/:object/:id' element={<ObjectUI method={"Display"}/>}/>
      <Route path='/deactivate/:object/:id' element={<DeleteQuery/>}/>
    </Routes>
    </div>
    </BrowserRouter>
    </div>
  )
}

export default App;