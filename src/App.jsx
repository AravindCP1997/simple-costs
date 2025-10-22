import './App.css'
import { TiTimes } from "react-icons/ti";
import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaArrowRight, FaArrowLeft, FaCopy } from 'react-icons/fa';

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
       if (logic){subtotal+=parseFloat(collection[i][field] || 0)}
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

function valueInRange(value,range){
    const [from,to] = range;
    const result = (value>=from && value<=to)?true:false;
    return result
}

function moveDate(date,years,months,days){
    const olddate = new Date(date);
    const newdate = new Date(olddate.getFullYear()+years,olddate.getMonth()+months,olddate.getDate()+days)
    return numberDay(dayNumber(newdate));
}

function ageInYears(d,t){
    const dob = new Date(d)
    const today = new Date(t)
    const delta = today.getFullYear() - dob.getFullYear()
    const result = (today>= new Date(today.getFullYear(),dob.getMonth(),dob.getDate()))?delta:delta-1;
    return result
}

function ageInDays(d,t){
    const result = dayNumber(t) - dayNumber(d) + 1;
    return result;
}

class Company{
    constructor(data){
        this.status = ('company' in localStorage);
        this.data = (this.status)?JSON.parse(localStorage.getItem('company')):{"Name":"","GSTIN":"","PAN":"","Year 0":2020,"Financial Year Beginning":"04","Functional Currency":{"Code":"INR","Currency":"Indian Rupee"}}
        this.startdate = `${this.data['Year 0']}-${this.data['Financial Year Beginning']}-01`
        this.sample = {
            "Name":"Sample Company",
            "GSTIN":"32ABDCS1234E1ZN",
            "Address":"",
            "State":"Kerala",
            "PIN":682017,
            "PAN":"ABDCS1234E",
            "Year 0":2025,
            "Financial Year Beginning":'04',
            "Functional Currency":{"Code":"INR","Currency":"Indian Rupee"}
        }
    }
    static timeMaintained = ('timecontrol' in localStorage);
    static timeControls = JSON.parse(localStorage.getItem('timecontrol'));
    static isPostingDateOpen(date){
        const firstPeriod = [this.timeControls['First']['From'],this.timeControls['First']['To']];
        const secondPeriod = [this.timeControls['Second']['From'],this.timeControls['Second']['To']]
        const result = (valueInRange(new Date(date),[new Date(firstPeriod[0]),new Date(firstPeriod[1])]) || valueInRange(new Date(date),[new Date(secondPeriod[0]),new Date(secondPeriod[1])]))
        return result;
    }
    static setTimeControl(periods){
        localStorage.setItem('timecontrol',JSON.stringify(periods))
    }
    static removeTimeControl(){
        localStorage.removeItem('timecontrol');
    }
    initialise(){
        localStorage.setItem('company',JSON.stringify(this.sample))
        localStorage.setItem('currencies',JSON.stringify(Intelligence.Currency));
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
            "Attendance":"attendance",
            "Bank Account":"bankaccounts",
            "Cost Center":"costcenters",
            "Cost Object":"costobjects", 
            "Currency":"currencies",
            "Customer":"customers",
            "Employee":"employees",
            "General Ledger":"generalledgers",
            "GST Code":'gstcodes',
            "Income Tax Code":'incometaxcodes',
            "Location":"locations",
            "Material":"materials",
            "Payment Term":"paymentterms",
            "Profit Center":"profitcenters",
            "Purchase Order":"purchaseorders",
            "Segment":"segments",
            "Service":"services",
            "Sale Order":"saleorders",
            "Unit":"units",
            "Vendor":"vendors",
            "TDS Code":"tdscodes",
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

class GSTCodes{
    constructor(code){
        this.code = code;
        this.data = GSTCodes.data.filter(item=>item['Code']==this.code)[0];
    }
    static data = Database.load('GST Code')
    static list = ListItems(this.data,'Code')
}

class TDSCodes{
    constructor(code){
        this.code = code;
        this.data = TDSCodes.data.filter(item=>item['Code']==this.code)[0];
    }
    
    static data = Database.load('TDS Code')
    static list = ListItems(this.data,'Code')
}

class Asset{
    constructor(name){
        this.name = name;
        this.data = Asset.data.filter(item=>item['Name']==this.name)[0];
        this.assetclass = new AssetClass(this.data['Asset Class']);
        this.costcenter = new CostCenter(this.data['Cost Center']);
        this.profitcenter = new ProfitCenter(this.costcenter.data['Profit Center']);
        this.segment = new Segment(this.profitcenter.data['Segment']);
        this.capdate = this.data['Date of Capitalisation'];
        this.UL = parseFloat(this.data['Useful Life']);
        this.ULDays = dayNumber(this.depCeaseDate()) - dayNumber(this.capdate) + 1;
        this.SV = parseFloat(this.data['Salvage Value']);
    }
    register(date) {
        
        const data = {...this.data,...{
            "Cost":this.cost(date),
            "Planned Depreciation":this.depreciation(date),
            "Depreciated Amount":this.depreciatedAmount(date),
            "Depreciable Amount":this.depreciableAmount(date),
            "Depreciated Till":this.depPostedUpTo(),
            "Profit Center":this.profitcenter.name, 
            "General Ledger - Asset":this.assetclass.data['General Ledger - Asset'], 
            "General Ledger - Depreciation":this.assetclass.data['General Ledger - Depreciation'], 
            "Segment":this.segment.name}
        }
        return data
    }
    depCeaseDate(){
        const capdate = new Date(this.capdate);
        const newdate = new Date(capdate.getFullYear()+this.UL,capdate.getMonth(),capdate.getDate()-1);
        return numberDay(dayNumber(newdate));
    }
    isDepreciable(date){
        const depreciable = (new Date(this.data['Date of Capitalisation'])<= new Date(date) && (this.data['Date of Removal']=="" || new Date(this.data['Date of Removal']) >new Date(date) ));
        return depreciable
    }
    transactions(period){
        const data = new Intelligence().transactionstable();
        const [from,to] = period;
        const filtered = data.filter(item=>item['Account']==this.name && item['Account Type']=="Asset" && item['Posting Date']>=from && item['Posting Date']<=to);
        return filtered
    }
    depPostedUpTo(){
       const data = new Intelligence().transactionstable();
       const filtered = data.filter(item=>item['Account']==this.name && item['Transaction']=="Depreciation")
       const dates = ListItems(filtered,"Depreciation Upto");
       const dateNumbers = dates.map(item=>dayNumber(item))
       const latest = Math.max(...dateNumbers,(dayNumber(this.capdate)-1));
       return numberDay(latest);
    }
    depreciatedAmount(date){
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>item['Account']==this.name && item['Transaction']=="Depreciation" && new Date(item['Posting Date'])<= new Date(date));
        const amount = SumFieldIfs(filtered,'Amount',['Debit/ Credit'],['Credit'])-SumFieldIfs(filtered,'Amount',['Debit/ Credit'],['Debit'])
        return amount
    }
    cost(date){
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>item['Account']==this.name && item['Account Type']=="Asset" && item['Posting Date']<=date && ["Acquisition","Revaluation"].includes(item['Transaction']));
        const cost = SumField(filtered,'Amount')
        return cost;
    }
    opening(date){
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>item['Account'] == this.name && item['Posting Date'] < date)
        const opening = SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Debit"]) - SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Credit"])
        return opening
    }
    closing(date){
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>item['Account'] == this.name && item['Posting Date'] <= date)
        const opening = SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Debit"]) - SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Credit"])
        return opening
    }
    depreciation(date){
        const spentDays = Math.max(dayNumber(date) - dayNumber(this.capdate) + 1,0)
        const cost = this.cost(date);
        const SV = this.SV;
        const UL = this.ULDays;
        const depreciation = (Math.max(cost - SV,0))/UL * spentDays;
        return depreciation.toFixed(2)
    }
    depreciableAmount(date){
        const amount = this.depreciation(date) - this.depreciatedAmount(date);
        return amount;
    }
    ledger(period){
        const [from,to] = period;
        const list = [];
        list.push({"Posting Date":from,"Transaction":"","Description":"Opening Balance","Amount":this.opening(from), "Debit/ Credit":""});
        this.transactions(period).map(item=>list.push({"Posting Date":item["Posting Date"], "Transaction":item['Transaction'],"Description":item["Description"], "Amount":item["Amount"], "Debit/ Credit":item["Debit/ Credit"]}))
        list.push({"Posting Date":to,"Description":"Closing Balance","Amount":this.closing(to), "Debit/ Credit":""});
        return list;
    }
    schedule(period){
        const [from,to] = period;
        const data = {};
        data['Segment'] = this.segment.name;
        data['Profit Center'] = this.profitcenter.name;
        data['Cost Center'] = this.costcenter.name;
        data['General Ledger'] = this.assetclass.data['General Ledger - Asset'];
        data['Asset Class'] = this.assetclass.name;
        data['Asset'] = this.name;
        data['Gross Amount at Beginning'] = this.grossOpening(from);
        data['Acquisition'] = this.transaction('Acquisition',period);
        data['Revaluation'] = this.transaction('Revaluation',period);
        data['Gross Disposal'] = this.grossDisposed(period);
        data['Gross Amount at End'] = this.grossClosing(to);
        data['Accumulated Depreciation Beginning'] = this.accDepreciationOpening(from);
        data['Depreciation for the Period'] = -this.transaction('Depreciation',period);
        data['Depreciation Disposal'] = this.accDepreciationDisposed(period);
        data['Accumulated Depreciation Closing'] = this.accDepreciationClosing(to);
        data['Net Value Beginning'] = this.grossOpening(from) - this.accDepreciationOpening(from);
        data['Net Value End'] = this.grossClosing(to) - this.accDepreciationClosing(to);
        return data
    }
    grossOpening(date){
        const data = new Intelligence().transactionstable().filter(item=>item['Account']==this.name && new Date(item['Posting Date']) < new Date(date));
        const costs = data.filter(item=>["Acquisition","Revaluation"].includes(item['Transaction']));
        const cost = (!this.disposedBefore(date))?SumFieldIfs(costs,'Amount',['Debit/ Credit'],['Debit'])-SumFieldIfs(costs,'Amount',['Debit/ Credit'],['Credit']):0;
        return cost
    }
    grossClosing(date){
        const data = new Intelligence().transactionstable().filter(item=>item['Account']==this.name && new Date(item['Posting Date']) <= new Date(date));
        const costs = data.filter(item=>["Acquisition","Revaluation"].includes(item['Transaction']));
        const cost = (!this.disposedOn(date))?SumFieldIfs(costs,'Amount',['Debit/ Credit'],['Debit'])-SumFieldIfs(costs,'Amount',['Debit/ Credit'],['Credit']):0;
        return cost
    }
    accDepreciationOpening(date){
        const data = new Intelligence().transactionstable().filter(item=>item['Account']==this.name && new Date(item['Posting Date']) < new Date(date));
        const deps = data.filter(item=>["Depreciation"].includes(item['Transaction']));
        const dep = (!this.disposedBefore(date))?SumFieldIfs(deps,'Amount',['Debit/ Credit'],['Credit'])-SumFieldIfs(deps,'Amount',['Debit/ Credit'],['Debit']):0;
        return dep
    }
    accDepreciationClosing(date){
        const data = new Intelligence().transactionstable().filter(item=>item['Account']==this.name && new Date(item['Posting Date']) <= new Date(date));
        const deps = data.filter(item=>["Depreciation"].includes(item['Transaction']));
        const dep = (!this.disposedOn(date))?SumFieldIfs(deps,'Amount',['Debit/ Credit'],['Credit'])-SumFieldIfs(deps,'Amount',['Debit/ Credit'],['Debit']):0;
        return dep
    }
    disposedOn(date){
        const data = new Intelligence().transactionstable().filter(item=>item['Account']==this.name && new Date(item['Posting Date']) <= new Date(date));
        const disposal = data.filter(item=>item['Transaction'] == "Disposal");
        const result = (disposal.length>0)
        return result
    }
    disposedBefore(date){
        const data = new Intelligence().transactionstable().filter(item=>item['Account']==this.name && new Date(item['Posting Date']) < new Date(date));
        const disposal = data.filter(item=>item['Transaction'] == "Disposal");
        const result = (disposal.length>0)
        return result
    }
    disposedDuring(period){
        const [from,to] = period;
        const data = new Intelligence().transactionstable().filter(item=>item['Account']==this.name && new Date(item['Posting Date']) >= new Date(from) && new Date(item['Posting Date']) <= new Date(to));
        const disposal = data.filter(item=>item['Transaction'] == "Disposal");
        const result = (disposal.length>0);
        return result; 
    }
    transaction(type,period){
        const [from,to] = period;
        const data = new Intelligence().transactionstable().filter(item=>item['Account']==this.name && item['Transaction']==type && new Date(item['Posting Date']) >= new Date(from) && new Date(item['Posting Date']) <= new Date(to));
        let sum = 0;
            sum += SumFieldIfs(data,'Amount',['Debit/ Credit'],['Debit'])-SumFieldIfs(data,'Amount',['Debit/ Credit'],['Credit'])
        return sum
    }
    grossDisposed(period){
        const [from,to] = period
        let value = 0;
        if (this.disposedDuring(period)){  
            value = -this.transaction('Disposal',period)
            value += this.accDepreciationOpening(from);
            value -= this.transaction('Depreciation',period);
        }
        return value
    }
    accDepreciationDisposed(period){
        const [from,to] = period
        let value = 0;
        if (this.disposedDuring(period)){
            value = this.transaction('Disposal',period)
            value += this.grossOpening(from);
            value += this.transaction('Acquisition',period);
            value += this.transaction('Revaluation',period);
        }
        return value
    }
    disposableValue(){
        const date = numberDay(dayNumber(new Date()));
        const value = this.grossClosing(date) - this.accDepreciationClosing(date);
        return value
    }
    static depreciationEntry(date,data,method){
        const entry = {};
        entry['Posting Date'] = date;
        entry['text'] = `${method} depreciation up to ${date}`;
        entry['Line Items'] = [];
        data.map(item=>entry['Line Items'].push({
            'Account':item['Name'],
            'Account Type':"Asset",
            'General Ledger':item['General Ledger - Asset'],
            'Transaction':"Depreciation",
            'Amount':Math.abs(item['Depreciable Amount']),
            'Debit/ Credit':(item['Depreciable Amount']<0)?"Debit":"Credit",
            'Depreciation Upto':date,
        }));
        data.map(item=>entry['Line Items'].push({
            'Account':item['General Ledger - Depreciation'],
            'Account Type':"General Ledger",
            'General Ledger':item['General Ledger - Depreciation'],
            'Amount':Math.abs(item['Depreciable Amount']),
            'Debit/ Credit':(item['Depreciable Amount']<0)?"Credit":"Debit",
            'Consumption Time From':(method=="Prospective")?item['Depreciated Till']:item['Date of Capitalisation'],
            'Consumption Time To':date,
            'Cost Center':item['Cost Center']

        }))
        return entry;
    }

    static data = Database.load("Asset")
    static register(date){
        const data = this.data;
        const list = [];
        data.map(item=>list.push(new Asset(item['Name']).register(date)));
        return list;
    }
    static schedule(period){
        const data = this.data;
        const list = [];
        data.map(item=>list.push(new Asset(item['Name']).schedule(period)));
        return list;
    }
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
    static activedata= this.data.filter(item=>!item['Deactivated'])
    static activeList(){
        return ListItems(this.activedata,"Name")
    }
    static depreciationData(date){
        return Asset.register(date)
    }
}

class AssetClass{
   constructor(name){
        this.name = name;
        this.data = AssetClass.data.filter(item=>item['Name']==this.name)[0];
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
        this.data = BankAccount.data.filter(item=>item['Name']==this.name)[0]
        this.listOfVAN = ListItems(this.data['Virtual Accounts'],"Virtual Account Number");
        this.VANData = this.data['Virtual Accounts'].map(item=>({...item,['Bank Account']:this.name}))
    }
    static data = Database.load("Bank Account")
    static active = this.data.filter(item=>!item['Deactivated'])
    static list(){
        const list = ListItems(this.active,"Name")
        return list
    }
    static VANData(){
        const list = this.list()
        const data = [];
        list.map(item=>data.push(...new BankAccount(item).VANData))
        return data;
    }
    static getVANData(VAN){
        const filtered = this.VANData().filter(item=>item['Virtual Account Number']==VAN)[0];
        return filtered
    }

}

