import { useState, useEffect} from 'react';
import { collection, loadData, saveData } from './scripts.js';
import { Link, useParams } from 'react-router-dom';


function GenerateInput({item,k,value,onthischange}){
    return(
        <>
            <div>{item['input']==="input"&&<input key={k} value={value} onChange={onthischange} type={item['type']}/>}{item['input']==="option"&&<select key={k} value={value} onChange={onthischange}>{item['options'].map((option)=><option value={option}>{option}</option>)}</select>}</div>
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
            {"name": "Name", "datatype":"single", "input":"input", "type":"text"},
            {"name": "Asset Class", "datatype":"single", "input":"option", "options":["Plant & Machinery", "Computer & Accessories"]},
            {"name": "Useful Life", "datatype":"single", "input":"input", "type":"number"},
            {"name": "Transactions", "datatype":"object", "structure":[{"name":"year","input":"input","type":"date"}]}
        ],
        "use-state":{
            "Name":"",
            "Asset Class":"",
            "Useful Life":3,
            "Transactions":{
                "year":""
            }
        }
    }
}


function Create({Object}){

    const schema = objects[Object]["schema"]

    /*const [masterdata,setmaster] = useState({
        "Name":{
            "First":"Aravind",
            "Second":"C Pradeep"
        },
        "Age":28,
        "BankAccounts":[
            {"id":0,"Bank":"SBI","Branch":"Karunagappally"}
        ],
        "Gender":"Male"
    })*/

        const [masterdata,setmaster] = useState(objects[Object]["use-state"])

    function addToList(list,structure,e){
        e.preventDefault;
        let data = {};
        const oldlist = masterdata[list];
        data['id'] = oldlist.length;
        structure.map(item=>data[item['name']] = item['use-state'])
        const newlist = [...oldlist,data]
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

    /*const schema = [
        {"name": "Name", "datatype":"object", "structure":[{"name": "First", "input":"input","type":"text", "use-state":""},{"name": "Second", "input":"input","type":"text", "use-state":""}]},
        {"name": "Age", "input":"input","datatype":"single", "type":"text", "use-state":""},
        {"name": "BankAccounts", "datatype":"collection", "structure":[{"name": "Bank", "input":"input","type":"text", "use-state":""},{"name": "Branch", "input":"input","type":"text", "use-state":""}]},
        {"name": "Gender", "input":"option", "datatype":"single", "options":["Male","Female"], "use-state":"Male"},
    ]*/

    return(
        <div>
        {schema.map(field=>
        <div>
            {field['datatype']==="single"&&<GenerateInput item={field} k={0} value={masterdata[field['name']]} onthischange={(e)=>singlechange(field['name'],e)}/>}
            {field['datatype']==="object"&&<InputRow collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} onchange={objectchange} />}
            {field['datatype']==="collection"&&<MultipleEntry collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} addfunction={(e)=>addToList(field['name'],field['structure'],e)} onchange={collectionchange}/>}
            </div>)}
            <p>{JSON.stringify(masterdata)}</p>
        </div>
    )
}

export function Transaction(){
    return(
        <Create Object={"Asset"}/>
    )
}





