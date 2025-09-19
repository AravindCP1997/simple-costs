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
            {"name": "Useful Life", "datatype":"single", "input":"input", "type":"number","use-state":0}
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
        {"name": "Currency", "datatype":"single", "input":"option", "options":["INR", "USD","MYR"], "use-state":"INR"},
        {"name": "Line Items", "datatype":"collection", "structure":
            [
                {"name":"General Ledger","input":"option","options":ListofItems(loadData('assets'),0)},
                {"name":"Amount","input":"input","type":"number"}
            ],
            "use-state":[{"id":0,"General Ledger":"Plant and Machinery","Amount":"False"}]}
    ]
}


export function ObjectNavigation({Object}){
    const menus = [
        {"name":"Display","method":"Display"},
        {"name":"Update","method":"Update"},
        {"name":"Delete","method":"Delete"},
    ]
    return(
        <div className="navigation">
            <div className='menu-cell'><Link to="/">Home</Link></div>
            <div className='menu-cell'><Link to={"/create/"+Object}>Create</Link></div>
            {menus.map((menu)=><div className='menu-cell'><Link to={`/query/${Object}/${menu.method}`}>{menu.name}</Link></div>)}
        </div>
    )
}


function GenerateInput({item,k,value,onthischange,label}){
    return(
        <>
            <label className='input'>{label && item['name']}{item['input']==="input"&&<input key={k} value={value} onChange={onthischange} type={item['type']}/>}{item['input']==="option"&&<select key={k} value={value} onChange={onthischange}>{item['options'].map((option)=><option value={option}>{option}</option>)}</select>}</label>
        </>
    )
}

function InputRow({collection,structure,onchange,fieldname}){
    return(
        <>
        <label>{fieldname}</label>
            <div className='row'>{structure.map((field,i)=><GenerateInput item={field} k={i} data-fieldname={fieldname} value={collection[field['name']]} onthischange={(e)=>onchange(fieldname,field['name'],e)} label={true}/>)} </div>
        </>
    )
}

export function MultipleEntry({collection,fieldname,structure,onchange,addfunction}){
    return(
        <>
        <label>{fieldname}</label>
        <div className='row'>{structure.map(field=><label>{field['name']}</label>)}</div>
        <div className='row'>{collection.map((item,index)=><>{structure.map(field=><GenerateInput item={field} k={index} value={collection[index][field['name']]} label={false} onthischange={(e)=>onchange(fieldname,index,field['name'],e)}/>)}</>)}</div>
        <button onClick={addfunction}>Add</button>
        </>
    )
}



function Create({schema,defaults,collection,id,send}){


    const [masterdata,setmaster] = useState(defaults)

    function addToList(list,structure,defaults,e){
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
    
    
    const original = loadData(collection);

    function submitObject(e){
        send(e,masterdata)
    }

    return(
        <div className='objectDisplay'>
        {schema.map(field=>
        <div className='objectField'>
            {field['datatype']==="single"&&<GenerateInput label={true} item={field} k={0} value={masterdata[field['name']]} onthischange={(e)=>singlechange(field['name'],e)}/>}
            {field['datatype']==="object"&&<InputRow collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} onchange={objectchange} />}
            {field['datatype']==="collection"&&<MultipleEntry collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} addfunction={(e)=>addToList(field['name'],field['structure'],field['use-state'][0],e)} onchange={collectionchange}/>}
            
            </div>)}
            <button onClick={(e)=>submitObject(e)}>Submit</button>
        </div>
    )
}

