import { useState, useEffect} from 'react';
import { collection, loadData, saveData } from './scripts.js';
import { Link, useParams } from 'react-router-dom';
import { Display, objects } from './Objects.jsx';

export function Transaction(){

    const [masterdata,setmaster] = useState({
        "Header Data":{},
        "Line Data":[]
    })

    const headerdata = [
        {"name": "Posting Date", "input":"input","type":"date", "use-state":0},
        {"name": "Entry Date", "input":"input","type":"date", "use-state":0}
    ]

    

    

    const [header,setheader] = useState({
        "Posting Date":0,
        "Entry Date":0
    })



    function headerchange(field,e){
        const {value} = e.target
        setheader(prevdata=>({
            ...prevdata,
            [field]:value
        }))
    }

    const details = [
        {"name": "Name", "input":"input","type":"text", "use-state":"", "placeholder":"Name"},
        {"name": "Age", "input":"input","type":"number", "use-state":""},
        {"name": "Salary", "type":"number", "input":"input","use-state":""},
        {"name": "Gender", "type":"number", "input":"option","use-state":"Male", "options":["Male","Female"]},
        {"name": "Favourite Cricketer", "type":"number", "input":"option","use-state":"Sachin", "options":["Aravind", "Dhoni", "Sachin"]}
    ]

    const list = [
        {"id":0,"Name":"","Age":0, "Salary":0, "Gender":"Male","Favourite Cricketer":"Dhoni"}
    ]

    const [data,setdata] = useState(list)

    function addItem(){
        let id = data.length;
        let datapack = {"id":id}
        details.map(item=>datapack[item.name] = item["use-state"])
        setdata([...data,datapack])
    }

    function handlechange(field,e,id){
        const {value} = e.target
        const olditem = data.filter(item=>item["id"]===id)[0];
        const newitem = {...olditem,[field]:value}
        const newdata = data.map((item)=>(item.id===id ? newitem : item))
        setdata(newdata)
    }


        /*return(
            <>
            <InputRow collection={header} structure={headerdata} onchange={headerchange}/>
            <MultipleEntry collection={data} structure={details} onchange={handlechange} addfunction={addItem}/>
            <p>{JSON.stringify(header)}</p>
            <p>{JSON.stringify(data)}</p>
            <p>{JSON.stringify(masterdata)}</p>
            <Create/>
            </>
        )*/

            return(
                <>
                <Create/>
                </>
            )

}

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


function Create(){

    const [masterdata,setmaster] = useState({
        "Name":{
            "First":"Aravind",
            "Second":"C Pradeep"
        },
        "Age":28,
        "BankAccounts":[
            {"id":0,"Bank":"SBI","Branch":"Karunagappally"}
        ],
        "Gender":"Male"
    })

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

    const schema = [
        {"name": "Name", "datatype":"object", "structure":[{"name": "First", "input":"input","type":"text", "use-state":""},{"name": "Second", "input":"input","type":"text", "use-state":""}]},
        {"name": "Age", "input":"input","datatype":"single", "type":"text", "use-state":""},
        {"name": "BankAccounts", "datatype":"collection", "structure":[{"name": "Bank", "input":"input","type":"text", "use-state":""},{"name": "Branch", "input":"input","type":"text", "use-state":""}]},
        {"name": "Gender", "input":"option", "datatype":"single", "options":["Male","Female"], "use-state":"Male"},
    ]

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





