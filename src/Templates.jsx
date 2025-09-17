import { useState, useEffect} from 'react';
import { collection, loadData, saveData } from './scripts.js';
import { Link, useParams } from 'react-router-dom';


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
                break;
            case 'Create':
                datapack = [...existingdata,data];
                saveData(datapack,collection);
                break;
            case 'Delete':
                datapack = existingdata.filter((item,index)=>index!=Id)
                saveData(datapack,collection);
                break;
            default:
                alert('Please put a method in the query')
        }

        
    }
    return(
        <>
        <Create schema={schema} defaults={defaults} collection={collection} send={sendObject}/>
        </>
    )
}





