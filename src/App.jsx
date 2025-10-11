import './App.css'
import { TiTimes } from "react-icons/ti";
import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate, useNavigate, useLocation } from 'react-router-dom';


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
            "Financial Year Beginning":'04',
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
            "Bank Account":"bankaccounts",
            "Cost Center":"costcenters",
            "Cost Object":"costobjects", 
            "Currency":"currencies",
            "Customer":"customers",
            "Employee":"employees",
            "General Ledger":"generalledgers",
            "Location":"locations",
            "Material":"materials",
            "Payment Term":"paymentterms",
            "Profit Center":"profitcenters",
            "Purchase Order":"purchaseorders",
            "Segment":"segments",
            "Sale Order":"saleorders",
            "Unit":"units",
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

class Asset{
    constructor(name){
        this.name = name;
        this.data = Asset.data.filter(item=>item['Name']==this.name)[0]
    }
    transactions(period){
        const data = new Intelligence().transactionstable();
        const [from,to] = period;
        const filtered = data.filter(item=>item['Account']==this.name && item['Posting Date']>=from && item['Posting Date']<=to);
        return filtered
    }
    opening(date){
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>item['Account'] == this.name && item['Posting Date'] < date)
        const opening = SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Debit"]) - SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Credit"])
        return opening
    }
    depreciation(period){
        const [from,to] = period
        const days = dayNumber(to) - dayNumber(from) + 1
        const opening = this.opening(from)
        const transactions = this.transactions(period)
        const SV = this.data["Salvage Value"];
        const UL = this.data["Useful Life"];
        const capDate = this.data['Date of Capitalisation']
        const spendUL = (dayNumber(from)-dayNumber(capDate))/365
        const remainingUL = UL - spendUL
        const depreciation = ((opening+transactions-SV)/remainingUL * days/365).toFixed(2)
        return depreciation
    }
    static data = Database.load("Asset")
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
    static activedata= this.data.filter(item=>!item['Deactivated'])
    static activeList(){
        return ListItems(this.activedata,"Name")
    }
}

class AssetClass{
   constructor(name){
        this.name = name;
   }
    static data = Database.load("Asset Class");
    static active = this.data.filter(item=>!item['Deactivated'])
    static list(){
        const list = ListItems(this.active,"Name")
        return list
    }
}

class BankAccount{
    constructor(name){
        this.name = name;
    }
    static data = Database.load("Bank Account")
    static active = this.data.filter(item=>!item['Deactivated'])
    static list(){
        const list = ListItems(this.active,"Name")
        return list
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
    static listtype(type){
        const data = this.data.filter(item=>item['Ledger Type']==type);
        const list = ListItems(data,"Name");
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
    accountBalance(period){
        const [from,to] = period;
        const opening = this.opening(from)
        const data = {"Ledger":this.name,"Opening Balance":this.opening(from).toFixed(2),"Debit":this.debit(period).toFixed(2),"Credit":this.credit(period).toFixed(2),"Closing Balance":(this.opening(from)+this.debit(period)-this.credit(period)).toFixed(2)}

        return data
    }
    static trialbalance(period){
        const list = [];
        const ledgers = this.list()
        ledgers.map(ledger=>list.push(new GeneralLedger(ledger).accountBalance(period)))
        return list
    }
}

class Customer{
    constructor(name){
        this.name = name;
    }
    static data = Database.load("Customer")
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
}

class CostCenter{
    constructor(name){
        this.name = name;
        this.data = CostObject.data.filter(item=>item['Name']==this.name)[0];
    }
    transactions(){
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>item['Cost Center']==this.name);
        return filtered
    }
    itemsOfDate(date){
        const data = this.transactions().filter(item=>item['Consumption Time From']<=date && item['Consumption Time To']>=date)
        const result = data.map(item=>({'Cost Element':item['Account'],'General Ledger':item['General Ledger'],'Cost per Day':CostCenter.costPerDay(item)}))
        return result;
    }
    costOfDate(date){
        const data = this.itemsOfDate(date)
        const cost  = SumField(data,'Cost per Day')
        return cost
    }
    prepaid(date){
        const data = this.transactions().filter(item=>new Date(item['Consumption Time To'])>new Date(date) && new Date(item['Consumption Time From'])<=new Date(date))
        const result = data.map(item=>({...item,...{'Prepaid Days':CostCenter.prepaiddays(item,date),'Prepaid Cost':CostCenter.prepaidCost(item,date)}}))
        return result
    }
    static prepaiddays(lineitem,date){
        const to = lineitem['Consumption Time To'];
        const days = dayNumber(to) - dayNumber(date)+ 1
        return days
    }
    static costPerDay(lineitem){
        const from = lineitem['Consumption Time From'];
        const to = lineitem['Consumption Time To'];
        const days = dayNumber(to) - dayNumber(from)+ 1
        const costperday = lineitem['Amount']/days
        return costperday
    }
    static prepaidCost(lineitem,date){
        const days = this.prepaiddays(lineitem,date);
        const costperday = this.costPerDay(lineitem);
        const prepaidcost = days * costperday
        return prepaidcost
    }
    static prepaidCostData(date){
        const centers = this.activeList
        const list = []
        centers.map(center=>list.push(...new CostCenter(center).prepaid(date)))
        return list
    }
    static data = Database.load("Cost Center")
    static activeData = this.data.filter(item=>!item['Deactivated'])
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
    static activeList = ListItems(this.activeData,"Name");
}

class CostObject{
    constructor(name){
        this.name = name;
        this.data = CostObject.data.filter(item=>item['Description']==this.name)[0];
        this.ratio = this.data['Settlement Ratio']
    }
    transactions(){
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>item['Cost Object']==this.name);
        return filtered
    }
    accumulatedCost(){
        let sum = 0;
        sum+=SumFieldIfs(this.transactions(),"Amount",["Debit/ Credit"],["Debit"]);
        sum-=SumFieldIfs(this.transactions(),"Amount",["Debit/ Credit"],["Credit"]);
        return sum;
    }
    allocation(){
        const cost = this.accumulatedCost();
        const ratio = this.ratio
        const list = [];
        ratio.map(item=>list.push({...item,["Allocable Amount"]:(cost*item['Proportion']/100)}))
        return list
    }
    static data = Database.load("Cost Object")
    static list(){
        const list = ListItems(this.data,"Description")
        return list
    }
    static transferablesData (){
        const data = [{"Name":"","Type":""}];
        Asset.list().map(item=>data.push({["Name"]:item,["Type"]:"Asset"}));
        Material.list().map(item=>data.push({["Name"]:item,["Type"]:"Material"}));
        CostCenter.list().map(item=>data.push({["Name"]:item,["Type"]:"Cost Center"}));
        this.list().map(item=>data.push({["Name"]:item,["Type"]:"Cost Object"}));
        return data
    }
    static transferablesList(){
        const list = ListItems(this.transferablesData(),"Name");
        return list
    }
    static getTransferableType(name){
        const type = this.transferablesData().filter(item=>item['Name']==name)[0]['Type'];
        return type
    }
}