class VANEntry{
    constructor(name,data){
        this.name = name;
        this.data = data;
        this.vandata = BankAccount.getVANData(this.name);
        this.ledgertype = new Intelligence().ledgerType(this.vandata['Ledger']); 
        this.bank = new BankAccount(this.vandata['Bank Account'])
    }
    createEntry(line){
        const entry = {};
        entry['Posting Date']=line['Posting Date'];
        entry['Document Date']=line['Document Date'];
        entry['Line Items'] = [];
        entry['Line Items'].push({
            'Account':this.vandata['Bank Account'],
            'Amount':line['Amount'],
            'Account Type':"Bank Account",
            'General Ledger':this.bank.data['General Ledger'],
            'Debit/ Credit':'Debit',
            'Text':line['Text'],
            'Profit Center':this.bank.data['Profit Center'],
        })
        entry['Line Items'].push({
            'Account':this.vandata['Ledger'],
            'Amount':line['Amount'],
            'Account Type':this.ledgertype,
            'General Ledger':(this.ledgertype=="Customer")?this.vandata['Presentation']:this.vandata['Ledger'],
            'Debit/ Credit':'Credit',
            'Text':line['Text'],
            'Profit Center':this.vandata['Profit Center'],
        })
        return entry
    }
    simulate(){
        const list = [];
        this.data.map(item=>list.push(this.createEntry(item)));
        return list;
    }
    errors(){
        const list = [];
        this.simulate().map(item=>list.push(...new Transaction('General').validate(item)));
        return list
    }
    post(){
        const result = [];
        const list = this.simulate();
        list.map(item=>result.push(Transaction.post(item)));
        return result
    }
}

