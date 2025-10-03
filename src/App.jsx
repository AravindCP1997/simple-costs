import './App.css'
import { TiTimes } from "react-icons/ti";
import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate, useNavigate } from 'react-router-dom';


function loadData(collection){
    const data = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];
    return data;
}

function saveData(data,collection){
  localStorage.setItem(collection,JSON.stringify(data));
}

const ListofItems  = (collection,n) => {
    const keys = (collection.length!= 0) ? Object.keys(collection[0]) : [];
    const List = (collection.length!= 0) ? collection.map(item=>item[keys[n]]) : [];
    return List
}

function SumField(collection,field){
    let subtotal = 0;
    collection.map(item=>subtotal+=parseFloat(item[field]))
    return subtotal
}

function SumFieldIfs(collection,field,ranges,criteria){
    let subtotal = 0
    for (let i = 0;i<collection.length;i++){
    let logic = true;
       for (let j = 0; j< ranges.length;j++){
        if (collection[i][ranges[j]] != criteria[j]){
            logic = false
        }
       } 
       if (logic){subtotal+=parseFloat(collection[i][field])}
    }
    return subtotal
}

function singleFilter(collection,field,value){
    const result = collection.filter(item=>item[field]===value)
    return result
}

function listFilter(collection,field,list){
    let filtered= []
    list.map(value=>filtered = [...filtered,...collection.filter(item=>item[field]===value)])
    return filtered
}

function exclListFilter(collection,field,list){
    let filtered = collection
    list.map(value=>filtered = filtered.filter(item=>item[field]!==value))
    return filtered
}

function rangeFilter(collection,field,list){
    let filtered = [];
    list.map(range=>filtered = [...filtered,...collection.filter(item=>item[field]>=range[0] && item[field]<=range[1])])
    return filtered
}

function exclRangeFilter(collection,field,list){
    let filtered = collection;
    list.map(range=>filtered = filtered.filter(item=>item[field]<range[0] || item[field]>range[1]))
    return filtered
}


