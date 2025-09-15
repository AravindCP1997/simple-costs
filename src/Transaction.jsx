import { useState } from 'react';
import { Date, SubmitButton, Description } from './Template.jsx';
import { collection, loadData, saveData } from './scripts.js';

export function Purchase(){

    const [data,setdata] = useState({
        pdate : 0,
        desc : ''
    }
    )
    
    function submitform(){
        alert(JSON.stringify(data));
    }

    function handlechange(e){
        const {name,value} = e.target;
        setdata(prevdata=>({
            ...prevdata,
            [name]: value
        }));
    }

    return(
        <form onSubmit={submitform}>
            <Date n="pdate" v={data.pdate} f={handlechange} l={'Posting Date'}/>
                <Description name="desc" v={data.desc} f={handlechange} l={'Description'} n='desc'/>

            <SubmitButton/>
        </form>

    )
}


export function CreateObject({Object}){
    const objects = {
    "Asset Class": {
        "name":"Asset Class",
        "fields":[
            {"field":"Name","type":"text", "use-state":""},
            {"field":"General Ledger","type":"text","use-state":""}    ,
            {"field":"Depreciation Ledger","type":"text","use-state":""}
        ],
        "use-state":{
            "Name":"",
            "General Ledger":"",
            "Depreciation Ledger": ""
        },
        "collection":"assetclasses"
    }
}

    const objectdata = objects[Object];
    const defaults = {}
    objectdata.fields.map((field)=>defaults[field.field] = field["use-state"])
    const [inputdata,setinputdata] = useState(defaults)

    function handlechange(e){
        const {name,value} = e.target;
        setinputdata(prevdata=>({
            ...prevdata,
            [name]: value
        }));
    }

    
    const original = loadData(objectdata.collection)


    function submitobject(){
        original.push(inputdata)
        saveData(original,objectdata.collection)
        alert(JSON.stringify(original))
    }
    return(
        <form onSubmit={submitobject}>
            <h2>Create {objectdata.name}</h2>
            {objectdata.fields.map((field)=><label>{field.field}<input name={field.field} value={inputdata[field.field]} type={field.type} onChange={handlechange}/></label>)}
            <input type="submit"/>
        </form>
    )
}
