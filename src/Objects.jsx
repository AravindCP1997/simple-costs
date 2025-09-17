import { useState} from 'react';
import { collection, loadData, saveData } from './scripts.js';
import { Link, useParams } from 'react-router-dom';

export function ObjectNavigation({Object}){
    const menus = [
        {"name":"Display","method":"Display"},
        {"name":"Update","method":"/updateobject/"},
        {"name":"Delete","method":"/deleteobject/"},
    ]
    return(
        <div className="navigation">
            <div className='menu-cell'><Link to="/">Home</Link></div>
            <div className='menu-cell'><Link to={"/create/"+Object}>Create</Link></div>
            {menus.map((menu)=><div className='menu-cell'><Link to={`/query/${Object}/${menu.method}`}>{menu.name}</Link></div>)}
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