export function Update(){
    const navigate = useNavigate()

    const {Object,Method,Id} = useParams()
    const collection = objects[Object]['collection']
    const schema = objects[Object]['schema']
    const usestates = {}
    schema.map(item=>usestates[item['name']]=item['use-state'])

    const existingdata = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];

    const defaults = (Method==="Create") ? usestates : existingdata[Id];

    function sendObject(e,data){
        let datapack;
        switch (Method) {
            case 'Update':
                datapack = existingdata.map((item,index)=>(index==Id)?data:item);
                saveData(datapack,collection);
                alert(`${Object} Updated!`)
                break;
            case 'Create':
                datapack = [...existingdata,data];
                saveData(datapack,collection);
                alert(`${Object} Created!`)
                break;
            case 'Delete':
                datapack = existingdata.filter((item,index)=>index!=Id)
                saveData(datapack,collection);
                alert(`${Object} Deleted!`)
                break;
            default:
                alert('Please put a method in the query')
        }
        navigate(`/query/${Object}/${Method}`)
        

        
    }
    return(
        <div className='display'>
        <ObjectNavigation Object={Object}/>
        <Create schema={schema} defaults={defaults} collection={collection} send={sendObject}/>
        </div>
    )
}

export function CreateObject(){
    const {Object} = useParams()
    const collection = objects[Object]['collection']
    const schema = objects[Object]['schema']
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
        <ObjectNavigation Object={Object}/>
        <Create schema={schema} defaults={defaults} collection={collection} send={sendObject}/>
        </div>
    )
}

export function Record(){
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
        <Create schema={schema} defaults={defaults} collection={collection} send={sendObject}/>
        </div>
    )
}

export function Manage(){

  const list = Object.keys(objects)
  
  return(
    <div className='manage'>
      <div className='title'><h3>Manage</h3></div>
      {list.map(item=><div className='object'>
        <h3>{item}</h3>
        <div className='operations'>
            <Link to={`/create/${item}`}>Create</Link>
            <Link to={`/query/${item}/Display`}>Display</Link>
            <Link to={`/query/${item}/Update`}>Update</Link>
            <Link to={`/query/${item}/Delete`}>Delete</Link>
            </div>
        </div>)}
    </div>
  )
}






function Menu({Menu,list}){
  return(
    <div className='menu'>
      <div className='cell'><h2>{Menu}</h2></div>
      {list.map(item=><div className='cell'><Link to="/">{item}</Link></div>)}
      <div className="cell"><Link to="/">Home</Link></div>
    </div>
  )
}



function Home(){

  return(
    <div className='home'>
      <h1 className='title'>Simple Costs<sup>&reg;</sup></h1>
    <div className='actions'>{}
      <div className='cell'><Link to="/record">Record</Link></div>
      <div className='cell'><Link to="/manage">Manage</Link></div>
      <div className='cell'><Link to="/reports">Reports</Link></div>
    </div>
    </div>
  )
}

function Query(){
  const {object,method} = useParams()
  const navigate = useNavigate();

  function sendQuery(){
    navigate('/updateobject/'+object+'/'+method+'/'+selected);
  }

    const collection = getcollection(object);
    const list = ListofItems(collection,0)
    const field = Object.keys(collection[0])[0];
    const [selected,setselected] = useState(0);
    return(
      <div>
        <ObjectNavigation Object={object}/>
        <form onSubmit={sendQuery}>
          <label className='query'><h2>Choose {object}</h2>
            <select value={selected} onChange={(e)=>setselected(e.target.value)}>
                {list.map((item,index)=><option value={index}>{item}</option>)}
            </select>
            </label>
            <input type="submit"/>
        </form>
      </div>
       
    )
}

function DisplayAsTable(collection){
    const fields = Object.keys(collection[0]);

    return (
        <div className='table'>
            <div className='row'>{fields.map(field=><div className='cell'><p>{field}</p></div>)}</div>
            {collection.map(data=><div className='row'>{fields.map(field=><div className='cell'><p>{data[field]}</p></div>)}</div>)}
        </div>
    )
}

function App(){
  return(
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/manage' element={<Manage/>}/>
      <Route path='/record' element={<Record/>}/>
      <Route path='/reports' element={<Menu Menu={"Reports"} list={["Trial Balance","Financial Statements","Cost Statements"]}/>}/>
      <Route path='/create/:Object' element={<CreateObject/>}/>
      <Route path='/query/:object/:method' element={<Query/>}/>
      <Route path='/updateobject/:Object/:Method/:Id' element={<Update/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App;