import './App.css'
import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { ListofItems, loadData, saveData, Database, objects, SumField, SumFieldIfs, Company, ReportObject, singleFilter, listFilter, exclListFilter, rangeFilter, exclRangeFilter } from './script';


function SuperRange(collection,range,from,to){
    const filtered = collection.filter(item=>item[from]<=range[0] && item[to]>=range[1])
    return filtered
}

function dayNumber(date){
    const time = new Date(date).getTime()
    const day = time/86400000
    return day
}

class Intelligence{
    constructor(){
    }
    loadCollection(object){
        const collection = objects[object]['collection']
        const data = loadData(collection)
        return data
    }
    search(collectionname,key,value,property){
        const collection = this.loadCollection(collectionname)
        const result = collection.filter(element=>element[key]==value)[0][property]
        return result
    }
    createLedgers(){
        const list = []
        const types = ['General Ledger','Asset']
        types.map(item=>this.loadCollection(item).map(subitem=>list.push({"Name":subitem['Name'],"Type":item})))
        return list
    }
    fixedassetsregister(){
        const register = this.assets.map(asset=>({...asset,['General Ledger']:this.search('Asset Class','Name',asset['Asset Class'],'General Ledger')}))
        return register
    }
    salary(period){
        const list = []
        const employees = this.loadCollection('Employee')
        employees.map(employee=>list.push({"Personnel No":employee['Name']['First Name']}))
        return list
    }
    transactionstable(){
        const data = Database.load('Transaction')
        const fields = ListofItems(objects['Transaction']['schema'],0).filter(item=>item!="Line Items")
        const table = []
        for (let i=0;i<data.length;i++) {
        const newdata = {}
        fields.map(field=>newdata[field] = data[i][field])
        data[i]['Line Items'].map(item=>table.push({...newdata,...item}))
        }
        return table
    }
}

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
      <div className='menuTitle'><h3>Record</h3></div>
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
      <div className='menuTitle'><h3>Control</h3></div>
      {list.map(item=><div className='menuItem'><h3 onClick={()=>{navigate(`/query/${item}`)}}>{item}</h3></div>)}
    </div>
  )
}

function Reports(){

    const navigate = useNavigate();
    return(
    <div className='menuList'>
    <div className='menuTitle'><h3>Reports</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/fixedassetsregister`)}}>Fixed Assets</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/reports`)}}>Financial Statements</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/reports`)}}>Cost Statement</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/reports`)}}>Form 16</h3></div>
    <div className='menuItem'><h3 onClick={()=>{navigate(`/scratch`)}}>Scratch</h3></div>
    </div>
    )
}

