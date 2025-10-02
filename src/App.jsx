import './App.css'
import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { ListofItems, loadData, saveData, Intelli, Database, objects, SumField, SumFieldIfs, Company, ReportObject, singleFilter, listFilter, exclListFilter, rangeFilter, exclRangeFilter } from './script';

function CompanyInfo(){
    const [editable,seteditable] = useState(false)
    const company = new Company()
    const [data,setdata] = useState(company.data)
    const [status,setstatus] = useState(company.status)
    const initialise = ()=>{
        company.initialise()
        alert('Company Created')
        window.location.reload()
    }
    const newCompany = () =>{
        setstatus(true)
        seteditable(true)
    }

    function CreateCompany(){
        return (
            <div className='createCompany'>
                <h2>Welcome to Simple Cost!</h2>
                <div><button className='blue' onClick={()=>initialise()}>Quick Initialise</button> to set up a sample company.</div>
                <div>Or, Create a <button className='green' onClick={()=>newCompany()}>New Company</button></div>
            </div>
        )
    }

    const save = ()=>{
        Company.save(data)
        alert('Company Info Saved')
        window.location.reload()
    }

    const deleteCompany = () =>{
        Company.delete()
        alert('Company Deleted')
        window.location.reload()
    }

    if (status) {
    return(

        <div className='companyInfo'>
            <h2>Company Info</h2>
            <div className='companyDetail'><label>Name </label><input disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['Name']:e.target.value}))} value={data['Name']}/></div>
            <div className='companyDetail'><label>Beginning of Year 1 </label><input onChange={(e)=>setdata(prevdata=>({...prevdata,['Year 1 Start']:e.target.value}))} type="date" disabled={!editable} value={data['Year 1 Start']}/></div>
            <div className='companyDetail'><label>Reporting Date of Year 1 </label><input type="date" disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['Year 1 End']:e.target.value}))} value={data['Year 1 End']}/></div>
            <div>
                {editable && <button onClick={()=>seteditable(false)}>Cancel</button>}
                {editable && <button onClick={()=>save()}>Save</button>}
                {!editable && <button onClick={()=>seteditable(true)}>Edit</button>}
                {!editable && <button onClick={()=>deleteCompany()}>Delete Company</button>}
            </div>
        </div>
    )
} else {
    return(
        <CreateCompany/>
    )
}
}

function Query(){
  const {object} = useParams()
  const navigate = useNavigate();

  function objectQuery(method){
    navigate(`/${method}/${object}/${selected}`);
  }

    const collection = Database.load(object)
    const list = ListofItems(collection,0)
    const [selected,setselected] = useState(0);
    return(
      <div className='query'>
          <label className='queryTitle'><h2>Choose {object}</h2>
            <select className='querySelect' value={selected} onChange={(e)=>setselected(e.target.value)}>
                {list.map((item,index)=><option value={index}>{item}</option>)}
            </select>
            </label>
            <div className='queryButtons'>
            <button className="blue" onClick={()=>{objectQuery('display')}}>View</button><button className="blue" onClick={()=>{objectQuery('update')}}>Update</button><button className="red" onClick={()=>{navigate(`/deactivate/${object}/${selected}/`)}}>Deactivate</button>
            </div>
            <p style={{textAlign:"center"}}>Or, <button className="green" onClick={()=>{navigate(`/create/${object}`)}}>Create {object}</button></p>
      </div>
       
    )
}

function DeleteQuery(){
    const navigate = useNavigate();
    const {object,id} = useParams();
    const collection =objects[object]['collection']
    const existingdata = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];
    
    function deactivate(){
        Database.remove(object,id)
        alert(`${object} Deleted!`);
        navigate(`/control`)
    }
    
    return(
        <div className='query'>
        <h2 className='queryTitle'>{`Deactivate ${object}`}</h2>
        <p>Are you sure want to {`deactivate ${object} ${id}`} ?</p>
        <div className='queryButtons'>
            <button className="blue" onClick={()=>{navigate(`/query/${object}`)}}>Cancel</button>
            <button className="red" onClick={deactivate}>Deactivate</button>
        </div>
        </div>
    )
}

function SearchBar(){
    const navigate = useNavigate()
    const [url,seturl] = useState()
    function search(){
        navigate(url)
        seturl('');
    }

    const inputRef = useRef();

    const keyDownHandler = (e) =>{
        (e.ctrlKey && e.key === '/')?inputRef.current.focus():null;
    }
    
    useEffect(()=>{
        const handle = document.addEventListener('keydown',keyDownHandler);
        return ()=>{
            document.removeEventListener('keydown',handle)
        }
    },[])

    function changeUrl(e){
        seturl(e.target.value)
    }
    return(
        <div className='searchBar'>
            <button className="green" onClick={()=>navigate('/company')}>Company</button>
            <button className='red' onClick={()=>navigate(`/`)}>Home</button>
            <input type="text" value={url} ref={inputRef} onChange={changeUrl} placeholder="Go to . . ."/>
            <button className="green" onClick={search}>&rarr;</button>
        </div>
    )
}

