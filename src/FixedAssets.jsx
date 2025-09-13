import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function CreateClass(){
    
    const [GL,setGL] = useState('');
    const [depreciable,setdepreciable] = useState(false);
    const [classes,setclasses] = useState([])

    useEffect(()=>{
    ('classes' in localStorage) ? setclasses(JSON.parse(localStorage.getItem('classes'))) : null;
  },[])

  function submitClass(){
    let assetclass = {}
    assetclass['GL'] = GL;
    assetclass['depreciable'] = depreciable;
    classes.push(assetclass)
    localStorage.setItem('classes',JSON.stringify(classes))
  }
    
    return(
       <form>
        <h2>Create Asset Class</h2>
        <label>General Ledger
            <input type="text" value={GL} onChange={(e)=>{setGL(e.target.value)}}/>
        </label>
        <label>Depreciable
            <input type="text" value={depreciable} onChange={(e)=>{setdepreciable(e.target.value)}}/>
        </label>
       </form> 
    )
}

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
            <h2>Create Asset</h2>
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
    <div className="assetTable">
    <div className='row'>{assetfields.map((field)=><div className='cell'>{field}</div>)}</div>
    {fixedassets.map((asset)=><div className='row'>{assetfields.map((field)=><div className='cell'>{asset[field]}</div>)}</div>)}

    </div>
  )
}

function FixedAssets(){
    return(
        <>
        <CreateClass/>
        <CreateAsset/>
        <DisplayAssets/>
        </>
    )
}

export default FixedAssets