class Intelligence{
    constructor(){
        this.collectioninfo = {
            "Asset":"assets",
            "Asset Class":"assetclasses", 
            "Cost Center":"costcenters", 
            "Currency":"currencies",
            "Customer":"customers",
            "Employee":"employees",
            "General Ledger":"generalledgers",
            "Location":"locations",
            "Material":"materials",
            "Profit Center":"profitcenters",
            "Purchase Order":"purchaseorders",
            "Segment":"segments",
            "Sale Order":"saleorders",
            "Vendor":"vendors"
        }
    }
    collection(name){
        return(this.collectioninfo[name])
    }
    loadCollection(object){
        const collection = this.collection(object)
        const data = loadData(collection)
        return data
    }
    itemsInCollection(object){
        const l = this.loadCollection(object).length
        return l
    }
    search(collectionname,key,value,property){
        const collection = this.loadCollection(collectionname)
        const result = collection.filter(element=>element[key]==value)[0][property]
        return result
    }
    createLedgers(){
        const list = [{"Name":"","Type":""}]
        const types = ['General Ledger','Asset','Vendor','Customer','Material']
        for (let i=0;i<types.length;i++){
            (this.itemsInCollection(types[i])>0)?this.loadCollection(types[i]).map(item=>list.push({"Name":`${item["Name"]}`,"Type":types[i]})):()=>{}
        }
        return list
    }
    ledgerType(ledger){
        const type = this.createLedgers().filter(item=>item["Name"]==ledger)[0]['Type']
        return type
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
    depreciation(asset,period){
        const [from,to] = period
        const days = dayNumber(to) - dayNumber(from) + 1
        let openingWDV = 98387
        const SV = asset['Salvage Value']
        const UL = asset['Useful Life']
        const capDate = asset['Date of Capitalisation']
        const spendUL = (dayNumber(from)-dayNumber(capDate))/365
        const remainingUL = UL - spendUL
        const depreciation = (openingWDV-SV)/remainingUL * days/365
        return (depreciation)

    }
}


const objects = {
    "Asset":{
        "name":"Asset",
        "schema": [
            {"name":"Code", "value":"calculated"},
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Asset Class", "datatype":"single", "input":"option", "options":ListofItems(loadData("assetclasses"),0),"use-state":""},
            {"name": "Cost Center", "datatype":"single", "input":"option", "options":ListofItems(loadData("costcenters"),0),"use-state":""},
            {"name": "Useful Life", "datatype":"single", "input":"input", "type":"number","use-state":0},
            {"name": "Salvage Value", "datatype":"single", "input":"input", "type":"number","use-state":0},
            {"name": "Date of Capitalisation", "datatype":"single", "input":"input", "type":"date","use-state":0},
            {"name": "Date of Removal", "datatype":"single", "input":"input", "type":"date","use-state":0},
            {"name": "Income Tax Depreciation Rate", "datatype":"single", "input":"input", "type":"number","use-state":0}
        ],
        "collection":'assets'
    },
    "Asset Class":{
        "name":"Asset Class",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "General Ledger - Asset", "datatype":"single", "input":"option", "options":ListofItems(loadData('generalledgers'),0), "use-state":""},
            {"name": "General Ledger - Depreciation", "datatype":"single", "input":"option", "options":ListofItems(loadData('generalledgers'),0), "use-state":""}
        ],
        "collection":"assetclasses"
    },
    "Cost Center":{
        "name": "Cost Center",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Profit Center", "datatype":"single", "input":"option", "options":ListofItems(loadData('profitcenters'),0), "use-state":""}
        ],
        "collection":"costcenters"
    },
    "Currency":{
        "name":"Currency",
        "schema":[
            {"name":"Currency","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Code","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Exchange Rate","datatype":"single","input":"input","type":"number","use-state":""}
        ],
        "collection":"currencies"
    },
    "Customer":{
        "name":"Customer",
        "collection":"customers",
        "schema": [
            {"name":"Name","datatype":"single","input":"input","type":"text"}
        ]
    },
    "Employee":{
        "name":"Employee",
        "schema": [
            {"name":"Personnel No", "datatype":"single", "input":"input", "type":"text", "use-state":0},
            {"name": "Name", "datatype":"object", "structure":[{"name":"First Name","datatype":"single","input":"input","type":"text"},{"name":"Last Name", "datatype":"single", "input":"input","type":"text"}], "use-state":{"First Name":"","Last Name":""}},
            {"name": "Date of Birth", "datatype":"single", "input":"input", "type":"date", "use-state":0},
            {"name": "PAN", "datatype":"single", "input":"input", "type":"text", "use-state":0},
            {"name":"Age","value":"calculated"},
            {"name": "Bank Accounts", "datatype":"collection", "structure":[{"name":"Bank", "datatype":"single", "input":"input", "type":"text"},{"name":"IFSC", "datatype":"single", "input":"input", "type":"text"},{"name":"Account Number", "datatype":"single", "input":"input", "type":"number"},{"name":"Confirm Account Number", "datatype":"single", "input":"input", "type":"number"},{"name":"Validated", "value":"calculated", "datatype":"single"}],"use-state":[{"id":0,"Bank":"SBI","IFSC":"SBIN0070056","Account Number":"000000000000", "Confirm Account Number":"000000000000"}]},
            {"name":"Date of Hiring", "datatype":"single", "input":"input", "type":"date", "use-state":0},
            {"name":"Employment Details", "datatype":"collection","structure":[{"name":"Organisational Unit", "datatype":"single", "input":"input", "type":"text"},{"name":"Designation", "datatype":"single", "input":"input", "type":"text"},{"name":"Basic Pay", "datatype":"single", "input":"input", "type":"number"},{"name":"From Date", "datatype":"single", "input":"input", "type":"date"},{"name":"To Date", "datatype":"single", "input":"input", "type":"date"}], "use-state":[{"id":0,"Organisational Unit":"Finance","Designation":"Assistant Manager","Basic Pay":100000,"From Date":0,"To Date":0}]}
        ],
        "collection":'employees'
    },
    "General Ledger":{
        "name":"General Ledger",
        "schema":[
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Presentation", "datatype":"single", "input":"option", "options":["Income", "Expense", "Asset", "Liability", "Equity"], "use-state":"Income"},
            {"name":"Ledger Type","datatype":"single","input":"option","options":["Asset", "Depreciation", "Cost Element", "Customer", "Material", "Vendor","General"]}
        ],
        "collection":"generalledgers"
    },
    "Location":{
        "name":"Location",
        "schema": [
            {"name":"Name", "datatype":"single", "input":"input", "type":"text"},
            {"name":"Cost Center", "datatype":"single", "input":"input", "type":"text"},
        ],
        "collection":"locations"
    },
    "Profit Center":{
        "name":"Profit Center",
        "schema":[
            {"name": "Center", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Segment", "datatype":"single", "input":"option", "options":ListofItems(loadData("segments"),0), "use-state":""},
        ],
        "collection":"profitcenters"
    },
    "Purchase Order":{
        "name": "Purchase Order",
        "schema":[
            {"name": "Vendor", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Description", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Item Details", "datatype":"collection", "structure":[
                {"name":"Material/ Service","datatype":"single","input":"input","type":"text"},
                {"name":"Quantity","datatype":"single","input":"input","type":"number"},
                {"name":"Price","datatype":"single","input":"input","type":"number"}
            ],"use-state":[{"id":0,"Material/ Service":"","Quantity":0,"Price":0}]}
        ],
        "collection":"purchaseorders"
    },
    "Segment":{
        "name": "Segment",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""}
        ],
        "collection":"segments"
    },
    "Sale Order":{
        "name": "Sale Order",
        "schema":[
            {"name": "Customer", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Description", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Item Details", "datatype":"collection", "structure":[
                {"name":"Material/ Service","datatype":"single","input":"input","type":"text"},
                {"name":"Quantity","datatype":"single","input":"input","type":"number"},
                {"name":"Price","datatype":"single","input":"input","type":"number"}
            ],"use-state":[{"id":0,"Material/ Service":"","Quantity":0,"Price":0}]}
        ],
        
        "collection":"saleeorders"
    },
    "Vendor":{
        "name":"Vendor",
        "collection":"vendors",
        "schema": [
            {"name":"Name","datatype":"single","input":"input","type":"text"}
        ]
    },
    "Transaction" : {
        "name":"Transaction",
        "collection":"transactions",
        "schema": [
            {"name": "Entry Date", "value":"calculated"},
            {"name": "Description", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Posting Date", "datatype":"single", "input":"input", "type":"date", "use-state":new Date()},
            {"name": "Document Date", "datatype":"single", "input":"input", "type":"date", "use-state":""},
            {"name": "Reference", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Currency", "datatype":"single", "input":"option", "options":[], "use-state":""},
            {"name": "Calculate Tax", "datatype":"single", "input":"option", "options":["Yes","No"], "use-state":"No"},
            {"name":"Balance", "value":"calculated"},
            {"name": "Line Items", "datatype":"collection", "structure":
                [
                    {"name":"Account", "datatype":"single","input":"option","options":ListofItems(new Intelligence().createLedgers(),0),"use-State":""},
                    {"name":"Account Type", "datatype":"single","value":"calculated"},
                    {"name":"Amount", "datatype":"single","input":"input","type":"number"},
                    {"name":"Debit/ Credit", "datatype":"single","input":"option","options":["Debit", "Credit"]},
                    {"name":"GST", "datatype":"single","input":"option","options":["Input 5%", "Input 12%", "Input 18%", "Input 40%","Output 5%", "Output 12%", "Output 18%", "Output 40%"]},
                    {"name":"Cost Center", "datatype":"single","input":"input","type":"text"},
                    {"name":"Quantity", "datatype":"single","input":"option","options":[]},
                    {"name":"Location", "datatype":"single","input":"option","options":ListofItems(loadData('locations'),0)},
                    {"name":"Profit Center", "datatype":"single","input":"option","options":ListofItems(loadData('profitcenters'),0)},
                    {"name":"Cost Object", "datatype":"single","input":"option","options":ListofItems(loadData('costobjects'),0)},
                    {"name":"Purchase Order", "datatype":"single","input":"option","options":ListofItems(loadData('purchaseorders'),0)},
                    {"name":"Purchase Order Item", "datatype":"single","input":"option","options":[]},
                    {"name":"Sale Order", "datatype":"single","input":"option","options":ListofItems(loadData('serviceorders'),0)},
                    {"name":"Sale Order Item", "datatype":"single","input":"option","options":[]},
                    {"name":"Employee", "datatype":"single","input":"option","options":ListofItems(loadData('employees'),0)},
                    {"name":"Consumption Time From", "datatype":"single","input":"input","type":"date"},
                    {"name":"Consumption Time To", "datatype":"single","input":"input","type":"date"},
                    {"name":"Cost per Day","value":"calculated","datatype":"single"}

                ],  
                "use-state":[{"id":0,"Account":"","Account Type":"Asset","General Ledger":"Plant and Machinery","Amount":0,"Debit/ Credit":"Debit","GST":"Input 5%","Cost Center":"Head Office","Asset":"","Material":"","Quantity":"","Location":"","Profit Center":"","Purchase Order":"","Purchase Order Item":"","Sale Order":"","Sale Order Item":"","Consumption Time From":"","Consumption Time To":"","Employee":"","Cost per Day":0}]}
        ]
    }
}

class Database{
    static loadAll(){
        const database = {}
        const keys = Object.keys(objects)
        keys.map(item=>database[objects[item]['name']]=loadData(objects[item]['collection']))
        return database
    }
    static load(collection){
        const database=loadData(objects[collection]['collection'])
        return database
    }
    static add(collection,data){
        const database=loadData(objects[collection]['collection'])
        const newdatabase = [...database,data]
        saveData(newdatabase,objects[collection]['collection'])
    }
    static update(collection,id,data){
        const database=loadData(objects[collection]['collection'])
        const newdatabase = database.map((item,index)=>(index===id?data:item))
        saveData(newdatabase,objects[collection]['collection'])
    }
    static removeAll(collection){
        saveData([],objects[collection]['collection'])
    }
    static remove(collection,id){
        const database=loadData(objects[collection]['collection'])
        const newdatabase = database.filter((item,index)=>(index!==id))
        saveData(newdatabase,objects[collection]['collection'])
    }
}

class Company{
    constructor(data){
        this.status = ('company' in localStorage)
        this.data = (this.status)?JSON.parse(localStorage.getItem('company')):{"Name":"","Year 1 Start":"","Year 1 End":""}
        this.sample = {
            "Name":"Sample Cost",
            "Year 1 Start":"2025-04-01",
            "Year 1 End":"2026-03-31"
        }
    }
    initialise(){
        localStorage.setItem('company',JSON.stringify(this.sample))
    }
    static save(data){
        localStorage.setItem('company',JSON.stringify(data))
    }
    static delete(){
        localStorage.removeItem('company')
    }
}

class ReportObject{
    constructor(name){
        this.name = name
        this.schema = QuerySchema[this.name]
    }
    process(data){
        switch(this.name){
            case 'Financial Statements':
                const result = new Intelli().transactionstable().filter(item=>item['Cost Center']==data['Cost Center'])
                return result
        }
    }
}

function SuperRange(collection,range,from,to){
    const filtered = collection.filter(item=>item[from]<=range[0] && item[to]>=range[1])
    return filtered
}

function dayNumber(date){
    const time = new Date(date).getTime()
    const day = time/86400000
    return day
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
      <div className='menuItem' onClick={()=>{navigate(`/create/Transaction`)}}><h3>Transaction</h3></div>
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
                output['Line Items'].map((item,index)=>(item['Account Type']=="Asset"&&item['Profit Center']=="")?list.push(`At line item ${index}, Profit Center required`):()=>{})
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
                result['Line Items'] = lineItems.map(item=>({...item,...{['Account Type']:(new Intelligence().ledgerType(item['Account'])),['Cost Center']:(item['Account Type']=="Asset")?"":item['Cost Center'],['Cost per Day']:(item['Amount']/(dayNumber(item['Consumption Time To'])+1-dayNumber(item['Consumption Time From'])))}}))
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

    function deactivate(){
        const newdata = collections.map((item,i)=>(i==id)?{...output,['Deactivated']:true}:item)
        saveData(newdata,collection)
        alert(`${object} deactivated`)
        cancel()
    }
    
    return(<>
        {method != "Deactivate" && <div className='queryDisplay'>
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
        }
        {method == "Deactivate" && 
            <div className='query'>
        <label className='queryTitle'>{`Deactivate ${object}`}</label>
        <p>Are you sure want to {`deactivate ${object} ${id}`} ?</p>
        <div className='queryButtons'>
            <button className="blue" onClick={()=>{cancel()}}>Cancel</button>
            <button className="red" onClick={()=>deactivate()}>Deactivate</button>
        </div>
        </div>
        }
        </>
    )
    
}

function Scratch(){

    return(
        <>
        {new Intelligence().depreciation({'Useful Life':5,"Salvage Value":5000,'Date of Capitalisation':"2025-10-01"},["2025-11-01","2025-11-30"])}
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
      <Route path='/deactivate/:object/:id' element={<CRUD method={"Deactivate"}/>}/>
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