function Report(){
    
    const querySchema = {
    "Financial Statements":[
        {"field":"Cost Center"}
    ]
}

    const {report} = useParams()
    const schema = querySchema[report]
    const [query,setquery] = useState({"Name":"Aravind"})
    const [data,setdata] = useState({})

    const process = (query) =>{
        const data = query
        return data
    }

    function FinancialStatements(){
        return(
            <div>This is Financial Statements
                <p>{JSON.stringify(data)}</p>
            </div>
        )
    }
    
    
    function ReportQuery(){
        return(
            <div>
                <h2>{`This is ${report} Query Section`}</h2>
                <button onClick={()=>setdata(process(query))}>Submit</button>
            </div>
        )
    }

    function ReportDisplay(){
        if (data!=null){
            switch(report){
                case 'Financial Statements':
                    return(
                        <FinancialStatements/>
                    )
                default:
                    return (
                        <div>Report not found</div>
                    )
            }
        } else {
            return (
                <div>Report not found</div>
            )
        }
    }

    return(
        <div>
            <h1>{`${report}`}</h1>
            <ReportQuery/>
            <ReportDisplay/>
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

function CRUD({method}){
    const navigate = useNavigate()
    const {object,id} = useParams()
    const collection = objects[object]['collection']
    const collections = loadData(collection)
    const schema = objects[object]['schema']
    const defaults = {}
    schema.map(item=>defaults[item['name']]=item['use-state']);
    const [data,setdata] = (method==="Create")?useState(defaults):useState(collections[id])
    const output = process()
    const editable = (method==="Create" || method==="Update")?true:false
    const errorlist = findError()

    function findError(){
        const list = []
        switch(object){
            case 'Transaction':
                (output['Balance']!=0)?list.push("Balance not zero"):null
                output['Line Items'].map((item,index)=>(item['Amount']==0)?list.push(`At line item ${index}, amount is zero`):()=>{})
                break
            case 'Asset':
                (output['Date of Capitalisation']=="")?list.push("Enter Date of Capitalisation"):()=>{}
                ((new Date(output['Date of Capitalisation']))>(new Date()))?list.push("Date of capitalisation cannot be a future date."):()=>{}
                break
            case 'Employee' :
                output['Bank Accounts'].map((item,i)=>(item['Validated']=="No")?list.push(`Bank Account ${i+1} is not validated`):()=>{});
                ((new Date(output['Date of Birth']))>(new Date()))?list.push("Date of Birth cannot be a future date."):()=>{}
        }
        return list
    }
    
    function process(){
        const result = data
        switch(object){
            case 'Employee':
                const birthdate = new Date(data['Date of Birth'])
                const today = new Date()
                const difference = today.getTime() - birthdate.getTime()
                const oneyear = 1000*60*60*24*365.25
                result['Age'] = Math.floor(difference/oneyear)
                const oldaccounts = data['Bank Accounts']
                const newaccounts = oldaccounts.map(account=>({...account,['Validated']:(account['Account Number']==account['Confirm Account Number'])?"Yes":"No"}))
                result['Bank Accounts'] = newaccounts
                break
            case 'Transaction':
                result['Balance'] = SumFieldIfs(data['Line Items'],"Amount",["Debit/ Credit"],["Debit"])-SumFieldIfs(data['Line Items'],"Amount",["Debit/ Credit"],["Credit"])
                const lineItems = data['Line Items']
                result['Line Items'] = lineItems.map(item=>({...item,...{['Cost Center']:(item['Account Type']=="Asset")?"":item['Cost Center'],['Cost per Day']:(item['Amount']/(dayNumber(item['Consumption Time To'])+1-dayNumber(item['Consumption Time From'])))}}))
        }
        return result
    }

    function handleChange1(field,e){
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:value
        }))
    }

    function handleChange2(field,subfield,e){
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:{...prevdata[field],[subfield]:value}
        }))
    }

    function handlechange3(field,subfield,index,e){
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].map((item,i)=>(i===index)?{...item,[subfield]:value}:item)
        }))
    }

    function addItem(field,defaults,e){
        e.preventDefault;
        setdata(prevdata=>({
            ...prevdata,
            [field]:[...prevdata[field],{...defaults,['id']:prevdata[field].length}]
        }))
    }

    function removeItem(field,index,e){
        e.preventDefault;
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].filter((item,i)=>i!==index)
        }))
        
    }

    function cancel(){
        navigate(`/query/${object}`)
        window.location.reload()
    }

    function save(){
        let newdata = []
        if (errorlist.length==0){
        switch (method) {
            case 'Create':
                newdata = [...collections,{...output,["Entry Date"]:new Date().toLocaleDateString()}]
                break
            case 'Update':
                newdata = collections.map((item,i)=>(i==id)?output:item)
                break
        }
        saveData(newdata,collection)
        alert(`${object} saved!`)
        cancel()
        } else {
        alert("There are still errors unresolved")
        }
    }
    
    return(
        <div className='queryDisplay'>
            <h2>{`${method} ${object}`}</h2>
        {schema.map(field=>
        <div className='queryField'>
        {field['value']=="calculated" && <div className="querySingle"><label>{field['name']}</label><input value={output[field['name']]} disabled={true}/></div>}
        {field['datatype']=="single" && <div className='querySingle'><label>{field['name']}</label>{ field['input'] == "input" && <input disabled={(field['disabled']||!editable)} type={field['type']} onChange={(e)=>handleChange1(field['name'],e)} value={output[field['name']]}/>}{field['input']=="option" && <select disabled={(field['disabled']||!editable)} onChange={(e)=>handleChange1(field['name'],e)} value={output[field['name']]}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}</div>}
        {field['datatype']=="object" && <div><label>{field['name']}</label>{field['structure'].map(subfield=><>{subfield['datatype']=="single"&&<div className='querySingle'><label>{subfield['name']}</label>{subfield['input']=="input" && <input type={subfield['type']} onChange={(e)=>handleChange2(field['name'],subfield['name'],e)} value={output[field['name']][subfield['name']]} disabled={(field['disabled']||!editable)}/>}{subfield['input'] == "option" && <select disabled={(field['disabled']||!editable)} onChange={(e)=>handleChange2(field['name'],subfield['name'],e)} value={output[field['name']][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}</div>}</>)}</div>}
        {field['datatype']=="collection" && <><label>{field['name']}</label><div className='queryTable'><table><thead><tr><th className='queryCell'></th>{field['structure'].map(subfield=><th className='queryCell'>{subfield['name']}</th>)}</tr></thead>{output[field['name']].map((item,index)=><tbody><tr><td className='queryCell'><button disabled={(field['disabled']||!editable)} onClick={(e)=>removeItem(field['name'],index,e)}>-</button></td>{field['structure'].map(subfield=><>{subfield['datatype']=="single" && <td className='queryCell'>{subfield['value']=="calculated" && <input value={output[field['name']][index][subfield['name']]} disabled={true}/>} {subfield['input']=="input"&& <input disabled={(field['disabled']||!editable)} className='queryCell' onChange={(e)=>handlechange3(field['name'],subfield['name'],index,e)} type={subfield['type']} value={output[field['name']][index][subfield['name']]}/>}{subfield['input']=="option" && <select disabled={(field['disabled']||!editable)} onChange={(e)=>handlechange3(field['name'],subfield['name'],index,e)} value={output[field['name']][index][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}</td>}</>)}</tr></tbody>)}</table></div><div className="queryButtons"><button disabled={(field['disabled']||!editable)} onClick={(e)=>addItem(field['name'],field['use-state'][0],e)} className='blue'>Add</button></div></>}
        </div>)}
        <div className='queryField'>
            <label>{`${errorlist.length} Error(s)`}</label>
            <ul>
                {errorlist.map(item=><li>{item}</li>)}
                </ul>
        </div>
        <div className='queryButtons'>
            {method==="Create" && <><button className='blue' onClick={()=>cancel()}>Cancel</button><button className='green' onClick={()=>save()}>Save</button></>}
            {method==="Update" && <><button className='blue' onClick={()=>cancel()}>Cancel</button><button className='green' onClick={()=>save()}>Update</button></>}
            {method==="Display" && <><button className='blue' onClick={()=>cancel()}>Back</button></>}
        </div>
        </div>
    )
    
}

function Scratch(){

    return(
        <>
        <DisplayAsTable collection={new Intelligence().transactionstable()}/>
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
      <Route path="/report/:report" element={<Report/>}/>
      <Route path='/query/:object/' element={<Query type={"Object"}/>}/>
      <Route path='/create/:object/' element={<CRUD method={"Create"}/>}/>
      <Route path='/update/:object/:id' element={<CRUD method={"Update"}/>}/>
      <Route path='/display/:object/:id' element={<CRUD  method={"Display"}/>}/>
      <Route path='/deactivate/:object/:id' element={<DeleteQuery type={"Object"}/>}/>
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