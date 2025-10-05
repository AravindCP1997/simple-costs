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

const ListItems = (collection,key)=>{
    const list = []
    collection.map(item=>list.push(item[key]))
    return list
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

class Company{
    constructor(data){
        this.status = ('company' in localStorage);
        this.data = (this.status)?JSON.parse(localStorage.getItem('company')):{"Name":"","GSTIN":"","PAN":"","Year 0":2020,"Financial Year Beginning":"04","Functional Currency":{"Code":"INR","Currency":"Indian Rupee"}}
        this.startdate = `${this.data['Year 0']}-${this.data['Financial Year Beginning']}-01`
        this.sample = {
            "Name":"Sample Company",
            "GSTIN":"32ABDCS1234E1ZN",
            "PAN":"ABDCS1234E",
            "Year 0":2025,
            "Financial Year Beginning":3,
            "Functional Currency":{"Code":"INR","Currency":"Indian Rupee"}
        }
    }
    static timeMaintained = ('timecontrol' in localStorage);
    static timeControls = JSON.parse(localStorage.getItem('timecontrol'));
    static setTimeControl(periods){
        localStorage.setItem('timecontrol',JSON.stringify(periods))
    }
    static removeTimeControl(){
        localStorage.removeItem('timecontrol');
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

class Database{
    static loadAll(){
        const database = {}
        const keys = Object.keys(objects)
        keys.map(item=>database[objects[item]['name']]=loadData(objects[item]['collection']))
        return database
    }
    static load(collection){
        const collectionname = {
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
            "Vendor":"vendors",
            "Transaction":'transactions'
        };
        const database=loadData(collectionname[collection])
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

class GeneralLedger{
    constructor(name){
        this.name = name;
        this.data = GeneralLedger.data.filter(item=>item["Name"]==this.name)[0];
        this.type = this.data['Ledger Type'];
        this.presentation = this.data['Presentation']
    }
    static data = Database.load("General Ledger")
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
    transactions(period){
        const [from,to] = period
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>item['General Ledger']==this.name && item['Posting Date']>=from && item['Posting Date']<=to)
        return filtered
    }
    debit(period){
        const data = this.transactions(period);
        const amount = SumFieldIfs(data,"Amount",["Debit/ Credit"],["Debit"])
        return amount
    }
    credit(period){
        const data = this.transactions(period);
        const amount = SumFieldIfs(data,"Amount",["Debit/ Credit"],["Credit"])
        return amount
    }
    opening(date){
        const data = new Intelligence().transactionstable();
        const start = (["Income","Expense"].includes(this.presentation))?Intelligence.yearStart(date):new Company().startdate;
        const filtered = data.filter(item=>item['General Ledger']==this.name && item['Posting Date']>=start && item['Posting Date']<date)
        const balance = SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Debit"]) - SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Credit"])
        return balance
    }
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
        const openingWDV = this.openingWDV(asset['Name'],from)
        const transaction = this.transactions(asset['Name'],period)
        const SV = asset['Salvage Value']
        const UL = asset['Useful Life']
        const capDate = asset['Date of Capitalisation']
        const spendUL = (dayNumber(from)-dayNumber(capDate))/365
        const remainingUL = UL - spendUL
        const depreciation = ((openingWDV+transaction-SV)/remainingUL * days/365).toFixed(2)
        return (depreciation)

    }
    openingWDV(asset,date){
        const data = this.transactionstable()
        const filtered = data.filter(item=>item['Account'] == asset && item['Posting Date'] < date)
        const WDV = SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Debit"]) - SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Credit"])
        return WDV
    }
    transactions(account,period){
        const [from,to] = period
        const data = this.transactionstable()
        const filtered = data.filter(item=>item['Account'] == account && item['Posting Date'] <= to && item['Posting Date'] >= from)
        const amount = SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Debit"]) - SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Credit"])
        return amount
    }
    generalledger(data){
        const result = {...data};
        (result['Ledger Type']=="Asset")?result['Presentation'] = "Asset":()=>{}
        (result['Ledger Type']=="Depreciation")?result['Presentation'] = "Expense":()=>{}
        (result['Ledger Type']=="Cost Element")?result['Presentation'] = "Expense":()=>{}
        (result['Ledger Type']=="Material")?result['Presentation'] = "Asset":()=>{}
        return result
    }
    generalledgerError(data){
        const list = [];
        (data['Name']=="")?list.push(`Provide a name for the asset`):()=>{}
        return list
    }
    assetLineItem(data){
        const notreq = ["Cost Center","Location","Quantity","Cost Object","Purchase Order","Service Order","Purchase Order Item","Service Order Item","Employee","Consumption Time From","Consumption Time To","Cost per Day"]
        const result = {...data}
        result["Profit Center"] = "Profit Center"
        notreq.map(item=>result[item]="")
        return result
    }
    assetLineItemError(data,index){
        const list = [];
        (data['Amount']==0)?list.push(`At line item ${index+ 1}, amount is zero.`):()=>{}
        return list
    }
    generalLedgerLineItem(data){
        const notreq = ["Location","Quantity"]
        const result = {...data};
        (!["Cost Element","Depreciation"].includes(new GeneralLedger(data['Account']).data['Ledger Type']))?notreq.push(...['Cost Center','Cost Object']):()=>{}
        result["General Ledger"] = result['Account']
        notreq.map(item=>result[item]="")
        return result
    }
    generalLedgerLineItemError(data,index){
        const list = [];
        const required = ['Amount'];
        (["Cost Element","Depreciation"].includes(new GeneralLedger(data['Account']).data['Ledger Type']))?required.push(...['Consumption Time From','Consumption Time To']):()=>{}
        required.map(item=>(data[item]=="")?list.push(` At line item ${index+1}, ${item} is required`):()=>{});
        (["Cost Element","Depreciation"].includes(new GeneralLedger(data['Account']).data['Ledger Type']) && data['Cost Center']=="" && data["Cost Object"]=="")?list.push(`At line item ${index +1 }, Cost Center or Cost Object is required`):()=>{}
        return list
    }
    lineItemCalc(data){
        let result = {...data}
        const type = this.ledgerType(data['Account']);
        result['Account Type'] = type;
        (type=="Asset")?result=this.assetLineItem(result):()=>{}
        (type=="General Ledger")?result=this.generalLedgerLineItem(result):()=>{}
        return(result)
    }
    lineItemErrors(data,index){
        let list = [];
        (data['Account Type']=="Asset")?list = this.assetLineItemError(data,index):()=>{}
        (data['Account Type']=="General Ledger")?list = this.generalLedgerLineItemError(data,index):()=>{}
        return list
    }
    depreciationRun(period){
        const list = [];
        const [from,to] = period
        const assets = this.loadCollection('Asset')
        assets.map(asset=>list.push({"Name":asset['Name'],"Opening WDV":this.openingWDV(asset['Name'],from),"Transactions":this.transactions(asset['Name'],period),"Depreciation":this.depreciation(asset,period),"Cost Center":asset["Cost Center"]}))
        return list
    }
    depreciationPOST(period){
        const [from,to] = period
        const data = this.depreciationRun(period);
        const lines = []
        let entry = {};
        entry['Posting Date'] = to;
        entry['Document Date'] = to;
        entry['Description'] = `Depreciation from ${from} to ${to}.`
        data.map(item=>lines.push(...[{'Account':"Depreciation","Account Type":"General Ledger","Amount":item['Depreciation'],"Debit/ Credit":"Debit","Cost Center":item["Cost Center"]},{'Account':item['Name'],'Account Type':"Asset",'Amount':item['Depreciation'],"Debit/Credit":"Credit"}]))
        entry['Line Items'] = lines;
    }
    static yearStart(dateString){
        const date = new Date(dateString);
        const reference = new Date(date.getFullYear(),new Company().data['Financial Year Beginning']-1,1)
        const result = (date>reference)?`${date.getFullYear()}-${new Company().data['Financial Year Beginning']}-01`:`${date.getFullYear()-1}-${new Company().data['Financial Year Beginning']}-01`;
        return result
    }
}

