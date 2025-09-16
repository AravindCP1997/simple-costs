import { useState} from 'react';
import { collection, loadData, saveData } from './scripts.js';
import { Link, useParams } from 'react-router-dom';

export const objects = {
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

    },
    "Employee":{
        "name": "Employee",
        "fields":[
            {"field":"Badge","type":"text", "use-state":""},
            {"field":"Name","type":"text", "use-state":""},
            {"field":"Cost Center","type":"text", "use-state":""},
            {"field":"Designation","type":"text", "use-state":""}
        ]
    },
    "Cost Center":{
        "name":"Cost Center",
        "fields":[
            {"field":"Name","type":"text", "use-state":""},
            {"field":"Profit Center","type":"text", "use-state":""},
            {"field":"Apportionment Ratio","type":"text", "use-state":""},
        ],
        "collection":"costcenters"
    }
}

function ObjectNavigation({Object}){
    const menus = [
        {"name":"Create","method":"/CreateObject/"},
        {"name":"Display","method":"/DisplayObject/"},
        {"name":"Update","method":"/DisplayObject/"},
        {"name":"Delete","method":"/DisplayObject/"},
    ]
    return(
        <div className='objectNavigation'>
            <div className='menu-cell'><Link to="/">Home</Link></div>
            {menus.map((menu)=><div className='menu-cell'><Link to={`${menu.method}${Object}`}>{menu.name}</Link></div>)}
        </div>
    )
}

export function CreateObject(){

    let {Object} = useParams()

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
    const fields = objects[Object].fields;

    const collection = loadData(objects[Object]['collection']);

    return(
        <div>
        <ObjectNavigation Object={Object}/>
        <Display collection={collection} structure={fields}/>
        </div>
    )
}

export function DisplayObject(){

    const {Object} = useParams()
    const collection = loadData(objects[Object]['collection'])
    const fields = objects[Object]['fields']
    const [out,setout] = useState([])

    const [id,setid] = useState();
    function changeid(e){
        setid(e.target.value)
    }

    function getObject(e){
        e.preventDefault()
        setout(collection.filter(item=>item.Name === id))
    }

    return(
        <div>
        <ObjectNavigation Object={Object}/>
        <QueryObject object={Object} onsubmit={getObject} onchange={changeid} idvalue={id}/>
        <Display collection={out} structure={fields}/>
            </div>

    )
}

function QueryObject({object,onsubmit,onchange,idvalue}){
    return(
        <form onSubmit={onsubmit}>
        <label>Display {object} 
        <input type="text" value={idvalue} onChange={onchange}/>
        </label>
        <input type="submit"/>
        </form>
    )

}

export function Display({collection,structure}){
    return(
        <div className='displayCollection'>
           {collection.map((item)=><div className='display-item'>{structure.map((fieldname)=><div className='display-data'><div className='display-field'>{fieldname.field}</div><div className='object-field'>{item[fieldname.field]}</div></div>)}</div>)} 
        </div>
    )
}
