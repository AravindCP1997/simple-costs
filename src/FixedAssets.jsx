import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';


function CreateAsset(){
    const [assetclass,setclass] = useState('')
    const [description,setdescription] = useState('')
    const [capdate,setcapdate] = useState(0)
    const [usefullife,setusefullife] = useState(0)
    const [salvagevalue,setsalvagevalue] = useState(0)
    const [itblock,setitblock] = useState('')
    const [itdep,setitdep] = useState(0)
    const [fixedassets,setfixedassets] = useState([])
    const assetdata = [
    {"field":"Asset Class","type":"text", "value":assetclass, "onchange":(e)=>{setclass(e.target.value)}},
    {"field":"Description","type":"text", "onchange":(e)=>{setdescription(e.target.value)}, "value":description},
    {"field":"Date of Capitalisation","type":"date", "onchange":(e)=>{setcapdate(e.target.value)}, "value":capdate},
    {"field":"Useful Life","type":"number", "onchange":(e)=>{setusefullife(e.target.value)}, "value":usefullife},
    {"field":"Salvage Value","type":"number", "onchange":(e)=>{setsalvagevalue(e.target.value)}, "value":salvagevalue},
    {"field":"Income Tax Depreciation Block","type":"text", "onchange":(e)=>{setitblock(e.target.value)}, "value":itblock},
    {"field":"Income Tax Depreciation Rate","type":"number", "onchange":(e)=>{setitdep(e.target.value)}, "value":itdep}
]

useEffect(()=>{
    ('fixedassets' in localStorage) ? setfixedassets(JSON.parse(localStorage.getItem('fixedassets'))) : null;
  },[])

function submitAsset(){
    let asset = {};
    assetdata.map((data)=>asset[data.field] = data.value);
    fixedassets.push(asset);
    localStorage.setItem('fixedassets',JSON.stringify(fixedassets))  
}
    return(
        <form>
            {assetdata.map((data)=><label>{data.field}<input type={data.type} value={data.value} onChange={data.onchange}/></label>)}
            <input type="submit" onClick={submitAsset}/>
        </form>
    )
}

function DisplayAssets(){
    const [fixedassets,setfixedassets] = useState([])
    
    useEffect(()=>{
    ('fixedassets' in localStorage) ? setfixedassets(JSON.parse(localStorage.getItem('fixedassets'))) : null;
  },[])

  const assetfields = ["Asset Class", "Description", "Date of Capitalisation", "Useful Life", "Salvage Value", "Income Tax Depreciation Block", "Income Tax Depreciation Rate"]

  return(
    <>
    <div className='row'>{assetfields.map((field)=><div className='cell'>{field}</div>)}</div>
    {fixedassets.map((asset)=><div className='row'>{assetfields.map((field)=><div className='cell'>{asset[field]}</div>)}</div>)}

    </>
  )
}

function FixedAssets(){
    return(
        <>
        <CreateAsset/>
        <DisplayAssets/>
        </>
    )
}

export default FixedAssets