function ReportQuery(){
    const [query,setquery] = useState([0,0])
    const [submittedQuery,setsubmitted] = useState(["2025-06-23","2026-03-31"])
    const handleChange = (e,i)=>{
        const {value} = e.target
        setquery(prevdata=>prevdata.map((item,index)=>(i==index)?value:item))
    }

    const submitQuery = ()=>{
        setsubmitted(query)
    }

    const Intel = new Intelligence()

    
    const data = Intel.depreciationRun(submittedQuery)
    const entry = Intel.depreciationPOST(submittedQuery)
    

    return(
        <div>
            <div>
            <div>
                <label>Period</label>
                <label>from <input value={query[0]} onChange={(e)=>handleChange(e,0)} type="date"></input></label>
                <label>to <input value={query[1]} onChange={(e)=>handleChange(e,1)} type="date"></input></label></div>
                <button onClick={submitQuery}>Submit</button>
                </div>
                {JSON.stringify(query)}
                <div>
                    <h2>Depreciation Run</h2>
                    <p>{`for the period from ${submittedQuery[0]} to ${submittedQuery[1]}`}</p>
                    <DisplayAsTable collection={data}/>
                    <button>Post</button>
                </div>
        </div>
    )
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
            {"name": "Date of Removal", "datatype":"single", "input":"input", "type":"date","use-state":0}
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
            {"name":"Code", "value":"calculated"},
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
    "Service":{
        "name":"Service",
        "schema":[
            {"name":"Name","datatype":"single","input":"input","type":"text","use-State":""},
            {"name":"Unit","datatype":"single","input":"input","type":"text","use-State":""},
            {"name":"General Ledger","datatype":"single","input":"option","options":ListofItems(Database.load('General Ledger'),0),"use-State":""},
        ],
        "collection":"services"
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
                    {"name":"General Ledger","value":"calculated","datatype":"single"},
                    {"name":"Account Type", "datatype":"single","value":"calculated"},
                    {"name":"Amount", "datatype":"single","input":"input","type":"number"},
                    {"name":"Debit/ Credit", "datatype":"single","input":"option","options":["Debit", "Credit"]},
                    {"name":"GST", "datatype":"single","input":"option","options":["Input 5%", "Input 12%", "Input 18%", "Input 40%","Output 5%", "Output 12%", "Output 18%", "Output 40%"]},
                    {"name":"Description", "datatype":"single","input":"input","type":"text"},
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
                "use-state":[{"id":0,"Account":"","Account Type":"","General Ledger":"","Amount":0,"Debit/ Credit":"Debit","GST":"","Cost Center":"","Cost Object":"","Asset":"","Material":"","Quantity":"","Location":"","Profit Center":"","Purchase Order":"","Purchase Order Item":"","Sale Order":"","Sale Order Item":"","Consumption Time From":"","Consumption Time To":"","Employee":"","Cost per Day":0}]}
        ]
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
        Company.setTimeControl({"First":{"From":"2025-04-01","To":"2026-03-31"},"Second":{}})
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

    const errorlist = []

    const errorcheck = () =>{
        (data['Name']=="")?errorlist.push("Provide company name"):()=>{};
        (data['Year 0']=="")?errorlist.push("Mention 0th year"):()=>{};
        (data['Financial Year Beginning']=="")?errorlist.push("Mention beginning month of financial year"):()=>{};
        (data['Functional Currency']['Code']=="")?errorlist.push("Provide functional currency code"):()=>{};
        (data['Functional Currency']['Currency']=="")?errorlist.push("Provide functional currency"):()=>{};
    }

    const save = ()=>{
        errorcheck()
        if (errorlist.length==0){
        if (!Company.timeMaintained) {
            const periods = {"First":{"From":`${data['Year 0']}-${data['Financial Year Beginning']}-01`,"To":`${data['Year 0']}-${data['Financial Year Beginning']}-20`},"Second":{}}
            Company.setTimeControl(periods)
        }
        Company.save(data)
        alert('Company Info Saved')
        window.location.reload()
        } else {
            alert("Please: " +"\n"+ errorlist.join("\n"))
        }
    }

    const cancel = ()=>{
        seteditable(false);
        window.location.reload()
    }

    const deleteCompany = () =>{
        Company.delete();
        Company.removeTimeControl();
        alert('Company Deleted')
        window.location.reload()
    }

    const months = [
        {"Month":"January","Number":"01"},
        {"Month":"February","Number":"02"},
        {"Month":"March","Number":"03"},
        {"Month":"April","Number":"04"},
        {"Month":"May","Number":"05"},
        {"Month":"June","Number":"06"},
        {"Month":"July","Number":"07"},
        {"Month":"August","Number":"08"},
        {"Month":"September","Number":"09"},
        {"Month":"October","Number":"10"},
        {"Month":"November","Number":"11"},
        {"Month":"December","Number":"12"},
    ]

    if (status) {
    return(

        <div className='companyInfo'>
            <h2>Company Info</h2>
            <div className='companyDetail'><label>Name </label><input required disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['Name']:e.target.value}))} value={data['Name']}/></div>
            <div className='companyDetail'><label>GSTIN</label><input onChange={(e)=>setdata(prevdata=>({...prevdata,['GSTIN']:e.target.value}))} type="text" disabled={!editable} value={data['GSTIN']}/></div>
            <div className='companyDetail'><label>PAN</label><input type="text" disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['PAN']:e.target.value}))} value={data['PAN']}/></div>
            <div className='companyDetail'><label>0<sup>th</sup> Year</label><input required min={1900} max={2050} type="number" disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['Year 0']:e.target.value}))} value={data['Year 0']}/></div>
            <div className='companyDetail'><label>Beginning Month of a Financial Year</label><select required value={data['Financial Year Beginning']} onChange={(e)=>setdata(prevdata=>({...prevdata,['Financial Year Beginning']:e.target.value}))}>{months.map(month=><option value={month['Number']}>{month['Month']}</option>)}</select></div>
            <div className='companyDetail'>
                <label>Functional Currency</label>
                <label>Code<input type="text" onChange={(e)=>setdata(prevdata=>({...prevdata,['Functional Currency']:{...prevdata['Functional Currency'],['Code']:e.target.value}}))} value={data['Functional Currency']['Code']}/></label>
                <label>Currency<input type="text" onChange={(e)=>setdata(prevdata=>({...prevdata,['Functional Currency']:{...prevdata['Functional Currency'],['Currency']:e.target.value}}))} value={data['Functional Currency']['Currency']}/></label>
                </div>
            
            <div>
                {editable && <button onClick={()=>cancel()}>Cancel</button>}
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

