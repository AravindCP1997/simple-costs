import { useState} from 'react';
import { collection, loadData, saveData } from './scripts.js';
import { Link, useParams } from 'react-router-dom';

function ObjectNavigation({Object}){
    const menus = [
        {"name":"Create","method":"/CreateObject/"},
        {"name":"Display","method":"/DisplayObjects/"},
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
    },
    "Profit Center":{
        "name": "Profit Center",
        "fields": [
            {"field":"Name","type":"text", "use-state":""},
            {"field":"Segment","type":"text", "use-state":""},
        ],
        "collection":"profitcenters"

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

    const collections =
        {
            "Asset Class":"assetclasses",
            "Asset":"assets",
            "Profit Center":"profitcenters"
        }

    const collection = loadData(collections[Object]);

    return(
        <div>
        <ObjectNavigation Object={Object}/>
        {collection.map((item)=><p>{JSON.stringify(item)}</p>)}
        </div>
    )
}