function Stickey(){

    return(
        <div className='stickey'>
        </div>
    )
}

function Home(){
    const navigate = useNavigate();
  return(
    <div className='home'>
      <h1 className='title'>Simple Costs<sup className='reg'>&reg;</sup></h1>
    <div className='actions'>{}
      <div className='menu green' onClick={()=>navigate(`/record`)}><h2>Record</h2></div>
      <div className='menu red' onClick={()=>navigate(`/control`)}><h2>Control</h2></div>
      <div className='menu blue'  onClick={()=>navigate(`/reports`)}><h2>Reports</h2></div>
    </div>
    </div>
  )
}

export function Record(){

    const navigate = useNavigate();
  
  return(
    <div className='menuList'>
      <div className='menuTitle green'><h3>Record</h3></div>
      <div className='menuItem' onClick={()=>{navigate(`/query/Transaction`)}}><h3>View</h3></div>
      <div className='menuItem' onClick={()=>{navigate(`/create/Transaction`)}}><h3>Transaction</h3></div>
      <div className='menuItem' onClick={()=>{navigate(`/create/Transaction`)}}><h3>Salary</h3></div>
      <div className='menuItem' onClick={()=>{navigate(`/create/Transaction`)}}><h3>Depreciation</h3></div>
      <div className='menuItem' onClick={()=>{navigate(`/create/Transaction`)}}><h3>Cost Absorption</h3></div>
      <div className='menuItem' onClick={()=>{navigate(`/create/Transaction`)}}><h3>Cost Settlement</h3></div>
    </div>
  )
}

export function Control(){

    const navigate = useNavigate();
  const list = Object.keys(objects).filter(item=>item!=="Transaction")
  
  return(
    <div className='menuList'>
      <div className='menuTitle red'><h3>Control</h3></div>
      {list.map(item=><div className='menuItem'><h3 onClick={()=>{navigate(`/query/${item}`)}}>{item}</h3></div>)}
    </div>
  )
}

