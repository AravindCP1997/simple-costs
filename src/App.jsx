import './App.css'
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { collection, loadData, saveData } from './scripts.js';

const objects = {
    "Asset":{
        "name":"Asset",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Asset Class", "datatype":"single", "input":"option", "options":["Plant & Machinery", "Computer & Accessories"],"use-state":"Computer & Accessories"},
            {"name": "Useful Life", "datatype":"single", "input":"input", "type":"number","use-state":0},
            {"name": "Transactions", "datatype":"collection", "structure":[{"name":"Year","input":"input","type":"date"},{"name":"Deleted","input":"option","options":['True','False']}],"use-state":[{"id":0,"Year":0,"Deleted":"False"}]}
        ],
        "collection":'assets'
    },
    "Employee":{
        "name":"Employee",
        "schema": [
            {"name": "Name", "datatype":"object", "structure":[{"name":"First Name", "input":"input", "type":"text"},{"name":"Second Name", "input":"input", "type":"text"}], "use-state":{"First Name":"Aravind", "Second Name":"C Pradeep"}},
            {"name": "Age", "datatype":"single", "input":"input", "type":"number", "use-state":"26"},
            {"name": "Bank Accounts", "datatype":"collection", "structure":[{"name":"Bank", "input":"input", "type":"text"},{"name":"IFSC", "input":"input", "type":"text"}],"use-state":[{"id":0,"Bank":"SBI","IFSC":"SBIN0070056"}]},
            {"name": "Transactions", "datatype":"collection", "structure":[{"name":"Year","input":"input","type":"date"},{"name":"Deleted","input":"option","options":['True','False']}],"use-state":[{"id":0,"Year":0,"Deleted":"False"}]}
        ],
        "collection":'employees'
    },
    "Profit Center":{
        "name":"Profit center",
        "schema":[
            {"name": "Center", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Segment", "datatype":"single", "input":"input", "type":"text", "use-state":""},
        ],
        "collection":"profitcenters"
    }
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

export function ObjectInfo(){
    const {Object} = useParams()
    const collections = (Object in localStorage) ? JSON.parse(localStorage.getItem(Object)) : []
    return(
        <div className='objectInfo'>
            <h2>Overview of Class - {Object}</h2>
            <ObjectNavigation Object={Object}/>
            <p>Current Number of {Object} is {collections.length}</p>
            
        </div>
    )
}


function GenerateInput({item,k,value,onthischange}){
    return(
        <>
            <label>{item['name']}: {item['input']==="input"&&<input key={k} value={value} onChange={onthischange} type={item['type']}/>}{item['input']==="option"&&<select key={k} value={value} onChange={onthischange}>{item['options'].map((option)=><option value={option}>{option}</option>)}</select>}</label>
        </>
    )
}

function InputRow({collection,structure,onchange,fieldname}){
    return(
        <>
            <div className='row'>{structure.map((field,i)=><GenerateInput item={field} k={i} data-fieldname={fieldname} value={collection[field['name']]} onthischange={(e)=>onchange(fieldname,field['name'],e)}/>)} </div>
        </>
    )
}

export function MultipleEntry({collection,fieldname,structure,onchange,addfunction}){
    return(
        <>
        <div className='row'>{collection.map((item,index)=><>{structure.map(field=><GenerateInput item={field} k={index} value={collection[index][field['name']]} onthischange={(e)=>onchange(fieldname,index,field['name'],e)}/>)}</>)}</div>
        <button onClick={addfunction}>Add</button>
        </>
    )
}



function Create({schema,defaults,collection,id,send}){

    /*const schema = objects[Object]["schema"]

    const defaults = {}
    schema.map(item=>defaults[item['name']]=item['use-state'])*/

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
        <div>
        {schema.map(field=>
        <div>
            {field['datatype']==="single"&&<GenerateInput item={field} k={0} value={masterdata[field['name']]} onthischange={(e)=>singlechange(field['name'],e)}/>}
            {field['datatype']==="object"&&<InputRow collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} onchange={objectchange} />}
            {field['datatype']==="collection"&&<MultipleEntry collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} addfunction={(e)=>addToList(field['name'],field['structure'],field['use-state'][0],e)} onchange={collectionchange}/>}
            
            </div>)}
            <p>{JSON.stringify(masterdata)}</p>
            <button onClick={(e)=>submitObject(e)}>Submit</button>
        </div>
    )
}

export function Transaction(){
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
        <div>
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
        <div>
        <ObjectNavigation Object={Object}/>
        <Create schema={schema} defaults={defaults} collection={collection} send={sendObject}/>
        </div>
    )
}

export function Manage(){

  const list = Object.keys(objects)
  
  return(
    <div className='manage'>
      <div><h2>Manage</h2></div>
      {list.map(item=><div className='object'>
        <h3>{item}</h3>
        <div className='operations'>
            <Link to={`/create/${item}`}>Create</Link>
            <Link to={`/query/${item}/Display`}>Display</Link>
            <Link to={`/query/${item}/Update`}>Update</Link>
            <Link to={`/query/${item}/Delete`}>Delete</Link>
            
        </div>
        </div>)}
      <div className="cell"><Link to="/">Home</Link></div>
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
      <div className='cell'><Link to="/manage">Manage</Link></div>
      <div className='cell'><Link to="/record">Record</Link></div>
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

    const collection = loadData(objects[object]['collection']);
    const [selected,setselected] = useState(0);
    return(
      <div>
        <ObjectNavigation Object={object}/>
        <form onSubmit={sendQuery}>
          <label>Choose {object}: 
            <select value={selected} onChange={(e)=>setselected(e.target.value)}>
              {collection.map((item,index)=><option value={index}>{item['Name']}</option>)}
            </select>
            </label>
            <input type="submit"/>
        </form>
      </div>
        
    
    )
}




function App(){
  return(
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/manage' element={<Manage/>}/>
      <Route path='/record' element={<Menu Menu={"Record"} list={["Purchase","Sale", "Cost Transfer"]}/>}/>
      <Route path='/reports' element={<Menu Menu={"Reports"} list={["Trial Balance","Financial Statements","Cost Statements"]}/>}/>
      <Route path='/object/:Object' element={<div><ObjectInfo/></div>}/>
      <Route path='/create/:Object' element={<CreateObject/>}/>
      <Route path='/query/:object/:method' element={<Query/>}/>
      <Route path='/updateobject/:Object/:Method/:Id' element={<Transaction/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App;