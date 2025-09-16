import { useState, useEffect} from 'react';
import { collection, loadData, saveData } from './scripts.js';
import { Link, useParams } from 'react-router-dom';

export function InputField({field, f,v,s, i}){

    const fields = {
        "Posting Date" : {
            "name":"Posting Date",
            "t": "text",
            "r":true,
            "n":"pdate"
        },
        "Entry Date" : {
            "name":"Entry Date",
            "t": "date",
            "r":false,
            "n":"edate"
        }
    }

   
    return (
        <>
            <label>{fields[field]["name"]}
                <input type={fields[field]["t"]} key={i} sl={s} value={v} onChange={f} name={fields[field]["n"]} required={fields[field]["r"]}/>
                </label>
        </>
    )
}


export function Transaction(){

    const list = [
        {"id":0,"name":"Aravind","age":0}
    ]

    const [data,setdata] = useState(list)

    function addItem(){
        let id = data.length;
        setdata([...data,{"id":id,"name":'',"age":0}])
    }

    function handlechange(field,e,id){
        const {value} = e.target
        const olditem = data.filter(item=>item["id"]===id)[0];
        const newitem = {...olditem,[field]:value}
        const newdata = data.map((item)=>(item.id===id ? newitem : item))
        setdata(newdata)
    }

    return(
        <>
        {data.map((item,index)=><><input key={index} value={data[index].name} type="text" onChange={(e)=>handlechange("name",e,index)}/>
    <input key={index} value={data[index].age} type="number" onChange={(e)=>handlechange("age",e,index)}/></>)}
        <button onClick={addItem}>Add</button>
        <p>{JSON.stringify(data)}</p>
        </>
    )

}