class Employee{
    constructor(id){
        this.id = id;
        this.data = Employee.data.filter(item=>item['ID']==this.id)[0];
    }
    daysalary(date){
        let scale = 0;
        const data = this.data['Employment Details'];
        const filtered = data.filter(item=>new Date((item['From']))<=new Date(date) && new Date(item['To'])>=new Date(date))
        scale = (filtered.length>0)? filtered[0]['Scale'] : 0;
        return scale
    }
    salary(year,month){
        const dates = datesInMonth(year,month);
        const list = [];
        dates.map(date=>list.push({"Date":date,"Salary":(this.daysalary(date)/daysInMonth(year,month))}))
        return list
    }
    static data = Database.load("Employee")
    static list(){
        const list = ListItems(this.data,"ID")
        return list
    }
    static salaryrun(year,month){
        const data = [];
        this.list().map(item=>data.push({"ID":item,"Salary":SumField(new Employee(item).salary(year,month),"Salary")}))
        return data
    }
}

class Material{
    constructor(name){
        this.name = name;
    }
    static data = Database.load("Material");
    static list(){
        const list = ListItems(this.data,"Description")
        return list
    }
}

class ProfitCenter{
    constructor(name){
        this.name = name;
    }
    static data = Database.load("Profit Center")
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
}

class Segment{
    constructor(name){
        this.name = name;
    }
    static data = Database.load("Segment")
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
}

class Vendor{
    constructor(name){
        this.name = name;
    }
    openitems(date){
        const transactions = new Intelligence().transactionstable()
        const result = transactions.filter(item=>item['Account']==this.name && new Date(item['Posting Date'])<=new Date(date) && !item['Cleared'])
        return result
    }
    static data = Database.load("Vendor")
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
}

function TrialBalance(){
    const [query,setquery] = useState(["2025-04-01","2026-03-31"])
    const [period,setperiod] = useState(["2025-04-01","2026-03-31"])
    const data = GeneralLedger.trialbalance(period)
    return(
        <div>
            <div className='query'>
                <label>Period</label>
                <label>From</label><input onChange={(e)=>setquery(prevdata=>[e.target.value,prevdata[1]])} value={query[0]} onCh type="date"/>
                <label>To</label><input onChange={(e)=>setquery(prevdata=>[prevdata[0],e.target.value])} value={query[1]} type="date"/>
                <button onClick={()=>setperiod(query)}>Get</button>
            </div>
            <DisplayAsTable collection={data}/>
        </div>

    )
}