function TimeControlling(){

    const status = Company.timeMaintained;
    const [periods,setperiods] = (status)?useState(Company.timeControls):useState({"First":{"From":"2024-04-01","To":"2025-03-31"},"Second":{"From":"2024-04-01","To":"2025-03-31"}});
    const [editable,seteditable] = useState(false);
    const save = () =>{
        Company.setTimeControl(periods);
        alert('Time Change Successful!');
        window.location.reload()
    }
    return(
    <div>
        <h2>Control of Transaction Time</h2>
        <div>
            <h3>Open Time Period</h3>
            <div>
                <h4>Period 1</h4>
                <div>
                    <label>From</label><input disabled={!editable} onChange={(e)=>setperiods(prevdata=>({...prevdata,["First"]:{...prevdata['First'],['From']:e.target.value}}))} value={periods["First"]["From"]} type="date"/>
                    <label>To</label><input disabled={!editable} onChange={(e)=>setperiods(prevdata=>({...prevdata,["First"]:{...prevdata['First'],['To']:e.target.value}}))} value={periods["First"]["To"]} type="date"/>
                </div>
            </div>
            <div>
                <h4>Period 2</h4>
                <div>
                    <label>From</label><input disabled={!editable} onChange={(e)=>setperiods(prevdata=>({...prevdata,["Second"]:{...prevdata['Second'],['From']:e.target.value}}))} value={periods["Second"]["From"]} type="date"/>
                    <label>To</label><input disabled={!editable} onChange={(e)=>setperiods(prevdata=>({...prevdata,["Second"]:{...prevdata['Second'],['To']:e.target.value}}))} value={periods["Second"]["To"]} type="date"/>
                </div>
            </div>
            {JSON.stringify(periods)}
            {!editable && <button onClick={()=>seteditable(true)}>Change</button>}
            {editable && <button onClick={()=>save()}>Save</button>}
            {editable && <button onClick={()=>window.location.reload()}>Cancel</button>}
        </div>
    </div>
    )
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
      <div className='menuItem' onClick={()=>navigate('/timecontrol')}><h3>Time Control</h3></div>
      {list.map(item=><div className='menuItem' onClick={()=>{navigate(`/query/${item}`)}}><h3>{item}</h3></div>)}
    </div>
  )
}

function Reports(){

    const navigate = useNavigate();
    return(
    <div className='menuList'>
    <div className='menuTitle'><h3>Reports</h3></div>
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
                output['Line Items'].map((item,index)=>list.push(...new Intelligence().lineItemErrors(item,index)))
                break
            case 'General Ledger':
                list.push(...new Intelligence().generalledgerError(output))
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
        let result = data
        switch(object){
            case 'General Ledger':
                result = new Intelligence().generalledger(result)
                break
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
                result['Line Items'] = lineItems.map(item=>new Intelligence().lineItemCalc(item))
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
        <div>
        {new GeneralLedger('Rent').opening("2025-06-24")}
        {new GeneralLedger('Rent').opening("2026-06-25")}
        {new GeneralLedger('Furniture and Fittings').opening("2040-06-24")}
        </div>
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
      <Route path="/timecontrol" element={<TimeControlling/>}/>
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