function Reports(){

    const navigate = useNavigate();
    return(
    <div className='menuList'>
    <div className='menuTitle blue'><h3>Reports</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/fixedassetsregister`)}}>Fixed Assets</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/reports`)}}>Financial Statements</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/reports`)}}>Cost Statement</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/reports`)}}>Form 16</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/scratch`)}}>Scratch</h3></div>
    </div>
    )
}



function DisplayAsTable({collection}){
    const fields = Object.keys(collection[0]);

    return (
        <div className='display'>
            <table className='displayTable'>
                <thead><tr>{fields.map(field=><th>{field}</th>)}</tr></thead>
                <tbody>{collection.map(data=><tr>{fields.map(field=><td>{data[field]}</td>)}</tr>)}</tbody>
            </table>
        </div>
    )
}

class ControlObject{
    constructor(name,data, schema){
        this.name = name;
        this.schema = schema || objects[this.name]['schema']
        this.collections = loadData(objects[this.name]['collection'])
        this.data = data || this.defaults();
        this.error = []
    }
    output(){
        let data = {...this.data}
        switch(this.name){
            case 'Employee':
                const birthdate = new Date(this.data['Date of Birth'])
                const today = new Date()
                const difference = today.getTime() - birthdate.getTime()
                const oneyear = 1000*60*60*24*365.25
                data['Age'] = Math.floor(difference/oneyear)
                const oldaccounts = this.data['Bank Accounts']
                const newaccounts = oldaccounts.map(account=>({...account,['Validated']:(account['Account Number']==account['Confirm Account Number'])?"Yes":"No"}))
                data['Bank Accounts'] = newaccounts
                break
            case 'Transaction':
                data['Balance'] = SumFieldIfs(this.data['Line Items'],"Amount",["Debit/ Credit"],["Debit"])-SumFieldIfs(this.data['Line Items'],"Amount",["Debit/ Credit"],["Credit"])
                const lineItems = this.data['Line Items']
                data['Line Items'] = lineItems.map(item=>({...item,['Cost Center']:(item['Account Type']=="Asset")?"":item['Cost Center']}))
        }
        return data;
    }
    validate(lineItem){
        (lineItem['Ledger Type']=="Asset")?lineItem['General Ledger']="Plant and Machinery":null
    }
    defaults(){
        const defaults = {}
        this.schema.map(item=>defaults[item['name']]=item['use-state']);
        return defaults;
    }
}

function FixedAssetsMaster(){
    return(
        <>
        <DisplayAsTable collection={new Intelli().fixedassetsregister()}/>
        </>
    )

}

function EmployeeRegister(){
    return(
        <>
        <DisplayAsTable collection={new Intelli().employeeregister()}/>
        </>
    )

}

function CRUD({method}){
    const navigate = useNavigate()
    const {object,id} = useParams()
    const [masterdata,setmaster] = (method==="Create")?useState(new ControlObject(object)):useState(new ControlObject(object,Database.load(object)[id]));
    const data = masterdata.output();
    const schema = masterdata.schema;

    const keyDownHandler = (e) =>{
        if (e.ctrlKey && e.key==='h'){
            e.preventDefault();
            navigate('/');
        }
    }

    useEffect(()=>{
        const handle = document.addEventListener('keydown',keyDownHandler);

        return ()=>{
            document.removeEventListener('keydown',handle)
        }
    },[])

    function createObject(){
        Database.add(object,data)
        alert(`${object} Created!`);
        cancel();
    }

    function updateObject(){
        Database.update(object,id,data)
        alert(`${object} Updated!`);
        cancel();
    }

    function cancel(){
        navigate(`/control`)
    }
    

    return(
        <div className='queryDisplay'>
            <h2 className='queryTitle'>{`${method} ${object}`}</h2>
        {schema.map(field=>
        <div className='queryField'>
        {field['value']=="calculated" && <div className="querySingle"><label>{field['name']}</label><input value={data[field['name']]} disabled={true}/></div>}
        {field['datatype']=="single" && <div className='querySingle'><label>{field['name']}</label>{ field['input'] == "input" && <input disabled={field['disabled']} type={field['type']} onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:e.target.value}))} value={data[field['name']]}/>}{field['input']=="option" && <select onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:e.target.value}))} value={data[field['name']]}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}</div>}
        {field['datatype']=="object" && <div><label>{field['name']}</label>{field['structure'].map(subfield=><>{subfield['datatype']=="single"&&<div className='querySingle'><label>{subfield['name']}</label>{subfield['input']=="input" && <input type={subfield['type']} onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:{...data[field['name']],[subfield['name']]:e.target.value}}))} value={data[field['name']][subfield['name']]} />}{subfield['input'] == "option" && <select onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:{...data[field['name']],[subfield['name']]:e.target.value}}))} value={data[field['name']][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}</div>}</>)}</div>}
        {field['datatype']=="collection" && <><label>{field['name']}</label><div className='queryTable'><table><thead><tr><th className='queryCell'></th>{field['structure'].map(subfield=><th className='queryCell'>{subfield['name']}</th>)}</tr></thead>{data[field['name']].map((item,index)=><tbody><tr><td className='queryCell'><button onClick={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:data[field['name']].filter((item,i)=>i!==index)}))}>-</button></td>{field['structure'].map(subfield=><>{subfield['datatype']=="single" && <td className='queryCell'>{subfield['value']=="calculated" && <input value={data[field['name']][index][subfield['name']]} disabled={true}/>} {subfield['input']=="input"&& <input className='queryCell' onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:data[field['name']].map((item,i)=>(i==index?{...item,[subfield['name']]:e.target.value}:item))}))} type={subfield['type']} value={data[field['name']][index][subfield['name']]}/>}{subfield['input']=="option" && <select onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:data[field['name']].map((item,i)=>(i==index?{...item,[subfield['name']]:e.target.value}:item))}))} value={data[field['name']][index][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}</td>}</>)}</tr></tbody>)}</table></div><div className="queryButtons"><button onClick={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:[...data[field['name']],{...field['use-state'][0],['id']:data[field['name']].length}]}))} className='blue'>Add</button></div></>}
        </div>)}
        <div className='queryButtons'>
            {method!="Display" && <button className='blue' onClick={cancel}>Cancel</button>}
            {method=="Display" && <button className='blue' onClick={cancel}>Back</button>}
            {method=="Create" && <button className='green' onClick={createObject}>Create</button>}
            {method=="Update" && <button className='blue' onClick={updateObject}>Update</button>}
        </div>
        </div>
)
}

function Scratch(){

    return(
        <>
        <DisplayAsTable collection={exclRangeFilter(new Intelli().transactionstable(),"Amount",[[0,1]])}/>
        </>
    )
}

function App(){
if (new Company().status){
  return(
    <div className='container'>
    <BrowserRouter>
    <SearchBar/>
    <div className="innerContainer">
    <Routes>
        <Route path="/company" element={<CompanyInfo/>}/>
      <Route path='/' element={<Home/>}/>
      <Route path='/record' element={<Record/>}/>
      <Route path='/control' element={<Control/>}/>
      <Route path='/reports' element={<Reports/>}/>
      <Route path='/query/:object/' element={<Query type={"Object"}/>}/>
      <Route path='/create/:object/' element={<CRUD method={"Create"}/>}/>
      <Route path='/update/:object/:id' element={<CRUD method={"Update"}/>}/>
      <Route path='/display/:object/:id' element={<CRUD  method={"Display"}/>}/>
      <Route path='/deactivate/:object/:id' element={<DeleteQuery type={"Object"}/>}/>
      <Route path="/fixedassetsregister" element={<FixedAssetsMaster/>}/>
      <Route path="/employeeregister" element={<EmployeeRegister/>}/>
      <Route path="/scratch/" element={<Scratch/>}/>
    </Routes>
    </div>
    </BrowserRouter>
    </div>
  )
} else {
    return(
        <div className='container'>
            <div className='innerContainer'>
                <CompanyInfo/>
            </div>
        </div>
    )
}
}

export default App;