class Intelligence{
    constructor(){
        this.collectioninfo = {
            "Asset":"assets",
            "Asset Class":"assetclasses", 
            "Cost Center":"costcenters", 
            "Cost Object":"costobjects",
            "Currency":"currencies",
            "Customer":"customers",
            "Employee":"employees",
            "General Ledger":"generalledgers",
            "Location":"locations",
            "Material":"materials",
            "Payment Term":"paymentterms",
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
        const types = ['General Ledger','Asset','Employee','Vendor','Customer','Material']
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
    bankAccount(data){
        const result = {...data};
        return result
    }
    bankAccountError(data){
        const list = [];
        const req = ["Name","IFSC","Account Number","General Ledger","Profit Center"];
        req.map(item=>(data[item]=="")?list.push(`${item} is required`):()=>{});
        data['Virtual Accounts'].map((item,index)=>(item["Virtual Account Number"]!="" && item['Ledger']=="")?list.push(`VAN ${item['Virtual Account Number']} requires a ledger`):()=>{})
        return list
    }
    costobject(data){
        const result = {...data};
        result['Settlement Ratio'] = result['Settlement Ratio'].map((item,index)=>({...item,['Type']:CostObject.getTransferableType(item['To'])}))
        return result
    }
    costobjectError(data){
        const list = [];
        (data['Description']=="")?list.push(`Provide a description for the object.`):()=>{};
        (data['Settlement Ratio'].length==0)?list.push(`Provide Settlement Ratio.`):()=>{};
        (data['Cost Accumulation Period']['From']=="" || data['Cost Accumulation Period']['To']=="")?list.push(`Provide Accumulation Period`):()=>{};
        if (data['Settlement Ratio'].length>0){
            (SumField(data['Settlement Ratio'],"Proportion")!=100)?list.push("Total of proportion be 100"):()=>{};
            (data['Settlement Ratio'].map((item, index)=>((item['Type']=="Cost Center" && (item["Consumption Time From"] == "" || item["Consumption Time To"] == ""))?list.push(`Settlement Item ${index + 1} requires Consumption Period`):()=>{})))
        }
        return list
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
        (data['Name']=="")?list.push(`Provide a name for the General Ledger`):()=>{}
        return list
    }
    profitCenterError(data){
        const list = [];
        const req = ["Name", "Segment"];
        req.map(item=>(data[item]=="")?list.push(`${item} is required`):()=>{});
        return list
    }
    segmentError(data){
        const list = [];
        const req = ["Name"];
        req.map(item=>(data[item]=="")?list.push(`${item} is required`):()=>{});
        return list
    }
    gst(data){
        const result = {...data};
        const lineitems = [...result['Line Items']];
        result['Line Items'].map(item=>(item['GST']!="")?lineitems.push({...item,['GST']:""}):()=>{})
        result['Line Items'] = lineitems
        return result
    }
    material(data){
        const result = {...data};
        return result
    }
    materialError(data){
        const list = [];
        const req = ["Description", "General Legder", "Unit"];
        req.map(item=>(data[item]=="")?list.push(`${item} is required`):()=>{});
        return list
    }
    vendorError(data){
        const list = []
        const req = ["Name"];
        req.map(item=>(data[item]=="")?list.push(`${item} is required`):()=>{});
        return list
    }
    assetError(data){
        const list = []
        const req = ["Name", "Asset Class", "Cost Center", "Useful Life", "Date of Capitalisation","Salvage value"];
        req.map(item=>(data[item]=="")?list.push(`${item} is required`):()=>{});
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
    static yearEnd(dateString){
        const yearStart = new Date(this.yearStart(dateString));
        const yearEnd = new Date(yearStart.getFullYear()+1,yearStart.getMonth(),0) 
        const result = `${yearEnd.getFullYear()}-${yearEnd.getMonth()+1}-${yearEnd.getDate()}`
        return result
    }
}

class Unit{
    constructor(code){
        this.code = code
    }
    static data = Database.load("Unit")
    static list(){
        const list = ListItems(this.data,"Code")
        return list
    }
}
const objects = {
    "Asset":{
        "name":"Asset",
        "schema": [
            {"name":"Code", "value":"calculated"},
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Asset Class", "datatype":"single", "input":"option", "options":["",...AssetClass.list()],"use-state":""},
            {"name": "Cost Center", "datatype":"single", "input":"option", "options":["",...CostCenter.list()],"use-state":""},
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
    "Bank Account":{
        "name":"Bank Account",
        "collection":"bankaccounts",
        "schema":[
            {"name":"Name","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Bank Name","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"IFSC","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Account Number","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"General Ledger","datatype":"single","input":"option","options":["",...GeneralLedger.listtype('Bank Account')],"use-state":""},
            {"name":"Profit Center","datatype":"single","input":"option","options":["",...ProfitCenter.list()],"use-state":""},
            {"name":"Virtual Accounts","datatype":"collection","structure":[
                {"name":"Virtual Account Number","datatype":"single","input":"input","type":"text","use-state":""},
                {"name":"Ledger","datatype":"single","input":"option","options":["",...Customer.list()],"use-state":""},
            ],"use-state":[{"Virtual Account Number":"","Ledger":""}]},
        ]
    },
    "Cost Center":{
        "name": "Cost Center",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":"Chennai"},
            {"name": "Profit Center", "datatype":"single", "input":"option", "options":["",...ProfitCenter.list()], "use-state":"No"},
            {"name":"Apportionment Ratio","datatype":"nest","structure":[{"name":"From", "datatype":"single", "input":"input", "type":"text"},{"name":"To", "datatype":"single", "input":"input", "type":"text"},{"name":"Ratio", "datatype":"collection", "structure":[{"name":"To", "datatype":"single", "input":"input", "type":"text"},{"name":"Ratio", "datatype":"single", "input":"input", "type":"text"}]}],"use-state":[{"From":"2025-04-01","To":"2026-03-31","Ratio":[{"To":"Head Office","Ratio":0.50}]}]}
        ],
        "collection":"costcenters"
    },
    "Cost Object":{
        "name":"Cost Object",
        "collection":"costobjects",
        "schema":[
            {"name":"Description","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Cost Accumulation Period","datatype":"object","structure":[{"name":"From", "datatype":"single", "input":"input", "type":"date"},{"name":"To", "datatype":"single", "input":"input", "type":"date"}],"use-state":{"From":"","To":""}},
            {"name":"Settlement Ratio","datatype":"collection","structure":[
                {"name":"To","datatype":"single","input":"option","options":CostObject.transferablesList()},
                {"name":"Proportion","datatype":"single","input":"input","type":"number"},
                {"name":"Type","datatype":"single","value":"calculated"},
                {"name":"Consumption Time From", "datatype":"single","input":"input","type":"date"},
                {"name":"Consumption Time To", "datatype":"single","input":"input","type":"date"}
            ],
            "use-state":[{"To":"","Proportion":"","Consumption Time From":"","Consumption Time To":""}]},

        ]
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
            {"name":"Name","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Address","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"PIN","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"Phone","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"E-mail","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"PAN","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"GSTIN","datatype":"single","input":"input","type":"text","use-state":""},
            {"name": "Bank Accounts", "datatype":"collection", "structure":[{"name":"Bank", "datatype":"single", "input":"input", "type":"text"},{"name":"IFSC", "datatype":"single", "input":"input", "type":"text"},{"name":"Account Number", "datatype":"single", "input":"input", "type":"number"},{"name":"Confirm Account Number", "datatype":"single", "input":"input", "type":"number"},{"name":"Validated", "value":"calculated", "datatype":"single"}],"use-state":[{"id":0,"Bank":"SBI","IFSC":"SBIN0070056","Account Number":"000000000000", "Confirm Account Number":"000000000000"}]},
            {"name":"Payment Terms","datatype":"single","input":"option","options":[],"use-state":""},
        ]
    },
    "Employee":{
        "name":"Employee",
        "schema": [
            {"name":"ID", "value":"calculated"},
            {"name": "Name", "datatype":"single", "input":"input","type":"text","use-state":""},
            {"name": "Address", "datatype":"single", "input":"input","type":"text","use-state":""},
            {"name": "PIN", "datatype":"single", "input":"input","type":"number","use-state":""},
            {"name": "Phone", "datatype":"single", "input":"input","type":"number","use-state":""},
            {"name": "E-mail", "datatype":"single", "input":"input","type":"text","use-state":""},
            {"name": "PAN", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Date of Birth", "datatype":"single", "input":"input", "type":"date", "use-state":0},
            {"name":"Age","value":"calculated"},
            {"name": "Date of Hiring", "datatype":"single", "input":"input", "type":"date", "use-state":0},
            {"name": "Bank Accounts", "datatype":"collection", "structure":[{"name":"Bank", "datatype":"single", "input":"input", "type":"text"},{"name":"IFSC", "datatype":"single", "input":"input", "type":"text"},{"name":"Account Number", "datatype":"single", "input":"input", "type":"number"},{"name":"Confirm Account Number", "datatype":"single", "input":"input", "type":"number"},{"name":"Validated", "value":"calculated", "datatype":"single"}],"use-state":[{"id":0,"Bank":"SBI","IFSC":"SBIN0070056","Account Number":"000000000000", "Confirm Account Number":"000000000000"}]},
            {"name":"Employment Details", "datatype":"collection","structure":[{"name":"Organisational Unit", "datatype":"single", "input":"option", "options":[""]},{"name":"Position", "datatype":"single", "input":"input", "type":"text"},{"name":"Scale", "datatype":"single", "input":"input", "type":"number"},{"name":"From", "datatype":"single", "input":"input", "type":"date"},{"name":"To", "datatype":"single", "input":"input", "type":"date"}], "use-state":[{"id":0,"Organisational Unit":"Finance","Position":"Assistant Manager","Scale":100000,"From":0,"To":0}]},
            {"name":"Deductions - Recurring","datatype":"collection","structure":[{"name":"Description","datatype":"single", "input":"input", "type":"text"},{"name":"From","datatype":"single", "input":"input", "type":"date"},{"name":"To","datatype":"single", "input":"input", "type":"date"},{"name":"Amount","datatype":"single", "input":"input", "type":"number"}], "use-state":[{"Description":"","From":"","To":"","Amount":""}]},
            {"name":"Deductions - Onetime","datatype":"collection","structure":[{"name":"Description","datatype":"single", "input":"input", "type":"text"},{"name":"Date","datatype":"single", "input":"input", "type":"date"},{"name":"Amount","datatype":"single", "input":"input", "type":"number"}], "use-state":[{"Description":"","Date":"","Amount":""}]},
            {"name":"Incometax Regime","datatype":"single","input":"option","options":["New","Old"],"use-state":""},
            {"name":"Incometax - Additional Income","datatype":"collection","structure":[{"name": "Tax Year", "datatype":"single", "input":"input","type":"number"},{"name": "Description", "datatype":"single", "input":"input","type":"text"},{"name": "Amount", "datatype":"single", "input":"input","type":"number"}],"use-state":[{"Tax Year":"","Description":"","Amount":""}]},
            {"name":"Incometax - Deductions","datatype":"collection","structure":[{"name": "Tax Year", "datatype":"single", "input":"input","type":"number"},{"name": "Description", "datatype":"single", "input":"input","type":"text"},{"name": "Amount", "datatype":"single", "input":"input","type":"number"}],"use-state":[{"Tax Year":"","Description":"","Amount":""}]},
            {"name":"Leaves","datatype":"collection","structure":[{"name": "From", "datatype":"single", "input":"input","type":"date"},{"name": "To", "datatype":"single", "input":"input","type":"date"},{"name": "Type of Leave", "datatype":"single", "input":"input","type":"text"}],"use-state":[{"From":"","To":"","Type of Leave":""}]},
        ],
        "collection":'employees'
    },
    "General Ledger":{
        "name":"General Ledger",
        "schema":[
            {"name":"Code", "value":"calculated"},
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name":"Ledger Type","datatype":"single","input":"option","options":["Asset", "Bank Account", "Cost Element", "Customer", "Depreciation" ,"General",  "Material", "Vendor"]},
            {"name": "Presentation", "datatype":"single", "input":"option", "options":["Income", "Expense", "Asset", "Liability", "Equity"], "use-state":"Income"},
            {"name": "Enable Clearing", "datatype":"single", "input":"option","options":["True","False"], "use-state":"True"},
        ],
        "collection":"generalledgers"
    },
    "Location":{
        "name":"Location",
        "schema": [
            {"name":"Name", "datatype":"single", "input":"input", "type":"text","use-state":""},
            {"name":"Cost Center", "datatype":"single", "input":"option", "options":["",...CostCenter.list()],"use-state":""},
        ],
        "collection":"locations"
    },
    "Material":{
        "name":"Material",
        "schema":[
            {"name":"Description", "datatype":"single", "input":"input", "type":"text","use-state":""},
            {"name":"General Ledger", "datatype":"single", "input":"option", "options":["",...GeneralLedger.listtype('Material')],"use-state":""},
            {"name":"Unit", "datatype":"single", "input":"option", "options":["",...Unit.list()],"use-state":""},
            {"name":"Price", "datatype":"collection", "structure":[{"name":"Location","datatype":"single","input":"input","type":"text"},{"name":"Date","datatype":"single","input":"input","type":"date"},{"name":"Price","datatype":"single","input":"input","type":"number"}],"use-state":[{"Location":"","Date":"","Price":""}]},
        ],
        "collection":"materials"
    },
    "Organisational Unit":{
        "name":"Organisational Unit",
        "collection":"organisationalunits",
        "schema":[
            {"name":"Name", "datatype":"single", "input":"input", "type":"text","use-state":""},
            {"name":"Cost Center", "datatype":"single", "input":"option", "options":["",...CostCenter.list()],"use-state":""}
        ]
    },
    "Payment Term":{
        "name":"Payment Term",
        "schema":[
            {"name":"Description","datatype":"single", "input":"input", "type":"text","use-state":"45 Days Net"},
            {"name":"Discounting Criteria", "datatype":"collection","structure":[{"name":"Days from Supply","datatype":"single","input":"input","type":"number"},{"name":"Discount %","datatype":"single","input":"input","type":"number"}] , "use-state":[{"Days from Supply":45,"Discount %":0}]}
        ],
        "collection":"paymentterms"
    },
    "Profit Center":{
        "name":"Profit Center",
        "schema":[
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Segment", "datatype":"single", "input":"option", "options":["",...Segment.list()], "use-state":""},
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
                {"name":"Price","datatype":"single","input":"input","type":"number"},
                {"name":"Value","datatype":"single","value":"calculated"},
                {"name":"Cost Center","datatype":"single","input":"input","type":"text"},
                {"name":"Cost Object","datatype":"single","input":"input","type":"text"},
            ],"use-state":[{"id":0,"Material/ Service":"","Quantity":0,"Price":0, "Value":0,"Cost Center":"","Cost Object":""}]}
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
    "Unit":{
        "name":"Unit",
        "collection":"units",
        "schema":[
            {"name":"Code","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Description","datatype":"single","input":"input","type":"text","use-state":""},
        ]
    },
    "Vendor":{
        "name":"Vendor",
        "collection":"vendors",
        "schema": [
            {"name":"Name","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Address","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"PIN","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"Phone","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"E-mail","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"PAN","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"GSTIN","datatype":"single","input":"input","type":"text","use-state":""},
            {"name": "Bank Accounts", "datatype":"collection", "structure":[{"name":"Bank", "datatype":"single", "input":"input", "type":"text"},{"name":"IFSC", "datatype":"single", "input":"input", "type":"text"},{"name":"Account Number", "datatype":"single", "input":"input", "type":"number"},{"name":"Confirm Account Number", "datatype":"single", "input":"input", "type":"number"},{"name":"Validated", "value":"calculated", "datatype":"single"}],"use-state":[{"id":0,"Bank":"SBI","IFSC":"SBIN0070056","Account Number":"000000000000", "Confirm Account Number":"000000000000"}]},
            {"name":"Payment Terms","datatype":"single","input":"option","options":[],"use-state":""},
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
                    {"name":"Account", "datatype":"single","input":"option","options":[...Material.list(),...Asset.list(),...GeneralLedger.listtype('General'),...GeneralLedger.listtype('Cost Element'),...BankAccount.list(),...Vendor.list()],"use-State":""},
                    {"name":"General Ledger","value":"calculated","datatype":"single"},
                    {"name":"Account Type", "datatype":"single","value":"calculated"},
                    {"name":"Amount", "datatype":"single","input":"input","type":"number"},
                    {"name":"Debit/ Credit", "datatype":"single","input":"option","options":["Debit", "Credit"]},
                    {"name":"GST", "datatype":"single","input":"option","options":["Input 5%", "Input 12%", "Input 18%", "Input 40%","Output 5%", "Output 12%", "Output 18%", "Output 40%"]},
                    {"name":"Description", "datatype":"single","input":"input","type":"text"},
                    {"name":"Cost Center", "datatype":"single","input":"input","type":"text"},
                    {"name":"Quantity", "datatype":"single","input":"option","options":[]},
                    {"name":"Value Date", "datatype":"single","input":"input","type":"date"},
                    {"name":"Location", "datatype":"single","input":"option","options":ListofItems(loadData('locations'),0)},
                    {"name":"Profit Center", "datatype":"single","input":"option","options":ListofItems(loadData('profitcenters'),0)},
                    {"name":"Cost Object", "datatype":"single","input":"option","options":["",...CostObject.list()]},
                    {"name":"Purchase Order", "datatype":"single","input":"option","options":ListofItems(loadData('purchaseorders'),0)},
                    {"name":"Purchase Order Item", "datatype":"single","input":"option","options":[]},
                    {"name":"Sale Order", "datatype":"single","input":"option","options":ListofItems(loadData('serviceorders'),0)},
                    {"name":"Sale Order Item", "datatype":"single","input":"option","options":[]},
                    {"name":"Employee", "datatype":"single","input":"option","options":ListofItems(loadData('employees'),0)},
                    {"name":"Consumption Time From", "datatype":"single","input":"input","type":"date"},
                    {"name":"Consumption Time To", "datatype":"single","input":"input","type":"date"},
                    {"name":"Cost per Day","value":"calculated","datatype":"single"},
                    {"name":"Cleared","value":"calculated","datatype":"single"}

                ],  
                "use-state":[{"id":0,"Account":"","Account Type":"","General Ledger":"","Amount":0,"Debit/ Credit":"Debit","GST":"","Cost Center":"","Cost Object":"","Asset":"","Material":"","Quantity":"","Location":"","Profit Center":"","Purchase Order":"","Purchase Order Item":"","Sale Order":"","Sale Order Item":"","Consumption Time From":"","Consumption Time To":"","Employee":"","Cost per Day":0,"Cleared":false}]}
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

function numberDay(number){
    const milliseconds = number*86400000;
    const date = new Date(milliseconds);
    const text = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,0)}-${(date.getDate()).toString().padStart(2,0)}`
    return text

}

function datesInPeriod(period){
    const [from,to] = period
    const interval = dayNumber(to) - dayNumber(from)
    const list = []
    for (let i = 0; i<=interval;i++){
        list.push(numberDay(dayNumber(from)+i))
    }
    return list
}

function daysInPeriod(period){
    const [from,to] = period
    const interval = dayNumber(to) - dayNumber(from) +1
    return interval
}

function datesInMonth(year,month){
    const startDate = new Date(`${year}-${month}-01`)
    const endDate = new Date(startDate.getFullYear(),startDate.getMonth()+1,0)
    const list = datesInPeriod([`${startDate.getFullYear()}-${startDate.getMonth()+1}-01`,`${endDate.getFullYear()}-${endDate.getMonth()+1}-${endDate.getDate()}`])
    return list
}

function daysInMonth(year,month){
    const startDate = new Date(`${year}-${month}-01`)
    const endDate = new Date(startDate.getFullYear(),startDate.getMonth()+1,0)
    const interval = daysInPeriod([`${startDate.getFullYear()}-${startDate.getMonth()+1}-01`,`${endDate.getFullYear()}-${endDate.getMonth()+1}-${endDate.getDate()}`])
    return interval
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
                <h1 className="createWelcome">Welcome</h1>
                <div className="createOptions">
                    <div className="createOption"><button className='blue' onClick={()=>initialise()}>Quick Initialise</button><p>Instantly creates a sample company</p></div>
                    <div className="createOption"><button className='green' onClick={()=>newCompany()}>New Company</button><p>Manual set-up of company</p></div>
                </div>
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
            <h2 className='companyInfoTitle'>Company Info</h2>
            <div className='companyDetails'>
                <div className='companyDetail'><label>Name </label><input required disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['Name']:e.target.value}))} value={data['Name']}/></div>
                <div className='companyDetail'><label>GSTIN</label><input onChange={(e)=>setdata(prevdata=>({...prevdata,['GSTIN']:e.target.value}))} type="text" disabled={!editable} value={data['GSTIN']}/></div>
                <div className='companyDetail'><label>PAN</label><input type="text" disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['PAN']:e.target.value}))} value={data['PAN']}/></div>
                <div className='companyDetail'><label>0<sup>th</sup> Year</label><input required min={1900} max={2050} type="number" disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['Year 0']:e.target.value}))} value={data['Year 0']}/></div>
                <div className='companyDetail'><label>Beginning Month of a Financial Year</label><select required disabled={!editable} value={data['Financial Year Beginning']} onChange={(e)=>setdata(prevdata=>({...prevdata,['Financial Year Beginning']:e.target.value}))}>{months.map(month=><option value={month['Number']}>{month['Month']}</option>)}</select></div>
                <div className='companyDetailObject'>
                    <label>Functional Currency</label>
                    <div className='companyDetail'><label>Code</label><input type="text" disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['Functional Currency']:{...prevdata['Functional Currency'],['Code']:e.target.value}}))} value={data['Functional Currency']['Code']}/></div>
                    <div className='companyDetail'><label>Currency</label><input type="text" disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['Functional Currency']:{...prevdata['Functional Currency'],['Currency']:e.target.value}}))} value={data['Functional Currency']['Currency']}/></div>

                </div>
            </div>
            
            <div className='companyInfoButtons'>
                {editable && <button className="blue" onClick={()=>cancel()}>Cancel</button>}
                {editable && <button className="green" onClick={()=>save()}>Save</button>}
                {!editable && <button className="blue" onClick={()=>seteditable(true)}>Edit</button>}
                {!editable && <button className="red" onClick={()=>deleteCompany()}>Delete Company</button>}
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
          <div className='queryTitle'><h2>Choose {object}</h2></div>
            <select className='querySelect' value={selected} onChange={(e)=>setselected(e.target.value)}>
                {list.map((item,index)=><option value={index}>{item}</option>)}
            </select>
            <div className='queryButtons'>
            <button className='green' onClick={()=>{navigate(`/create/${object}`)}}>Create {object}</button>
            <button className='blue' onClick={()=>{objectQuery('display')}}>View</button>
            <button className='blue' onClick={()=>{objectQuery('update')}}>Update</button>
            <button className='red' onClick={()=>{navigate(`/deactivate/${object}/${selected}/`)}}>Deactivate</button>
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
        <div className='searchBarOuter'>
        <div className='searchBar'>
            <button className="green" onClick={()=>navigate('/company')}>Company</button>
            <button className='red' onClick={()=>navigate(`/`)}>Home</button>
            <input type="text" value={url} ref={inputRef} onChange={changeUrl} placeholder="Go to . . ."/>
            <button className="green" onClick={search}>&rarr;</button>
        </div>
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

function Record(){

    const navigate = useNavigate();
  
  return(
    <div className='menuContainer'>
            <h3 className='menuContainerTitle'>Record</h3>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Generic</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/create/Transaction`)}}><h4>Transaction</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Costing</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/costobjectsettlement`)}}><h4>Cost Object Settlement</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/costtoprepaid`)}}><h4>Cost to Prepaid</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Payroll</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/salaryrun`)}}><h4>Salary Posting</h4></div>
            </div>
    </div>
  )
}

function Control(){

    const navigate = useNavigate();
    const list = [
        {"Group":"Asset Accounting","items":["Asset","Asset Class"]},
        {"Group":"Costing","items":["Cost Center","Cost Object"]},
        {"Group":"Financial Accounting","items":["General Ledger","Profit Center","Segment","Currency"]},
        {"Group":"Material","items":["Material","Service","Purchase Order","Sale Order","Location","Unit"]},
        {"Group":"Payroll","items":["Employee", "Organisational Unit"]},
        {"Group":"Receivables & Payables","items":["Bank Account", "Customer","Vendor","Payment Terms"]}
    ]
  
    return(
        <div className='menuContainer'>
            <h3 className='menuContainerTitle'>Control</h3>
            {list.map(item=>
                <div className='menuList'>
                    <div className='menuTitle red'><h4>{item["Group"]}</h4></div>
                    {item['items'].map(object=>
                        <div className='menuItem' onClick={()=>{navigate(`/query/${object}`)}}><h4>{object}</h4></div>
                    )}
                    
                </div>
            )}
            <div className='menuList'>
            <div className='menuTitle red'><h4>Config</h4></div>
            <div className='menuItem' onClick={()=>navigate('/timecontrol')}><h4>Time Control</h4></div>
            <div className='menuItem' onClick={()=>navigate('/holidays')}><h4>Holidays</h4></div>
            </div>
        </div>
    )
}

function Reports(){

    const navigate = useNavigate();
    return(
        <div className='menuContainer'>
            <h3 className='menuContainerTitle'>Reports</h3>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Costing</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/costobjectbalance`)}}><h4>Cost Object Balance</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/costobjecttransactions`)}}><h4>Cost Object Transactions</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/costcenteritems`)}}><h4>Cost Center Items</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Payroll</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/paycalc`)}}><h4>Salary Calculator</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Receivables & Payables</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/vendoropenitem`)}}><h4>Vendor Open Item</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Assets</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/vendoropenitem`)}}><h4>Open Item</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Miscellaneous</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/ledger`)}}><h4>Ledger Display</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/scratch`)}}><h4>Scratch</h4></div>
            </div>
        </div>
    )
}


function DisplayAsTable({collection}){

    if (collection.length!=0){
    const fields = Object.keys(collection[0]);

    return (
        <div className='displayAsTable'>
            <table className='displayTable'>
                <thead><tr>{fields.map(field=><th className='displayTableCell'>{field}</th>)}</tr></thead>
                <tbody>{collection.map(data=><tr>{fields.map(field=><td className='displayTableCell'>{data[field]}</td>)}</tr>)}</tbody>
            </table>
        </div>
    )
} else {
    return (
        <div className='displayAsTable'>
            Sorry! No data found.
        </div>
    )
}
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
    const deactivated = output['Deactivated'];
    const editable = (!deactivated && (method==="Create" || method==="Update"))?true:false
    const errorlist = findError()

    function findError(){
        const list = []
        switch(object){
            case 'Bank Account':
                list.push(...new Intelligence().bankAccountError(data))
                break
            case 'Cost Object':
                list.push(...new Intelligence().costobjectError(output));
                break
            case 'Transaction':
                (output['Balance']!=0)?list.push("Balance not zero"):null
                output['Line Items'].map((item,index)=>list.push(...new Intelligence().lineItemErrors(item,index)))
                break
            case 'General Ledger':
                list.push(...new Intelligence().generalledgerError(output))
            case 'Asset':
                list.push(...new Intelligence().assetError(output));
                ((new Date(output['Date of Capitalisation']))>(new Date()))?list.push("Date of capitalisation cannot be a future date."):()=>{}
                break
            case 'Employee' :
                output['Bank Accounts'].map((item,i)=>(item['Validated']=="No")?list.push(`Bank Account ${i+1} is not validated`):()=>{});
                ((new Date(output['Date of Birth']))>(new Date()))?list.push("Date of Birth cannot be a future date."):()=>{}
                break
            case 'Vendor':
                list.push(...new Intelligence().vendorError(output))
                break
            case 'Profit Center':
                list.push(...new Intelligence().profitCenterError(output))
                break
            case 'Segment':
                list.push(...new Intelligence().segmentError(output))
                break
        }
        return list
    }
    
    function process(){
        let result = data;
        switch(object){
            case 'Cost Object':
                result = new Intelligence().costobject(result)
                break
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
        {method != "Deactivate" && <div className='crudUI'>
            <h2 className='crudTitle'>{`${method} ${object}`}</h2>
            {deactivated && <h4>The {object} has been deactivated and can only been viewed.</h4>}
        <div className='crudFields'>
        {schema.map(field=>
        <>
        {field['value']=="calculated" && <div className='crudField'><div className='crudRow'><label>{field['name']}</label><input value={output[field['name']]} disabled={true}/></div></div>}
        {field['datatype']=="single" && <div className='crudField'><div className='crudRow'><label>{field['name']}</label>{ field['input'] == "input" && <input disabled={(field['disabled']||!editable)} type={field['type']} onChange={(e)=>handleChange1(field['name'],e)} value={output[field['name']]}/>}{field['input']=="option" && <select disabled={(field['disabled']||!editable)} onChange={(e)=>handleChange1(field['name'],e)} value={output[field['name']]}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}</div></div>}
        {field['datatype']=="object" && <div className='crudField'><div className='crudObject'><label>{field['name']}</label>{field['structure'].map(subfield=><>{subfield['datatype']=="single"&&<div className='crudRow'><label>{subfield['name']}</label>{subfield['input']=="input" && <input type={subfield['type']} onChange={(e)=>handleChange2(field['name'],subfield['name'],e)} value={output[field['name']][subfield['name']]} disabled={(field['disabled']||!editable)}/>}{subfield['input'] == "option" && <select disabled={(field['disabled']||!editable)} onChange={(e)=>handleChange2(field['name'],subfield['name'],e)} value={output[field['name']][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}</div>}</>)}</div></div>}
        {field['datatype']=="collection" && <div className='crudField'><div className='crudObject'><label>{field['name']}</label><div className='crudTable'><table><thead><tr><th className='crudTableCell'></th>{field['structure'].map(subfield=><th className='crudTableCell'>{subfield['name']}</th>)}</tr></thead>{output[field['name']].map((item,index)=><tbody><tr><td className='crudTableCell'><button disabled={(field['disabled']||!editable)} onClick={(e)=>removeItem(field['name'],index,e)}>-</button></td>{field['structure'].map(subfield=><>{subfield['datatype']=="single" && <td className='crudTableCell'>{subfield['value']=="calculated" && <input value={output[field['name']][index][subfield['name']]} disabled={true}/>} {subfield['input']=="input"&& <input disabled={(field['disabled']||!editable)} onChange={(e)=>handlechange3(field['name'],subfield['name'],index,e)} type={subfield['type']} value={output[field['name']][index][subfield['name']]}/>}{subfield['input']=="option" && <select disabled={(field['disabled']||!editable)} onChange={(e)=>handlechange3(field['name'],subfield['name'],index,e)} value={output[field['name']][index][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}</td>}</>)}</tr></tbody>)}</table></div><div className='crudObjectButtons'><button className="blue" disabled={(field['disabled']||!editable)} onClick={(e)=>addItem(field['name'],field['use-state'][0],e)}>Add</button></div></div></div>}
        {field['datatype']=="nest" && <div className="crudField"><div className="crudObject"><label>{field['name']}</label><button>Add</button><div className='crudGrid'>{output[field['name']].map((item,index)=><div className="crudFields">{field['structure'].map(subfield=><div className='crudField'>{subfield['datatype']=="single" && <div className='crudRow'><label>{subfield['name']}</label><input value={output[field['name']][index][subfield['name']]} type={subfield['type']}/></div>}{subfield['datatype']=="collection" && <div className='crudObject'><label>{subfield['name']}</label><div className='crudTable'><table><thead><tr><th className='crudTableCell'></th>{subfield['structure'].map(thirdfield=><th className='crudTableCell'>{thirdfield['name']}</th>)}</tr></thead><tbody>{output[field['name']].map((subitem,subindex)=><tr><td><div className='crudTableCell'><button></button></div></td>{subfield['structure'].map(thirdfield=><td><div className='crudTableCell'><input value={output[field['name']][index][subfield['name']][subindex][thirdfield]}/></div></td>)}</tr>)}</tbody></table></div></div> }</div>)}</div>)}</div></div></div>}
        </>)}</div>
        <div className='crudError'>
            <label>{`${errorlist.length} Error(s)`}</label>
            <ul>
                {errorlist.map(item=><li>{item}</li>)}
                </ul>
        </div>
        <div className='crudButtons'>
            {(!deactivated && method==="Create") && <><button className='blue' onClick={()=>cancel()}>Cancel</button><button className='green' onClick={()=>save()}>Save</button></>}
            {(!deactivated && method==="Update") && <><button  className='blue' onClick={()=>cancel()}>Cancel</button><button className='green' onClick={()=>save()}>Update</button></>}
            {(method==="Display" || deactivated) && <><button className='blue' onClick={()=>cancel()}>Back</button></>}
        </div>
        </div>
        }
        {method == "Deactivate" && 
            <div className='query'>
        <label className='queryTitle'>{`Deactivate ${object}`}</label>
        {!deactivated && <>
        <p>Are you sure want to {`deactivate ${object} ${id}`} ?</p>
        <div className='queryButtons'>
            <button className="blue" onClick={()=>{cancel()}}>Cancel</button>
            <button className="red" onClick={()=>deactivate()}>Deactivate</button>
        </div>
        </>
}

    {deactivated && <>
        <p>{object} has already been deactivated!</p>
        <div className='queryButtons'>
        <button className="blue" onClick={()=>{cancel()}}>Back</button>
        </div>
   </> }
        </div>
        }
        </>
    )
    
}

class Report{
    constructor(name){
        this.name = name;
        this.schema = Report.schema[this.name];
    }
    default(){
        const result = {};
        this.schema.map(item=>result[item['name']]=Report.defaultobject(item['fields']))
        return result
    }
    static defaultobject(fields){
        const result = {}
        fields.map(field=>result[field]=this.defaults(field))
        return result
    }
    static defaults(field){
        let result = ""
        switch (field){
            case 'value':
                result =  ''
                break
            case 'values':
                result = ['']
                break
            case 'exclValues':
            result = ['']
            break
            case 'range' :
                result = ['','']
                break
            case 'ranges' :
                result =  [['','']]
                break
            case 'exclRanges' :
                result =  [['','']]
                break
        }
        return result
    }
    static schema = {
        "costcenteritems":[
            {"name":"centers","label":"Cost Centers","fields":['values']},
            {"name":"date","label":"Date","fields":['values']}
        ],
        "costobjectbalance":[
            {"name":"objects","label":"Cost Objects","fields":['values']}
        ],
        "costobjecttransactions":[
            {"name":"objects","label":"Cost Objects","fields":['values']}
        ],
        "costobjectsettlement":[
            {"name":"object","label":"Cost Object","fields":["value"]}
        ],
        "costtoprepaid":[
            {"name":"date","label":"Date","fields":["value"]}
        ],
        "ledger":[
            {"name":"ledger","label":"Ledger","fields":["values"]},
            {"name":"period","label":"Period","fields":["range"]},
        ],
        "paycalc":[
            {"name":"id", "label":"Employee ID","fields":["value"]},
            {"name":"year", "label":"Year","fields":["value"]},
            {"name":"month", "label":"Month","fields":["value"]},
        ],
        "salaryrun":[
            {"name":"year", "label":"Year","fields":["value"]},
            {"name":"month", "label":"Month","fields":["value"]},
        ],
        "vendoropenitem":[
            {'name':"vendor","label":"Vendor","fields":["values"]},
            {'name':"date","label":"Date","fields":["value"]},
        ]
    }
}

function ReportQuery(){
    const {report} = useParams();
    const reportobject = new Report(report);
    const [query,setquery] = useState(reportobject.default());
    const {schema} = reportobject
    const navigate = useNavigate();

    function submitQuery(){
        navigate('/reportdisplay/'+report, {state: query})
    }

    function valueChange(itemname,field,e){
        const {value} = e.target;
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:value}
        }))
    }

    function rangeChange(itemname,field,i,e){
        const {value} = e.target;
        const prevrange = [...query[itemname][field]];
        const newrange = prevrange.map((item,index)=>(i==index)?value:item);
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:newrange}
        }))
    }

    function valuesChange(itemname,field,i,e){
        const {value} = e.target;
        const prevvalues = [...query[itemname][field]];
        const newvalues = prevvalues.map((item,index)=>(i==index)?value:item);
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:newvalues}
        }))
    }

    function rangesChange(itemname,field,i,j,e){
        const {value} = e.target;
        const prevranges = [...query[itemname][field]];
        const prevrange = prevranges[i];
        const newrange = prevrange.map((item,index)=>(j==index)?value:item);
        const newranges = prevranges.map((item,index)=>(i==index)?newrange:item);
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:newranges}
        }))
    }

    function addValues(itemname,field){
        const defaults = Report.defaults(field);
        const newvalues = [...query[itemname][field],...defaults]
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:newvalues}}))
    }

    function addRanges(itemname,field){
        const defaults = Report.defaults(field);
        const newvalues = [...query[itemname][field],...defaults]
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:newvalues}}))
    }

    return(
        <div className='reportQuery'>
            <h2 className='reportQueryTitle'>Query</h2>
        {schema.map(item=>
            <div className="reportQueryField">
                <label>{item['label']}</label>
                {item["fields"].map(field=>
                    <div className='reportQuerySubfield'>
                        <label>{field}</label>
                        {field == "option" && <>option</>}
                        {field =="value" && <input className='reportQueryCell' onChange={(e)=>valueChange(item['name'],field,e)} value={query[item['name']][field]}/>}
                        {field =="values" && <div className='reportQueryColumn'>{query[item['name']][field].map((values,i)=><div><input className='reportQueryCell' onChange={(e)=>valuesChange(item['name'],field,i,e)} value={query[item['name']][field][i]}/></div>)} <button onClick={()=>addValues(item['name'],field)}>+</button></div>}
                        {field =="exclValues" && <div className='reportQueryColumn'>{query[item['name']][field].map((values,i)=><div><input className='reportQueryCell' onChange={(e)=>valuesChange(item['name'],field,i,e)} value={query[item['name']][field][i]}/></div>)} <button onClick={()=>addValues(item['name'],field)}>+</button></div>}
                        {field =="range" && <div className='reportQueryRow'><input className='reportQueryCell' onChange={(e)=>rangeChange(item['name'],field,0,e)} value={query[item['name']][field][0]}/><input className='reportQueryCell' onChange={(e)=>rangeChange(item['name'],field,1,e)} value={query[item['name']][field][1]}/></div>}
                        {field =="ranges" && <div className='reportQueryColumn'>{query[item['name']][field].map((ranges,i)=><div><div className='reportQueryRow'><input className='reportQueryCell' onChange={(e)=>rangesChange(item['name'],field,i,0,e)} value={query[item['name']][field][i][0]}/><input className='reportQueryCell' onChange={(e)=>rangesChange(item['name'],field,i,1,e)} value={query[item['name']][field][i][1]}/></div></div>)} <button onClick={()=>addRanges(item['name'],field)}>+</button></div>}
                        {field =="exclRanges" && <div className='reportQueryColumn'>{query[item['name']][field].map((ranges,i)=><div><div className='reportQueryRow'><input  className='reportQueryCell' onChange={(e)=>rangesChange(item['name'],field,i,0,e)} value={query[item['name']][field][i][0]}/><input className='reportQueryCell' onChange={(e)=>rangesChange(item['name'],field,i,1,e)} value={query[item['name']][field][i][1]}/></div></div>)} <button onClick={()=>addRanges(item['name'],field)}>+</button></div>}
                        </div>
                )}
                </div>
        )}
        
        <div className='reportQueryButtons'>
            <button className='blue' onClick={()=>submitQuery()}>Submit</button>
        </div>
        </div>
    )
}

function ReportDisplay(){
    const {report} = useParams();
    const location = useLocation()
    const query = location.state || {}
    const navigate = useNavigate()

    function CostCenterItems({query}){
        const {centers,date} = query

        return (
            <>
                {centers['values'].map(center=>
                    <div>
                        <h4>{center}</h4>
                        {date['values'].map(item=>
                            <div>
                                <h5>{item}</h5>
                                <DisplayAsTable collection={new CostCenter(center).itemsOfDate(item)}/>
                            </div>
                        )}
                    </div>
                )}   
            </>
        )
    }

    function CostObjectBalance({query}){
    const {objects} = query
    const data = [];
    objects['values'].map(item=>data.push({"Cost Object":item,"Accumulated Cost":new CostObject(item).accumulatedCost()}))
    
    return(
        <div>
            <DisplayAsTable collection={data}/>
            <button onClick={()=>navigate('/reportdisplay/costobjecttransactions', {state: query})}>Transactions</button>
        </div>
    )
}

    function CostObjectTransactions({query}){
        const {objects} = query;
        const data = [];
        objects['values'].map(item=>data.push({"Object":item,"data":new CostObject(item).transactions()}))
        return(
            <div>
                {data.map(item=>
                    <div>
                        <h3>{item["Object"]}</h3>
                        <DisplayAsTable collection={item['data']}/>
                    </div>
                )}
            </div>
        )
    }

    function CostObjectSettlement({query}){
        const {object} = query;
        const name = object['value']
        const costObject = new CostObject(name)
        const totalCost = costObject.accumulatedCost()
        const allocation = costObject.allocation()
        return(
            <div>
                <h2>Cost Object Settlement</h2>
                <h4>Object - {name}</h4>
                <p>Total Cost Accumulated: {totalCost}</p>
                <DisplayAsTable collection={allocation}/>
                <button>Cancel</button>
                <button>Post</button>
            </div>
        )
    }

    function CostToPrepaid({query}){
        const {date}  = query;
        const data = CostCenter.prepaidCostData(date['value']);

        return(
            <div>
                <DisplayAsTable collection={data}/>
            </div>
        )
    }

    function PayCalc({query}){
        const location = useLocation();
        const {id,year,month} = query;
        const data = new Employee(id['value']).salary(year['value'],month['value'])
        return(
            <>
            <DisplayAsTable collection={data}/>
            </>
        )
    }

    function SalaryRun({query}){
        const {year,month} = query
        const data = Employee.salaryrun(year['value'],month['value']);
        return(
            <>
            <DisplayAsTable collection={data}/>
            </>
        )
}

    function VendorOpenItem({query}){
        const {vendor,date} = query
        return(
            <div>
                {vendor['values'].map(item=>
                    <div>
                        <h4>{item}</h4>
                        <DisplayAsTable collection={new Vendor(item).openitems(date['value'])}/>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className='reportDisplay'>
            {report=="costcenteritems" && <CostCenterItems query={query}/>}
            {report=="costtoprepaid" && <CostToPrepaid query={query}/>}
            {report=="costobjectbalance" && <CostObjectBalance query={query}/>}
            {report=="costobjecttransactions" && <CostObjectTransactions query={query}/>}
            {report=="costobjectsettlement" && <CostObjectSettlement query={query}/>}
            {report=="paycalc" && <PayCalc query={query}/>}
            {report=="salaryrun" && <SalaryRun query={query}/>}
            {report=="vendoropenitem" && <VendorOpenItem query={query}/>}
            <div className='reportDisplayButtons'>
                <button className="blue" onClick={()=>navigate('/report/'+report)}>Back</button>
            </div>
        </div>
    )
}

function Ledger(){
    const location = useLocation()
    const data = location.state || {"list":[],"period":[]}
    const list = data['ledger']['values']
    const period = data['period']['range']
    return(
        <div className='ledgers'>
            <h3>Ledger Display</h3>
            {list.map(item=>
            <div className='ledger'>
                <h4>{item}</h4>
                <DisplayAsTable collection={new Asset(item).transactions(period)}/>
            </div>
            )}
        </div>
    )
}

class HolidayCalendar{
    constructor(year){
        this.year = year;
        this.key = "y"+year;
        this.data = HolidayCalendar.data[this.key] || [{"Date":"","Description":"Blank"}];
        this.yearStart = `${this.year}-${new Company().data['Financial Year Beginning']}-01`
        this.yearEnd = Intelligence.yearEnd(this.yearStart);
        
    }
    save(data){
        const allYearData = HolidayCalendar.data
        allYearData[this.key] = data;
        saveData(allYearData,'holidays')
    }
    error(data){
        const list = [];
        data.map((item,i)=>(dayNumber(item['Date'])<dayNumber(this.yearStart) || dayNumber(item['Date'])>dayNumber(this.yearEnd) )? list.push(`Date ${i+1} not in the year`):()=>{})
        return list
    }
    static data = ('holidays' in localStorage)?JSON.parse(localStorage.getItem('holidays')):{};
    static years = Object.keys(this.data);
    static isHoliday(date){
        let result = false;
        const year= new Date(Intelligence.yearStart(date)).getFullYear()
        const yeardata = this.data["y"+year];
        (yeardata.filter(item=>item['Date']==date).length>0)?result=true:result=false;
        return result
    }
    

}

function Holidays(){
    const [year,setyear] = useState("2025");
    const [editable,seteditable] = useState(false);
    const [selected,setselected] = useState(0);
    const [data,setdata] = useState(new HolidayCalendar(selected).data);
    const error = new HolidayCalendar(selected).error(data)

    const view =()=>{
        setselected(year);
        setdata(new HolidayCalendar(year).data)
    }
    const handleChange = (index,field,e) =>{
        const {value} = e.target;
        setdata(data.map((item,i)=>(i==index)?{...item,[field]:value}:item))
    }

    const addHoliday = ()=>{
        setdata([...data,{"Date":"","Description":""}])
    }

    const removeHoliday = (index)=>{
        setdata(data.filter((item,i)=>i!==index))
    }

    const save = ()=>{
        new HolidayCalendar(selected).save(data)
        alert('Saved!')
        window.location.reload()
    }

    return(
        <div className='holidays'>
            <div className='holidaysQuery'>
                <input onChange={(e)=>setyear(e.target.value)} value={year} type="number"/>
                <button onClick={()=>view()}>View</button>
            </div>

            {!editable && 
                <div className='holidaysDisplay'>
                    <h3 className='holidaysTitle'>{'Holidays of ' + selected}</h3>
                    <DisplayAsTable collection={data}/>
                    <button onClick={()=>seteditable(true)}>Edit</button>
                </div>
            }

            {editable && 
                <div className='holidaysDisplay'>
                    <h3 className='holidaysTitle'>{'Holidays of ' + selected}</h3>
                    <table>
                        <thead>
                            <tr><th></th><th>Date</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            {data.map((item,i)=><tr><td><button onClick={()=>removeHoliday(i)}>-</button></td><td><input type="date" onChange={(e)=>handleChange(i,'Date',e)} value={item['Date']}/></td><td><input onChange={(e)=>handleChange(i,'Description',e)} value={item['Description']}/></td></tr>)}
                        </tbody>
                    </table>
                    <div className='holidayErrors'>
                        <ul>
                    {error.map(item=><li>{item}</li>)}
                    </ul>
                    </div>
                    <button onClick={()=>addHoliday()}>+</button>
                    <button onClick={()=>save()}>Save</button>
                    
                </div>
                
            }
        </div>
    )
}

class Transaction{
    constructor(type){
        this.type = type
    }
    static lineItemTypes = ["Asset","Bank Account","General Ledger","Customer","Material","Vendor"]
    static headerFields = ["Posting Date","Document Date","Reference","Text"]
}

function TransactionUI(){
    return(
        <div>
        </div>
    )
}


function Scratch(){

    return(
        <>
        <DisplayAsTable collection={CostCenter.prepaidCostData("2024-06-22")}/>
        {JSON.stringify(CostCenter.activeList)}
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
      <Route path="/report/:report" element={<ReportQuery/>}/>
      <Route path="/reportdisplay/:report" element={<ReportDisplay/>}/>
      <Route path="/ledger" element={<Ledger/>}/> 
      <Route path='/query/:object/' element={<Query type={"Object"}/>}/>
      <Route path='/create/:object/' element={<CRUD method={"Create"}/>}/>
      <Route path='/update/:object/:id' element={<CRUD method={"Update"}/>}/>
      <Route path='/display/:object/:id' element={<CRUD  method={"Display"}/>}/>
      <Route path='/deactivate/:object/:id' element={<CRUD method={"Deactivate"}/>}/>
      <Route path="/scratch/" element={<Scratch/>}/>
      <Route path="/timecontrol" element={<TimeControlling/>}/>
      <Route path="/trialbalance" element={<TrialBalance/>}/>
      <Route path="/holidays" element={<Holidays/>}/>
      <Route path="*" element={<Home/>}/>
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