class Currency{
    constructor(name){
        this.name = name;
    }
    static data = Database.load("Currency");
    static activeData = this.data.filter(item=>!item['Deactivated']);
    static activeList = ListItems(this.activeData,"Name");

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
    closing(date){
        const data = new Intelligence().transactionstable();
        const start = (["Income","Expense"].includes(this.presentation))?Intelligence.yearStart(date):new Company().startdate;
        const filtered = data.filter(item=>item['General Ledger']==this.name && item['Posting Date']>=start && item['Posting Date']<=date)
        const balance = SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Debit"]) - SumFieldIfs(filtered,"Amount",["Debit/ Credit"],["Credit"])
        return balance
    }
    accountBalance(period){
        const [from,to] = period;
        const opening = this.opening(from)
        const data = {"Ledger":this.name,"Opening Balance":opening.toFixed(2),"Debit":this.debit(period).toFixed(2),"Credit":this.credit(period).toFixed(2),"Closing Balance":(this.opening(from)+this.debit(period)-this.credit(period)).toFixed(2)}
        return data
    }
    ledger(period){
        const [from,to] = period;
        const list = [];
        list.push({"Posting Date":from,"Description":"Opening Balance","Amount":this.opening(from), "Debit/ Credit":""});
        this.transactions(period).map(item=>list.push({"Posting Date":item["Posting Date"], "Description":item["Description"], "Amount":item["Amount"], "Debit/ Credit":item["Debit/ Credit"]}))
        list.push({"Posting Date":to,"Description":"Closing Balance","Amount":this.closing(to), "Debit/ Credit":""});
        return list;
    }
    static accountBalances(period){
        const list = [];
        const ledgers = this.list();
        ledgers.map(ledger=>list.push(new GeneralLedger(ledger).accountBalance(period)));
        return list
    }
    static convertToLineItem(data){
        const fields = ["Posting Date", "Reference", "Account", "Amount","Debit/ Credit", "Description", "Profit Center", "Cost Center"];
        const result = {};
        fields.map(item=>result[item]=data[item]);
        return result
    }
    static lineItemJournal(period){
        const [from,to] = period;
        const transactions = new Intelligence().transactionstable().filter(item=>item['Posting Date']>=from && item['Posting Date']<=to);
        const list = [];
        transactions.map(item=>list.push(this.convertToLineItem(item)));
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
        this.data = CostCenter.data.filter(item=>item['Name']==this.name)[0];
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
    accumulated(){
        const CostElements = [...new Set(ListItems(this.transactions(),"Account"))];
        const list = [];
        CostElements.map(element=>list.push({'Account':element,'Accumulated Cost':(SumFieldIfs(this.transactions(),'Amount',["Debit/ Credit", "Account"],["Debit",element])-SumFieldIfs(this.transactions(),'Amount',["Debit/ Credit", "Account"],["Credit",element]))}))
        return list;
    }
    accumulatedCost(){
        let sum = 0;
        sum+=SumFieldIfs(this.transactions(),"Amount",["Debit/ Credit"],["Debit"]);
        sum-=SumFieldIfs(this.transactions(),"Amount",["Debit/ Credit"],["Credit"]);
        return sum;
    }
    allocation(){
        const data = this.accumulated();
        const ratio = this.ratio
        const list = [];
        ratio.map(item=>data.map(cost=>list.push({...item,...{'Cost Element':cost['Account'],'Allocable Amount':cost['Accumulated Cost']*item['Proportion']/100}})))
        return list
    }
    allocationEntry(){
        const allocation = this.allocation();
        const entry = {
            "Text":"Cost Object Settlement of "+this.name,
            "Line Items":[]
        }
        allocation.map(item=>entry['Line Items'].push({'Account':item['To'],'Amount':item['Allocable Amount']}))
        allocation.map(item=>entry['Line Items'].push({'Account':item['Cost Element'],'Amount':item['Allocable Amount']}))
        return entry
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
    constructor(code){
        this.code = code;
        this.data = Employee.data.filter(item=>item['Code']==this.code)[0];
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
        dates.map(date=>list.push({"Date":date,"Salary":(this.daysalary(date)/daysInMonth(year,month)).toFixed(3)}))
        return list
    }
    static data = Database.load("Employee")
    static list(){
        const list = ListItems(this.data,"Code")
        return list
    }
    static salaryrun(year,month){
        const data = [];
        this.list().map(item=>data.push({"Code":item,"Name":new Employee(item).data['Name'], "Salary":SumField(new Employee(item).salary(year,month),"Salary").toFixed(0)}))
        return data
    }
}

class Location{
    constructor(name){
        this.name = name;
        this.data = Location.data.filter(item=>item['Name']==this.name)[0];
        this.costcenter = new CostCenter(this.data['Cost Center']);
        this.profitcenter = new ProfitCenter(this.costcenter.data['Profit Center']);
    }
    static data = Database.load("Location");
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
}

class Material{
    constructor(name){
        this.name = name;
        this.data = Material.data.filter(item=>item['Name']==this.name)[0]
    }
    transactionsBefore(date){
        const data = Transaction.transactionstable()
        const filtered = data.filter(item=>item['Account']==this.name && new Date(item['Posting Date']) < new Date(date) )
        return filtered
    }
    transactionsTill(date){
        const data = Transaction.transactionstable()
        const filtered = data.filter(item=>item['Account']==this.name && new Date(item['Posting Date']) <= new Date(date) )
        return filtered
    }
    transactions(period){
        const [from,to] = period;
        const data = Transaction.transactionstable()
        const filtered = data.filter(item=>item['Account']==this.name && new Date(item['Posting Date']) >= new Date(from) && new Date(item['Posting Date']) <= new Date(to) )
        return filtered
    }
    opening(date){
        const data = this.transactionsBefore(date);
        const quantity = (data.length>0)? SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Credit"]):0;
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        const result = {"Quantity":quantity,"Amount":amount}
        return result
    }
    closing(date){
        const data = this.transactionsTill(date);
        const quantity = (data.length>0)? SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Credit"]):0;
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        const result = {"Quantity":quantity,"Amount":amount}
        return result
    }
    ledger(period){
        const [from,to] = period;
        const list = [];
        list.push({"Document No":"","Posting Date":from,"Text":"Opening","Quantity":this.opening(from)['Quantity'],"Amount":this.opening(from)['Amount'],"Debit/ Credit":""})
        this.transactions(period).map(item=>list.push({
            "Document No":item['Document No'],
            "Posting Date":item['Posting Date'],
            "Text":item['Text'],
            "Quantity":item['Quantity'],
            "Amount":item['Amount'],
            "Debit/ Credit":item['Debit/ Credit'],
        }))
        list.push({"Document No":"","Posting Date":to,"Text":"Closing","Quantity":this.closing(to)['Quantity'],"Amount":this.closing(to)['Amount'],"Debit/ Credit":""})
        return list;  
    }
    static data = Database.load("Material");
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
}

class MaterialInLocation{
    constructor(material,location){
        this.material = material;
        this.location = location;
    }
    transactionsBefore(date){
        const data = Transaction.transactionstable()
        const filtered = data.filter(item=>item['Account']==this.material && item['Location']==this.location && new Date(item['Posting Date']) < new Date(date) )
        return filtered
    }
    transactionsTill(date){
        const data = Transaction.transactionstable()
        const filtered = data.filter(item=>item['Account']==this.material && item['Location']==this.location && new Date(item['Posting Date']) <= new Date(date) )
        return filtered
    }
    transactions(period){
        const [from,to] = period;
        const data = Transaction.transactionstable()
        const filtered = data.filter(item=>item['Account']==this.material && item['Location']==this.location && new Date(item['Posting Date']) >= new Date(from) && new Date(item['Posting Date']) <= new Date(to) )
        return filtered
    }
    opening(date){
        const data = this.transactionsBefore(date);
        const quantity = (data.length>0)? SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Credit"]):0;
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        const result = {"Quantity":quantity,"Amount":amount}
        return result
    }
    closing(date){
        const data = this.transactionsTill(date);
        const quantity = (data.length>0)? SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Credit"]):0;
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        const result = {"Quantity":quantity,"Amount":amount}
        return result
    }
    receipts(period){
        const [from,to] = period;
        const data = this.transactions(period).filter(item=>item['Transaction']=="Receipt");
        const quantity = (data.length>0)? SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Credit"]):0;
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        const result = {"Quantity":quantity,"Amount":amount}
        return result
    }
    costs(period){
        const [from,to] = period;
        const data = this.transactions(period).filter(item=>item['Transaction']=="Cost");
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        return amount
    }
    issues(period){
        const [from,to] = period;
        const data = this.transactions(period).filter(item=>item['Transaction']=="Issue");
        const quantity = (data.length>0)? SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Credit"]):0;
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        const result = {"Quantity":quantity,"Amount":amount}
        return result
    }
    ledger(period){
        const [from,to] = period;
        const list = [];
        list.push({"Document No":"","Posting Date":from,"Text":"Opening","Quantity":this.opening(from)['Quantity'],"Amount":this.opening(from)['Amount'],"Debit/ Credit":""})
        this.transactions(period).map(item=>list.push({
            "Document No":item['Document No'],
            "Posting Date":item['Posting Date'],
            "Text":item['Text'],
            "Quantity":item['Quantity'],
            "Amount":item['Amount'],
            "Debit/ Credit":item['Debit/ Credit'],
        }))
        list.push({"Document No":"","Posting Date":to,"Text":"Closing","Quantity":this.closing(to)['Quantity'],"Amount":this.closing(to)['Amount'],"Debit/ Credit":""})
        return list;  
    }
    balances(period){
        const [from,to] = period;
        const data= {
            'Material':this.material,
            'General Ledger':new Material(this.material).data['General Ledger'],
            "Location":this.location,
            'Profit Center':new Location(this.location).profitcenter.name,
            "Opening Quantity":this.opening(from)['Quantity'],
            "Opening":this.opening(from)['Amount'],
            "Receipt Quantity":this.receipts(period)['Quantity'],
            "Receipt":this.receipts(period)['Amount'],
            "Issue Quantity":this.issues(period)['Quantity'],
            "Issue":this.issues(period)['Amount'],
            "Cost":this.costs(period),
            "Closing Quantity":this.closing(to)['Quantity'],
            "Closing":this.closing(to)['Amount']
        };
        return data
    }
    valuetransactionsBefore(date){
        const data = Transaction.transactionstable()
        const filtered = data.filter(item=>item['Account']==this.material && item['Location']==this.location && new Date(item['Value Date']) < new Date(date) )
        return filtered
    }
    valuetransactionsTill(date){
        const data = Transaction.transactionstable()
        const filtered = data.filter(item=>item['Account']==this.material && item['Location']==this.location && new Date(item['Value Date']) <= new Date(date) )
        return filtered
    }
    valuetransactions(period){
        const [from,to] = period;
        const data = Transaction.transactionstable()
        const filtered = data.filter(item=>item['Account']==this.material && item['Location']==this.location && new Date(item['Value Date']) >= new Date(from) && new Date(item['Value Date']) <= new Date(to) )
        return filtered
    }
    valueopening(date){
        const data = this.valuetransactionsBefore(date);
        const quantity = (data.length>0)? SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Credit"]):0;
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        const result = {"Quantity":quantity,"Amount":amount}
        return result
    }
    valueclosing(date){
        const data = this.valuetransactionsTill(date);
        const quantity = (data.length>0)? SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Credit"]):0;
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        const result = {"Quantity":quantity,"Amount":amount}
        return result
    }
    valuereceipts(period){
        const [from,to] = period;
        const data = this.valuetransactions(period).filter(item=>item['Transaction']=="Receipt");
        const quantity = (data.length>0)? SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Credit"]):0;
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        const result = {"Quantity":quantity,"Amount":amount}
        return result
    }
    valuecosts(period){
        const [from,to] = period;
        const data = this.valuetransactions(period).filter(item=>item['Transaction']=="Cost");
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        return amount
    }
    valueissues(period){
        const [from,to] = period;
        const data = this.valuetransactions(period).filter(item=>item['Transaction']=="Issue");
        const quantity = (data.length>0)? SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Quantity',["Debit/ Credit"],["Credit"]):0;
        const amount = (data.length>0)? SumFieldIfs(data,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(data,'Amount',["Debit/ Credit"],["Credit"]):0
        const result = {"Quantity":quantity,"Amount":amount}
        return result
    }
    movement(period){
        const [from,to] = period;
        const data = {
            'Material' : this.material,
            'General Ledger':new Material(this.material).data['General Ledger'],
            "Location":this.location,
            'Profit Center':new Location(this.location).profitcenter.name,
            "Opening Quantity":this.valueopening(from)['Quantity'],
            "Opening":this.valueopening(from)['Amount'],
            "Receipt Quantity":this.valuereceipts(period)['Quantity'],
            "Receipt":this.valuereceipts(period)['Amount'],
            "Issue Quantity":this.valueissues(period)['Quantity'],
            "Issue":this.valueissues(period)['Amount'],
            "Cost":this.valuecosts(period),
            "Closing Quantity":this.valueclosing(to)['Quantity'],
            "Closing":this.valueclosing(to)['Amount']
        }
        return data
    }
    movingCost(date){
        const {Quantity,Amount} = this.valueclosing(date);
        if (Quantity>0){
            return (Amount/Quantity)
        } else {
            return 0
        }
    }
    static MaterialBalances(period){
        const materials = Material.list();
        const locations = Location.list();
        const list = [];
        materials.map(material=>locations.map(location=>
            list.push(new MaterialInLocation(material,location).balances(period))
        ))
        return list
    }
    static MaterialMovement(period){
        const materials = Material.list();
        const locations = Location.list();
        const list = [];
        materials.map(material=>locations.map(location=>
            list.push(new MaterialInLocation(material,location).movement(period))
        ))
        return list
    }

}

class ProfitCenter{
    constructor(name){
        this.name = name;
        this.data = ProfitCenter.data.filter(item=>item['Name']==this.name)[0];
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
        this.data = Segment.data.filter(item=>item['Name']==this.name)[0]
    }
    static data = Database.load("Segment")
    static list(){
        const list = ListItems(this.data,"Name")
        return list
    }
}

class Service{
    constructor(name){
        this.name = name;
    }
    static data = Database.load('Service');
    static list(){
        return  ListItems(this.data,"Name");
    }
}

class Vendor{
    constructor(name){
        this.name = name;
        this.data = Vendor.data.filter(item=>item['Name']==this.name)[0];
    }
    openitems(date){
        const transactions = new Intelligence().transactionstable()
        const result = transactions.filter(item=>item['Account']==this.name && new Date(item['Posting Date'])<=new Date(date) && !item['Cleared'])
        return result
    }
    opening(date){
        const data = new Intelligence().transactionstable()
        const filtered = data.filter(item=>item['Account']==this.name && new Date(item['Posting Date']) < new Date(date))
        const opening = (filtered.length>0)? SumFieldIfs(filtered,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(filtered,'Amount',["Debit/ Credit"],["Credit"]):0
        return opening
    }
    closing(date){
        const data = new Intelligence().transactionstable()
        const filtered = data.filter(item=>item['Account']==this.name && new Date(item['Posting Date']) <= new Date(date))
        const opening = (filtered.length>0)? SumFieldIfs(filtered,'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(filtered,'Amount',["Debit/ Credit"],["Credit"]):0
        return opening
    }
    transactions(period){
        const [from,to] = period;
        const data = new Intelligence().transactionstable()
        const filtered = data.filter(item=>item['Account']==this.name && new Date(item['Posting Date']) >= new Date(from) && new Date(item['Posting Date']) <= new Date(to) )
        return filtered
    }
    ledger(period){
        const [from,to] = period;
        const list = [{"Date":from,"Description":"Opening", "Debit/ Credit":"", "Amount":this.opening(from)}];
        this.transactions(period).map(item=>list.push({"Date":item['Posting Date'],"Description":item['Description'],"Debit/ Credit":item['Debit/ Credit'], "Amount":item['Amount']}))
        list.push({"Date":to,"Description":"Closing","Debit/ Credit":"", "Amount":this.closing(to)})
        return list
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
            "Bank Account":'bankaccounts',
            "Cost Center":"costcenters", 
            "Cost Object":"costobjects",
            "Currency":"currencies",
            "Customer":"customers",
            "Employee":"employees",
            "General Ledger":"generalledgers",
            "GST Code":"gstcodes",
            "Location":"locations",
            "Material":"materials",
            "Payment Term":"paymentterms",
            "Profit Center":"profitcenters",
            "Purchase Order":"purchaseorders",
            "Segment":"segments",
            "Service":"services",
            "Sale Order":"saleorders",
            "Vendor":"vendors",
            "TDS Code":"tdscodes",
            "Transaction":"transactions"
        }
    }
    static States = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bengal", "Bihar", "Chattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala","Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telengana", "Tripura", "Uttarakhand", "Uttar Pradesh","West Bengal"]
    static UTs = ["Andaman Nicobar", "Chandigarh", "Dadra Nagar Haveli and Daman Diu", "Lakshadweep", "Ladakh"]
    static Currency = [
        {"Name":"US Dollar", "Code":"USD"},
        {"Name":"Euro", "Code":"EUR"},
        {"Name":"Canadian Dollar", "Code":"CAD"},
        {"Name":"Yuan", "Code":"CNY"},
        {"Name":"Indian Rupee", "Code":"INR"},
        {"Name":"Pound Sterling", "Code":"GBP"},
        {"Name":"Yen", "Code":"JPY"},
        {"Name":"Swiss Franc", "Code":"CHF"},
        {"Name":"Australian Dollar", "Code":"AUD"},
        {"Name":"Qatari Rial", "Code":"QAR"},
    ]
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
        const types = ['General Ledger','Asset','Employee','Vendor','Customer','Material', 'Service', 'Bank Account']
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
        const fields = ["Posting Date","Document No"]
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
        data['Virtual Accounts'].map((item,index)=>(item["Virtual Account Number"]!="" && item['Profit Center']=="")?list.push(`VAN ${item['Virtual Account Number']} requires a profit center`):()=>{})
        data['Virtual Accounts'].map((item,index)=>(new Intelligence().ledgerType(item['Ledger'])=="Customer" && item['Presentation']=="")?list.push(`${item['Virtual Account Number']} requires presentation`):()=>{})
        return list
    }
    bankError(line,i){
        const list = [];
        (line['Account Number']!==line['Confirm Account Number'])?list.push(`Bank account ${i} does not match.`):()=>{};
        return list;
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
        const req = ["Name", "General Legder", "Unit"];
        req.map(item=>(data[item]=="")?list.push(`${item} is required`):()=>{});
        return list
    }
    vendorError(data){
        const list = [];
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
            {"name": "Code", "datatype":"single", "input":"input", "type":"number", "use-state":""},
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
            {"name": "Code", "datatype":"single", "input":"input", "type":"number", "use-state":""},
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Depreciable", "datatype":"single", "input":"option", "options":["","Yes","No"], "use-state":""},
            {"name": "General Ledger - Asset", "datatype":"single", "input":"option", "options":["",...GeneralLedger.listtype("Asset")], "use-state":""},
            {"name": "General Ledger - Depreciation", "datatype":"single", "input":"option", "options":["",...GeneralLedger.listtype("Depreciation")], "use-state":""}
        ],
        "collection":"assetclasses"
    },
    "Bank Account":{
        "name":"Bank Account",
        "collection":"bankaccounts",
        "schema":[
            {"name": "Code", "datatype":"single", "input":"input", "type":"number", "use-state":""},
            {"name":"Name","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Bank Name","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"IFSC","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Account Number","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"General Ledger","datatype":"single","input":"option","options":["",...GeneralLedger.listtype('Bank Account')],"use-state":""},
            {"name":"Profit Center","datatype":"single","input":"option","options":["",...ProfitCenter.list()],"use-state":""},
            {"name":"Virtual Accounts","datatype":"collection","structure":[
                {"name":"Virtual Account Number","datatype":"single","input":"input","type":"text","use-state":""},
                {"name":"Ledger","datatype":"single","input":"option","options":["",...Customer.list(),...GeneralLedger.listtype('General')],"use-state":""},
                {"name":"Presentation","datatype":"single","input":"option","options":["",...GeneralLedger.listtype('Customer')]},
                {"name":"Profit Center","datatype":"single","input":"option","options":["",...ProfitCenter.list()]}
            ],"use-state":[{"Virtual Account Number":"","Ledger":"","Profit Center":""}]},
        ]
    },
    "Cost Center":{
        "name": "Cost Center",
        "schema": [
            {"name": "Code", "datatype":"single", "input":"input", "type":"number", "use-state":""},
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":"Chennai"},
            {"name": "Profit Center", "datatype":"single", "input":"option", "options":["",...ProfitCenter.list()], "use-state":"No"},
            {"name":"Apportionment Ratio","datatype":"nest","structure":[
                {"name":"From", "datatype":"single", "input":"input", "type":"date"},
                {"name":"To", "datatype":"single", "input":"input", "type":"date"},
                {"name":"Ratio", "datatype":"collection", "structure":[
                    {"name":"To", "datatype":"single", "input":"input", "type":"text"},
                    {"name":"Ratio", "datatype":"single", "input":"input", "type":"text"}
                ],'use-state':[{"To":"","Ratio":""}]}
            ],"use-state":[{"From":"2025-04-01","To":"2026-03-31","Ratio":[{"To":"Head Office","Ratio":0.50}]}]}
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
            {"name": "Code", "datatype":"single", "input":"input", "type":"number", "use-state":""},
            {"name":"Name","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Address","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"City","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"PIN","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"State","datatype":"single","input":"option","options":["",...Intelligence.States,...Intelligence.UTs,"Outside India"],"use-state":""},
            {"name":"Phone","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"E-mail","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"PAN","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"GSTIN","datatype":"single","input":"input","type":"text","use-state":""},
            {"name": "Bank Accounts", "datatype":"collection", "structure":[{"name":"Bank", "datatype":"single", "input":"input", "type":"text"},{"name":"IFSC", "datatype":"single", "input":"input", "type":"text"},{"name":"Account Number", "datatype":"single", "input":"input", "type":"number"},{"name":"Confirm Account Number", "datatype":"single", "input":"input", "type":"number"}],"use-state":[{"id":0,"Bank":"SBI","IFSC":"SBIN0070056","Account Number":"000000000000", "Confirm Account Number":"000000000000"}]},
            {"name":"Payment Terms","datatype":"single","input":"option","options":[],"use-state":""},
        ]
    },
    "Employee":{
        "name":"Employee",
        "schema": [
            {"name":"Code", "datatype":"single", "input":"input","type":"text","use-state":""},
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
            {"name": "Code", "datatype":"single", "input":"input", "type":"number", "use-state":""},
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name":"Ledger Type","datatype":"single","input":"option","options":["","Asset", "Bank Account", "Cost Element",  "Customer", "Depreciation" ,"General", "GST",  "Material", "Vendor"]},
            {"name": "Presentation", "datatype":"single", "input":"option", "options":["Income", "Expense", "Asset", "Liability", "Equity"], "use-state":"Income"},
            {"name": "Enable Clearing", "datatype":"single", "input":"option","options":["True","False"], "use-state":"True"},
        ],
        "collection":"generalledgers"
    },
    "GST Code":{
        "name":"GST Code",
        "collection":"gstcodes",
        "schema":[
            {"name":"Code","datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name":"Rate","datatype":"single","input":"input","type":"number","use-state":0},
            {"name":"Cess Rate","datatype":"single","input":"input","type":"number","use-state":0},
            {"name":"CGST Account","datatype":"single","input":"option","options":["",...GeneralLedger.listtype('GST')],"use-state":0},
            {"name":"IGST Account","datatype":"single","input":"option","options":["",...GeneralLedger.listtype('GST')],"use-state":0},
            {"name":"SGST Account","datatype":"single","input":"option","options":["",...GeneralLedger.listtype('GST')],"use-state":0},
            {"name":"UTGST Account","datatype":"single","input":"option","options":["",...GeneralLedger.listtype('GST')],"use-state":0},
            {"name":"Cess Account","datatype":"single","input":"option","options":["",...GeneralLedger.listtype('GST')],"use-state":0}
        ]
    },
    "Income Tax Code":{
        "name":"Income Tax Code",
        "collection":"incometaxcodes",
        "schema":[
            {"name":"Code", "datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Taxation","datatype":"nest","structure":[
                {"name":"From Year", "datatype":"single","input":"input","type":"number","use-state":""},
                {"name":"To Year", "datatype":"single","input":"input","type":"number","use-state":""},
                {"name":"Marginal Relief","datatype":"single","input":"option","options":["","Yes","No"],"use-state":"No"},
                {"name":"Exemption Limit", "datatype":"single","input":"input","type":"number","use-state":""},
                {"name":"Cess", "datatype":"single","input":"input","type":"number","use-state":""},
                {"name":"Slab", "datatype":"collection", "structure":[
                    {"name":"From","datatype":"single","input":"input","type":"number"},
                    {"name":"To","datatype":"single","input":"input","type":"number"},
                    {"name":"Rate","datatype":"single","input":"input","type":"number"},
                ], 'use-state':[{"From":"","To":"","Rate":""}]},
            ], "use-state":[{"From Year":"","To Year":"","Exemption Limit":"","Marginal Relief":"No","Slab":[{"From":"","To":"","Rate":""}]}]}
        ]
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
            {"name":"Name", "datatype":"single", "input":"input", "type":"text","use-state":""},
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
            {"name": "Code", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name":"Description","datatype":"single", "input":"input", "type":"text","use-state":"45 Days Net"},
            {"name":"Discounting Criteria", "datatype":"collection","structure":[{"name":"Days from Supply","datatype":"single","input":"input","type":"number"},{"name":"Discount %","datatype":"single","input":"input","type":"number"}] , "use-state":[{"Days from Supply":45,"Discount %":0}]}
        ],
        "collection":"paymentterms"
    },
    "Profit Center":{
        
        "name":"Profit Center",
        "schema":[
            {"name": "Code", "datatype":"single", "input":"input", "type":"number", "use-state":""},
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
            {"name": "Code", "datatype":"single", "input":"input", "type":"number", "use-state":""},
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
    "TDS Code":{
        "name":"TDS Code",
        "collection":"tdscodes",
        "schema":[
            {"name":"Code","datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name":"Description","datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name":"General Ledger","datatype":"single","input":"option","options":["",...GeneralLedger.listtype('TDS')], "use-state":""},
        ]
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
            {"name": "Code", "datatype":"single", "input":"input", "type":"number", "use-state":""},
            {"name":"Name","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"Address","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"City","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"State","datatype":"single","input":"option","options":["",...Intelligence.States,...Intelligence.UTs,"Outside India"],"use-state":""},
            {"name":"PIN","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"MSME Status","datatype":"single","input":"option","options":["","Micro","Small","Medium","Non-MSME"],"use-state":""},
            {"name":"Phone","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"E-mail","datatype":"single","input":"input","type":"number","use-state":""},
            {"name":"PAN","datatype":"single","input":"input","type":"text","use-state":""},
            {"name":"GSTIN","datatype":"single","input":"input","type":"text","use-state":""},
            {"name": "Bank Accounts", "datatype":"collection", "structure":[{"name":"Bank", "datatype":"single", "input":"input", "type":"text"},{"name":"IFSC", "datatype":"single", "input":"input", "type":"text"},{"name":"Account Number", "datatype":"single", "input":"input", "type":"number"},{"name":"Confirm Account Number", "datatype":"single", "input":"input", "type":"number"}],"use-state":[{"id":0,"Bank":"SBI","IFSC":"SBIN0070056","Account Number":"000000000000", "Confirm Account Number":"000000000000"}]},
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
                    {"name":"Quantity", "datatype":"single","input":"input","type":"number"},
                    {"name":"Value Date", "datatype":"single","input":"input","type":"date"},
                    {"name":"Location", "datatype":"single","input":"input","type":"text"},
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
    const currencies = (Currency.activeList.length>0)?Currency.activeList:ListItems(Intelligence.Currency,"Name")
    const newCompany = () =>{
        setstatus(true)
        seteditable(true)
    }

    function CreateCompany(){
        return (
            <div className='createCompany'>
                <div className="titleCard">
                    <h1>Simple Costs<sup>&reg;</sup></h1>
                    <p>Enterprise Information System</p>
                </div>
                <div className="createOptions">
                    <div className="createOption"><button className='blue' onClick={()=>initialise()}>Quick Initialise</button></div>
                    <div className="createOption"><button className='green' onClick={()=>newCompany()}>New Company</button></div>
                </div>
            </div>
        )
    }

    const errorlist = []

    const errorcheck = () =>{
        (data['Name']=="")?errorlist.push("Provide company name"):()=>{};
        (data['Year 0']=="")?errorlist.push("Mention 0th year"):()=>{};
        (data['Financial Year Beginning']=="")?errorlist.push("Mention beginning month of financial year"):()=>{};
        (data['Functional Currency']['Currency']=="")?errorlist.push("Provide functional currency"):()=>{};
    }

    const save = ()=>{
        errorcheck()
        if (errorlist.length==0){
        if (!Company.timeMaintained) {
            const periods = {"First":{"From":`${data['Year 0']}-${data['Financial Year Beginning']}-01`,"To":`${data['Year 0']}-${data['Financial Year Beginning']}-20`},"Second":{}}
            Company.setTimeControl(periods)
        }
        Company.save(data);
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

    const stateOrUT = ["",...Intelligence.States,...Intelligence.UTs, "Outside India"];

    if (status) {
    return(

        <div className='companyInfo'>
            <h2 className='companyInfoTitle'>Company Info</h2>
            <div className='companyDetails'>
                <div className='companyDetail'><label>Name </label><input required disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['Name']:e.target.value}))} value={data['Name']}/></div>
                <div className='companyDetail'><label>Address</label><input onChange={(e)=>setdata(prevdata=>({...prevdata,['Address']:e.target.value}))} type="text" disabled={!editable} value={data['Address']}/></div>
                <div className='companyDetail'><label>State</label><select onChange={(e)=>setdata(prevdata=>({...prevdata,['State']:e.target.value}))} disabled={!editable} value={data['State']}>{stateOrUT.map(option=><option value={option}>{option}</option>)}</select></div>
                <div className='companyDetail'><label>GSTIN</label><input onChange={(e)=>setdata(prevdata=>({...prevdata,['GSTIN']:e.target.value}))} type="text" disabled={!editable} value={data['GSTIN']}/></div>
                <div className='companyDetail'><label>PAN</label><input type="text" disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['PAN']:e.target.value}))} value={data['PAN']}/></div>
                <div className='companyDetail'><label>0<sup>th</sup> Year</label><input required min={1900} max={2050} type="number" disabled={!editable} onChange={(e)=>setdata(prevdata=>({...prevdata,['Year 0']:e.target.value}))} value={data['Year 0']}/></div>
                <div className='companyDetail'><label>Beginning Month of a Financial Year</label><select required disabled={!editable} value={data['Financial Year Beginning']} onChange={(e)=>setdata(prevdata=>({...prevdata,['Financial Year Beginning']:e.target.value}))}>{months.map(month=><option value={month['Number']}>{month['Month']}</option>)}</select></div>
                <div className='companyDetail'><label>Functional Currency</label><select required disabled={!editable} value={data['Functional Currency']} onChange={(e)=>setdata(prevdata=>({...prevdata,['Functional Currency']:e.target.value}))}>{currencies.map(option=><option value={option}>{option}</option>)}</select></div>
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
    <div className='timeControlUI'>
        <h2 className='timeControlTitle'>Time Control</h2>
        <div className='timePeriod'>
            <h4 className='timeControlSubTitle'>Open Time Period</h4>
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
            
        </div>
        <div className='timePeriodButtons'>
            {!editable && <button className="blue" onClick={()=>seteditable(true)}>Change</button>}
            {editable && <button className="green" onClick={()=>save()}>Save</button>}
            {editable && <button className="blue" onClick={()=>window.location.reload()}>Cancel</button>}
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
    const location = useLocation()
    const [url,seturl] = useState()
    function search(){
        navigate(url)
        seturl('');
    }

    const inputRef = useRef();

    const keyDownHandler = e =>{
        if (e.ctrlKey && e.key==="g"){
            e.preventDefault();
            inputRef.current.focus();
        } else if (e.ctrlKey && e.key==="h"){
            e.preventDefault();
            navigate('/');
            window.location.reload();
        }
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
            <button className="searchBarButton" onClick={()=>navigate(`/`)}><FaHome/></button>
            <button className="searchBarButton" onClick={()=>navigate(-1)}><FaArrowLeft/></button>
            <div className='search'>
                <input type="text" value={url} ref={inputRef} onChange={changeUrl} placeholder="Go to . . ."/>
            </div>
            <button className="searchBarButton" onClick={search}><FaArrowRight/></button>
            <button className="searchBarButton" onClick={()=>window.open(window.location.href,'_blank')}><FaCopy/></button>
        </div>
        </div>
    )
}

function Home(){
    const navigate = useNavigate();
  return(
    <div className='homeOuter'>
        <div className='home'>
            <h1 className='title'>Simple Costs<sup className='reg'>&reg;</sup></h1>
            <div className='actions'>{}
                <div className='menu green' onClick={()=>navigate(`/record`)}><h2>Record</h2></div>
                <div className='menu red' onClick={()=>navigate(`/control`)}><h2>Control</h2></div>
                <div className='menu blue'  onClick={()=>navigate(`/reports`)}><h2>Report</h2></div>
            </div>
        </div>
    </div>
  )
}

function Record(){

    const navigate = useNavigate();
  
  return(
    <div className='menuContainer'>
            <h3 className='menuContainerTitle' onClick={()=>navigate('/control')}>Record</h3>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Generic</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/transaction/General`)}}><h4>Transaction</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Asset</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/transaction/Asset Acquisition`)}}><h4>Acquisition</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/depreciationpros`)}}><h4>Depreciation</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/depreciationretro`)}}><h4>Depreciation Retrospective</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/transaction/Manual Depreciation`)}}><h4>Manual Depreciation</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/transaction/Asset Revaluation`)}}><h4>Revaluation</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/transaction/Asset Disposal`)}}><h4>Disposal</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Costing</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/costobjectsettlement`)}}><h4>Cost Object Settlement</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/costtoprepaid`)}}><h4>Cost to Prepaid</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Material</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/materialissue`)}}><h4>Material Issue</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle red'><h4>Payables & Receivables</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/transaction/Sale`)}}><h4>Sale</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/vanaccounting`)}}><h4>VAN Accounting</h4></div>
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
        {"Group":"Payables & Receivables","items":["Bank Account", "Customer","Vendor","Payment Term"]},
        {"Group":"Payroll","items":["Employee", "Organisational Unit","Income Tax Code"]}
    ]
  
    return(
        <div className='menuContainer'>
            <h3 className='menuContainerTitle' onClick={()=>navigate('/reports')}>Control</h3>
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
            <h3 className='menuContainerTitle' onClick={()=>navigate('/record')}>Report</h3>
            <div className='menuList'>
                <div className='menuTitle blue'><h4>Assets</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/assetledger`)}}><h4>Asset Ledger</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/assetregister`)}}><h4>Asset Register</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/assetschedule`)}}><h4>Asset Schedule</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle blue'><h4>Costing</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/costobjectbalance`)}}><h4>Cost Object Balance</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/costobjecttransactions`)}}><h4>Cost Object Transactions</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/costcenteritems`)}}><h4>Cost Center Items</h4></div>
            </div>
             <div className='menuList'>
                <div className='menuTitle blue'><h4>Financial Accounting</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/accountbalances`)}}><h4>Account Balances</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/generalledger`)}}><h4>Ledger</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/transactions`)}}><h4>Transactions</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/viewdocument`)}}><h4>View Document</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle blue'><h4>Materials</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/materialledger`)}}><h4>Material Ledger</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/materialinlocation`)}}><h4>Material In Location Ledger</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/materialbalances`)}}><h4>Material Balances</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/materialmovement`)}}><h4>Material Movement</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle blue'><h4>Payables & Receivables</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/vendoropenitem`)}}><h4>Open Item</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/vendorledger`)}}><h4>Ledger</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/personalaccountbalance`)}}><h4>Account Balance</h4></div>
            </div>
            <div className='menuList'>
                <div className='menuTitle blue'><h4>Payroll</h4></div>
                <div className='menuItem' onClick={()=>{navigate(`/report/paycalc`)}}><h4>Salary Calculator</h4></div>
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

class Code{
    constructor(name){
        this.name = name;
        this.codes = Code.codeslist[this.name];
    }
    checkCode(code){
        const errors = [];
        (code<this.codes[0] || code>this.codes[1])?errors.push(`Please use code within range (${this.codes[0]},${this.codes[1]})`):()=>{};
        (this.alreadyExists(code))?errors.push(this.name + ' with same code already exists'):()=>{}
        return errors
    }
    alreadyExists(code){
        const data = Database.load(this.name);
        const items = data.filter(item=>item['Code']==code);
        const result = (items.length>0);
        return result;
    }
    static codeslist = {
        "Segment" :[1,99],
        "Profit Center":[1000,1999],
        "Cost Center":[2000,3999],
        "Asset Class":[100,499],
        "Bank Account":[90000,99999],
        "Asset":[100000,199999],
        "General Ledger":[200000,299999],
        "Vendor":[300000,399999],
        "Customer":[400000,499999],
        "Payment Term":[500,559],
        "Employee":[10000,99999]
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
        let req = [];
        switch(object){
            case 'Bank Account':
                list.push(...new Intelligence().bankAccountError(data))
                break
            case 'Cost Object':
                list.push(...new Intelligence().costobjectError(output));
                break
            case 'General Ledger':
                list.push(...new Intelligence().generalledgerError(output))
            case 'Asset':
                list.push(...new Intelligence().assetError(output));
                ((new Date(output['Date of Capitalisation']))>(new Date()))?list.push("Date of capitalisation cannot be a future date."):()=>{}
                break
            case 'Asset Class':
                req = ["Name","General Ledger - Asset", "General Ledger - Depreciation", "Depreciable"];
                break
            case 'Customer':
                req = ["Name","State"];
                output['Bank Accounts'].map((item,i)=>list.push(...new Intelligence().bankError(item,i+1)))
                break
            case 'Employee' :
                output['Bank Accounts'].map((item,i)=>(item['Validated']=="No")?list.push(`Bank Account ${i+1} is not validated`):()=>{});
                ((new Date(output['Date of Birth']))>(new Date()))?list.push("Date of Birth cannot be a future date."):()=>{}
                break
            case 'Vendor':
                req = ["Name","State"];
                output['Bank Accounts'].map((item,i)=>list.push(...new Intelligence().bankError(item,i+1)))
                break
            case 'Profit Center':
                list.push(...new Intelligence().profitCenterError(output))
                break
            case 'Segment':
                list.push(...new Intelligence().segmentError(output))
                break
        }
        req.map(item=>(output[item]=="")?list.push(`${item} required`):()=>{});
        (["Payment Term","Employee","Bank Account","Segment","Asset Class","Customer","Asset","Profit Center","Cost Center","General Ledger", "Vendor"].includes(object))?list.push(...new Code(object).checkCode(output['Code'])):()=>{};
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

    function handlechange4(field,index,subfield,subindex,subsubfield,e){
        const {value} = e.target;
        setdata(prevdata=>({
            ...prevdata,[field]:prevdata[field].map((item,i)=>
            (i==index)?{...item,[subfield]:item[subfield].map((subitem,ii)=>
            (ii==subindex)?{...subitem,[subsubfield]:value}:subitem)}:item)
        }))
    }

    function addItem(field,defaults,e){
        e.preventDefault;
        setdata(prevdata=>({
            ...prevdata,
            [field]:[...prevdata[field],defaults]
        }))
    }

    function removeItem(field,index,e){
        e.preventDefault;
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].filter((item,i)=>i!==index)
        }))
        
    }

    function addItem2(field,index,subfield,defaults){
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].map((item,i)=>
            (i==index)?{...item,[subfield]:[...item[subfield],defaults]}:item
            )
        }))
    }

    function removeItem2(field,index,subfield,subindex){
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].map((item,i)=>
            (i==index)?{...item,[subfield]:item[subfield].filter((subitem,ii)=>ii!=subindex)}:item)
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
        {field['datatype']=="nest" && <div className="crudField"><div className="crudObject"><label>{field['name']}</label><button onClick={(e)=>addItem(field['name'],field['use-state'][0],e)}>Add</button><div className='crudGrid'>{output[field['name']].map((item,index)=><div className="crudFields">{field['structure'].map(subfield=><div className='crudField'>{subfield['datatype']=="single" && <div className='crudRow'><label>{subfield['name']}</label>{subfield['input']=="input" && <input onChange={(e)=>handlechange3(field['name'],subfield['name'],index,e)} value={output[field['name']][index][subfield['name']]} type={subfield['type']}/>}{subfield['input']=="option" && <select onChange={(e)=>handlechange3(field['name'],subfield['name'],index,e)} value={output[field['name']][index][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}</div>}{subfield['datatype']=="collection" && <div className='crudObject'><label>{subfield['name']}</label><div className='crudTable'><table><thead><tr><th className='crudTableCell'></th>{subfield['structure'].map(subsubfield=><th className='crudTableCell'>{subsubfield['name']}</th>)}</tr></thead><tbody>{output[field['name']][index][subfield['name']].map((subitem,subindex)=><tr><td><div className='crudTableCell'><button onClick={()=>removeItem2(field['name'],index,subfield['name'],subindex)}>-</button></div></td>{subfield['structure'].map(subsubfield=><td><div className='crudTableCell'><input value={output[field['name']][index][subfield['name']][subindex][subsubfield['name']]} onChange={(e)=>handlechange4(field['name'],index,subfield['name'],subindex,subsubfield['name'],e)}/></div></td>)}</tr>)}</tbody></table><button onClick={()=>addItem2(field['name'],index,subfield['name'],subfield['use-state'][0])}>+</button></div></div> }</div>)}<button onClick={(e)=>removeItem(field['name'],index,e)}>-</button></div>)}</div></div></div>}
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
        "accountbalances":[
            {"name":"period","label":"Period","type":"date","fields":["range"]}
        ],
        "assetregister":[
            {"name":"date","label":"As at","type":"date","fields":["value"]},
            {"name":"segment", "label":"Segment", "type":"text", "fields":["values"]},
            {"name":"profitcenter", "label":"Profit Center", "type":"text", "fields":["values"]},
            {"name":"costcenter", "label":"Cost Center", "type":"text", "fields":["values"]},
            {"name":"assetgl", "label":"General Ledger - Asset", "type":"text", "fields":["values"]},
            {"name":"depreciationgl", "label":"General Ledger - Depreciation", "type":"text", "fields":["values"]},
            {"name":"assetclass", "label":"Asset Class", "type":"text", "fields":["values"]},
        ],
        "assetledger":[
            {"name":"asset", "label":"Asset", "type":"text", "fields":["value"]},
            {"name":"period","label":"Period","type":"date","fields":["range"]}
        ],
        "assetschedule":[
            {"name":"period","label":"Period","type":"date","fields":["range"]}
        ],
        "attendance":[
            {"name":"employee","label":"Employee","type":"text","fields":["value"]},
            {"name":"year","label":"Year","type":"number","fields":["value"]},
            {"name":"month","label":"Month","type":"number","fields":["value"]},
        ],
        "clearing":[
            {"name":"ledger","label":"Ledger","type":"text","fields":["value"]},
            {"name":"date","label":"Date","type":"date","fields":["value"]},
        ],
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
            {"name":"date","type":"date","label":"Date","fields":["value"]}
        ],
        "depreciationpros":[
            {"name":"date", "label":"Date","type":"date","fields":["value"]}
        ],
        "depreciationretro":[
            {"name":"date", "label":"Date", "type":"date","fields":["value"]}
        ],
        "generalledger":[
            {"name":"ledger", "type":"text","label":"General Ledger","fields":["value"]},
            {"name":"period","type":"date","label":"Period","fields":["range"]}
        ],
        "ledger":[
            {"name":"ledger","label":"Ledger","fields":["values"]},
            {"name":"period","label":"Period","fields":["range"]},
        ],
        "materialissue":[
            {"name":"postingdate","label":"Posting Date","type":"date","fields":["value"]},
            {"name":"valuedate","label":"Value Date","type":"date","fields":["value"]},
            {"name":"material","label":"Material","type":"text","fields":["value"]},
            {"name":"location","label":"Location","type":"text","fields":["value"]},
        ],
        "materialinlocation":[
            {"name":"material","label":"Material","type":"text","fields":["value"]},
            {"name":"location","label":"Location","type":"text","fields":["value"]},
            {"name":"period","label":"Period","type":"date","fields":["range"]},
        ],
        "materialledger":[
            {"name":"material","label":"Material","type":"text","fields":["value"]},
            {"name":"period","label":"Period","type":"date","fields":["range"]},
        ],
        "materialbalances":[
            {"name":"period","label":"Period","type":"date","fields":["range"]},
        ],
        "materialmovement":[
            {"name":"period","label":"Period","type":"date","fields":["range"]},
        ],
        "paycalc":[
            {"name":"code", "label":"Employee Code","fields":["value"]},
            {"name":"year", "label":"Year","fields":["value"]},
            {"name":"month", "label":"Month","fields":["value"]},
        ],
        "personalaccountbalance":[
            {"name":"date","label":"As at","type":"date","fields":["value"]}
        ],
        "salaryrun":[
            {"name":"year", "label":"Year","fields":["value"]},
            {"name":"month", "label":"Month","fields":["value"]},
        ],
        "transactions":[
            {"name":"period","label":"Period","type":"date","fields":["range"]}
        ],
        "vanaccounting":[
            {"name":"VAN","label":"VAN","type":"text","fields":["value"]}
        ],
        "viewdocument":[
            {"name":"docno","label":"Document No","type":"text","fields":["value"]}
        ],
        "vendorledger":[
            {'name':"vendor","label":"Vendor","type":"text" ,"fields":["value"]},
            {'name':"period","label":"Period","type":"date","fields":["range"]},
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
                        {field =="value" && <input type={item["type"]} className='reportQueryCell' onChange={(e)=>valueChange(item['name'],field,e)} value={query[item['name']][field]}/>}
                        {field =="values" && <div className='reportQueryColumn'>{query[item['name']][field].map((values,i)=><div><input type={item["type"]} className='reportQueryCell' onChange={(e)=>valuesChange(item['name'],field,i,e)} value={query[item['name']][field][i]}/></div>)} <button onClick={()=>addValues(item['name'],field)}>+</button></div>}
                        {field =="exclValues" && <div className='reportQueryColumn'>{query[item['name']][field].map((values,i)=><div><input className='reportQueryCell' type={item["type"]} onChange={(e)=>valuesChange(item['name'],field,i,e)} value={query[item['name']][field][i]}/></div>)} <button onClick={()=>addValues(item['name'],field)}>+</button></div>}
                        {field =="range" && <div className='reportQueryRow'><input type={item["type"]} className='reportQueryCell' onChange={(e)=>rangeChange(item['name'],field,0,e)} value={query[item['name']][field][0]}/><input type={item["type"]} className='reportQueryCell' onChange={(e)=>rangeChange(item['name'],field,1,e)} value={query[item['name']][field][1]}/></div>}
                        {field =="ranges" && <div className='reportQueryColumn'>{query[item['name']][field].map((ranges,i)=><div><div className='reportQueryRow'><input type={item["type"]} className='reportQueryCell' onChange={(e)=>rangesChange(item['name'],field,i,0,e)} value={query[item['name']][field][i][0]}/><input type={item["type"]} className='reportQueryCell' onChange={(e)=>rangesChange(item['name'],field,i,1,e)} value={query[item['name']][field][i][1]}/></div></div>)} <button onClick={()=>addRanges(item['name'],field)}>+</button></div>}
                        {field =="exclRanges" && <div className='reportQueryColumn'>{query[item['name']][field].map((ranges,i)=><div><div className='reportQueryRow'><input type={item["type"]} className='reportQueryCell' onChange={(e)=>rangesChange(item['name'],field,i,0,e)} value={query[item['name']][field][i][0]}/><input type={item["type"]} className='reportQueryCell' onChange={(e)=>rangesChange(item['name'],field,i,1,e)} value={query[item['name']][field][i][1]}/></div></div>)} <button onClick={()=>addRanges(item['name'],field)}>+</button></div>}
                        </div>
                )}
                </div>
        )}
        
        <div className='reportQueryButtons'>
            <button className='blue' onClick={()=>navigate('/reports')}>Back</button>
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

    function AccountBalances({query}){
        const {period}= query
        const data = GeneralLedger.accountBalances(period['range']);

        return(
            <div>
                <DisplayAsTable collection={data}/>
            </div>
        )
    }

    function AssetRegister({query}){

        const {segment,profitcenter,costcenter,assetclass,assetgl,depreciationgl, date} = query;
        const [idate,setidate] = useState(date['value']);
        const [odate,setodate] = useState(date['value']);
        let data = Asset.register(odate);
        data = (segment['values'].length>0 && segment['values'][0]!="")?data.filter(item=>segment['values'].includes(item['Segment'])):data;
        data = (profitcenter['values'].length>0 && profitcenter['values'][0]!="")?data.filter(item=>profitcenter['values'].includes(item['Profit Center'])):data;
        data = (costcenter['values'].length>0 && costcenter['values'][0]!="")?data.filter(item=>costcenter['values'].includes(item['Cost Center'])):data;
        data = (assetclass['values'].length>0 && assetclass['values'][0]!="")?data.filter(item=>assetclass['values'].includes(item['Asset Class'])):data;
        data = (assetgl['values'].length>0 && assetgl['values'][0]!="")?data.filter(item=>assetgl['values'].includes(item['General Ledger - Asset'])):data;
        data = (depreciationgl['values'].length>0 && depreciationgl['values'][0]!="")?data.filter(item=>depreciationgl['values'].includes(item['General Ledger - Depreciation'])):data;

        return (
            <div>
                <h2>Asset Register</h2>
                <label>As at</label><input value={idate} onChange={(e)=>setidate(e.target.value)} type="date"/><button onClick={()=>setodate(idate)}>Get</button>
                <DisplayAsTable collection={data}/>
            </div>
        )
    }

    function AssetLedger({query}){
        const {asset, period} = query;
        const navigate = useNavigate();

        if (Asset.list().includes(asset['value'])){
            const data = new Asset(asset['value']).ledger(period['range']);

            return(
                <div>
                    <h2>Asset Ledger</h2>
                    <p>{`Of ${asset['value']} for the period from ${period['range'][0]} to ${period['range'][1]}`}</p>
                    <DisplayAsTable collection={data}/>
                </div>
            )
        } else {
            return (
                <div className='negativeReport'>
                    <p>Sorry, May be the asset is misspelled. Don't worry. You can choose one from the list below</p>
                    <div>{Asset.list().map(item=><button onClick={()=>navigate('/reportdisplay/assetledger', {state:{"asset":{"value":item},"period":period}})}>{item}</button>)}</div>
                </div>
            )
        }
    }

    function AssetSchedule({query}){
        const {period} = query;
        const data = Asset.schedule(period['range']);
        const keys = Object.keys(data[0]);
        const navigate = useNavigate();

        const ledger = (asset)=>{
            navigate('/reportdisplay/assetledger', {state:{'asset':{'value':asset},'period':period}})
        }
        return(
            <div>
                <h2>Asset Schedule</h2>
                <p>{`from ${period['range'][0]} to ${period['range'][1]}`}</p>
                <table>
                    <thead>
                        <tr>
                            {keys.map(key=>
                                <th>{key}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item=>
                            <tr onDoubleClick={()=>ledger(item['Asset'])}>
                                {keys.map(key=>
                                    <td>{item[key]}</td>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )
    }

    function Clearing({query}){
        const {ledger,date} = query;
        const data = new Ledger(ledger['value']).openItems(date['value']);
        const display = ["Posting Date","General Ledger","Document Date","Text","Amount","Debit/ Credit"]
        const [selected,setselected] = useState([])
        
        const selectedData = data.filter((item,i)=>selected.includes(i));
        
        const entry = {}
        entry['Line Items'] = [];
        selectedData.map(item=>entry['Line Items'].push({'calculated':true,'Account':item['Account'],'General Ledger':item['General Ledger'],'Amount':item['Amount'],'Debit/ Credit':(item['Debit/ Credit']=='Debit')?'Credit':'Debit'}))
        entry['Balance'] = SumFieldIfs(entry['Line Items'],'Amount',['Debit/ Credit'],['Debit'])-SumFieldIfs(entry['Line Items'],'Amount',['Debit/ Credit'],['Credit'])
        const [type,settype] = useState("");
        const transaction = new Transaction('General');
        const lineItems = transaction.firstLineItem();
        const [input,setinput] = useState(Transaction.defaults)
        const output = {}
        output['Posting Date'] = date['value'];
        output['Document Date'] = date['value'];
        output['Line Items'] = [...transaction.process(input)['Line Items'],...entry['Line Items']];
        output['Balance'] = SumFieldIfs(output['Line Items'],'Amount',['Debit/ Credit'],['Debit'])-SumFieldIfs(output['Line Items'],'Amount',['Debit/ Credit'],['Credit'])
        
        const [bank,setbank] = useState("");
        const payEntry = {...output,['Line Items']:entry['Line Items']};
        (bank!="")?payEntry['Line Items'].push({'Account':bank,'Amount':entry['Balance'],"Payee":ledger['value'], "Debit/ Credit":"Credit","General Ledger":new BankAccount(bank).data['General Ledger'], "Profit Center":new BankAccount(bank).data['Profit Center']}):()=>{}
        payEntry["Balance"] = SumFieldIfs(payEntry['Line Items'],'Amount',['Debit/ Credit'],['Debit'])-SumFieldIfs(payEntry['Line Items'],'Amount',['Debit/ Credit'],['Credit'])
        const clearingEntries = output['Line Items'].filter(item=>!item['calculated'])
        const calculatedEntries = output['Line Items'].filter(item=>item['calculated'])
        const errors = transaction.validate(output);
        const removeitem = (i,array)=>{
            return array.filter(item=>item!==i)
        }

        const addItem = (i,array)=>{
            const newarray = [...array,i]
            return newarray;
        }

        const selection = (e,i)=>{
            const value = e.target.checked;
            (value)?setselected(prevdata=>addItem(i,prevdata)):setselected(prevdata=>removeitem(i,prevdata))
        }

        const selectAll = ()=>{
            const length = data.length;
            for (let i=0; i<length; i++){
            setselected(prevdata=>addItem(i,prevdata))
            }
        }

        const lineItemChange = (index,field,e)=>{
        const {value} = e.target;
        setinput(prevdata=>({
            ...prevdata,['Line Items']:prevdata['Line Items'].map((item,i)=>(i==index)?{...item,[field]:value}:item)
        }))
    }

    const addLine = ()=>{
        setinput(prevdata=>({
            ...prevdata,['Line Items']:[...prevdata['Line Items'],Transaction.defaults['Line Items'][0]]
        }))
    }

    const removeLine = (index)=>{
        setinput(prevdata=>({
            ...prevdata,['Line Items']:prevdata['Line Items'].filter((item,i)=>i!==index)
        }))
    }

    const save = (type)=>{
        let newdata = [];
        const collections = loadData('transactions');
        if (errors.length==0){
            switch (type){
                case 'Clear':
                    newdata = [...collections,{...output,["Entry Date"]:new Date().toLocaleDateString()}]
                    break
                case 'Pay':
                    newdata = [...collections,{...payEntry,["Entry Date"]:new Date().toLocaleDateString()}]
                    break
            }
            saveData(newdata,'transactions')
            alert(`Saved!`)
            window.location.reload();

        } else {
            alert("There are still errors unresolved")
        }
    }
        

        return(
            <div>
                <div>
                    <table>
                        <thead>
                            <tr>
                                {display.map(field=><th>{field}</th>)}<th>Select</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item,i)=>
                                <tr>
                                    {display.map(field=>
                                    <td><p>{item[field]}</p></td>
                                    )}
                                    <td><input onChange={(e)=>selection(e,i)} checked={selected.includes(i)} type={"checkbox"}/></td>
                                </tr>
                    )}
                        </tbody>
                    </table>
                    <button onClick={()=>selectAll()}>Select All</button>
                    <button onClick={()=>setselected([])}>Deselect All</button>
                    <button onClick={()=>settype("Clear")}>Clear</button>
                    <button onClick={()=>settype("Pay")}>Clear & Pay</button>
                    <button></button>
                </div>
                {type==="Clear" && <div className='clear'>
                    <table>
                        <thead>
                            <tr><th className='lineItemCell'></th>{transaction.lineItems().map(item=><th className='lineItemCell'>{item['name']}</th>)}</tr>  
                        </thead>
                        <tbody>
                            {clearingEntries.map((item,i)=>
                                <tr><td className='lineItemCell'><button onClick={()=>removeLine(i)}>-</button></td>
                            
                                
                                {transaction.lineItemByContent(item).map(field=>
                                    <td className='lineItemCell'>
                                        {field['input']=="input" && <input onChange={(e)=>lineItemChange(i,field['name'],e)} type={field['type']} value={item[field['name']]}/>}
                                        {field['input']=="option" && <select onChange={(e)=>lineItemChange(i,field['name'],e)} value={item[field['name']]}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}
                                        {field['input']=="calculated" && <label>{item[field['name']]}</label>}
                                    </td>
                                )}</tr>
                            )}
                            {calculatedEntries.map(item=>
                            <tr>
                                <td className='lineItemCell'></td>
                                {transaction.lineItems().map(field=>
                                    <td className='lineItemCell'>{item[field['name']]}</td>
                                )}
                            
                            </tr>
                            )}
                        </tbody>
                    </table>
                    {output['Balance']}
                    <button className='blue' onClick={()=>addLine()}>+</button>
                    <div className='errors'>
                <h4>Please consider:</h4>
                <ul>
                    {errors.map((item,i)=><li key={i}>{item}</li>)}
                </ul>
            </div>
            <button onClick={()=>save()}>Save</button>
                </div>}
            {type==="Pay" && 
                <div>
                    <label>Bank Account</label>
                    <select value={bank} onChange={(e)=>setbank(e.target.value)}>{["",...BankAccount.list()].map(option=><option value={option}>{option}</option>)}</select>
                </div>
            }
            {JSON.stringify(payEntry)}
            </div>
        )
    }

    function Depreciation({query,method}){
        const date = query['date']['value'];
        let data = Asset.depreciationData(date);
        data = data.map(item=>(new Date(item['Depreciated Till'])>= new Date(date))?{...item,['Depreciable']:"Retrospective"}:{...item,['Depreciable']:"Yes"})
        const postingdata = (method=="Prospective")?data.filter(item=>item['Depreciable']!="Retrospective"):data.filter(item=>item['Depreciable']=="Retrospective")
        const entry = Asset.depreciationEntry(date,postingdata,method);
        const post = ()=>{
            Transaction.post(entry);
            alert('Depreciation Posted Succesfully');
        }
        return(
            <div>
                <DisplayAsTable collection={data}/>
                <button onClick={()=>post()}>Post</button>
                <button onClick={()=>navigate('/reportdisplay/depreciationretro',{state:query})}>Retro</button>
            </div>
        )
    }

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

    function GenLedger({query}){
        const {ledger,period}  = query;
        const data = new GeneralLedger(ledger['value']).ledger(period['range']);

        return(
            <div>
                <DisplayAsTable collection={data}/>
            </div>
        )
    }

    function MaterialIssueUI({query}){

    const{postingdate,valuedate,material,location} = query;

    const PDate = postingdate['value'];
    const Material = material['value'];
    const Location = location['value'];
    const VDate = valuedate['value'];

    const defaults = [
        {"Transaction":"Transfer","Location":"","Quantity":0,"Product":"","General Ledger":"","Cost Center":"","Cost Object":"","Profit Center":"","Consumption Time From":"","Consumption Time To":""}
    ]
    const [input,setinput] = useState(defaults);
    const mi = new MaterialIssue(Material,Location,VDate,PDate,input);
    const schema = mi.schema;
    const errors = mi.validate();
    const entry = mi.createEntry();

    const lineItemChange = (index,field,e)=>{
        const {value} = e.target;
        setinput(prevdata=>(
            prevdata.map((item,i)=>(i==index)?{...item,[field]:value}:item)
        ))
    }

    const addLine = ()=>{
        setinput(prevdata=>([...prevdata,defaults[0]]))
    }

    const removeLine = (index)=>{
        setinput(prevdata=>(
            prevdata.filter((item,i)=>i!==index)
        ))
    }

    const post =()=>{
        const result = mi.post();
        alert(result);
    }

    return (
        <div className='transaction'>
            <div className='lineItems'>
                <table>
                    <thead>
                        <tr><th></th>{schema[0].map(item=><th>{item['name']}</th>)}</tr>
                    </thead>
                    <tbody>
                        {input.map((item,i)=>
                            <tr><td><button onClick={()=>removeLine(i)}>-</button></td>{schema[i].map(field=>
                            <td>
                                {field['input']=="input" && <input onChange={(e)=>lineItemChange(i,field['name'],e)} type={field['type']} value={input[i][field['name']]}/>}
                                {field['input']=="option" && <select onChange={(e)=>lineItemChange(i,field['name'],e)} value={input[i][field['name']]}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}
                                {field['input']=="calculated" && <label></label>}
                            </td>)}
                            </tr>
                        )}
                    </tbody>
                </table>
                <button onClick={()=>addLine()}>+</button>
            </div>
            <button onClick={()=>post()}>POST</button>
            {JSON.stringify(entry)}
        </div>
    )
    }

    function MaterialLedger({query}){
        const {material, period} = query
        const data = new Material(material['value']).ledger(period['range'])
        return(
            <div>
                <DisplayAsTable collection={data}/>
            </div>
        )
    }

    function MaterialInLocationLedger({query}){
        const {material,location, period} = query
        const data = new MaterialInLocation(material['value'],location['value']).ledger(period['range'])
        return(
            <div>
                <DisplayAsTable collection={data}/>
            </div>
        )
    }

    function MaterialBalances({query}){
        const {period} = query;
        const data = MaterialInLocation.MaterialBalances(period['range']);

        return (
            <div>
                <DisplayAsTable collection={data}/>
            </div>
        )
    }

    function MaterialMovement({query}){
        const {period} = query;
        const data = MaterialInLocation.MaterialMovement(period['range']);

        return (
            <div>
                <DisplayAsTable collection={data}/>
            </div>
        )
    }

    function PayCalc({query}){
        const location = useLocation();
        const {code,year,month} = query;
        const data = new Employee(code['value']).salary(year['value'],month['value'])
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

    function PersonalAccountBalance({query}){
        const {date}= query;
        const data = Ledger.accountBalances(date['value']);
        
        return(
            <div>
                <DisplayAsTable collection={data}/>
            </div>
        )
    }

    function Transactions({query}){
        const {period}= query;
        const data = Transaction.transactions(period['range']);
        const fields = ["Document No","Posting Date","Document Date","Reference","Account","General Ledger","Amount","Debit/ Credit","Account Type", "Presentation","Transaction","Profit Center"]
        const navigate = useNavigate();
        const view = (docNo) =>{
            navigate('/reportdisplay/viewdocument',{state:{"docno":{"value":docNo}}})
        } 

        return(
            <div>
                <table>
                    <thead>
                        <tr>{fields.map(item=><th>{item}</th>)}</tr>
                    </thead>
                    <tbody>
                        {data.map(item=>
                            <tr onDoubleClick={()=>view(item['Document No'])}>{fields.map(field=><td>{item[field]}</td>)}</tr>
                        )}
                    </tbody>
                </table>
            </div>
        )
    }

    function VendorOpenItem({query}){
        const {vendor,date} = query
        return(
            <div>
                {vendor['values'].map(item=>
                    <div>
                        <h4>{item}</h4>
                        <DisplayAsTable collection={new Ledger(item).openItems(date['value'])}/>
                    </div>
                )}
            </div>
        )
    }

    function VendorLedger({query}){
        const {vendor,period} = query
        const data = new Ledger(vendor['value']).ledger(period['range']);

        return(
            <div>
                <DisplayAsTable collection={data}/>
            </div>
        )
    }

    function ViewDocument({query}){
        const {docno} = query
        const data = new Doc(docno['value']).data;
        const fields = Object.keys(data).filter(field=>field!="Line Items")

        return(
            <div>
                {fields.map(field=>
                    <div><label>{field}</label><label>{data[field]}</label></div>
                )}
                <DisplayAsTable collection={data['Line Items']}/>
            </div>
        )
    }

    function VANAccounting({query}){
        const {VAN} = query;
        const defaults = {"Positng Date":"","Document Date":"","Amount":"","Text":""}
        const [data,setdata] = useState([defaults]);

        const handleChange = (e,i,field)=>{
            const {value} = e.target;
            setdata(prevdata=>(prevdata.map((item,index)=>(i==index)?{...item,[field]:value}:item)))
        }

        const removeLine = (i) =>{
            setdata(prevdata=>(prevdata.filter((item,index)=>index!==i)))
        }

        const addLine = ()=>{
            setdata(prevdata=>([...prevdata,defaults]))
        }

        const vanentry = new VANEntry(VAN['value'],data)
        const simulation = vanentry.simulate();
        const post =()=> {
            const result = vanentry.post()
            alert(result)
        }
        return(
            <div>
                <h4>VAN Accounting</h4>
                <div>
                    <table>
                        <thead>
                            <tr><th></th><th>Posting Date</th><th>Document Date</th><th>Amount</th><th>Text</th></tr>
                        </thead>
                        <tbody>
                            {data.map((item,i)=>
                                <tr>
                                    <td><button onClick={()=>removeLine(i)}>-</button></td>
                                    <td><input value={item['Posting Date']} onChange={(e)=>handleChange(e,i,"Posting Date")} type="date"/></td>
                                    <td><input value={item['Document Date']} onChange={(e)=>handleChange(e,i,"Document Date")} type="date"/></td>
                                    <td><input value={item['Amount']} onChange={(e)=>handleChange(e,i,"Amount")} type="number"/></td>
                                    <td><input value={item['Text']} onChange={(e)=>handleChange(e,i,"Text")} type="text"/></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <button onClick={()=>addLine()}>+</button>
                </div>
                <button onClick={()=>post()}>Post</button>
            </div>
        )
    }

    return (
        <div className='reportDisplay'>
            {report=="accountbalances" && <AccountBalances query={query}/>}
            {report=="assetledger" && <AssetLedger query={query}/>}
            {report=="assetregister" && <AssetRegister query={query}/>}
            {report=="assetschedule" && <AssetSchedule query={query}/>}
            {report=="attendance" && <AttendanceUI query={query}/>}
            {report=="clearing" && <Clearing query={query}/>}
            {report=="costcenteritems" && <CostCenterItems query={query}/>}
            {report=="costtoprepaid" && <CostToPrepaid query={query}/>}
            {report=="costobjectbalance" && <CostObjectBalance query={query}/>}
            {report=="costobjecttransactions" && <CostObjectTransactions query={query}/>}
            {report=="costobjectsettlement" && <CostObjectSettlement query={query}/>}
            {report=="depreciationpros" && <Depreciation query={query} method={"Prospective"}/>}
            {report=="depreciationretro" && <Depreciation query={query} method={"Retrospective"}/>}
            {report=="generalledger" && <GenLedger query={query}/>}
            {report=="materialissue" && <MaterialIssueUI query={query}/>}
            {report=="materialinlocation" && <MaterialInLocationLedger query={query}/>}
            {report=="materialledger" && <MaterialLedger query={query}/>}
            {report=="materialbalances" && <MaterialBalances query={query}/>}
            {report=="materialmovement" && <MaterialMovement query={query}/>}
            {report=="personalaccountbalance" && <PersonalAccountBalance query={query}/>}
            {report=="paycalc" && <PayCalc query={query}/>}
            {report=="salaryrun" && <SalaryRun query={query}/>}
            {report=="transactions" && <Transactions query={query}/>}
            {report=="vendoropenitem" && <VendorOpenItem query={query}/>}
            {report=="vendorledger" && <VendorLedger query={query}/>}
            {report=="viewdocument" && <ViewDocument query={query}/>}
            {report=="vanaccounting" && <VANAccounting query={query}/>}
            <div className='reportDisplayButtons'>
                <button className="blue" onClick={()=>navigate('/report/'+report)}>Back</button>
            </div>
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
    firstLineItem(content){
        let items = this.lineItemByContent(content);
        let notreq = [];
        switch (this.type){
            case 'Purchase':
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Vendor.list()]}:item);
                break
            case 'Sale':
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Customer.list()]}:item);
                notreq = ["Account Type","Debit/ Credit","General Ledger","GST", "Profit Center", "Cost Center", "HSN", "Quantity", "Value Date", "Location"]
                break
            case 'Manual Depreciation':
                items = [];
                break
            case 'Asset Acquisition':
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Vendor.list()]}:item);
                notreq = ["Transaction","General Ledger","GST", "Profit Center", "Cost Center", "HSN", "Quantity", "Value Date", "Location"]
                break
            case 'Asset Disposal':
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Customer.list()]}:item);
                notreq = ["Transaction","General Ledger","GST", "Profit Center", "Cost Center", "HSN", "Quantity", "Value Date", "Location"]
                break
            case 'Asset Revaluation':
                items=[];
                break
            case 'Payment':
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...BankAccount.list()]}:item);
                
                break
            case 'Receipt':
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...BankAccount.list()]}:item);
                break
            case 'General':
                items = [];
                break
        }
        items = items.map(item=>(!notreq.includes(item['name'])?item:{...item,['input']:'calculated'}));
        return items
    }
    lineItemHeads(){
        let items = Transaction.lineItems
        const req ={
            "Purchase":["Account","Transaction","Account Type","Presentation","General Ledger","Amount","Debit/ Credit","Text","GST","GST Supplier","HSN","Profit Center","Payee","TDS","TDS Base","TDS Deductee","Location","Quantity","Value Date"],
            "Sale":["Account","Transaction","Account Type","Presentation","General Ledger","Amount","Debit/ Credit","Text","GST","GST Supplier","HSN","Profit Center","Payee","TDS","TDS Base","TDS Deductee","Location","Quantity","Value Date"],
            "Asset Acquisition":["Account","Transaction","Amount","Debit/ Credit","Text","Profit Center","GST","GST Supplier","HSN","Presentation","Payee","TDS","TDS Base","Deductee"],
            "General":ListItems(Transaction.lineItems,'name')
        }
        let calc = [];
        switch (this.type){
            case 'Sale':
                notreq = ["Cost Object","Consumption Time From", "Consumption Time To", "Presentation","Purchase Order", "Sale Order", "Item", "Clearing Document", "Clearing Date"]
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Material.list(),...Service.list(),...Asset.activeList()]}:item);
                break
            case 'Purchase':
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Material.list(),...Service.list(),...Asset.activeList(),...GeneralLedger.listtype('General'),...GeneralLedger.listtype('Cost Element')]}:item);
                break
            case 'Manual Depreciation':
                notreq = ["HSN","GST","GST Supplier","Location","Quantity","Value Date","TDS","TDS Base","TDS Deductee","Cost Object", "Presentation","Purchase Order", "Sale Order", "Item", "Clearing Document", "Clearing Date"]
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Asset.activeList()]}:item);
                break
            case 'Asset Acquisition':
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Asset.activeList()]}:item);
                break
            case 'Asset Disposal':
                notreq = ["Cost Center","Depreciation Upto","Location","Quantity","Value Date","Cost Object", "Purchase Order", "Sale Order", "Item", "Clearing Document", "Clearing Date","Consumption Time From","Consumption Time To"]
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Asset.activeList()]}:item);
                break
            case 'Asset Revaluation':
                notreq = ["Depreciation Upto","TDS","TDS Base","TDS Deductee","Presentation","GST","GST Supplier","HSN","Location","Quantity","Value Date","Cost Object", "Purchase Order", "Sale Order", "Item", "Clearing Document", "Clearing Date","Consumption Time From","Consumption Time To"]
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Asset.activeList(),...GeneralLedger.list()]}:item);
                break
            case 'Payment':
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Vendor.list(),...Customer.list(),...BankAccount.list()]}:item);
                notreq = ["Transaction","Depreciation Upto","GST","GST Supplier","HSN","Cost Center","Cost Object","Consumption Tinme From","Consumption Time To","Locaiton","Quantity","Value Date","Purchase Order", "Sale Order", "Item"]
                break
            case 'Receipt':
                items = items.map(item=>(item['name']=="Account")?{...item,['options']:["",...Vendor.list(),...Customer.list(),...BankAccount.list()]}:item);
                notreq = ["Transaction","Depreciation Upto","GST","GST Supplier","HSN","Cost Center","Cost Object","Consumption Time From","Consumption Time To","Location","Quantity","Value Date","Purchase Order", "Sale Order", "Item"]
                break
        }
        items = items.filter(item=>req[this.type].includes(item['name']));

        items = items.map(item=>(calc.includes(item['name']))?{...item,["input"]:"calculated"}:item);
        return items
    }
    lineItemByContent(content){
        let lineItems = this.lineItemHeads();
        const type = new Intelligence().ledgerType(content['Account']);
        const req = {
            "":["Account"],
            "Asset":["Account","Transaction","Amount","Debit/ Credit","Text","GST","GST Supplier","HSN","Depreciation Upto"],
            "Material":["Account","Amount","Debit/ Credit","Text","GST","GST Supplier","HSN","Location","Quantity","Value Date"],
            "Service":["Account","Amount","Debit/ Credit","Text","GST","GST Supplier","HSN","Profit Center"],
            "Vendor":["Account","Presentation","Amount","Debit/ Credit","Text","Profit Center","Payee","TDS","TDS Base","TDS Deductee"],
            "Customer":["Account","Amount","Debit/ Credit","Text","Profit Center","Payee","TDS","TDS Base","TDS Deductee"],
            "Bank Account":["Account","Amount","Debit/ Credit","Text","VAN"],
            "General Ledger":["Account","Amount","Debit/ Credit","Text","Profit Center","Consumption Time From","Consumption Time To","Cost Center","Cost Object","GST","GST Supplier","HSN"]
        }

        const transactions = {
            "Material":["Receipt","Transfer","Consumption"],
            "Asset":["Acquisition","Disposal","Depreciation","Revaluation"],
        }
        lineItems= lineItems.map(item=>(req[type].includes(item['name']))?item:{...item,['input']:'calculated'})
        Object.keys(transactions).includes(type)?lineItems= lineItems.map(item=>(item['name']=="Transaction")?{...item,...{'input':"option","options":["",...transactions[type]]}}:item):()=>{}
        switch (type){
            case 'Vendor':
                lineItems = lineItems.map(item=>(item['name']=="Presentation")?{...item,...{'input':"option","options":["",...GeneralLedger.listtype('Vendor')]}}:item)
                break
            case 'Customer':
                lineItems = lineItems.map(item=>(item['name']=="Presentation")?{...item,...{'input':"option","options":["",...GeneralLedger.listtype('Customer')]}}:item)
            case 'Asset':
                const transaction = content['Transaction'];
                lineItems = lineItems.map(item=>(item['name']=="Transaction" && this.type=="Sale")?{...item,...{'input':"option","options":["","Disposal"]}}:item);
                lineItems = lineItems.map(item=>(item['name']=="Transaction" && this.type=="Manual Depreciation")?{...item,...{'input':"option","options":["","Depreciation"]}}:item)
                lineItems = lineItems.map(item=>(item['name']=="Amount" && ["Disposal","Depreciation"].includes(transaction))?{...item,...{'input':"calculated"}}:item);
                break
            case 'Bank Account':
                lineItems = lineItems.map(item=>(item['name']=="VAN")?{...item,...{'input':"option","options":["",new BankAccount(content['Account']).listOfVAN]}}:item)
                break

        }
        return lineItems 
    }
    process(data){
        const result = {...data};

        result['Line Items'] = result['Line Items'].map(item=>this.lineItemProcess(item));
        result['Line Items'].map(item=>(!item['GST']=="")?result['Line Items'].push(...this.calcGST(item)):()=>{})
        result['Line Items'].map(item=>(!item['TDS']=="")?result['Line Items'].push(this.calcTDS(item)):()=>{})
        result['Line Items'].map(item=>(item['Account Type']=="Asset" && item['Transaction']=="Depreciation")?result['Line Items'].push(this.depreciation(item)):()=>{});
        
        result["Balance"] = SumFieldIfs(result['Line Items'],'Amount',["Debit/ Credit"],["Debit"]) - SumFieldIfs(result['Line Items'],'Amount',["Debit/ Credit"],["Credit"])
        return result
    }
    lineItemProcess(lineItemData){
        const result = {...lineItemData};
        result['Account Type'] = new Intelligence().ledgerType(result['Account']);
        switch (result['Account Type']){
            case 'General Ledger':
                result['General Ledger'] = result['Account'];
                break;
            case 'Vendor':
                result['General Ledger'] = result['Presentation'];
                break
            case 'Customer':
                result['General Ledger'] = result['Presentation'];
                break
            case 'Bank Account':
                result['General Ledger'] = new BankAccount(result['Account']).data['General Ledger'];
                result['Profit Center'] = new BankAccount(result['Account']).data['Profit Center'];
                break
            case 'Material':
                result['General Ledger'] = new Material(result['Account']).data['General Ledger']
                break
            case 'Asset':
                result['Transaction'] = (this.type=="Manual Depreciation")?"Depreciation":result['Transaction'];
                result['Transaction'] = (this.type=="Asset Acquisition")?"Acquisition":result['Transaction'];
                result['Transaction'] = (this.type=="Asset Disposal")?"Disposal":result['Transaction'];
                result['Transaction'] = (this.type=="Asset Revaluation")?"Revaluation":result['Transaction'];
                result['General Ledger'] = new Asset(result['Account']).assetclass.data['General Ledger - Asset'];
                result['Profit Center'] = new Asset(result['Account']).profitcenter.name;
                result['Amount'] = (result['Transaction']=="Disposal")?new Asset(result['Account']).disposableValue():result['Amount']
                result['Amount'] = (result['Transaction']=="Depreciation")?new Asset(result['Account']).depreciableAmount(result['Depreciation Upto']):result['Amount']
                result['Debit/ Credit'] = (this.type=="Manual Depreciation" && result['Transaction']=="Depreciation")?"Credit":result['Debit/ Credit']
                break
        }
        return result
    }
    calcGST(data){
        let result = []
        const Code = new GSTCodes(data['GST']);
        result.push({'calculated':true,'Account':Code.data['CGST Account'],'General Ledger':Code.data['CGST Account'],'Amount':Code.data['Rate']/2*data['Amount']/100,"Debit/ Credit":data['Debit/ Credit'],"Profit Center":data['Profit Center'],"GST Supplier":data['GST Supplier']});       
        result.push({'calculated':true,'Account':Code.data['SGST Account'],'Account Type':"General Ledger",'General Ledger':Code.data['SGST Account'],'Amount':Code.data['Rate']/2*data['Amount']/100,"Debit/ Credit":data['Debit/ Credit'],"Profit Center":data['Profit Center'],"GST Supplier":data['GST Supplier']});       
        return result
        
    }

    calcTDS(data){
        const constants = {
            "194C-Individual":{
                "Rate":0.01
            }
        }
        let result = {'calculated':true};
        result = (Object.keys(constants).includes(data['TDS']))?{...result,...{'Amount':data['TDS Base']*constants[data['TDS']]['Rate'],'Debit/ Credit':"Credit"}}:result;
        return result
    }
    depreciation(data){
        const asset = new Asset(data['Account'])
        let result = {'calculated':true};
        result['Account'] = asset.assetclass.data['General Ledger - Depreciation'];
        result['Amount'] = data['Amount'];
        result['Debit/ Credit'] = (data['Debit/ Credit']!="Debit")?"Debit":"Credit";
        result['Cost Center'] = asset.costcenter.name;
        result['Profit Center'] = asset.profitcenter.name;
        result['Text'] = data['Text'];
        result['Consumption Time From'] = asset.depPostedUpTo();
        result['Consumption Time To'] = data['Depreciation Upto']
        result = this.lineItemProcess(result)
        return result;
    }
    validate(data){
        const list = [];    
        const firstPeriod = [Company.timeControls['First']['From'],Company.timeControls['First']['To']];
        const secondPeriod = [Company.timeControls['Second']['From'],Company.timeControls['Second']['To']]
        const req = ["Posting Date","Document Date"];
        req.map(item=>(data[item]=="")?list.push(`${item} required.`):()=>{});
        (new Date(data['Posting Date'])>new Date())?list.push('Posting Date cannot be future.'):()=>{};
        (!valueInRange(new Date(data['Posting Date']),[new Date(firstPeriod[0]),new Date(firstPeriod[1])]) && !valueInRange(new Date(data['Posting Date']),[new Date(secondPeriod[0]),new Date(secondPeriod[1])]))?list.push('Posting Date not in Open Period(s)'):()=>{}
        (new Date(data['Document Date'])>new Date())?list.push('Document Date cannot be future.'):()=>{};
        (data["Balance"]!=0)?list.push('Balance not zero.'):()=>{};
        data['Line Items'].map((item,i)=>list.push(...this.validateline(item,i)));
        return list
    }
    validateline(item,i){
        let req = {
            "Asset": ["Transaction","Debit/ Credit"],
            "Bank Account":[],
            "Material":["Location","Quantity","Value Date"],
            "Service":["Profit Center"],
            "Customer":["Debit/ Credit","Profit Center"],
            "Vendor":["Debit/ Credit","Profit Center"],
            "":["Account"],
            "General Ledger":[]
        };
        const list = [];
        req[item['Account Type']].map(reqfield=>(item[reqfield]=="") ?list.push(`Line ${i}: ${reqfield} required`):()=>{})
        return list;
    }
    static database = ('transactions' in localStorage)?JSON.parse(localStorage.getItem('transactions')):[]
    static transactionstable(){
        const data = this.database
        const fields = ["Posting Date","Document No"]
        const table = []
        for (let i=0;i<data.length;i++) {
        const newdata = {}
        fields.map(field=>newdata[field] = data[i][field])
        data[i]['Line Items'].map(item=>table.push({...newdata,...item}))
        }
        return table
    }
    static transactions(period){
        const [from,to] = period;
        const data = this.transactionstable().filter(item=>new Date(item['Posting Date'])>= new Date(from) && new Date(item['Posting Date'])<= new Date(to))
        return data
    }

    static headerFields = [
        {"name":"Posting Date","type":"date"},
        {"name":"Document Date","type":"date"},
        {"name":"Reference","type":"text"},
        {"name":"Text","type":"text"},
    ]
    static lineItems = [
        {"name":"Account", "placeholder":"Account","type":"text", "input":"option", "options":["",...Asset.activeList(),...BankAccount.list(),...GeneralLedger.list(), ...Material.list(),...Service.list(),...Vendor.list(), ...Customer.list()]},
        {"name":"Transaction", "input":"option","options":[""]},
        {"name":"Account Type", "input":"calculated"},
        {"name":"Presentation", "input":"notrequired"},
        {"name":"VAN","input":"calculated"},
        {"name":"Depreciation Upto", "input":"input", "type":"date"},
        {"name":"General Ledger", "input":"calculated"},
        {"name":"Amount", "type":"number", "input":"input"},
        {"name":"Debit/ Credit", "type":"number", "input":"option","options":["","Debit","Credit"]},
        {"name":"Text","input":"input","type":"text"},
        {"name":"GST","input":"option","options":["",GSTCodes.list]},
        {"name":"GST Supplier", "type":"number", "input":"option","options":["",...Vendor.list(),...Customer.list()]},
        {"name":"HSN", "type":"number", "input":"input"},
        {"name":"Payee", "type":"number", "input":"option","options":["",...Vendor.list(),...Customer.list()]},
        {"name":"TDS Base","input":"input","type":"number"},
        {"name":"TDS","input":"option","options":["","194C-Individual"]},
        {"name":"TDS Deductee", "type":"number", "input":"option","options":["",Vendor.list(),Customer.list()]},
        {"name":"Profit Center","input":"option","options":["",...ProfitCenter.list()]},
        {"name":"Cost Center","input":"option","options":["",...CostCenter.list()]},
        {"name":"Cost Object","input":"option","options":["",...CostObject.list()]},
        {"name":"Consumption Time From","input":"input","type":"date"},
        {"name":"Consumption Time To","input":"input","type":"date"},
        {"name":"Location","input":"option","options":["",...Location.list()]},
        {"name":"Quantity","input":"input","type":"number"},
        {"name":"Value Date","input":"input","type":"date"},
        {"name":"Purchase Order","input":"input","type":"number"},
        {"name":"Sale Order","input":"input","type":"number"},
        {"name":"Item","input":"input","type":"number"},
        {"name":"Clearing Document","input":"calculated"},
        {"name":"Clearing Date","input":"calculated"}
    ]
    
    static defaults = {
        "Posting Date":"",
        "Document Date":"",
        "Reference":"",
        "Text":"",
        "Line Items":[this.defaultLine()]
    }

    static defaultLine(){
        const data = {}
        this.lineItems.map(item=>(data[item['name']]=""));
        return data
    }
    static VANSimulate(VAN,data){
        const list = [];
        data.map(item=>list.push({...this.defaults,...{'Posting Date':item['Date'],'Line Items':this.VANLineItems(VAN,item)}}))
        return list
    }
    static VANLineItems(VAN,line){
        const list = [];
        const VANData = BankAccount.getVANData(VAN);
        list.push({'Account':VANData['Bank Account'],"Amount":line['Amount'],"Debit/ Credit":"Debit","Text":line["Text"],"Profit Center":new BankAccount(VANData['Bank Account']).data['Profit Center']})
        list.push({'Account':VANData['Ledger'],"Amount":line['Amount'],"Debit/ Credit":"Credit","Text":line["Text"],"Profit Center":VANData['Profit Center']})
        return list
    }
    static VANPosting(VAN,data){
        const result = this.VANSimulate(VAN,data);
        result.map(item=>this.post(item));
        return('Success')
    }
    static post(data){
        const updateddatabase = [...this.database,{...data,['Document No']:this.newDocNo()}]
        this.savedatabase(updateddatabase);
        return 'Success'
    }
    static newDocNo(){
        let start = 100000;
        do {
            start++;
        } while (this.isDocExists(start));
        return start
    }
    static isDocExists(docNo){
        return (this.database.filter(item=>item['Document No']==docNo).length>0)
    }
    static savedatabase(database){
        localStorage.setItem('transactions',JSON.stringify(database));
    }
    static docs = ListItems(this.database,"Document No")
}

function TransactionUI(){
    const {trans} = useParams();
    const URLcheck = ["Sale","General","Purchase", "Payment","Receipt", "Manual Depreciation", "Asset Disposal", "Asset Acquisition", "Asset Revaluation"].includes(trans);
    const navigate = useNavigate();
    const transaction = new Transaction(trans);
    
    const lineItems = transaction.lineItemHeads();
    const {headerFields} = Transaction;
    const [restOfAccount,...restOfFields] = lineItems;
    const [input,setinput] = useState(Transaction.defaults)
    const output = transaction.process(input);
    const [firstLine,...restOfLines] = output['Line Items'].filter(item=>!item['calculated']);
    const firstLineItem = transaction.firstLineItem(firstLine);
    const [Account,...restOfField] = firstLineItem;
    const calculatedLines = output['Line Items'].filter(item=>item['calculated']);
    const errors = transaction.validate(output);
    
    const headerChange = (field,e) =>{
        const {value} = e.target;
        setinput(prevdata=>({
            ...prevdata,[field]:value
        }))
    }

    const lineItemChange = (index,field,e)=>{
        const {value} = e.target;
        setinput(prevdata=>({
            ...prevdata,['Line Items']:prevdata['Line Items'].map((item,i)=>(i==index)?{...item,[field]:value}:item)
        }))
    }

    const addLine = ()=>{
        setinput(prevdata=>({
            ...prevdata,['Line Items']:[...prevdata['Line Items'],Transaction.defaults['Line Items'][0]]
        }))
    }

    const removeLine = (index)=>{
        setinput(prevdata=>({
            ...prevdata,['Line Items']:prevdata['Line Items'].filter((item,i)=>i!==index)
        }))
    }

    const save = ()=>{
        if (errors.length==0){
            Transaction.post(output);
            alert(`Saved!`)
            window.location.reload();

        } else {
            alert("There are still errors unresolved")
        }
    }
    
    return(
        <>
        {URLcheck && 
        <div className="transaction">
            
            <h2 className='transactionTitle'>{trans}</h2>
            <div className="header">
                {headerFields.map((item,index)=>
                    <div className='headerField' key={index}><label>{item['name']}</label><input onChange={(e)=>headerChange(item['name'],e)} type={item['type']} value={output[item['name']]}/></div>
                )}
                {firstLineItem.map((item,index)=>
                    <>{item['input']!='calculated' && <div className='headerField' key={index}><label>{item['name']}</label>
                        {item['input']=='input' && <input onChange={(e)=>lineItemChange(0,item['name'],e)} type={item['type']} value={firstLine[item['name']]}/>}
                        {item['input']=='option' && <select onChange={(e)=>lineItemChange(0,item['name'],e)} value={firstLine[item['name']]}>{item['options'].map(option=><option value={option}>{option}</option>)}</select>}
                    </div>}</>
                )}
                <div className='headerField'><label>Balance</label><label>{output['Balance']}</label></div>
            </div>
            <div className='lineItems'>
                <table>
                    <thead>
                        <tr><th className='lineItemCell'></th>{lineItems.map(item=><th className='lineItemCell'>{item['name']}</th>)}</tr>  
                    </thead>
                    <tbody>
                        {restOfLines.map((item,i)=>
                            <tr><td className='lineItemCell'><button onClick={()=>removeLine(i+1)}>-</button></td>
                           
                            
                            {transaction.lineItemByContent(item).map(field=>
                                <td className='lineItemCell'>
                                    {field['input']=="input" && <input onChange={(e)=>lineItemChange(i+1,field['name'],e)} type={field['type']} value={item[field['name']]}/>}
                                    {field['input']=="option" && <select onChange={(e)=>lineItemChange(i+1,field['name'],e)} value={item[field['name']]}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}
                                    {field['input']=="calculated" && <label>{item[field['name']]}</label>}
                                </td>
                            )}</tr>
                        )}
                        {calculatedLines.map(item=>
                            <tr>
                                <td className='lineItemCell'></td>
                                {lineItems.map(field=>
                                <td className='lineItemCell'>{item[field['name']]}</td>
                                )}
                            
                            </tr>
                        )}
                    </tbody>
                </table>
            <div className='lineItemsButtons'><button className='blue' onClick={()=>addLine()}>+</button></div>
            </div>
            <div className='errors'>
                <h4>Please consider:</h4>
                <ul>
                    {errors.map((item,i)=><li key={i}>{item}</li>)}
                </ul>
            </div>
            <div className="transactionButtons">
                <button onClick={()=>save()} className='green'>Save</button>
                </div>
        </div>}
        {!URLcheck && 
        <div className='transaction'>
            <p>Uh-oh! We couldn't get you what you were searching for!</p>
            <Record/>
        </div>
        }
        </>
    )
}

class MaterialIssue{
    constructor(material,location,valuedate,postingdate,data){
        this.material = material;
        this.location = location;
        this.valuedate = valuedate;
        this.postingdate = postingdate;
        this.data = data;
        this.schema = this.data.map(item=>this.modifySchema(item['Transaction']))
    }
    modifySchema(transaction){
        const schema = MaterialIssue.schema;
        const calc = {
            "":["Cost Center","Profit Center"],
            "Transfer":["General Ledger","Cost Center","Cost Object","Product","Profit Center","Consumption Time From","Consumption Time To"],
            "Consumption - Product":["General Ledger","Cost Center","Cost Object","Profit Center","Consumption Time From","Consumption Time To"],
            "Consumption - Cost":["Location","Profit Center","Product"],
            "Consumption - General":["Location","Cost Center","Cost Object","Product","Consumption Time From","Consumption Time To"]
        }
        const modifiedSchema = schema.map(item=>(calc[transaction].includes(item['name']))?{...item,['input']:'calculated'}:item);
        return modifiedSchema;
    }
    debitLines(line){
        let lineItem = {};
        const transaction = line['Transaction'];
        if (transaction=="Transfer"){
            lineItem={
                'Account':this.material,
                'Location':line['Location'],
                'Debit/ Credit':'Debit',
                'Quantity':line['Quantity'],
                'Transaction':'Receipt',
                'Profit Center': new Location(line['Location']).profitcenter.name,
                'Amount':0,
                'General Ledger':new Material(this.material).data['General Ledger'],
                'Value Date':this.valuedate,
                'Text':`${this.material} Transfer from ${this.location} to ${line['Location']}`
            }
        } else if (transaction=="Consumption - Product"){
            lineItem={
                'Account':line['Product'],
                'Location':line['Location'],
                'Debit/ Credit':'Debit',
                'Quantity':"",
                'Transaction':"Cost",
                'Profit Center': new Location(line['Location']).profitcenter.name,
                'Amount':0,
                'General Ledger':new Material(line['Product']).data['General Ledger'],
                'Value Date':this.valuedate,
                'Text':`${this.material} from ${this.location} consumed by ${line['Product']} at ${line['Location']}`
            }
        } else if (transaction=="Consumption - Cost"){
            lineItem={
                'Account':line['General Ledger'],
                'Debit/ Credit':'Debit',
                'Cost Center':line['Cost Center'],
                'Cost Object':line['Cost Object'],
                'Profit Center': line['Profit Center'],
                'Amount':0,
                'General Ledger':line['General Ledger'],
                'Consumption Time From':line['Consumption Time From'],
                'Consumption Time To':line['Consumption Time To'],
                'Text':`${this.material} from ${this.location} consumed as ${line['General Ledger']}`
            }
        } else if (transaction=="Consumption - General"){
            lineItem={
                'Account':line['General Ledger'],
                'Debit/ Credit':'Debit',
                'Profit Center': line['Profit Center'],
                'Amount':0,
                'General Ledger':line['General Ledger'],
                'Text':`${this.material} from ${this.location} consumed as ${line['General Ledger']}`
            }
        }

        return lineItem
    }
    creditLine(){
        const lineItem={
            'Account':this.material,
            'Amount':0,
            'Debit/ Credit':"Debit",
            'Location':this.location,
            'Quantity':SumField(this.data,"Quantity"),
            'Value Date':this.valuedate,
            'Profit Center':new Location(this.location).profitcenter.name,
            'General Ledger':new Material(this.material).data['General Ledger'],
            'Text':`Issue of ${this.material} from ${this.location} on ${this.valuedate}`,
            'Transaction':'Issue'
        }
        return lineItem
    }
    createEntry(){
        const entry = {};
        const errors = this.validate();
        if (errors.length == 0){
            entry['Posting Date']=this.postingdate;
            entry['Document Date'] =this.valuedate;
            entry['Line Items'] = [this.creditLine(),...this.data.map(item=>this.debitLines(item))];
            return entry;
        } else {
            return 'Error';
        }
    }
    validate(){
        const errors = [];
        (!Company.isPostingDateOpen(this.postingdate))?errors.push('Posting date not in open period'):()=>{};
        const mand = {
            "":["Location"],
            "Transfer":["Location","Quantity"],
            "Consumption - Product":["Location","Quantity","Product"],
            "Consumption - Cost":["Quantity","General Ledger","Cost Center","Cost Object","Profit Center","Consumption Time From","Consumption Time To"],
            "Consumption - General":["Quantity","General Ledger","Profit Center"]
        }
        this.data.map((item,i)=>mand[item['Transaction']].map(field=>(item[field]=="")?errors.push(`At ${i}, ${field} is required`):()=>{}))
        return errors
    }
    post(){
        const entry = this.createEntry();
        if (entry!="Error"){
            Transaction.post(entry);
            return 'Success';
        } else {
            return this.validate();
        }
    }
    static schema = [
        {"name":"Transaction","input":"option","options":["","Transfer","Consumption - Product","Consumption - Cost","Consumption - General"]},
        {"name":"Location","input":"option","options":["",...Location.list()]},
        {"name":"Quantity","input":"input","type":"number"},
        {"name":"Product","input":"option","options":["",...Material.list()]},
        {"name":"General Ledger","input":"option","options":["",...GeneralLedger.listtype('General'),...GeneralLedger.listtype('Cost Element')]},
        {"name":"Cost Center","input":"option","options":["",...CostCenter.list()]},
        {"name":"Cost Object","input":"option","options":["",...CostObject.list()]},
        {"name":"Consumption Time From","input":"input","type":"date"},
        {"name":"Consumption Time To","input":"input","type":"date"},
        {"name":"Profit Center","input":"option","options":["",...ProfitCenter.list()]},
    ]
}

class Ledger{
    constructor(name){
        this.name = name;
    }
    transactions(period){
        const [from,to] = period;
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>(new Date(item['Posting Date'])>= new Date(from) && new Date(item['Posting Date'])<= new Date(to) && item['Account']==this.name ))
        return filtered
    }
    transactionsBefore(date){
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>(new Date(item['Posting Date'])< new Date(date) && item['Account']==this.name ))
        return filtered
    }
    transactionsTill(date){
        const data = new Intelligence().transactionstable();
        const filtered = data.filter(item=>(new Date(item['Posting Date'])<= new Date(date) && item['Account']==this.name ))
        return filtered
    }
    opening(date){
        return SumFieldIfs(this.transactionsBefore(date),'Amount',["Debit/ Credit"],["Debit"])-SumFieldIfs(this.transactionsBefore(date),'Amount',["Debit/ Credit"],["Credit"])
    }
    closing(date){
        return SumFieldIfs(this.transactionsTill(date),'Amount',["Debit/ Credit"],["Debit"])-SumFieldIfs(this.transactionsTill(date),'Amount',["Debit/ Credit"],["Credit"])
    }
    openItems(date){
        const data = this.transactionsTill(date);
        const filtered = data.filter(item=>((!item['Clearing Document']!="" || new Date(item['Clearing Date'])>new Date(date))))
        const result = filtered.map(item=>
            ({...item,
                ...{
                    "Age in Years":ageInYears(item['Posting Date'],date),
                    "Age in Days":ageInDays(item['Posting Date'],date),
                    "MSME Status":(item['Account Type']=="Vendor")?new Vendor('T K Salim').data['MSME Status']:"Not Applicable"
                }}))
        return result
    }
    ledger(period){
        const [from,to] = period;
        const list = [{"Date":from,"Description":"Opening", "Debit/ Credit":"", "Amount":this.opening(from)}];
        this.transactions(period).map(item=>list.push({"Date":item['Posting Date'],"Description":item['Text'],"Debit/ Credit":item['Debit/ Credit'], "Amount":item['Amount']}))
        list.push({"Date":to,"Description":"Closing","Debit/ Credit":"", "Amount":this.closing(to)})
        return list
    }
    GLOpening(presentation,date){
        const data = this.transactionsBefore(date);
        const opening = SumFieldIfs(data,'Amount',["General Ledger","Debit/ Credit"],[presentation,"Debit"]) - SumFieldIfs(data,'Amount',["General Ledger","Debit/ Credit"],[presentation,"Credit"])
        return opening
    }
    GLClosing(presentation,date){
        const data = this.transactionsTill(date);
        const opening = SumFieldIfs(data,'Amount',["General Ledger","Debit/ Credit"],[presentation,"Debit"]) - SumFieldIfs(data,'Amount',["General Ledger","Debit/ Credit"],[presentation,"Credit"])
        return opening
    }
    GLOpenItems(presentation,date){
        const data = this.openItems(date);
        const filtered = data.filter(item=>item['General Ledger']==presentation);
        return filtered
    }
    static accountBalances(date){
        const presentations = [...GeneralLedger.listtype('Vendor'),...GeneralLedger.listtype('Customer')];
        const accounts = [...Vendor.list(),...Customer.list()];
        const list = [];
        presentations.map(presentation=>
            accounts.map(account=>
                list.push({'Presentation':presentation,'Account':account,'Balance':new Ledger(account).GLClosing(presentation,date)})
            )
        )
        const result = list.filter(item=>item['Balance']!=0);
        return result;
    }
}

class Doc{
    constructor(docno){
        this.docno = docno;
        this.data = Doc.data.filter(item=>item['Document No']==this.docno)[0]
    }
    static data = Transaction.database
}

class IncomeTax{
    constructor(code){
        this.code = code;
        this.data = IncomeTax.data.filter(item=>item['Code']==this.code)[0];
    }
    taxOnSlab(slab,income){
        const {From,To,Rate} = slab;
        const applicableIncome = Math.max(0,income-From);
        const slabLimit = To - From;
        const tax = Math.min(slabLimit,applicableIncome)* Rate/100;
        return tax
    }
    taxation(year){
        const taxation = this.data['Taxation'];
        const taxationyear = taxation.filter(item=>(year>=item['From Year'] && year<=item['To Year']))[0];
        return taxationyear
    }
    tax(year,income){
        const taxation = this.taxation(year)
        const slabs = taxation['Slab'];
        const exemptionLimit = taxation['Exemption Limit'];
        let tax = 0;
        for (let i=0; i<slabs.length; i++){
            tax+=this.taxOnSlab(slabs[i],income);
        }
        const cesspercent = taxation['Cess'];
        const cess = tax * cesspercent/100;
        const taxWithCess = tax + cess
        const result = (income<=exemptionLimit)?0:taxWithCess;
        return result
    }
    marginalRelief(year,income){
        const taxation = this.taxation(year);
        const reliefApplicable = (taxation['Marginal Relief'] =="Yes");
        const exemptionLimit = taxation['Exemption Limit'];
        
        const taxOnExemptionLimit = this.tax(year,exemptionLimit);
        const taxOnIncome = this.tax(year,income);
        
        const excessOfIncome = Math.max(income-exemptionLimit,0);
        const excessOfTax = Math.max(taxOnIncome-taxOnExemptionLimit,0);
        
        const relief = Math.max(excessOfTax - excessOfIncome,0);
        
        const result  = (reliefApplicable)?relief:0;
        return result
    }
    netTax(year,income){
        const tax = this.tax(year,income);
        const marginalRelief = this.marginalRelief(year,income);
        const netTax = tax-marginalRelief;
        return netTax;
    }
    
    static data = Database.load('Income Tax Code');
    static codes = ListItems(this.data,'Code');
}
class FASettings{
    static data = ('fasettings' in localStorage)?JSON.parse(localStorage.getItem('fasettings')):this.defaults;
    static defaults = {
        "GL for Basic Salary":"",
        "GL for Discount":"",
        "GL for Emoluments and Deductions":[{"Item":"","Type":"","GL":""}],
        "GL for Salary TDS":"",
        "TDS Codes":[{"Code":"","Description":"","Rate":"","GL":""}],
        "GST Codes":[{"State":0,"Code":0,"Description":"","IGST Rate":0,"CGST Rate":0,"SGST Rate":0,"UTGST Rate":0,"Cess rate":0,"IGST GL":"","CGST GL":"","SGST GL":"","UTGST GL":"","Cess GL":""}]
    }
    static changeTo(data){
        saveData(data,'fasettings')
    }
}
function FinancialAccountSettings(){
    const settings = FASettings
    const [data,setdata] = useState(settings.data || settings.defaults);
    
    const handleChange1 = (e,field) =>{
        const {value} = e.target;
        setdata(prevdata=>({
            ...prevdata,[field]:value
        }))
    }

    const handleChange2 = (e,field,index,subfield) =>{
        const {value} = e.target;
        setdata(prevdata=>({
            ...prevdata,[field]:prevdata[field].map((item,i)=>
            (index==i)?{...item,[subfield]:value}:item)
        }))
    }

    const addItem = (field)=>{
        const defaultitem = settings.defaults[field][0];
        setdata(prevdata=>({
            ...prevdata,[field]:[...prevdata[field],defaultitem]
        }))
    }

    const removeItem = (field,index)=>{
        setdata(prevdata=>({
            ...prevdata,[field]:prevdata[field].filter((item,i)=>(i!==index))
        }))
    }

    const save = () =>{
        settings.changeTo(data);
        alert('Financial Account Settings Changed');
        window.location.reload()
    }

    return(
        <div className='reportDisplay'>
            <h2>Financial Account Settings</h2>
            <div>
                <label>General Ledger for Basic Salary</label>
                <select value={data['GL for Basic Salary']} onChange={(e)=>handleChange1(e,'GL for Basic Salary')}>
                    {GeneralLedger.list().map(option=>
                        <option value={option}>{option}</option>
                    )}
                </select>
            </div>
            <div>
                <label>General Ledger for Discount</label>
                <select value={data['GL for Discount']} onChange={(e)=>handleChange1(e,'GL for Discount')}>
                    {GeneralLedger.list().map(option=>
                        <option value={option}>{option}</option>
                    )}
                </select>
            </div>
            <div>
                <label>General Ledger for Salary TDS</label>
                <select value={data['GL for Salary TDS']} onChange={(e)=>handleChange1(e,'GL for Salary TDS')}>
                    {GeneralLedger.list().map(option=>
                        <option value={option}>{option}</option>
                    )}
                </select>
            </div>
            <div className='crudTable'>
                <label>Salary Emoluments and Deductions</label>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Item</th>
                            <th>Emolument/ Deduction</th>
                            <th>General Ledger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data['GL for Emoluments and Deductions'].map((item,i)=>
                            <tr>
                                <td><button onClick={()=>removeItem('GL for Emoluments and Deductions',i)}>-</button></td>
                                <td><input type={"text"} value={item['Item']} onChange={(e)=>handleChange2(e,'GL for Emoluments and Deductions',i,'Item')}/></td>
                                <td><select value={item['Type']} onChange={(e)=>handleChange2(e,'GL for Emoluments and Deductions',i,'Type')}><option value={"Deduction"}>Deduction</option><option value={"Emolument"}>Emolument</option></select></td>
                                <td><select value={item['GL']} onChange={(e)=>handleChange2(e,'GL for Emoluments and Deductions',i,'GL')}>{GeneralLedger.list().map(option=><option value={option}>{option}</option>)}</select></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button onClick={()=>addItem('GL for Emoluments and Deductions')}>+</button>
            </div>
            <div  className='crudTable'>
                <label>TDS and TCS Codes</label>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Code</th>
                            <th>Description</th>
                            <th>Rate</th>
                            <th>General Ledger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data['TDS Codes'].map((item,i)=>
                            <tr>
                                <td><button onClick={()=>removeItem('TDS Codes',i)}>-</button></td>
                                <td><input type={"text"} value={item['Code']} onChange={(e)=>handleChange2(e,'TDS Codes',i,'Code')}/></td>
                                <td><input type={"text"} value={item['Description']} onChange={(e)=>handleChange2(e,'TDS Codes',i,'Description')}/></td>
                                <td><input type={"number"} value={item['Rate']} onChange={(e)=>handleChange2(e,'TDS Codes',i,'Rate')}/></td>
                                <td><select value={item['GL']} onChange={(e)=>handleChange2(e,'TDS Codes',i,'GL')}>{GeneralLedger.list().map(option=><option value={option}>{option}</option>)}</select></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button onClick={()=>addItem('TDS Codes')}>+</button>
            </div>
            <div className='crudTable'>
                <label>GST Codes</label>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>State</th>
                            <th>Code</th>
                            <th>Description</th>
                            <th>IGST %</th>
                            <th>CGST %</th>
                            <th>SGST %</th>
                            <th>UTGST %</th>
                            <th>Cess %</th>
                            <th>IGST General Ledger</th>
                            <th>CGST General Ledger</th>
                            <th>SGST General Ledger</th>
                            <th>UTGST General Ledger</th>
                            <th>Cess General Ledger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data['GST Codes'].map((item,i)=>
                            <tr>
                                <td><button onClick={()=>removeItem('GST Codes',i)}>-</button></td>
                                <td><select value={item['State']} onChange={(e)=>handleChange2(e,'GST Codes',i,'State')}>{Intelligence.States.map(option=><option value={option}>{option}</option>)}{Intelligence.UTs.map(option=><option value={option}>{option}</option>)}</select></td>
                                <td><input type={"text"} value={item['Code']} onChange={(e)=>handleChange2(e,'GST Codes',i,'Code')}/></td>
                                <td><input type={"text"} value={item['Description']} onChange={(e)=>handleChange2(e,'GST Codes',i,'Description')}/></td>
                                <td><input type={"number"} value={item['IGST Rate']} onChange={(e)=>handleChange2(e,'GST Codes',i,'IGST Rate')}/></td>
                                <td><input type={"number"} value={item['CGST Rate']} onChange={(e)=>handleChange2(e,'GST Codes',i,'CGST Rate')}/></td>
                                <td><input type={"number"} value={item['SGST Rate']} onChange={(e)=>handleChange2(e,'GST Codes',i,'SGST Rate')}/></td>
                                <td><input type={"number"} value={item['UTGST Rate']} onChange={(e)=>handleChange2(e,'GST Codes',i,'UTGST Rate')}/></td>
                                <td><input type={"number"} value={item['Cess Rate']} onChange={(e)=>handleChange2(e,'GST Codes',i,'Cess Rate')}/></td>
                                <td><select value={item['IGST GL']} onChange={(e)=>handleChange2(e,'GST Codes',i,'IGST GL')}>{GeneralLedger.list().map(option=><option value={option}>{option}</option>)}</select></td>
                                <td><select value={item['CGST GL']} onChange={(e)=>handleChange2(e,'GST Codes',i,'CGST GL')}>{GeneralLedger.list().map(option=><option value={option}>{option}</option>)}</select></td>
                                <td><select value={item['SGST GL']} onChange={(e)=>handleChange2(e,'GST Codes',i,'SGST GL')}>{GeneralLedger.list().map(option=><option value={option}>{option}</option>)}</select></td>
                                <td><select value={item['UTGST GL']} onChange={(e)=>handleChange2(e,'GST Codes',i,'UTGST GL')}>{GeneralLedger.list().map(option=><option value={option}>{option}</option>)}</select></td>
                                <td><select value={item['Cess GL']} onChange={(e)=>handleChange2(e,'GST Codes',i,'Cess GL')}>{GeneralLedger.list().map(option=><option value={option}>{option}</option>)}</select></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button onClick={()=>addItem('GST Codes')}>+</button>
            </div>
            <button onClick={()=>save()}>Save</button>
        </div>
    )
}

class Attendance{
    constructor(employee,year,month){
        this.year = year;
        this.month = month;
        this.employee = employee;
        this.data = Attendance.data.filter(item=>item['Year']==this.year && item['Month']==this.month)[0];
    }
    changeData(data){
        const oldData = Attendance.data;
        const newData = oldData.map(item=>(item['Year']==this.year && item['Month']==this.month && item['Employee'] == this.employee)?{...item,['Attendance']:data}:item) 
        saveData(newData,'attendance');
    }
    createData(data){
        const oldData = Attendance.data;
        const newData = [...oldData,{"Year":this.year,"Month":this.month,"Employee":this.employee,"Attendance":data}];
        saveData(newData,'attendance');
    }
    static isPresent(employee,date){
        const year= new Date(Intelligence.yearStart(date)).getFullYear();
        const month = new Date(date).getMonth();
        const data = new Attendance(employee,year,month).data;
        const present = (data.length==0 && (data['Attendance']['Present'].includes(date) || data['Attendance']['Leave'].includes(date)))?true:false;
        return present
    }
    static defaults = {"Present":[],"Leave":[]}
    static data = Database.load('Attendance')
}

function AttendanceUI({query}){
    const {year,month,employee} = query;
    const dates = datesInMonth(year['value'],month['value']);
    const attendance = new Attendance(employee['value'],year['value'],month['value']);
    const [data,setdata] = useState(attendance.data['Attendance'] || Attendance.defaults);
    const changeTick=(e,field,i)=>{
        const value = e.target.checked;
        (value)?setdata(prevdata=>({
            ...prevdata,[field]:addItem(prevdata[field],dates[i])
        })):setdata(prevdata=>({
            ...prevdata,[field]:removeItem(prevdata[field],dates[i])
        }))
    }

    const removeItem = (array,i)=>{
        return array.filter(item=>item!=i);
    }

    const addItem = (array,i)=>{
        const newArray = [...array,i];
        return newArray;
    }

    const selectAll = () =>{
        const length = dates.length;
        for (let i=0;i<length;i++){
            setdata(prevdata=>({
                ...prevdata,['Present']:addItem(prevdata['Present'],dates[i])
            }))
        }
    }

    const save = () =>{
        attendance.createData(data);
        alert('Saved');
        window.location.reload();
    }

    return (
        <div>
            <div>
                <h2>Attendance</h2>
                <h4>Employee: {employee['value']}</h4>
                <h4>Year: {year['value']}</h4>
                <h4>Month: {month['value']}</h4>
            </div>
            <div className='crudTable'>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Present</th>
                            <th>Agreed Leave</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dates.map((date,i)=>
                            <tr>
                                <td>{date}</td>
                                <td><input onChange={(e)=>changeTick(e,'Present',i)} checked={data['Present'].includes(date)} type="checkbox"/></td>
                                <td><input onChange={(e)=>changeTick(e,'Leave',i)} checked={data['Leave'].includes(date)} type="checkbox"/></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button onClick={()=>selectAll()}>Select All</button>
            </div>
            <button className='blue' onClick={()=>save()}>Save</button>
            {JSON.stringify(attendance.data)}
        </div>
    )
}

function Scratch(){
    const income = 700010;
    return(
        <div>
        {JSON.stringify(Attendance.isPresent("12","2025-01-01"))}
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
            <Route path="/transaction/:trans" element={<TransactionUI/>}/>
            <Route path="/holidays" element={<Holidays/>}/>
            <Route path="/fasettings" element={<FinancialAccountSettings/>}/>
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