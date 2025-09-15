import { useState} from 'react';
import { collection, loadData, saveData } from './scripts.js';
import { Link, useParams } from 'react-router-dom';

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

function ObjectNavigation({Object}){
    const menus = [
        {"name":"Create","method":"/CreateObject/"},
        {"name":"Display","method":"/DisplayObject/"},
        {"name":"Update","method":"/UpdateObject/"},
        {"name":"Delete","method":"/DeleteObject/"},
    ]
    return(
        <div className='objectNavigation'>
            {menus.map((menu)=><div className='menu-cell'><Link to={`${menu.method}${Object}`}>{menu.name}</Link></div>)}
        </div>
    )
}

export function CreateObject(){

    let {Object} = useParams()
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
    },
    "Asset": {
        "name":"Asset",
        "fields":[
            {"field":"Name","type":"text", "use-state":""},
            {"field":"Asset Class","type":"text", "use-state":""},
            {"field":"Useful Life","type":"number", "use-state":0},
        ],
        "collection":"assets"
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
        <div>
        <ObjectNavigation Object={Object}/>
        <form onSubmit={submitobject} className='createobject'>
            <h2>Create {objectdata.name}</h2>
            {objectdata.fields.map((field)=><label>{field.field}<input name={field.field} value={inputdata[field.field]} type={field.type} onChange={handlechange}/></label>)}
            <input className="submitObject" type="submit"/>
        </form>
        </div>
    )
}

export function DisplayObjects(){
    const {Object} = useParams();

    const collection = loadData(Object);

    return(
        <p>{JSON.stringify(collection)}</p>
    )
}
