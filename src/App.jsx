import './App.css'
import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaHome, FaArrowRight, FaArrowLeft, FaCopy } from 'react-icons/fa';
import exportFromJSON from 'export-from-json';
import { PiTreeView } from 'react-icons/pi';

function loadData(collection){
    const data = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];
    return data;
}

function saveData(data,collection){
  localStorage.setItem(collection,JSON.stringify(data));
}

const ListItems = (collection,key)=>{
    const list = [];
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

function Count(value,Array){
    let subtotal = 0;
    for (let i = 0; i <Array.length; i++){
        if (Array[i]==value){
            subtotal ++;
        }
    }
    return subtotal;
}

function CountFieldIfs(collection,ranges,criteria){
    let subtotal = 0;
    for (let i = 0;i<collection.length;i++){
    let logic = true;
       for (let j = 0; j< ranges.length;j++){
        if (collection[i][ranges[j]] != criteria[j]){
            logic = false
        }
       } 
       if (logic){subtotal++}
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

class Asset{
    constructor(code,company){
        this.company = company;
        this.code = code;
        this.data = new Collection('Asset').getData({'Company Code':this.company, 'Code':this.code});
        this.capdate = this.data['Date of Capitalisation'];
        this.retdata = this.data['Date of Retirement'];
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
    static data(company){
        const data = new Collection('Asset').load();
        const filtered = data.filter(item=>(item['Company Code']==company));
        return filtered;
    }
    static listAll(Company){
        const data = this.data(Company);
        const list = ListItems(data,"Code");
        return list
    }
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
    static activeList(){
        return ListItems(this.activedata,"Name")
    }
    static depreciationData(date){
        return Asset.register(date)
    }
}

class AssetClass{
   constructor(code,company){
        this.code = code;
        this.company = company;
        this.data = new Collection('AssetClass').getData({'Company Code':this.company,'Code':this.code})
   }
    static data(company){
        const data = new Collection('AssetClass').load();
        const filtered = data.filter(item=>item['Company Code']==company);
        return filtered;
    };
    static listAll(company){
        const data = this.data(company);
        const list = ListItems(data,'Code');
        return list;
    };
    static list(){
        const list = ListItems(this.active,"Name")
        return list
    }
}

class AssetDevelopment{
    constructor(company,code){
        this.code = code;
        this.company = company;
    }
    static data(company){
        const data = new Collection('AssetDevelopment').load();
        const filtered = data.filter(item=>item['Company Code']==company);
        return filtered;
    }
    static listAll(company){
        const data = this.data(company);
        const list = ListItems(data,'Code');
        return list;
    }
}

class BankAccount{
    constructor(company,code){
        this.code = code;
        this.company = company;
    }
    static data(company){
        const data = new Collection('BankAccount').load();
        const filtered = data.filter(item=>item['Company Code']==company);
        return filtered;
    }
    static listAll(company){
        const data = this.data(company);
        const list = ListItems(data,'Code');
        return list;
    }
}

class GeneralLedger{
    constructor(name){
        this.name = name;
        this.data = GeneralLedger.data.filter(item=>item["Name"]==this.name)[0];
        this.type = this.data['Ledger Type'];
        this.presentation = this.data['Presentation']
    }
    static data(company){
        const data = new Collection('GeneralLedger').load();
        const filtered = data.filter(item=>item['Company Code']==company);
        return filtered;
    }
    static listAll(company){
        const list = ListItems(this.data(company),"Code")
        return list
    }
    static listBytype(company,type){
        const data = this.data(company);
        const filtered = data.filter(item=>item['Ledger Type']==type);
        const list = ListItems(filtered,"Code")
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
    constructor(company,code){
        this.code = code;
        this.company = company;
    }
    static data(company){
        const data = new Collection('Customer').load();
        const filtered = data.filter(item=>item['Company Code']==company);
        return filtered;
    }
    static listAll(company){
        const data = this.data(company);
        const list = ListItems(data,'Code');
        return list;
    }
}

class CostCenter{
    constructor(Company, Code){
        this.code = Code;
        this.company = Company;
        this.data = new Collection('CostCenter').getData({'Company Code':this.company,'Code':this.code})
    }
    static data(Company){
        const alldata = new Collection('CostCenter').load();
        const filtered = alldata.filter(item=>item['Company Code']==Company);
        return filtered;
    }
    static listAll(Company){
        const data = this.data(Company);
        const list = ListItems(data,'Code');
        return list;
    }
}

class OrganisationalUnit{
    constructor(company,code){
        this.code = code;
        this.company = company;
        this.data = new Collection('OrganisationalUnit').getData({"Company Code":this.company,"Code":this.code})
    }
    static data(company){
        const data = new Collection('OrganisationalUnit').load();
        const filtered = data.filter(item=>item['Company Code']==company)
        return filtered;
    }
    static listAll(company){
        const data = this.data(company);
        const list = ListItems(data,"Code");
        return list;
    }
}

class Employee{
    constructor(code,company){
        this.code = code;
        this.company = company;
        this.data = new Collection("Employee","Display").getData({"Code":this.code,"Company Code":this.company});
    }
    variableWage(wageType,date){
        const data = this.data['Variable Wages'];
        const filtered = data.filter(item=>(new Date(item['From']) <= new Date(date) && new Date(item['To']) >= new Date(date) && item['Wage Type']==wageType));
        return filtered;
    }
    salary(year,month){
        const dates = datesInMonth(year,month);
        const list = [];
        dates.map(date=>list.push({"Date":date,"Salary":(this.daysalary(date)/daysInMonth(year,month)).toFixed(3)}))
        return list
    }
}

class Material{
    constructor(company,code){
        this.code = code;
        this.company = company;
        this.data = new Collection('Material').getData({'Company Code':this.company,'Code':this.code});
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
    static data(Company){
        const data = new Collection('Material').load();
        const filtered = data.filter(material=>material['Company Code']==Company);
        return filtered;
    }
    static listAll(Company){
        const data = this.data(Company);
        const list = ListItems(data,'Code');
        return list;
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



class Segment{
    constructor(code){
        this.code = code;
        this.data = new Collection('Segment').getData({"Code":this.code});
    }
    static listAll(){
        const list = ListItems(new Collection('Segment').load(),'Code');
        return list;
    }
}

class Service{
    constructor(company,code){
        this.code = code;
        this.company = company;
    }
    static data(company){
        const data = new Collection('Service').load();
        const filtered = data.filter(item=>item['Company Code']==company);
        return filtered;
    }
    static listAll(company){
        const data = this.data(company);
        const list = ListItems(data,'Code');
        return list;
    }
}

class Vendor{
    constructor(company,code){
        this.code = code;
        this.company = company;
    }
    static data(company){
        const data = new Collection('Vendor').load();
        const filtered = data.filter(item=>item['Company Code']==company);
        return filtered;
    }
    static listAll(company){
        const data = this.data(company);
        const list = ListItems(data,'Code');
        return list;
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

function SearchBar(){
    const navigate = useNavigate();
    const location = useLocation()
    const [url,seturl] = useState()
    function search(){
        navigate(url)
        seturl('');
        window.location.reload();
    }

    const inputRef = useRef();

    const keyDownHandler = e =>{
        if (e.altKey && e.key==="g"){
            e.preventDefault();
            inputRef.current.focus();
        } else if (e.altKey && e.key==="h"){
            e.preventDefault();
            navigate('/');
            window.location.reload();
        } else if (e.altKey && e.key==="+"){
            e.preventDefault();
            window.open(window.location.href,'_blank');
        } else if (e.altKey && e.key==="Backspace"){
            e.preventDefault();
            navigate(-1);
        } else if (e.altKey && e.key==="r"){
            e.preventDefault();
            navigate('/record');
        } else if (e.altKey && e.key==="R"){
            e.preventDefault();
            navigate('/reports');
        } else if (e.altKey && e.key==="c"){
            e.preventDefault();
            navigate('/control');
        }
    }

    
    useEffect(()=>{
        const handle = document.addEventListener('keydown',keyDownHandler);
        return ()=>{
            document.removeEventListener('keydown',handle);
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
            <button className="searchBarButton" onClick={()=>window.open(window.location.href,'_blank')}><FaPlus/></button>
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
            <div className='actions'>
                <div className='menu red' onClick={()=>navigate(`/control`)}><h2>Control</h2></div>
                <div className='menu green' onClick={()=>navigate(`/record`)}><h2>Record</h2></div>
                <div className='menu blue'  onClick={()=>navigate(`/reports`)}><h2>Report</h2></div>
            </div>
        </div>
    </div>
  )
}

function Record(){

    const navigate = useNavigate();
    const transactions = [
        
        {"Group":"General","transactions":[
            {"Name":"General Posting","URL":'/interface',"state":{"type":"Transaction","transaction":"General"}},
        ]},
        {"Group":"Procurement","transactions":[
            {"Name":"Purchase","URL":'/t/Purchase'},
            {"Name":"Purchase Return","URL":'/t/Purchase Return'},
        ]},
        {"Group":"Sales & Services","transactions":[
            {"Name":"Sale","URL":'/t/Sale'},
            {"Name":"Sale Return","URL":'/t/Sale Return'},
        ]},
    ]
  
  return(
    <div className='menuContainer'>
            <h3 className='menuContainerTitle' onClick={()=>navigate('/control')}>Record</h3>
            {transactions.map(group=>
                <div className='menuList'>
                    <div className='menuTitle blue'><h4>{group["Group"]}</h4></div>
                    {group['transactions'].map(transaction=>
                        <div className='menuItem' onClick={()=>{navigate(transaction['URL'],{state:transaction['state']})}}><h4>{transaction['Name']}</h4></div>
                    )}
                    
                </div>
            )}
    </div>
  )
}

function Control(){

    const navigate = useNavigate();
    const controls = [
        {"Group":"Global", "Controls":[
            {"Name":"Chart of Accounts", "URL":"/interface", "state":{"type":"Collection","method":"Create","collection":"ChartOfAccounts"}},
            {"Name":"Company", "URL":"/interface", "state":{"type":"Collection","method":"Create","collection":"Company"}},
            {"Name":"Financial Statement Version", "URL":"/interface", "state":{"type":"Collection","method":"Create","collection":"FinancialStatementVersion"}},
            {"Name":"Group Chart of Accounts", "URL":"/interface", "state":{"type":"Collection","method":"Create","collection":"GroupChartOfAccounts"}},
            {"Name":"Income Tax Code", "URL":"/interface", "state":{"type":"Collection","method":"Create","collection":"IncomeTaxCode"}},
            {"Name":"Payment Terms", "URL":"/interface", "state":{"type":"Collection","method":"Create","collection":"PaymentTerms"}},
            {"Name":"Segment", "URL":"/interface", "state":{"type":"Collection","method":"Create","collection":"Segment"}},
        ]},
        {"Group":"Tables", "Controls":[
            {"Name":"Currencies", "URL":"/interface/","state":{'type':'Table','table':'Currencies','method':'Display'}},
            {"Name":"HSN", "URL":"/interface/","state":{'type':'Table','table':'HSN','method':'Display'}},
            {"Name":"Units", "URL":"/interface/","state":{'type':'Table','table':'Units','method':'Display'}},
        ]},
        {"Group":"Financial Accounting", "Controls":[
            {"Name":"Financial Accounts Settings", "URL":"/c/FinancialAccountsSettings"},
            {"Name":"Time Control", "URL":"/c/TimeControl"},
            {"Name":"General Ledger", "URL":"/c/GeneralLedger"},
        ]},
        {"Group":"Asset", "Controls":[
            {"Name":"Create Asset", "URL":"/interface","state":{'type':'CollectionQuery','collection':'Asset','method':"Create"}},
            {"Name":"Display Asset", "URL":"/interface","state":{'type':'CollectionQuery','collection':'Asset','method':"Display"}},
            {"Name":"Asset Class", "URL":"/c/AssetClass"},
            {"Name":"Asset Development", "URL":"/c/AssetDevelopment"},
        ]},
        {"Group":"Performance", "Controls":[
            {"Name":"Cost Center", "URL":"/c/CostCenter"},
            {"Name":"Cost Object", "URL":"/c/CostObject"},
            {"Name":"Profit Center", "URL":"/c/ProfitCenter"},
        ]},
        {"Group":"Payables & Receivables", "Controls":[
            {"Name":"Bank Account", "URL":"/c/BankAccount"},
            {"Name":"Customer", "URL":"/c/Customer"},
            {"Name":"Vendor", "URL":"/interface", "state":{"type":"CollectionQuery","collection":"Vendor","method":"Create"}},
            {"Name":"Purchase Order", "URL":"/c/PurchaseOrder"},
            {"Name":"Sale Order", "URL":"/c/SaleOrder"},
        ]},
        {"Group":"Payroll", "Controls":[
            {"Name":"Employee", "URL":"/c/Employee"},
            {"Name":"Organisational Unit", "URL":"/c/OrganisationalUnit"},
            {"Name":"Holidays", "URL":"/c/Holidays"},
            {"Name":"Attendance", "URL":"/c/Attendance"},
        ]},
        {"Group":"Material", "Controls":[
            {"Name":"Material", "URL":"/c/Material"},
            {"Name":"Location", "URL":"/c/Location"},
            {"Name":"Service", "URL":"/c/Service"},
        ]},
    ]
  
    return(
        <div className='menuContainer'>
            <h3 className='menuContainerTitle' onClick={()=>navigate('/reports')}>Control</h3>
            {controls.map(group=>
                <div className='menuList'>
                    <div className='menuTitle blue'><h4>{group["Group"]}</h4></div>
                    {group['Controls'].map(control=>
                        <div className='menuItem' onClick={()=>{navigate(control['URL'],{state:control['state']})}}><h4>{control['Name']}</h4></div>
                    )}
                    
                </div>
            )}
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
                <div className='menuItem' onClick={()=>{navigate(`/interface`,{state:{'type':'ReportQuery','report':'ViewDocument'}})}}><h4>View Document</h4></div>
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


class Report{
    constructor(report){
        this.report = report;
    }
    schema(data){
        const allSchema = {
            "ViewDocument":[
                {"name":"Posting Date","datatype":"single","noteditable":true},
                {"name":"Document Number","datatype":"single","noteditable":true},
                {"name":"Line Items","datatype":"table"}
            ]
        }
        return allSchema[this.report];
    }
    defaults(data){
        let defaults = {};
        switch (this.report){
            case 'ViewDocument':
                const documentData = Transaction.getDocument(data['Company Code'],data['Year'],data['Document Number']);
                defaults = documentData;
                break
        }
        return defaults;
    }
    errors(data){
        return [];
    }
    process(data){
        return data;
    }
    navigation(data){
        const navigation = [
            {"name":"Back","type":"navigate","url":"/interface","state":{"type":"ReportQuery","report":this.report}}
        ]
        return navigation;
    }
    title(){
        const titles = {
            "ViewDocument":"View Document"
        }
        return (titles[this.report]);
    }
}

class Transaction{
    constructor(type){
        this.type = type;
    }
    defaults(data){
        const defaults = {"Company Code":"","Posting Date":"","Document Date":"","Reference":"","Currency":""};
        switch (this.type){
            case 'Sale':
                defaults['Customer'] = {
                    "Customer":"",
                    "Presentation":"",
                    "Amount":0
                }
                break;
            case 'Sale Return':
                defaults['Customer'] = {
                    "Customer":"",
                    "Presentation":"",
                    "Amount":0
                }
                break;
            case 'Purchase':
                defaults['Vendor'] = {
                    "Vendor":"",
                    "Presentation":"",
                    "Amount":0
                }
                break;
            case 'Purchase Return':
                defaults['Vendor'] = {
                    "Vendor":"",
                    "Presentation":"",
                    "Amount":0
                }
                break;
        }
        defaults['Line Items'] = [{"Account Type":"",'Account':"",'Amount':0,'Debit/ Credit':"",'Presentation':"",'General Ledger':"",'Cost Center':"",'Cost Object':"",'Profit Center':"",'Location':"",'Quantity':0,'Material Valuation From':"",'Material Valuation To':"",'Cost Valuation From':"",'Cost Valuation To':""}];
        defaults['Balance'] = 0; 
        return defaults
    }
    schema(data){
        let schema = [
            {"name":"Company Code", "datatype":"single","input":"option","options":["",...Company.listAll], "noteditable":!(data['Company Code']=="")},
            {"name":"Posting Date", "datatype":"single","input":"input","type":"date", "noteditable":(data['Company Code']=="")},
            {"name":"Document Date", "datatype":"single","input":"input","type":"date","noteditable":(data['Company Code']=="")},
            {"name":"Reference", "datatype":"single","input":"input","type":"text","noteditable":(data['Company Code']=="")},
            {"name":"Balance", "datatype":"single","input":"input","type":"text","noteditable":true},
            {"name":"Currency", "datatype":"single","input":"option","options":["",...Currencies.listCurrencies], "noteditable":(data['Company Code']=="")},
            {"name":"Exchange Rate", "datatype":"single","input":"input","type":"number", "noteditable":(data['Company Code']=="")},
        ]
        switch (this.type){
            case 'Sale':
                schema.push({
                    "name":"Customer",
                    "datatype":"object",
                    "schema":[
                        {"name":"Customer","datatype":"single","input":"option","options":["",Customer.listAll(data['Company Code'])]},
                        {"name":"Presentation","datatype":"single","input":"option","options":[""]},
                        {"name":"Amount","datatype":"single","input":"input","type":"number"}
                    ],
                    "noteditable":(data['Company Code']=="")
                })
                break;
            case 'Sale Return':
                schema.push({
                    "name":"Customer",
                    "datatype":"object",
                    "schema":[
                        {"name":"Customer","datatype":"single","input":"option","options":["",Customer.listAll(data['Company Code'])]},
                        {"name":"Presentation","datatype":"single","input":"option","options":[""]},
                        {"name":"Amount","datatype":"single","input":"input","type":"number"}
                    ],
                    "noteditable":(data['Company Code']=="")
                })
                break;
            case 'Purchase':
                schema.push({
                    "name":"Vendor",
                    "datatype":"object",
                    "schema":[
                        {"name":"Vendor","datatype":"single","input":"option","options":["",Vendor.listAll(data['Company Code'])]},
                        {"name":"Presentation","datatype":"single","input":"option","options":[""]},
                        {"name":"Amount","datatype":"single","input":"input","type":"number"}
                    ],
                    "noteditable":(data['Company Code']=="")
                })
                break;
            case 'Purchase Return':
                schema.push({
                    "name":"Vendor",
                    "datatype":"object",
                    "schema":[
                        {"name":"Vendor","datatype":"single","input":"option","options":["",Vendor.listAll(data['Company Code'])]},
                        {"name":"Presentation","datatype":"single","input":"option","options":[""]},
                        {"name":"Amount","datatype":"single","input":"input","type":"number"}
                    ],
                    "noteditable":(data['Company Code']=="")
                })
                break;
        }
        schema.push({
            "name":"Line Items",
            "datatype":"collection",
            "noteditable":data['Company Code']=="",
            "schema":data['Line Items'].map(item=>this.lineItem(data,item))
        })
        return schema;
    }
    lineItem(data,item){
        let list = [
            {"name":"Account Type","datatype":"single","input":"option","options":["",...KB.PostingAccounts]},
            {"name":"Account","datatype":"single","input":"option","options":["",...this.accountsByType(data['Company Code'],item['Account Type'])],"noteditable":data['Company Code']==""},
            {"name":"Account Description","datatype":"single","input":"input","type":"text", "noteditable":"true"},
            {"name":"Transaction","datatype":"single","input":"input","type":"text"},
            {"name":"Amount","datatype":"single","input":"input","type":"number"},
            {"name":"Debit/ Credit","datatype":"single","input":"option","options":['','Debit','Credit']},
            {"name":"Presentation","datatype":"single","input":"option","options":[""]},
            {"name":"Text","datatype":"single","input":"input","type":"text"},
            {"name":"General Ledger","datatype":"single","input":"input","type":"text","noteditable":true},
            {"name":"Cost Center","datatype":"single","input":"option","options":["",CostCenter.listAll(data['Company Code'])]},
            {"name":"Cost Object","datatype":"single","input":"input","type":"text"},
            {"name":"Profit Center","datatype":"single","input":"option","options":["",...ProfitCenter.listAll(data['Company Code'])], "noteditable":(data['Company Code']=="")},
            {"name":"Location","datatype":"single","input":"option","options":[""], "noteditable":(data['Company Code']=="")},
            {"name":"Quantity","datatype":"single","input":"input","type":"number"},
            {"name":"Material Valuation From","datatype":"single","input":"input","type":"date"},
            {"name":"Material Valuation To","datatype":"single","input":"input","type":"date"},
            {"name":"Cost Valuation From","datatype":"single","input":"input","type":"date"},
            {"name":"Cost Valuation To","datatype":"single","input":"input","type":"date"},
        ]
        let noteditables = [];
        let notreq = [];
        switch (this.type){
            case 'Sale':
                notreq = ["Cost Center","Cost Object","Cost Valuation From","Cost Valuation To"];
                list = list.map(field=>(field['name']=="Account Type")?{...field,['options']:["","Asset","Material","Service"]}:field);
                break
            case 'Sale Return':
                notreq = ["Cost Center","Cost Object","Cost Valuation From","Cost Valuation To"];
                list = list.map(field=>(field['name']=="Account Type")?{...field,['options']:["","Asset","Material","Service"]}:field);
                break
            case 'Purchase':
                notreq = [];
                list = list.map(field=>(field['name']=="Account Type")?{...field,['options']:["","Asset","Material","Service","General Ledger"]}:field);
                break
        }
        switch (item['Account Type']){
            case 'Asset':
                noteditables = ["Presentation","Cost Center","Cost Object","Profit Center","Location","Quantity","Material Valuation From","Material Valuation To","Cost Valuation From", "Cost Valuation To"]
                break
            case 'Asset Development':
                noteditables = ["Presentation","Cost Center","Cost Object","Profit Center","Location","Quantity","Material Valuation From","Material Valuation To","Cost Valuation From", "Cost Valuation To"]
                break
            case 'Bank Account':
                noteditables = ["Presentation","Cost Center","Cost Object","Profit Center","Location","Quantity","Material Valuation From","Material Valuation To","Cost Valuation From", "Cost Valuation To"]
                break
            case 'Customer':
                noteditables = ["Cost Center","Cost Object","Location","Quantity","Material Valuation From","Material Valuation To","Cost Valuation From", "Cost Valuation To"]
                break
            case 'Material':
                noteditables = ["Presentation","Cost Center","Cost Object","Profit Center","Cost Valuation From", "Cost Valuation To"]
                break
            case 'Service':
                noteditables = ["Presentation","Profit Center","Location","Quantity","Material Valuation From","Material Valuation To"]
                break
            case 'Vendor':
                noteditables = ["Cost Center","Cost Object","Location","Quantity","Material Valuation From","Material Valuation To","Cost Valuation From", "Cost Valuation To"]
                break
        }
        list = list.filter(field=>!notreq.includes(field['name']));
        list = list.map(field=>(noteditables.includes(field['name']))?{...field,['noteditable']:true}:field)
        return list
    }
    errors(data){
        let errors = [];
        const mandatory = ["Posting Date","Document Date"];
        mandatory.map(field=>(data[field]=="")?errors.push(`${field} required.`):()=>{});
        (new Date(data['Posting Date']) > new Date())?errors.push(`Posting Date cannot be in future`):()=>{};
        (new Date(data['Document Date']) > new Date())?errors.push(`Document Date cannot be in future`):()=>{};
        (data['Company Code']!="" && data['Posting Date']!="" && !(new Company(data['Company Code']).IsPostingOpen(data['Posting Date'])))?errors.push(`Posting Date not Open`):()=>{};
        data['Line Items'].map((item,i)=>errors.push(...this.lineItemErrors(item,i)));
        data['Balance']!=0?errors.push(`Transaction not balanced`):()=>{};
        const uniquelist = [...new Set(errors)];
        return uniquelist; 
    }
    lineItemErrors(item,index){
        let list = [];
        let mandatory = ['Account Type','Debit/ Credit','Amount'];
        switch (item['Account Type']) {
            case 'Asset':
                break
            case 'Customer':
                mandatory.push(...['Profit Center'])
                break
            case 'Material':
                mandatory.push(...['Location','Quantity','Material Valuation From', 'Material Valuation To'])
                break
            case 'Vendor':
                mandatory.push(...['Profit Center'])
                break
        }
        mandatory.map(field=>(item[field]=="")?list.push(`Line Item ${index+1}: ${field} required.`):()=>{})
        return list;
    }
    process(data) {
        let result = {...data};
        let balance = 0;
        switch(this.type){
            case 'Sale':
                balance+=result['Customer']['Amount'];
                break;
            case 'Sale Return':
                balance-=result['Customer']['Amount'];
                break;
            case 'Purchase':
                balance-=Number(result['Vendor']['Amount']);
                break;
            case 'Purchase Return':
                balance+=Number(result['Vendor']['Amount']);
                break;
        }
        result['Line Items'] = result['Line Items'].map(item=>this.lineItemProcess(item));
        result['Line Items'].map(item=>
            (item['Debit/ Credit']=="Debit")? balance += Number(item['Amount']): balance -= Number(item['Amount'])
        )
        result['Balance'] = balance;
        return result;
    }
    lineItemProcess(item){
        let result = {...item};
        let notreq = [];
        switch (item['Account Type']){
            case 'Asset':
                notreq = ["Presentation","Cost Center","Cost Object","Profit Center","Location","Quantity","Material Valuation From","Material Valuation To","Cost Valuation From", "Cost Valuation To"]
                break
        }
        notreq.map(field=>result[field]="");
        return result;
    }
    entry(data){
        let result = {};

        return result;
    }
    completeTransaction(data){
        if (['Sale,Purchase','Sale Return','Purchase Return','General'].includes(this.type)){
            const result = Transaction.postDocument(data);
            return result;
        }
    }
    navigation(data){
        const navigation = [
            {"name":"Back", 'type':'navigate',"url":"/record","state":{}},
            {"name":"Post", 'type':'action',"onClick":()=>alert(this.completeTransaction(data))},
        ]
        return navigation;
    }
    accountsByType(Company,type){
        const accounts = {
            "":[],
            "Asset":Asset.listAll(Company),
            "Asset Development":AssetDevelopment.listAll(Company),
            "Bank Account":BankAccount.listAll(Company),
            "Customer":Customer.listAll(Company),
            "General Ledger":GeneralLedger.listAll(Company),
            "Material":Material.listAll(Company),
            "Service":Service.listAll(Company),
            "Vendor":Vendor.listAll(Company)
        }
        return accounts[type];
    }
    
    static database = ('transactions' in localStorage)?JSON.parse(localStorage.getItem('transactions')):[];
    static docExists(company,year,number){
        const data = this.database.filter(document=>document['Company Code']==company && document['Year']==year && document['Document Number']==number);
        const result = data.length>0;
        return result;
    }
    static newDocNo(company,year){
        let start = 1;
        do {
            start ++;
        } while (this.docExists(company,year,start));
        return start
    }
    static postableData(data){
        const result = {...data};
        const company = data['Company Code'];
        const year = new Company(company).PostingYear(result['Posting Date']);
        result['Year'] = year;
        result['Document Number'] = this.newDocNo(company,year);
        return result;
    }
    static postDocument(data){
        const postabledata = this.postableData(data);
        const updatedDatabase = [...this.database,postabledata];
        this.saveDatabase(updatedDatabase);
        return 'Success'
    }
    static saveDatabase(database){
        localStorage.setItem('transactions',JSON.stringify(database));
    }
    static getDocument(company,year,number){
        const data = this.database;
        const result = data.filter(document=>document['Company Code']==company && document['Year']==year && document['Document Number']==number)[0];
        return result;
    }
}

class IncomeTax{
    constructor(code){
        this.code = code;
        this.data = new Collection('IncomeTaxCode').getData({'Code':this.code});
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
}

function SingleInput({field,output,setdata}){

    const handleChange = (e) =>{
        const {value} = e.target;
        setdata(prevdata=>({
            ...prevdata,[field['name']]:value}))
    }

    return(
        <div className='displayField'>
            <div className='displayRow'>
                <label>{field['name']}</label>
                {field['noteditable'] && <p>{output[field['name']]}</p>}
                {(field['input'] == "input" && !field['noteditable'] )&& 
                    <input type={field['type']} maxLength={field['maxLength']} placeholder={field['placeholder']} onChange={(e)=>handleChange(e)} value={output[field['name']]}/>}
                {(field['input']=="option" && !field['noteditable']) && 
                    <select onChange={(e)=>handleChange(e)} value={output[field['name']]}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}
            </div>
        </div>
    )
}

function ObjectInput({field,setdata,output}){
    const handleChange=(field,e)=>{
        setdata(prevdata=>({
            ...prevdata,[field['name']]:{...prevdata[field['name']],[field]:value}
        }))
    }
    return(
        <div className='displayField'>
            <div className='displayObject'>
                <label>{field['name']}</label>
                {field['schema'].map(subfield=>
                    <>{subfield['datatype']=="single"&&
                        <div className='displayRow'><label>{subfield['name']}</label>
                            {(!field['noteditable'] && subfield['input']=="input" )&& 
                                <input type={subfield['type']} onChange={(e)=>handleChange(subfield['name'],e)} value={output[field['name']][subfield['name']]}/>}
                            {(!field['noteditable'] && subfield['input'] == "option") && 
                                <select  onChange={(e)=>handleChange(subfield['name'],e)} value={output[field['name']][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}
                            {field['noteditable'] && 
                                <p>{output[field['name']][subfield['name']]}</p>
                            }
                        </div>}
                    </>)}
            </div>
        </div>
    )
}

function ListInput({field,setdata,output}){

    const handleChange = (i,e)=>{
        const {value} = e.target; 
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:prevdata[field['name']].map((item,index)=>i==index?value:item)
        }))
    }

    function addItem(){
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:[...prevdata[field['name']],""]
        }))
    }

    function removeItem(i){
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:prevdata[field['name']].filter((item,index)=>i!==index)
        }))
    }

    return(
        <div className='displayField'>
            <div className='displayObject'>
                <div className='displayRow'><label>{field['name']}</label><button onClick={()=>addItem()}>+</button></div>
                <div className='displayList'>
                    {output[field['name']].map((item,i)=>
                        <div>
                            {field['noteditable'] && <p>{item}</p>}
                            {(field['input'] == "input" && !field['noteditable'] )&& 
                            <div><input type={field['type']} maxLength={field['maxLength']} placeholder={field['placeholder']} onChange={(e)=>handleChange(i,e)} value={item}/><button onClick={()=>removeItem(i)}>-</button></div>}
                            {(field['input']=="option" && !field['noteditable']) && 
                            <div><select onChange={(e)=>handleChange(i,e)} value={item}>{field['options'].map(option=><option value={option}>{option}</option>)}</select><button onClick={()=>removeItem(i)}>-</button></div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function CollectionInput({field,handleChange,output,addItem,removeItem}){
    return (
        <div className='displayField'>
            <div className='displayObject'>
                <div className='displayObjectHead'>
                    <label>{field['name']}</label>
                        <div className='displayObjectButtons'>
                            {!field['noteditable'] && <button className="blue" onClick={(e)=>addItem(field['name'],e)}>Add</button>}
                        </div>
                </div>
                
                <div className='displayTable'>
                    <table>
                        <thead>
                            <tr>
                                {!field['noteditable'] && <th className='displayTableCell'></th>}
                                {field['schema'][0].map(subfield=><th className='displayTableCell'>{subfield['name']}</th>)}</tr>
                        </thead>
                        {output[field['name']].map((item,index)=>
                            <tbody>
                                <tr>
                                    {!field['noteditable'] && <td className='displayTableCell'><button onClick={(e)=>removeItem(field['name'],index,e)}>-</button></td>}
                                    {field['schema'][index].map(subfield=>
                                        <>{subfield['datatype']=="single" && 
                                            <td className='displayTableCell'>
                                                {subfield['noteditable'] && <p>{output[field['name']][index][subfield['name']]}</p>}
                                                {(subfield['input']=="input" && !subfield['noteditable'])&& <input onChange={(e)=>handleChange(field['name'],subfield['name'],index,e)} type={subfield['type']} placeholder={subfield['placeholder']} value={output[field['name']][index][subfield['name']]}/>}
                                                {(subfield['input']=="option"&& !subfield['noteditable']) && <select onChange={(e)=>handleChange(field['name'],subfield['name'],index,e)} value={output[field['name']][index][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}
                                            </td>}
                                        </>)}
                                </tr>
                            </tbody>)}
                    </table>
                </div>
            </div>
        </div>
    )
}

function NestInput({field,output,setdata,defaults}){
    
    function collectionChange(subfield,index,e){
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:prevdata[field['name']].map((item,i)=>(i===index)?{...item,[subfield]:value}:item)
        }))
    }

    function nestChange(index,subfield,subindex,subsubfield,e){
        const {value} = e.target;
        setdata(prevdata=>({
            ...prevdata,[field['name']]:prevdata[field['name']].map((item,i)=>
            (i==index)?{...item,[subfield]:item[subfield].map((subitem,ii)=>
            (ii==subindex)?{...subitem,[subsubfield]:value}:subitem)}:item)
        }))
    }

    function addCollection(){
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:[...prevdata[field['name']],defaults[field['name']][0]]
        }))
    }

    function removeCollection(index){
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:prevdata[field['name']].filter((item,i)=>i!==index)
        }))
        
    }

    function addNest(index,subfield){
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:prevdata[field['name']].map((item,i)=>
            (i==index)?{...item,[subfield]:[...item[subfield],defaults[field['name']][0][subfield][0]]}:item
            )
        }))
    }

    function removeNest(index,subfield,subindex){
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:prevdata[field['name']].map((item,i)=>
            (i==index)?{...item,[subfield]:item[subfield].filter((subitem,ii)=>ii!=subindex)}:item)
        }))
    }
    
    return(
        <div className="displayField">
            <div className="displayObject">
                <label>{field['name']}</label>
                <button onClick={()=>addCollection()}>Add</button>
                <div className='displayGrid'>{output[field['name']].map((item,index)=>
                    <div className="displayFields">{field['schema'][index].map(subfield=>
                        <div className='displayField'>
                            {subfield['datatype']=="single" && <div className='displayRow'>
                                <label>{subfield['name']}</label>
                                {subfield['input']=="input" && <input onChange={(e)=>collectionChange(subfield['name'],index,e)} value={output[field['name']][index][subfield['name']]} type={subfield['type']}/>}
                                {subfield['input']=="option" && <select onChange={(e)=>collectionChange(subfield['name'],index,e)} value={output[field['name']][index][subfield['name']]}>
                                    {subfield['options'].map(option=><option value={option}>{option}</option>)}
                                    </select>}
                            </div>}
                            {subfield['datatype']=="collection" && <div className='displayObject'>
                                <label>{subfield['name']}</label>
                                <div className='displayTable'>
                                    <table>
                                        <thead>
                                            <tr><th className='displayTableCell'></th>{subfield['schema'][0].map(subsubfield=><th className='displayTableCell'>{subsubfield['name']}</th>)}</tr>
                                        </thead>
                                        <tbody>{output[field['name']][index][subfield['name']].map((subitem,subindex)=>
                                            <tr>
                                                <td><div className='displayTableCell'><button onClick={()=>removeNest(index,subfield['name'],subindex)}>-</button></div></td>
                                                {subfield['schema'][subindex].map(subsubfield=>
                                                <td>
                                                    <div className='displayTableCell'><input value={output[field['name']][index][subfield['name']][subindex][subsubfield['name']]} onChange={(e)=>nestChange(index,subfield['name'],subindex,subsubfield['name'],e)}/></div>
                                                </td>)}
                                            </tr>)}
                                        </tbody>
                                    </table>
                                    <button onClick={()=>addNest(index,subfield['name'])}>+</button>
                                </div>
                            </div> }
                        </div>)}
                        <button onClick={()=>removeCollection(index)}>-</button>
                    </div>)}
                </div>
            </div>
        </div>
    )
}

const MultipleInput = ({field,output,setdata})=>{
    
    const valueChange=(req,i,e)=>{
        const {value} = e.target;
        setdata(prevdata=>({
            ...prevdata,[field['name']]:{...prevdata[field['name']],[req]:prevdata[field['name']][req].map((item,index)=>(i==index)?value:item)}
        }))
    }

    const removeItem=(req,i)=>{
        setdata(prevdata=>({
            ...prevdata,[field['name']]:{...prevdata[field['name']],[req]:prevdata[field['name']][req].filter((item,index)=>i!=index)}
        }))
    }

    const addValue=(req)=>{
        setdata(prevdata=>({
            ...prevdata,[field['name']]:{...prevdata[field['name']],[req]:[...prevdata[field['name']][req],""]}
        }))
    }

    const addRange=(req)=>{
        setdata(prevdata=>({
            ...prevdata,[field['name']]:{...prevdata[field['name']],[req]:[...prevdata[field['name']][req],{"from":"","to":""}]}
        }))
    }

    const rangeChange =(req,i,subfield,e)=>{
        const {value} = e.target;
        setdata(prevdata=>({
            ...prevdata,[field['name']]:{...prevdata[field['name']],[req]:prevdata[field['name']][req].map((item,index)=>(i==index)?{...item,[subfield]:value}:item)}
        }))
    }
    
    return (
        <div className='displayField'>
            <label>{field['name']}</label>
            {field['req'].map(req=>
                <div className='displayObject'>
                    <div className='displayRow'><label>{req}</label></div>
                    {(req=="values" || req=="exclValues") && <div className='displayList'>
                        <button onClick={()=>addValue(req)}>+</button>
                        {output[field['name']][req].map((item,i)=>
                        <div>
                            {field['noteditable'] && <p>{item}</p>}
                            {(field['input'] == "input" && !field['noteditable'] )&& 
                            <div><input type={field['type']} maxLength={field['maxLength']} placeholder={field['placeholder']} onChange={(e)=>valueChange(req,i,e)} value={item}/><button onClick={()=>removeItem(req,i)}>-</button></div>}
                            {(field['input']=="option" && !field['noteditable']) && 
                            <div><select onChange={(e)=>valueChange(i,e)} value={item}>{field['options'].map(option=><option value={option}>{option}</option>)}</select><button onClick={()=>removeItem(req,i)}>-</button></div>}
                        </div>
                        )}
                    </div>}
                    {(req=="ranges" || req=="exclRanges") &&<div className='displayList'>
                        <button onClick={()=>addRange(req)}>+</button>
                        {output[field['name']][req].map((item,i)=>
                        <div>
                            {field['noteditable'] && <p>{item}</p>}
                            {(field['input'] == "input" && !field['noteditable'] )&& 
                            <div>
                                <input type={field['type']} maxLength={field['maxLength']} placeholder={field['placeholder']} onChange={(e)=>rangeChange(req,i,'from',e)} value={item['from']}/>
                                <input type={field['type']} maxLength={field['maxLength']} placeholder={field['placeholder']} onChange={(e)=>rangeChange(req,i,'to',e)} value={item['to']}/>
                                <button onClick={()=>removeItem(req,i)}>-</button>
                            </div>}
                            {(field['input']=="option" && !field['noteditable']) && 
                            <div>
                                <select onChange={(e)=>rangeChange(req,i,'from',e)} value={item['from']}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>
                                <select onChange={(e)=>rangeChange(req,i,'to',e)} value={item['to']}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>
                                <button onClick={()=>removeItem(req,i)}>-</button>
                            </div>}
                        </div>
                        )}
                    </div>}
                </div>
            )}
        </div>
    )

}

function TableInput({addTableRow,removeTableRow,tableChange,schema,data,editable}){
    return (
        <div className='displayTable'>
                    <table>
                        <thead>
                            <tr>
                                {editable && <th className='displayTableCell'></th>}
                                {schema.map(field=><th className='displayTableCell'>{field['name']}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item,i)=>
                                <tr>
                                    {editable && <td className='displayTableCell'><button onClick={()=>removeTableRow(i)}>-</button></td>}
                                    {schema.map(field=><td className='displayTableCell'>
                                        {editable && <>
                                        {field['input']=="input" && <input value={item[field['name']]} onChange={(e)=>tableChange(i,field['name'],e)}/>}
                                        {field['input']=='option' && <select value={item[field['name']]} onChange={(e)=>tableChange(i,field['name'],e)}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}
                                        </>}
                                        {!editable && <label>{item[field['name']]}</label>}
                                    </td>)}
                                </tr>
                            )}
                        </tbody>
                    </table>
            {editable && <div className='tableButtons'><button onClick={()=>addTableRow()}>+</button></div>}
        </div>
    )
}

const Collapsible = ({ children, title }) => {
      const [isOpen, setIsOpen] = useState(false);
      const contentRef = useRef(null);

      const toggleCollapse = () => {
        setIsOpen(!isOpen);
      };

      return (
        <div> 
            <div ref={contentRef} style={{maxHeight: isOpen ? `${contentRef.current.scrollHeight}px` : '0',overflow: 'hidden',transition: 'max-height 0.3s ease-in-out',}}>
            {children}
            </div>
            <div className="left">
                <button onClick={toggleCollapse} aria-expanded={isOpen}>{isOpen && `Hide`}{!isOpen && `${title}`}</button>
            </div> 
        </div>
      );
};

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

class KB{
    constructor(){
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
    static AccountTypes = ["Asset","Asset Class","Asset Development","Bank Account","Cost Center","Cost Object","Customer","Employee","Location","Material","Organisational Unit","Profit Center","Purchase Order","Sale Order","Service","Vendor",];
    static PostingAccounts = ["Asset","Asset Development","Bank Account","Customer","General Ledger","Material","Service","Vendor"];
    static GeneralLedgerGroups = ["Asset","Liability","Equity","Income","Expense"];
    static LedgerTypes = ["Asset","Bank Account","Cost Element","Customer","General","Depreciation","Material","Vendor"]
    static YearStart(year,firstMonth){
        const result = `${year}-${firstMonth}-01`;
        return result;
    }
    static YearEnd(year,firstMonth){
        const yearStart = new Date(this.YearStart(year,firstMonth));
        const yearEnd = new Date(yearStart.getFullYear()+1,yearStart.getMonth(),0);
        const result = `${yearEnd.getFullYear()}-${(yearEnd.getMonth()+1).toString().padStart(2,0)}-${yearEnd.getDate()}`;
        return result;
    }
}

class Operations{
    static downloadJSON(data,fileName){
        const exportType = exportFromJSON.types.json;
        exportFromJSON({data,fileName,exportType});
    }
    static downloadCSV(data,fileName){
        const exportType = exportFromJSON.types.csv;
        exportFromJSON({data,fileName,exportType});
    }
}

class CollectionQuery{
    constructor(collection,method){
        this.collection = collection;
        this.method = method;
        this.title = this.collection;
        this.mandatory = new Collection(this.collection).identifiers;
        this.createRequirements = CollectionQuery.createRequirements[this.collection];
        this.defaults = CollectionQuery.defaults[this.collection];
    }
    schema(data){
        return CollectionQuery.schema[this.collection];
    }
    errors(data){
        const missing = [];
        const errors = [];
        this.createRequirements.map(field=>(data[field]=="")?missing.push(field):()=>{});
        (this.createRequirements.includes("Company Code") && new Collection("Company").exists({"Code":data["Company Code"]})==false)?errors.push(`Company with Code ${data["Company Code"]} does not exist.`):()=>{};
        (this.createRequirements.includes("Employee") && new Collection("Employee").exists({"Company Code":data["Company Code"], "Code":data['Employee']})==false)?errors.push(`Employee with Code ${data["Employee"]} does not exist in Company ${data["Company Code"]}.`):()=>{};
        (this.createRequirements==ListItems(this.schema(data),"name") && this.checkAvailability(data))?(errors.push(`${this.collection} with same identifier(s) already exists.`)):()=>{};
        (missing.length>0)?errors.push(`${missing.join(", ")} required.`):()=>{};
        return errors;
    }
    process(data){
        return data;
    }
    navigation(data){
        return [
            {"name":"Back","type":"navigate","url":"/control","state":{}},
            {"name":this.method,"type":"navigate","url":"/interface","state":{'type':'Collection','collection':this.collection,'method':this.method,'data':data}}
        ]
    }
    checkAvailability(data){
        const availability = new Collection(this.collection).exists(data);
        return availability;
    }
    static createRequirements = {
        "Asset":["Company Code"],
        "AssetClass":["Company Code"],
        "AssetDevelopment":["Company Code"],
        "Attendance":["Company Code","Year","Month","Employee"],
        "BankAccount":["Company Code"],
        "ChartOfAccounts":[],
        "Company":[],
        "CostCenter":["Company Code"],
        "CostObject":["Company Code"],
        "Currency":[],
        "Customer":["Company Code"],
        "Employee":["Company Code"],
        "FinancialAccountsSettings":["Company Code"],
        "FinancialStatementVersion":[],
        "GeneralLedger":["Company Code"],
        "GroupChartOfAccounts":[],
        "Holidays":["Company Code","Year"],
        "IncomeTaxCode":[],
        "Location":["Company Code"],
        "Material":["Company Code"],
        "OrganisationalUnit":["Company Code"],
        "PaymentTerms":[],
        "ProfitCenter":["Company Code"],
        "PurchaseOrder":["Company Code"],
        "SaleOrder":["Company Code"],
        "Segment":[],
        "Service":["Company Code"],
        "TimeControl":["Company Code"],
        "UserSettings":["User"],
        "Vendor":["Company Code"],

    }
    static schema = {
        "Asset":[
            {"name":"Code","datatype":"single","input":"input","type":"number"},
            {"name":"Company Code","datatype":"single","input":"input","type":"text", "maxLength":4}
        ],
        "AssetClass":[
            {"name":"Code","input":"input","type":"number"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "AssetDevelopment":[
            {"name":"Code","input":"input","type":"number"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "Attendance":[
            {"name":"Company Code","input":"input","type":"text", "maxLength":4},
            {"name":"Year","input":"input","type":"number"},
            {"name":"Month","input":"input","type":"number"},
            {"name":"Employee","input":"input","type":"text"}
        ],
        "BankAccount":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "ChartOfAccounts":[
            {"name":"Code","input":"input","type":"text", "maxLength":4}
        ],
        "Company":[
            {"name":"Code","input":"input","type":"text", "maxLength":4}
        ],
        "CostCenter":[
            {"name":"Code","input":"input","type":"number"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "CostObject":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "Currency":[
            {"name":"Code","input":"input","type":"text"}
        ],
        "Customer":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "Employee":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "FinancialAccountsSettings":[
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "FinancialStatementVersion":[
           {"name":"Code","input":"input","type":"number"} 
        ],
        "GeneralLedger":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "GroupChartOfAccounts":[
            {"name":"Code","input":"input","type":"text", "maxLength":5}
        ],
        "Holidays":[
            {"name":"Company Code","input":"input","type":"text", "maxLength":4},
            {"name":"Year","input":"input","type":"number"},
        ],
        "IncomeTaxCode":[
            {"name":"Code","input":"input","type":"text"}
        ],
        "Location":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "Material":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "OrganisationalUnit":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "PaymentTerms":[
            {"name":"Code","input":"input","type":"text"}
        ],
        "ProfitCenter":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "PurchaseOrder":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "SaleOrder":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "Segment":[
            {"name":"Code","input":"input","type":"text" ,"maxLength":4,}
        ],
        "Service":[
            {"name":"Code","input":"input","type":"text"},
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "TimeControl":[
            {"name":"Company Code","input":"input","type":"text", "maxLength":4}
        ],
        "UserSettings":[
            {"name":"User","input":"input","type":"text"}
        ],
        "Vendor":[
            {"name":"Code","datatype":"single","input":"input","type":"text"},
            {"name":"Company Code","datatype":"single","input":"input","type":"text", "maxLength":4}
        ],
    }
    static defaults = {
        "Asset":{"Code":"","Company Code":'FACT'},
        "AssetClass":{"Code":"","Company Code":1000},
        "AssetDevelopment":{"Code":"","Company Code":1000},
        "Attendance":{"Company Code":1000,"Year":"","Month":"","Employee":""},
        "BankAccount":{"Code":"","Company Code":1000},
        "ChartOfAccounts":{"Code":""},
        "Company":{"Code":""},
        "CostCenter":{"Code":"","Company Code":1000},
        "CostObject":{"Code":"","Company Code":1000},
        "Currency":{"Code":""},
        "Customer":{"Code":"","Company Code":1000},
        "Employee":{"Code":"","Company Code":""},
        "FinancialAccountsSettings":{"Company Code":1000},
        "FinancialStatementVersion":{"Code":""},
        "GeneralLedger":{"Code":"","Company Code":1000},
        "GroupChartOfAccounts":{"Code":""},
        "Holidays":{"Company Code":1000,"Year":""},
        "IncomeTaxCode":{"Code":""},
        "Location":{"Code":"","Company Code":1000},
        "Material":{"Code":"","Company Code":""},
        "OrganisationalUnit":{"Code":"","Company Code":1000},
        "PaymentTerms":{"Code":""},
        "ProfitCenter":{"Code":"","Company Code":1000},
        "PurchaseOrder":{"Code":"","Company Code":1000},
        "SaleOrder":{"Code":"","Company Code":1000},
        "Segment":{"Code":""},
        "Service":{"Code":"","Company Code":1000},
        "TimeControl":{"Company Code":1000},
        "UserSettings":{"User":""},
        "Vendor":{"Code":"","Company Code":'FACT'},
    }
}

class Collection{
    constructor(name,method="Display"){
        this.name = name;
        this.collectionname = Collection.collectionname[this.name];
        this.method = method;
        this.editable = (method=="Create" || method=="Update")
        this.identifiers = Collection.identifiers[this.name];
        this.title = Collection.titles[this.name];
    }
    load(){
        const data = loadData(this.collectionname);
        return data;
    }
    exists(data){
        const collection = this.load();
        const identifiers = this.identifiers;
        const values = identifiers.map(item=>data[item])
        const filteredCount = CountFieldIfs(collection,identifiers,values)
        return (filteredCount>0)?true:false;
    }
    getData(data){
        const collection = this.load();
        const identifiers = this.identifiers;
        const values = identifiers.map(item=>data[item]);
        let result = {};
        if (this.exists(data)){
            let filtered = collection;
            for (let i = 0; i<identifiers.length;i++){
                filtered = filtered.filter(item=>item[identifiers[i]]==values[i]);
            }
            result = filtered[0];
        }
        return result;
    }
    defaults(data){
        let defaults = {};
        if (this.method=="Create"){
            switch (this.name){
                case 'Asset':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Name":"",
                        "Asset Class":"",
                        "Cost Center":"",
                        "Useful Life":0,
                        "Salvage Value":0,
                        "Date of Capitalisation":"",
                        "Date of Retirement":"",
                        "Depreciation Method":"",
                        "Depreciation Rate":"",
                    }
                    break
                case 'AssetClass':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Depreciable":"",
                        "General Ledger - Depreciation":"",
                        "General Ledger - Asset":""
                    }
                    break
                case 'AssetDevelopment':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Name":"",
                        "Genral Ledger":"",
                        "Profit Center":"",
                    }
                    break
                case 'Attendance':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Year":data['Year'],
                        "Month":data['Month'],
                        "Employee":data['Employee'],
                        "Attendance":datesInMonth(data['Year'],data['Month']).map(item=>({'Date':item,'Status':'','Remarks':''}))
                    }
                    break
                case 'BankAccount':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Bank Name":"",
                        "Account Number":"",
                        "IFSC Code":"",
                        "Profit Center":"",
                        "Virtual Accounts":[{"Virtual Account Number":"","Ledger":"","Profit Center":""}],
                    }
                    break
                case 'ChartOfAccounts':
                    defaults = {
                        "Code":"",
                        "General Ledger Range":KB.GeneralLedgerGroups.map(item=>({"Group":item,"From":"","To":""})),
                    }
                    break
                case 'Company':
                    defaults = {
                        "Code":"",
                        "Name":"",
                        "Address":"",
                        "PIN":"",
                        "PAN":"",
                        "Places of Business":[{"Place":"","State":""}],
                        "Functional Currency":"",
                        "Year Zero":"",
                        "Financial Year Beginning":"",
                        "Chart of Accounts":"",
                        "Group Chart of Accounts":"",                        
                    }
                    break
                case 'CostCenter':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Name":"",
                        "Profit Center":"",
                        "Apportionment Ratio":[
                            {"From":"","To":"","Ratio":[
                                {"Type":"","To":"","Percentage":0}
                            ]}
                        ]
                    }
                    break
                case 'CostObject':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Name":"",
                        "Profit Center":"",
                    }
                    break
                case 'Customer':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Name":"",
                        "Address":"",
                        "PIN":"",
                        "State":"",
                        "Phone":"",
                        "Email":"",
                        "GSTIN":"",
                        "PAN":"",
                        "Payment Terms":"",
                        "Bank Accounts":[
                            {"Account Number":"","Confirm Account Number":"","Bank Name":"","IFSC Code":""}
                        ],
                    }
                    break
                case 'Employee':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Name":"",
                        "Address":"",
                        "PIN":"",
                        "State":"",
                        "Phone":"",
                        "Email":"",
                        "Tax Identification Number":"",
                        "Date of Birth":"",
                        "Date of Joining":"",
                        "Date of Seperation":"",
                        "Bank Accounts":[
                            {"Account Number":"","Confirm Account Number":"","Bank Name":"","IFSC Code":""}
                        ],
                        "Employment Details":[
                            {"Organisational Unit":"","From":"","To":"","Position":""}
                        ],
                        "Variable Wages":[
                            {"Wage Type":"","Amount":"","From":"","To":""}
                        ],
                        "Fixed Wages":[
                            {"Wage Type":"","Amount":"","From Year":"","From Month":"","To Year":"","To Month":""}
                        ],
                        "One Time Wages":[
                            {"Wage Type":"","Amount":"","Date":""}
                        ],
                        "Income Tax Code":"",
                        "Additional Income and Deductions":[
                            {"Tax Year":"","Description":"","Type":"","Amount":""}
                        ]
                    }
                    break
                case 'FinancialAccountsSettings':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "General Ledger for Profit and Loss":"",
                        "General Ledger for Cash Discount":"",
                        "Wage Types":[
                            {"Type":"","Description":"","GL":""}
                        ],
                        "General Ledger for Salary TDS":"",
                        "Code Range":KB.AccountTypes.map(item=>({"Collection":item,"From":"","To":""}))
                    }
                    break
                case 'FinancialStatementVersion':
                    defaults = {
                        "Code":"",
                        "Chart of Accounts":"",
                        "Type":"",
                        "Hierarchy":[{"Presentation":"","Hierarchy":""}],
                    }
                    break
                case 'GeneralLedger':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Chart of Accounts":new Company(data['Company Code']).data['Chart of Accounts'],
                        "Name":"",
                        "Ledger Type":"",
                        "Group":"",
                        "Group General Ledger":"",
                    }
                    break
                case 'GroupChartOfAccounts':
                    defaults = {
                        "Code":"",
                        "General Ledger Range":KB.GeneralLedgerGroups.map(item=>({"Group":item,"From":"","To":""})),
                    }
                    break
                case 'Holidays':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Year":new Date().getFullYear(),
                        "Holidays":[
                            {"Date":"","Description":""}
                        ],
                    }
                    break
                case 'IncomeTaxCode':
                    defaults = {
                        "Code":"",
                        "Taxation":[
                            {
                                "From Year":0,
                                "To Year":0,
                                "Exemption Limit":0,
                                "Marginal Relief":"",
                                "Standard Deduction - Salary":0,
                                "Cess":0,
                                "Slab":[
                                    {"From":0,"To":0,"Rate":0}
                                ]
                            }
                        ]
                    }
                    break
                case 'Location':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Name":"",
                        "Address":"",
                        "Cost Center":"",
                        "Business Place":""
                    }
                    break
                case 'Material':
                    defaults = {
                        "Code":"",
                        "Company Code": data['Company Code'],
                        "Name":"",
                        "Price":[
                            {"Location":"","From":"","To":"","Price":""}
                        ],
                        "General Ledger":"",
                        "General Ledger - Cost of Sales":"",
                        "General Ledger - Revenue":""
                    }
                    break
                case "OrganisationalUnit":
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Name":"",
                        "Cost Center":"",
                        "Business Place":""
                    }
                    break
                case 'PaymentTerms':
                    defaults = {
                        "Code":"",
                        "Description":"",
                        "Due Within Days":0,
                        "Discount Criteria":[
                            {"Days":0,"Rate":0}
                        ],
                        "Interest Criteria":[
                            {"Days":0,"Rate":0}
                        ],
                    }
                    break
                case 'ProfitCenter':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Segment":"",
                        "Name":"",
                    }
                    break
                case 'PurchaseOrder':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Order Number":"",
                        "Date":"",
                        "Vendor":"",
                        "Items":[
                            {"Material":"","Description":"","Quantity":0,"Unit Price":0,"Total Price":0}
                        ],
                        "Total Amount":0,
                    }
                    break
                case 'SaleOrder':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Order Number":"",
                        "Date":"",
                        "Customer":"",
                        "Items":[
                            {"Material":"","Description":"","Quantity":0,"Unit Price":0,"Total Price":0}
                        ],
                        "Total Amount":0,
                    }
                    break
                case 'Segment':
                    defaults = {
                        "Code":"",
                        "Name":""
                    }
                    break
                case 'Service':
                    defaults = {
                        "Code":"",
                        "Company Code": "",
                        "Name":"",
                        "Price":[
                            {"Business Place":"","From":"","To":"","Price":""}
                        ],
                        "General Ledger - Expense":"",
                        "General Ledger - Revenue":""
                    }
                    break
                case 'TimeControl':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Open Periods":[
                            {"From":"","To":""}
                        ],
                    }
                    break
                case 'Vendor':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Name":"",
                        "Address":"",
                        "PIN":"",
                        "State":"",
                        "Phone":"",
                        "Email":"",
                        "GSTIN":"",
                        "PAN":"",
                        "Payment Terms":"",
                        "Bank Accounts":[
                            {"Account Number":"","Confirm Account Number":"","Bank Name":"","IFSC Code":""}
                        ],
                        "Groups":[""]
                    }
                    break
                
            }
        } else if (this.method=="Update" || this.method =="Display") {
            defaults = this.getData(data);
        }
        return defaults
    }
    schema(data){
        let schema = [];
        switch (this.name){
            case 'Asset':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Asset Class","datatype":"single","input":"option","options":["",...AssetClass.listAll(data['Company Code'])],"noteditable":!(this.method=="Create")},
                    {"name":"Cost Center","datatype":"single","input":"option","options":["",...CostCenter.listAll(data['Company Code'])],"noteditable":!(this.method=="Create")},
                    {"name":"Useful Life","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"Salvage Value","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"Date of Capitalisation","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Date of Retirement","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Depreciation Method","datatype":"single","input":"option","options":["","Straight Line","Reducing Balance"],"noteditable":!this.editable},
                    {"name":"Depreciation Rate","datatype":"single","input":"input","type":"number","noteditable":(!this.editable || data['Depreciation Method']!="Reducing Balance")},
                ]
                break
            case 'AssetClass':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!(this.editable)},
                    {"name":"Depreciable","datatype":"single","input":"option","options":["","Yes","No"],"noteditable":!(this.method=="Create")},
                    {"name":"General Ledger - Depreciation","datatype":"single","input":"option","options":["",...GeneralLedger.listBytype(data['Company Code'],"Depreciation")],"noteditable":(data['Depreciable']!="Yes" || !this.method=="Create")},
                    {"name":"General Ledger - Asset","datatype":"single","input":"option","options":["",...GeneralLedger.listBytype(data['Company Code'],"Asset")],"noteditable":(!this.method=="Create")},
                ]
                break
            case 'AssetDevelopment':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"General Ledger","datatype":"single","input":"option","options":["",...GeneralLedger.listBytype(data['Company Code'],'Asset')],"noteditable":!(this.method=="Create")},
                    {"name":"Profit Center","datatype":"single","input":"option","options":["",...ProfitCenter.listAll(data['Company Code'])],"noteditable":!(this.method=="Create")},
                ]
                break
            case 'Attendance':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Employee","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Year","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Month","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Attendance","datatype":"collection","noteditable":true,"schema":data['Attendance'].map(item=>[
                        {"name":"Date","datatype":"single","input":"input","type":"date","noteditable":true},
                        {"name":"Status","datatype":"single","input":"option","options":["","Present","Leave","Absent"],"noteditable":!this.editable},
                        {"name":"Remarks","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    ])}
                ]
                break
            case 'BankAccount':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!this.method=="Create"},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Bank","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"IFSC","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Account","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"General Ledger","datatype":"single","input":"option","options":[""],"noteditable":(!this.method=="Create")},
                    {"name":"Profit Center","datatype":"single","input":"option","options":[""],"noteditable":(!this.method=="Create")},
                    {"name":"Business Place","datatype":"single","input":"option","options":[""],"noteditable":(!this.method=="Create")},
                    {"name":"Virtual Accounts","datatype":"collection","noteditable":!this.editable,"schema":data['Virtual Accounts'].map(item=>[
                        {"name":"Virtual Account Number","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Ledger","datatype":"single","input":"option","options":[],"noteditable":!this.editable},
                        {"name":"Presentation","datatype":"single","input":"option","options":[],"noteditable":!this.editable},
                        {"name":"Profit Center","datatype":"single","input":"option","options":[],"noteditable":!this.editable},
                    ])},
                    {"name":"Group Key","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                ]
                break
            case 'ChartOfAccounts':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","maxLength":4,"type":"text","noteditable":!(this.method=="Create")},
                    {"name":"General Ledger Range","datatype":"collection","noteditable":true,"schema":data['General Ledger Range'].map(item=>[
                        {"name":"Group","datatype":"single","input":"input","type":"text","noteditable":true},
                        {"name":"From","input":"input","datatype":"single","type":"number","noteditable":!(this.method=="Create")},
                        {"name":"To","input":"input","datatype":"single","type":"number","noteditable":!(this.method=="Create")},        
                    ])},
                ]
                break
            case 'Company':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","maxLength":4,"type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Address","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"PIN","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"PAN","datatype":"single","input":"input","type":"text","maxLength":10,"noteditable":!this.editable},
                    {"name":"Places of Business","datatype":"collection","noteditable":!this.editable,"schema":data['Places of Business'].map(item=>[
                        {"name":"Place","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"State","input":"option","datatype":"single","options":["",...KB.States,...KB.UTs],"noteditable":!this.editable},    
                        {"name":"GSTIN","input":"input","datatype":"single","type":"text","maxLength":15,"noteditable":!this.editable},    
                    ])},
                    {"name":"Functional Currency","datatype":"single","input":"option","options":["",...Currencies.listCurrencies],"noteditable":!(this.method=="Create")},
                    {"name":"Year Zero","datatype":"single","input":"input","type":"number","maxLength":4,"noteditable":!(this.method=="Create")},
                    {"name":"Financial Year Beginning","datatype":"single","input":"option","options":["","01","02","03","04","05","06","07","08","09","10","11","12"],"noteditable":!(this.method=="Create")},
                    {"name":"Chart of Accounts","datatype":"single","input":"option","options":["",...ChartOfAccounts.listCompanyCoA],"noteditable":!(this.method=="Create")},
                    {"name":"Group Chart of Accounts","datatype":"single","input":"option","options":["",...ChartOfAccounts.listGroupCoA],"noteditable":!(this.method=="Create")},
                ];
                break
            case 'CostObject':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Profit Center","datatype":"single","input":"option","options":[""],"noteditable":!(this.method=="Create")} ,
                    {"name":"Settlement Ratio","datatype":"collection","noteditable":!this.editable,"schema":data['Settlement Ratio'].map(item=>[
                        {"name":"To", "datatype":"single","input":"option","options":[""],"noteditable":!this.editable},
                        {"name":"Percentage","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    ])
                    }
                ]
                break
            case 'CostCenter':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Profit Center","datatype":"single","input":"option","options":["",...ProfitCenter.listAll(data['Company Code'])],"noteditable":!(this.method=="Create")} ,
                    {"name":"Apportionment Ratio","datatype":"nest","noteditable":!this.editable,"schema":data['Apportionment Ratio'].map(item=>[
                        {"name":"From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"To","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"Ratio","datatype":"collection","noteditable":!this.editable,"schema":item['Ratio'].map(subitem=>[
                            {"name":"Type","datatype":"single","input":"option","options":[""],"noteditable":!this.editable},
                            {"name":"To","datatype":"single","input":"option","options":[""],"noteditable":!this.editable},
                            {"name":"Percentage","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        ])},
                    ])},
                ]
                break
            case 'Customer':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Address","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"PIN","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"State","datatype":"single","input":"option","options":["",...KB.States,...KB.UTs],"noteditable":!this.editable},
                    {"name":"Phone","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"Email","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Tax Identification Number","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"GSTIN","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Payment Terms","datatype":"single","input":"option","options":[""],"noteditable":!this.editable},
                ]
                break
            case 'Employee':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Address","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"PIN","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"State","datatype":"single","input":"option","options":["",...KB.States,...KB.UTs],"noteditable":!this.editable},
                    {"name":"Phone","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"Email","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Tax Identification Number","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Date of Birth","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Date of Joining","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Date of Seperation","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Bank Accounts","datatype":"collection","noteditable":!this.editable,"schema":data['Bank Accounts'].map(item=>[
                        {"name":"Account Number","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Confirm Account Number","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Bank Name","input":"input","datatype":"single","type":"text","noteditable":!this.editable},
                        {"name":"IFSC Code","input":"input", "datatype":"single","type":"text","noteditable":!this.editable},        
                    ])},
                    {"name":"Employment Details","datatype":"collection","noteditable":!this.editable,"schema":data['Employment Details'].map(item=>[
                        {"name":"Organisational Unit","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"From","input":"input","datatype":"single","type":"date","noteditable":!this.editable},
                        {"name":"To","input":"input", "datatype":"single","type":"date","noteditable":!this.editable}, 
                        {"name":"Position","input":"input", "datatype":"single","type":"text","noteditable":!this.editable},        
                    ])},
                    {"name":"Variable Wages","datatype":"collection","noteditable":!this.editable,"schema":data['Variable Wages'].map(item=>[
                        {"name":"Wage Type","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Amount","input":"input","datatype":"single","type":"number","noteditable":!this.editable},
                        {"name":"From","input":"input","datatype":"single","type":"date","noteditable":!this.editable},
                        {"name":"To","input":"input","datatype":"single","type":"date","noteditable":!this.editable},      
                    ])},
                    {"name":"Fixed Wages","datatype":"collection","noteditable":!this.editable,"schema":data['Fixed Wages'].map(item=>[
                        {"name":"Wage Type","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Amount","input":"input","datatype":"single","type":"number","noteditable":!this.editable},
                        {"name":"From Year","input":"input","datatype":"single","type":"number","noteditable":!this.editable},
                        {"name":"From Month","input":"input","datatype":"single","type":"number","noteditable":!this.editable},
                        {"name":"To Year","input":"input","datatype":"single","type":"number","noteditable":!this.editable},
                        {"name":"To Month","input":"input","datatype":"single","type":"number","noteditable":!this.editable},   
                    ])},
                    {"name":"One Time Wages","datatype":"collection","noteditable":!this.editable,"schema":data['One Time Wages'].map(item=>[
                        {"name":"Wage Type","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Amount","input":"input","datatype":"single","type":"number","noteditable":!this.editable},
                        {"name":"Date","input":"input","datatype":"single","type":"date","noteditable":!this.editable},      
                    ])},
                    {"name":"Income Tax Code","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Additional Income and Deductions","datatype":"collection","noteditable":!this.editable,"schema":data['Additional Income and Deductions'].map(item=>[
                        {"name":"Tax Year","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Type","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Amount","input":"input","datatype":"single","type":"number","noteditable":!this.editable},     
                    ])},
                ]
                break
            case 'FinancialAccountsSettings':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"General Ledger for Profit and Loss Account","datatype":"single","input":"option","options":["",...GeneralLedger.listAll(data['Company Code'])],"noteditable":!this.editable},
                    {"name":"General Ledger for Cash Discount","datatype":"single","input":"option","options":["",...GeneralLedger.listAll(data['Company Code'])],"noteditable":!this.editable},
                    {"name":"Wage Types","datatype":"collection","noteditable":!this.editable,"schema":data['Wage Types'].map(item=>[
                        {"name":"Wage Type","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Type","input":"option","datatype":"single","options":["Earning","Deduction"],"noteditable":!this.editable},
                        {"name":"General Ledger","input":"option","datatype":"single","options":[""],"noteditable":!this.editable},    
                    ])},
                    {"name":"General Ledger for Salary TDS","datatype":"single","input":"option","options":["",...GeneralLedger.listAll(data['Company Code'])],"noteditable":!this.editable},
                    {"name":"Code Range", "datatype":"collection","noteditable":true,"schema":data['Code Range'].map(item=>[
                        {"name":"Collection", "datatype":"single","input":"input", "noteditable":true},
                        {"name":"From","datatype":"single","input":"input", "type":"number"},
                        {"name":"To","datatype":"single","input":"input", "type":"number"},
                    ])}
                ]
                break
            case 'FinancialStatementVersion':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","maxLength":4,"type":"number","noteditable":!(this.method=="Create")},
                    {"name":"Chart of Accounts","datatype":"single","input":"option","options":[""],"noteditable":!(this.editable)},
                    {"name":"Type","datatype":"single","input":"option","options":["Individual","Group"],"noteditable":!(this.editable)},
                    {"name":"Hierarchy","datatype":"collection","noteditable":!(this.editable),"schema":data['Hierarchy'].map(item=>[
                        {"name":"Presentation","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"Hierarchy","input":"input", "placeholder":"eg: Current Assets > Inventory","datatype":"single","type":"text","noteditable":!this.editable},        
                    ])},
                ]
                break
            case 'GeneralLedger':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Chart of Accounts","datatype":"single","input":"option","options":[""],"noteditable":true},
                    {"name":"Group","datatype":"single","input":"option","options":["",...KB.GeneralLedgerGroups],"noteditable":!this.editable},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Ledger Type","datatype":"single","input":"option","options":["",...KB.LedgerTypes],"noteditable":!this.editable},
                    {"name":"Group General Ledger", "datatype":"single","input":"option","options":[""],"noteditable":!this.editable},
                ]
                break
            case 'GroupChartOfAccounts':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","maxLength":5,"type":"text","noteditable":!(this.method=="Create")},
                    {"name":"General Ledger Range","datatype":"collection","noteditable":true,"schema":data['General Ledger Range'].map(item=>[
                        {"name":"Group","datatype":"single","input":"input","type":"text","noteditable":true},
                        {"name":"From","input":"input","datatype":"single","type":"number","noteditable":!(this.method=="Create")},
                        {"name":"To","input":"input","datatype":"single","type":"number","noteditable":!(this.method=="Create")},        
                    ])},
                ]
                break
            case 'Holidays':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Year","datatype":"single","input":"input","type":"number","noteditable":true},
                    {"name":"Holidays","datatype":"collection","noteditable":!this.editable,"schema":data['Holidays'].map(item=>[
                        {"name":"Date","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"Description","input":"input", "datatype":"single","type":"text","noteditable":!this.editable},
                    ])},
                ]
                break
            case 'IncomeTaxCode':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","type":"text","maxLength":6,"noteditable":!(this.method=="Create")},
                    {"name":"Taxation","datatype":"nest","noteditable":!this.editable,"schema":data['Taxation'].map(item=>[
                        {"name":"From Year","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"To Year","input":"input", "datatype":"single","type":"number","noteditable":!this.editable},
                        {"name":"Exemption Limit","input":"input", "datatype":"single","type":"number","noteditable":!this.editable},        
                        {"name":"Marginal Relief","input":"option", "datatype":"single","options":["Yes","No"],"noteditable":!this.editable},
                        {"name":"Standard Deduction - Salary","input":"input", "datatype":"single","type":"number","noteditable":!this.editable},
                        {"name":"Cess","input":"input", "datatype":"single","type":"number","noteditable":!this.editable},
                        {"name":"Slab","datatype":"collection","noteditable":!this.editable,"schema":item['Slab'].map(subitem=>[
                            {"name":"From","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                            {"name":"To","input":"input", "datatype":"single","type":"number","noteditable":!this.editable},        
                            {"name":"Rate","input":"input", "datatype":"single","type":"number","noteditable":!this.editable},      
                        ])},
                    ])},
                ]
                break
            case 'Location':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Cost Center", "datatype":"single","input":"option","options":[""],"noteditable":!(this.method=="Create")},
                    {"name":"Business Place", "datatype":"single","input":"option","options":[""],"noteditable":!(this.method=="Create")},
                    {"name":"Address","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                ]
                break
            case 'Material':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Unit","datatype":"single","input":"option","options":["",...Units.listUnits],"noteditable":!this.editable},
                    {"name":"Price","datatype":"collection","noteditable":!this.editable, "schema":data['Price'].map(item=>[
                        {"name":"Location","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"To","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"Price","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    ])},
                    {"name":"General Ledger","datatype":"single","input":"option","options":["",...GeneralLedger.listBytype(data['Company Code'],'Material')],"noteditable":!this.editable},
                    {"name":"General Ledger - Cost of Sales","datatype":"single","input":"option","options":["",...GeneralLedger.listBytype(data['Company Code'],'General')],"noteditable":!this.editable},
                    {"name":"General Ledger - Revenue","datatype":"single","input":"option","options":["",...GeneralLedger.listBytype(data['Company Code'],'General')],"noteditable":!this.editable},
                ]
                break
            case 'OrganisationalUnit':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","maxLength":6,"noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Business Place","datatype":"single","input":"option","options":["",...new Company(data['Company Code']).BusinessPlaces],"noteditable":!this.editable},
                    {"name":"Cost Center","datatype":"single","input":"option","options":["",...CostCenter.listAll(data['Company Code'])],"noteditable":!(this.method=="Create")},
                ]
                break
            case 'PaymentTerms':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Due Within Days","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"Discount Criteria","datatype":"collection","noteditable":!this.editable,"schema":data['Discount Criteria'].map(item=>[
                        {"name":"Days","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"Discount %","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    ])},
                    {"name":"Interest Criteria","datatype":"collection","noteditable":!this.editable,"schema":data['Interest Criteria'].map(item=>[
                        {"name":"Days","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"Interest %","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    ])
                    }
                ]
                break
            case 'ProfitCenter':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Segment","datatype":"single","input":"option","options":["",...Segment.listAll()],"noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                ]
                break
            case 'PurchaseOrder':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Order Number","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Vendor","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Order Date","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Delivery Date","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Items","datatype":"collection","noteditable":!this.editable,"schema":data['Items'].map(item=>[
                        {"name":"Material","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Quantity","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"Unit Price","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"Total Price","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    ])},
                    {"name":"Total Amount","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                ]
                break
            case 'SaleOrder':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Order Number","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Customer","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Order Date","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Delivery Date","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Items","datatype":"collection","noteditable":!this.editable,"schema":data['Items'].map(item=>[
                        {"name":"Material","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Quantity","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"Unit Price","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"Total Price","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    ])},
                    {"name":"Total Amount","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                ]
                break
            case 'Segment': 
                schema = [
                    {"name":"Code","datatype":"single","input":"input","type":"text", "maxLength":4,"noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                ]
                break
            case 'Service':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Unit","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Price","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"General Ledger - Expense","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"General Ledger - Revenue","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                ]
                break
            case 'TimeControl':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Open Periods","datatype":"collection","noteditable":!this.editable,"schema":data['Open Periods'].map(item=>[
                        {"name":"From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"To","input":"input", "datatype":"single","type":"date","noteditable":!this.editable},        
                    ])},
                ]
                break
            case 'UserSettings':
                schema = [
                    {"name":"Username","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Full Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Email","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Role","datatype":"single","input":"option","options":["Admin","User"],"noteditable":!this.editable},
                ]
                break
            case 'Vendor':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Address","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"PIN","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"State","datatype":"single","input":"option","options":["",...KB.States,...KB.UTs],"noteditable":!this.editable},
                    {"name":"Phone","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"Email","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Tax Identification Number","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"GSTIN","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Payment Terms","datatype":"single","input":"option","options":[""],"noteditable":!this.editable},
                    {"name":"Groups","datatype":"list","input":"option","options":["A","B"],"noteditable":!this.editable}
                ]
                break
        }
        return schema;
    }
    navigation(data){
        const navigation = [
            {"name":"Back","type":"navigate","url":'/control','state':{},'onClick':()=>alert('Hi')},
            {"name":"Save","type":"action","onClick":()=>alert(this.save(data))},
        ];
        if (this.method!="Create"){
            navigation.push({"name":"Export JSON","type":"action","onClick":()=>Operations.downloadJSON(data,this.name)})
        }
        return navigation;

    }
    errors(data){
        const list = [];
        const mandatory = Collection.mandatory[this.name];
        const missed = [];
        mandatory.map(field=>data[field]==""?missed.push(field):()=>{});
        (missed.length>0)?list.push(`${missed.join(", ")} necessary`):()=>{};
        (this.method=="Create" && this.exists(data))?list.push(`Record of ${this.title} with same identfiers ${JSON.stringify(this.identifiers)} already exists`):()=>{};
        (KB.AccountTypes.includes(this.title) && data['Code']!="" && !valueInRange(data['Code'],new Company(data['Company Code']).CollectionRange(this.title)))?list.push(`${this.title} code ${data['Code']} not in range for Company ${data['Company Code']} (${JSON.stringify(new Company(data['Company Code']).CollectionRange(this.title))})`):()=>{};
        switch (this.name){
            case 'Asset':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                data['Date of Retirement']!="" && (new Date(data['Date of Retirement']) < new Date(data['Date of Capitalisation']))?list.push("Date of Retirement cannot be before Date of Capitalisation"):()=>{};
                data['Date of Capitalisation']!="" && (new Date(data['Date of Capitalisation']) > new Date())?list.push("Date of Capitalisation cannot be in future"):()=>{};
                (data['Depreciation Rate']>100)?list.push(`Depreciation Rate cannot exceed 100%`):()=>{};
                break
            case 'AssetClass':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                (data['Depreciable']=="Yes" && data['General Ledger - Depreciation']=="")?list.push(`General Ledger - Depreciation is required`):()=>{};
                break
            case 'AssetDevelopment':
                break
            case 'Attendance':
                data['Attendance'].map(item=>(item['Status']=="")?list.push(`Attendance missing for ${item['Date']}`):()=>{});
                break
            case 'BankAccount':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'ChartOfAccounts':
                (this.method=="Create" && new Collection("GroupChartOfAccounts").exists(data))?list.push(`Group Chart of Accounts with same identifier(s) already exists`):()=>{};
                data['General Ledger Range'].map((item,i)=>(item['From']=="" || item['To']=="")?list.push(`Group ${item['Group']} requires range`):()=>{})
                data['General Ledger Range'].map((item,i)=>(item['From']>=item['To'])?list.push(`${item['Group']}: 'To' range needs to be greater than 'from' range`):()=>{})
                for (let i=1;i<data['General Ledger Range'].length;i++){
                    (data['General Ledger Range'][i]['From'] <= data['General Ledger Range'][i-1]['To'])?list.push(`'From' range of ${data['General Ledger Range'][i]['Group']} to be greater than 'To' range of ${data['General Ledger Range'][i-1]['Group']}`):()=>{};
                }
                break
            case 'Company':
                data['Places of Business'].map((item,i)=>(item['Place']=="" || item['State']=="")?list.push(`Place of Business ${i+1}: Information incomplete.`):()=>{});
                data['Places of Business'].length==0?list.push("At least one Place of Business is required"):()=>{};
                data['Places of Business'].map(item=>Count(item['Place'],ListItems(data['Places of Business'],"Place"))>1?list.push(`${item['Place']} repeats in Place of Business`):()=>{})
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'CostCenter':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'Customer':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'Employee':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'FinancialAccountsSettings':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                data['Code Range'].map(item=>(item['From']>=item['To'])?list.push(`Code Range ${item['Collection']}: 'To' range needs to be greater than 'from' range`):()=>{})
                data['Code Range'].map(item=>item['From']<=0 || item['To']<=0?list.push(`Code Range ${item['Collection']}: 'From' and 'To' range should be positive numbers`):()=>{})
                break
            case 'FinancialStatementVersion':
                data['Hierarchy'].map((item,i)=>(item['Presentation']=="" || item['Hierarchy']=="")?list.push(`Hierarchy ${i+1}: Information incomplete.`):()=>{});
                data['Hierarchy'].length==0?list.push("At least one Hierarchy is required"):()=>{};
                data['Hierarchy'].map(item=>Count(item['Hierarchy'],ListItems(data['Hierarchy'],"Hierarchy"))>1?list.push(`${item['Hierarchy']} repeats in Hierarchy`):()=>{})
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'GeneralLedger':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                (data['Code']!="" && data["Group"]!="" && !valueInRange(data['Code'],new ChartOfAccounts(data['Company Code']).range(data['Group'])))?list.push(`General Ledger code ${data['Code']} not in range for ${data['Group']} ${JSON.stringify(new ChartOfAccounts(data['Company Code']).range(data['Group']))}`):()=>{};
                break
            case 'GroupChartOfAccounts':
                (this.method=="Create" && new Collection("ChartOfAccounts").exists(data))?list.push(`Chart of Accounts with same identifier(s) already exists`):()=>{};
                data['General Ledger Range'].map((item,i)=>(item['From']=="" || item['To']=="")?list.push(`Group ${item['Group']} requires range`):()=>{})
                data['General Ledger Range'].map((item,i)=>(item['From']>=item['To'])?list.push(`${item['Group']}: 'To' range needs to be greater than 'from' range`):()=>{})
                for (let i=1;i<data['General Ledger Range'].length;i++){
                    (data['General Ledger Range'][i]['From'] <= data['General Ledger Range'][i-1]['To'])?list.push(`'From' range of ${data['General Ledger Range'][i]['Group']} to be greater than 'To' range of ${data['General Ledger Range'][i-1]['Group']}`):()=>{};
                }
                break
            case 'Holidays':
                data['Holidays'].map((item,i)=>(item['Date']=="" || item['Description']=="")?list.push(`At Holidays line ${i}, information incomplete`):()=>{})
                break
            case 'IncomeTaxCode':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                data['Taxation'].map((item,i)=>(item['From Year']=="" || item['To Year']=="")?list.push(`At Taxation line ${i}, From Year and To Year are required`):()=>{});
                data['Taxation'].map((item,i)=>(item['From Year']>=item['To Year'])?list.push(`At Taxation line ${i}, To Year should be greater than From Year`):()=>{});
                for (let i=1;i<data['Taxation'].length;i++){
                    (data['Taxation'][i]['From Year'] <= data['Taxation'][i-1]['To Year'])?list.push(`At Taxation line ${i}, From Year should be greater than To Year of previous line`):()=>{};
                }
                break
            case 'Location':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'Material':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                data['Price'].map((item,i)=>(item['Location']=="" || item['From']=="" || item['To']=="" && item['Price']=="")?list.push(`At Price line ${i}, information incomplete`):()=>{})
                break
            case 'OrganisationalUnit':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'PaymentTerms':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                data['Discount Criteria'].map((item,i)=>(item['Days']=="" || item['Discount %']=="")?list.push(`At Terms line ${i}, information incomplete`):()=>{})
                data['Interest Criteria'].map((item,i)=>(item['Days']=="" || item['Interest %']=="")?list.push(`At Interest Criteria line ${i}, information incomplete`):()=>{})
                break
            case 'ProfitCenter':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'PurchaseOrder':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                data['Items'].map((item,i)=>(item['Material']=="" || item['Quantity']=="" || item['Unit Price']=="" || item['Total Price']=="")?list.push(`At Items line ${i}, information incomplete`):()=>{})
                break
            case 'SaleOrder':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                data['Items'].map((item,i)=>(item['Material']=="" || item['Quantity']=="" || item['Unit Price']=="" || item['Total Price']=="")?list.push(`At Items line ${i}, information incomplete`):()=>{})
                break
            case 'Segment':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'Service':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'TimeControl':
                data['Open Periods'].map((item,i)=>(item['From']=="" || item['To']=="")?list.push(`At Open Periods line ${i}, information incomplete`):()=>{})
                data['Open Periods'].map((item,i)=>(new Date(item['From']) > new Date(item['To']))?list.push(`At Open Periods line ${i}, 'To' date should be after 'From' date`):()=>{})
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'UserSettings':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'Vendor':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
        }
        const uniquelist = [...new Set(list)];
        return uniquelist;
    }
    process(data){
        let result = {...data};
        switch (this.name){
            case 'Asset':
                result['Depreciation Rate'] = (result['Depreciation Method']!="Reducing Balance")?0:result['Depreciation Rate'];
                break
            case 'GeneralLedger':
                break
        }
        return result;
    }
    create(data){
        const existing = this.load();
        const updated = [...existing,data];
        return updated;
    }
    delete(data){
        const collection = this.load();
        const identifiers = this.identifiers;
        const values = identifiers.map(item=>data[item]);
        let result = collection;
        for (let i = 0;i<collection.length;i++){
            let logic = true;
            for (let j = 0; j< identifiers.length;j++){
                if (collection[i][identifiers[j]] != values[j]){
                    logic = false
                }
            } 
            if (logic){result = result.filter((item,index)=>index!==i)}
            }
        return result;
    }
    update(data){
        const existing = this.delete(data);
        const updated = [...existing,data];
        return updated
    }
    updatedCollection(data){
        let result = [];
        switch (this.method){
            case 'Create':
                result = this.create(data);
                break
            case 'Update':
                result = this.update(data);
                break
            case 'Delete':
                result = this.delete(data);
                break
        }
        return result
    } 
    save(data){
        const errors = this.errors(data);
        if (errors.length>0) {
            return ("Validation Unsuccessful!")
        } else {
            saveData(this.updatedCollection(data),this.collectionname);
            return ('Success');
        }
    }
    static collectionname = {
        "Asset":"assets",
        "AssetClass":"assetclasses",
        "AssetDevelopment":"assetdevelopments",
        "Attendance":"attendances",
        "BankAccount":"bankaccounts",
        'ChartOfAccounts':'chartsofaccounts',
        'Company':'companies',
        'CostObject':'costobjects',
        'CostCenter':'costcenters',
        'Customer':'customers',
        "Employee":"employees",
        "FinancialAccountsSettings":"financialaccountsettings",
        "FinancialStatementVersion":"financialstatementversions",
        "GeneralLedger":"generalledgers",
        'GroupChartOfAccounts':'groupchartsofaccounts',
        "Holidays":"holidays",
        "IncomeTaxCode":"incometaxcodes",
        "Location":"locations",
        "Material":"materials",
        "OrganizationUnit":"organisationalunits",
        "PaymentTerms":"paymentterms",
        "ProfitCenter":"profitcenters",
        "PurchaseOrder":"purchaseorders",
        "SaleOrder":"saleorders",
        "Segment":"segments",
        "Service":"services",
        "TimeControl":"timecontrols",
        "UserSettings":"usersettings",
        "Vendor":"vendors",
    }
    static mandatory = {
        "Asset":["Company Code","Code","Name","Asset Class","Cost Center","Useful Life","Salvage Value","Date of Capitalisation","Depreciation Method"],
        "AssetClass":["Code","Company Code","Depreciable","General Ledger - Asset"],
        "AssetDevelopment":["Company Code","Code","Name","General Ledger","Profit Center"],
        "Attendance":["Company Code","Employee","Year","Month"],
        "BankAccount":["Code","Company Code","Account Number","Bank Name","IFSC Code"],
        "ChartOfAccounts":["Code"],
        "Company":["Code","Name","Year Zero","Financial Year Beginning","Functional Currency","Chart of Accounts"],
        "CostObject":["Company Code","Code","Name","Profit Center"],
        "CostCenter":["Company Code","Code","Name","Profit Center"],
        "Customer":["Code","Company Code","Name","State"],
        "Employee":["Code","Company Code","Name","State","Income Tax Code"],
        "FinancialAccountsSettings":["Company Code","General Ledger for Profit and Loss Account","General Ledger for Cash Discount","General Ledger for Salary TDS"],
        "FinancialStatementVersion":["Code"],
        "GeneralLedger":["Code","Company Code","Chart of Accounts","Name","Ledger Type","Group"],
        "GroupChartOfAccounts":["Code"],
        "Holidays":["Company Code","Year"],
        "IncomeTaxCode":["Code"],
        "Location":["Code","Company Code","Name","Cost Center","Business Place"],
        "Material":["Code","Company Code","Name","Unit","General Ledger","General Ledger - Cost of Sales", "General Ledger - Revenue"],
        "OrganisationalUnit":["Code","Company Code","Name","Cost Center","Business Place"],
        "PaymentTerms":["Code","Description"],
        "ProfitCenter":["Company Code","Code","Segment","Name"],
        "PurchaseOrder":["Code","Company Code","Vendor","Date","Business Place"],
        "SaleOrder":["Code","Company Code","Customer","Date","Business Place"],
        "Segment":["Code","Name"],
        "Service":["Code","Company Code","Name","Unit","General Ledger - Expense","General Ledger - Revenue"],
        "TimeControl":["Company Code"],
        "UserSettings":["User"],
        "Vendor":["Code","Company Code","Name","State"],
    }
    static identifiers = {
        "Asset":["Company Code","Code"],
        "AssetClass":["Code","Company Code"],
        "AssetDevelopment":["Company Code","Code"],
        "Attendance":["Company Code","Employee","Year","Month"],
        "BankAccount":["Code","Company Code"],
        "ChartOfAccounts":["Code"],
        "Company":["Code"],
        "CostObject":["Company Code","Code"],
        "CostCenter":["Company Code","Code"],
        "Customer":["Code","Company Code"],
        "Employee":["Code","Company Code"],
        "FinancialAccountsSettings":["Company Code"],
        "FinancialStatementVersion":["Code"],
        "GeneralLedger":["Code","Company Code"],
        "GroupChartOfAccounts":["Code"],
        "Holidays":["Company Code","Year"],
        "IncomeTaxCode":["Code"],
        "Location":["Code","Company Code"],
        "Material":["Code","Company Code"],
        "OrganisationalUnit":["Code","Company Code"],
        "PaymentTerms":["Code","Company Code"],
        "ProfitCenter":["Company Code","Code"],
        "PurchaseOrder":["Code","Company Code"],
        "SaleOrder":["Code","Company Code"],
        "Segment":["Code"],
        "Service":["Code","Company Code"],
        "TimeControl":["Company Code"],
        "UserSettings":["User"],
        "Vendor":["Code","Company Code"],
    }
    static titles = {
        "Asset":"Asset",
        "AssetClass":"Asset Class",
        "AssetDevelopment":"Asset Development",
        "Attendance":"Attendance",
        "BankAccount":"Bank Account",
        'ChartOfAccounts':'Chart of Accounts',
        'Company':'Company',
        'CostObject':'Cost Object',
        'CostCenter':'Cost Center',
        'Customer':'Customer',
        "Employee":"Employee",
        "FinancialAccountsSettings":"Financial Accounts Settings",
        "FinancialStatementVersion":"Financial Statement Version",
        "GeneralLedger":"General Ledger",
        'GroupChartOfAccounts':'Group Chart of Accounts',
        "Holidays":"Holidays",
        "IncomeTaxCode":"Income Tax Code",
        "Location":"Location",
        "Material":"Material",
        "OrganisationalUnit":"Organizational Unit",
        "PaymentTerms":"Payment Terms",
        "ProfitCenter":"Profit Center",
        "PurchaseOrder":"Purchase Order",
        "SaleOrder":"Sale Order",
        "Segment":"Segment",
        "Service":"Service",
        "TimeControl":"Time Control",
        "UserSettings":"User Settings",
        "Vendor":"Vendor",
    }
}

class Table{
    constructor(name,method="Display"){
        this.name = name;
        this.title = this.name;
        this.method = method;
        this.data = (this.name in localStorage)?JSON.parse(localStorage.getItem(this.name)):[];
        this.defaults = (this.method=="Create")?Table.defaults[this.name]:this.data;
        this.key = Table.keys[this.name];
        this.mandatory = Table.mandatory[this.name];
    }
    errors(data){
        const list = [];
        data.map((item,i)=>this.mandatory.map(field=>(item[field]=="")?list.push(`Item ${i+1} requires ${field}`):()=>{}));
        data.map(item=>Count(item[this.key],ListItems(data,this.key))>1?list.push(`${this.key} ${item[this.key]} exists ${Count(item[this.key],ListItems(data,this.key))} times.`):()=>{});
        const uniquelist = [...new Set(list)]
        return uniquelist;
    }
    process(data){
        return data;
    }
    navigation(data){
        const navigation = [
            {"name":"Back","type":"navigate","url":"/control","state":{}},
        ];
        if (this.method!="Update"){
            navigation.push({"name":"CSV","type":"action","onClick":()=>Operations.downloadCSV(data,this.name)});
            navigation.push({"name":"Update","type":"navigate","url":"/interface","state":{"type":"Table","method":"Update","table":this.name}});
        }
        (this.method=="Update")?navigation.push({"name":"Update","type":"action","onClick":()=>alert(this.save(data))}):()=>{};
        return navigation;
    }
    save(data){
        localStorage.setItem(this.name,JSON.stringify(data));
        return ('Success');
    }
    schema(data){
        let schema = [];
        switch (this.name){
            case 'Currencies':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","type":"text"},
                    {"name":"Description","datatype":"single","input":"input","type":"text"}

                ]
                break
            case 'HSN':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","type":"text"},
                    {"name":"Type","datatype":"single","input":"option","options":["","Goods","Services"]},
                    {"name":"Description","datatype":"single","input":"input","type":"text"}

                ]
                break
            case 'Units':
                schema = [
                    {"name":"Symbol","datatype":"single","input":"input","type":"text"},
                    {"name":"Name","datatype":"single","input":"input","type":"text"},
                    {"name":"Quantity","datatype":"single","input":"input","type":"text"},
                    {"name":"Description","datatype":"single","input":"input","type":"text"}
                ]
                break
        }
        return schema;
    }
    static defaults = {
        "Currencies":[{"Code":"","Description":""}],
        "Units":[{"Symbol":"","Name":"","Quantity":"","Description":""}],
        "HSN":[{"Code":"","Type":"","Description":""}]
    }
    static keys = {
        "Currencies":"Code",
        "Units":"Symbol",
        "HSN":"Code"
    }
    static mandatory = {
        "Currencies":["Code"],
        "HSN":["Code","Type"],
        "Units":["Symbol","Name","Quantity"]
    }
}

class ReportQuery{
    constructor(report){
        this.report = report;
    }
    schema(data){
        const allSchema = {
            "ViewDocument":[
                {"name":"Company Code","datatype":"single","input":"option","options":["",...Company.listAll]},
                {"name":"Year","datatype":"single","input":"input","type":"text"},
                {"name":"Document Number","datatype":"single","input":"input","type":"text"},
                {"name":"Segment","datatype":"multiple","input":"input","type":"number","req":["values","ranges","exclValues","exclRanges"]}
            ]
        }
        return allSchema[this.report];
    }
    defaults(data){
        const allDefaults = {
            "ViewDocument":{"Company Code":"","Year":"","Document Number":"","Segment":{"values":[""],"exclValues":[""],"ranges":[{"from":"","to":""}],"exclRanges":[{"from":"","to":""}]}}
        }
        return allDefaults[this.report]
    }
    errors(data){
        return [];
    }
    process(data){
        return data;
    }
    navigation(data){
        const navigation = [
            {"name":"Back","type":"navigate","url":"/reports","state":{}},
            {"name":"Get","type":"navigate","url":"/interface","state":{'type':'Report','report':this.report,'data':data}}
        ]
        return navigation;
    }
}

function Interface(){
    const location = useLocation();
    const inputData = location.state || {};
    const {type} = inputData;
    let defaults = {};
    let Display = {};
    let editable = false;
    let title = "";
    if (type=="CollectionQuery"){
        const {collection,method} = inputData;
        Display = new CollectionQuery(collection,method);
        defaults = Display.defaults;
        editable = true;
        title = `${method} ${new Collection(collection).title}`;
    } else if (type=="Collection"){
        const {collection,method,data} = inputData;
        Display = new Collection(collection,method);
        defaults = Display.defaults(data);
        editable = (method=="Create" || method=="Update");
        title = `${method} ${Display.title}`;
    } else if (type=="Table"){
        const {table,method} = inputData;
        Display = new Table(table,method);
        defaults = Display.defaults;
        editable = (method=="Update");
        title = table;
    } else if (type=="Transaction"){
        const {transaction} = inputData;
        Display = new Transaction(transaction);
        defaults = Display.defaults('');
        editable = true;
        title = transaction;
    } else if (type=="ReportQuery"){
        const {report} = inputData;
        Display = new ReportQuery(report);
        defaults = Display.defaults();
        editable = true;
        title = report;
    } else if (type=="Report"){
        const {report,data} = inputData;
        Display = new Report(report);
        defaults = Display.defaults(data);
        editable = false;
        title = Display.title();
    }
    const [data,setdata] = useState(defaults);
    const output = Display.process(data);
    const schema = Display.schema(output);
    const errors = Display.errors(output);
    const navigation = Display.navigation(output);
    const navigate = useNavigate();
    const goto = (url,data)=>{
        navigate(url,{state:data});
        window.location.reload();
    }

    function objectChange(field,subfield,e){
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:{...prevdata[field],[subfield]:value}
        }))
    }

    function collectionChange(field,subfield,index,e){
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].map((item,i)=>(i===index)?{...item,[subfield]:value}:item)
        }))
    }

    function addCollection(field,e){
        e.preventDefault;
        setdata(prevdata=>({
            ...prevdata,
            [field]:[...prevdata[field],defaults[field][0]]
        }))
    }

    function removeCollection(field,index,e){
        e.preventDefault;
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].filter((item,i)=>i!==index)
        }))
        
    }

    const tableChange = (index,field,e)=>{
        const {value} = e.target;
        setdata(prevdata=>(prevdata.map((item,i)=>(i==index)?{...item,[field]:value}:item)))
    }

    const addTableRow=()=>{
        setdata(prevdata=>([...prevdata,defaults[0]]));
    }

    const removeTableRow =(index)=>{
        setdata(prevdata=>(prevdata.filter((item,i)=>i!=index)))
    }

    return(
        <div className='display'>
            <div className='displayTitle'>
                <h2>{title}</h2>
            </div>
            <div className='displayInputFields'>
                {type!="Table" && schema.map(field=>
                    <>
                        {field['datatype']=="single" && <SingleInput field={field} output={output} setdata={setdata}/>}
                        {field['datatype']=="list" && <ListInput field={field} output={output} setdata={setdata}/>}
                        {field['datatype']=="collection" && <CollectionInput field={field} output={output} handleChange={collectionChange} addItem={addCollection} removeItem={removeCollection}/>}
                        {field['datatype']=="nest" && <NestInput field={field} output={output} setdata={setdata} defaults={defaults}/>}
                        {field['datatype']=="multiple" && <MultipleInput field={field} output={output} setdata={setdata}/>}
                        {field['datatype']=="table" && <DisplayAsTable collection={output[field['name']]}/>}
                    </>
                )}
                {type=="Table" && <TableInput addTableRow={addTableRow} removeTableRow={removeTableRow} data={output} schema={schema} tableChange={tableChange} editable={editable}/>}
            </div>
            {(editable && (errors.length>0)) && <div className='error'>
                <Collapsible title={`Things to Consider (${errors.length}) `} children={<ul>
                    {errors.map(error=>
                        <li>{error}</li>
                    )}
                </ul>}/>
            </div>}
            <div className='navigation'>
                {navigation.map(item=><>
                    {item['type']=="navigate" && <button onClick={()=>goto(item['url'],item['state'])}>{item['name']}</button>}
                    {item['type']=="action" && <button onClick={item['onClick']}>{item['name']}</button>}
                    </>
                )}
            </div>
            {JSON.stringify(data)}
        </div>
    )
}

class Company{
    constructor(Code){
        this.code = Code;
        this.data = new Collection('Company').getData({"Code":this.code});
        this.BusinessPlaces = ListItems(this.data['Places of Business'],"Place");
    }
    AccountSettings(){
        return new Collection('FinancialAccountsSettings').getData({"Company Code":this.code});
    }
    CollectionRange(collection){
        const settings = this.AccountSettings();
        const range = settings['Code Range'].filter(item=>item['Collection']===collection)[0];
        const result = [range['From'],range['To']];
        return result;
    }
    TimeControl(){
        const data = new Collection('TimeControl').getData({'Company Code':this.code});
        const timeControlData = data['Open Periods'];
        return timeControlData;
    }
    IsPostingOpen(date){
        let result = false;
        this.TimeControl().map(time=>(new Date(date)<=new Date(time['To']) && new Date(date)>=new Date(time['From']))?result = true:()=>{})
        return result
    }
    PostingYear(PostingDate){
        const pdate = new Date(PostingDate);
        const reference = `${pdate.getFullYear()}-${this.data['Financial Year Beginning']}-01`;
        const result = (new Date(reference)>pdate)?pdate.getFullYear()-1:pdate.getFullYear();
        return result
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
    static data = new Collection('Company').load();
    static listAll = ListItems(this.data,"Code");
    
}

class ChartOfAccounts{
    constructor(code){
        this.code = code;
        this.data = ChartOfAccounts.allData.find(item=>item['Code']==this.code);
    }
    range(group){
        const data = this.data['General Ledger Range'];
        const filtered = data.find(item=>item['Group']==group);
        const result = [filtered['From'],filtered['To']]
        return result;
    }
    static company = new Collection('ChartOfAccounts').load();
    static group = new Collection('GroupChartOfAccounts').load();
    static allData = [...this.company,...this.group];
    static listCompanyCoA = ListItems(this.company,'Code');
    static listGroupCoA = ListItems(this.group,'Code');
    static listAllCoA = [...this.listCompanyCoA,...this.listGroupCoA];
    static type(CoA){
        if (this.listCompanyCoA.includes(CoA)){
            return "Company";
        } else if (this.listGroupCoA.includes(CoA)){
            return "Group";
        } else {
            return "NA"
        }
    }
}

class Units{
    static allData = new Table('Units').data;
    static listUnits = ListItems(this.allData,'Unit');
}

class Currencies{
    static allData = new Table('Currencies').data;
    static listCurrencies = ListItems(this.allData,'Code');
}

class HSN{
    static allData = new Table('HSN').data;
    static listHSN = ListItems(this.allData,'Code');
}

class ProfitCenter{
    constructor(code,company){
        this.code = code;
        this.company = company;
        this.data = new Collection('ProfitCenter').getData({'Company Code':this.company,'Code':this.code});
    }
    static data(company){
        const data = new Collection('ProfitCenter').load();
        const filtered = data.filter(item=>item['Company Code']==company);
        return filtered;
    }
    static listAll(company){
        const list = ListItems(this.data(company),"Code");
        return list
    }
}

function Scratch(){
   

    return(
        <div className='reportDisplay'>
        <MultipleInput/>
        </div>
    )
}

function buildTree(data, parentId = null) {
    let tree = [];
    data.map(item=>(item['parentId']===parentId)?tree.push({...item,['children']:buildTree(data,item['id'])}):()=>{})
    return tree;
}

const TreeNode = ({ node, addItem , handleChange,removeItem}) => {
  return (
    <li>
      <input value={node.name} onChange={(e)=>handleChange(node.id,e)}/> {/* Assuming 'name' is a property in your node object */}
      <button onClick={()=>addItem(node.id)}>+</button>
      <button onClick={()=>removeItem(node.id)}>-</button>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} addItem={addItem} handleChange={handleChange} removeItem={removeItem} />
          ))}
        </ul>
      )}
    </li>
  );
};

const TreeView = () => {
    const [data,setdata] = useState([{'id':1,'name':'name','parentId':null},{id:2,'name':'firstName','parentId':1}]);
    const treeStructure = buildTree(data); 
    const addItem = (parentId)=>{
        const prevdata = [...data];
        const id = prevdata.length;
        const newdata = [...prevdata,{'id':id+1,'name':'','parentId':parentId}]
        setdata(newdata)
    }
    const handleChange = (id,e) =>{
        const {value} = e.target;
        setdata(prevdata=>(prevdata.map((item)=>
        (item['id']==id)?{...item,['name']:value}:item
        )))
    }

    const removeItem = (id)=>{
        setdata(prevdata=>prevdata.filter(item=>(item['id']!=id && item['parentId']!=id)))
    }

    return (<>
    <ul>
        {treeStructure.map(node => (
        <TreeNode key={node.id} node={node} addItem={addItem} handleChange={handleChange} removeItem={removeItem}/>
        ))}
    </ul>
    {JSON.stringify(data)}
    </>
    );
};




function App(){
    return(
        <div className='container'>
        <BrowserRouter>
        <SearchBar/>
        <div className="innerContainer">
        <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path="/navigate/:menu" element={<Navigation/>}/>
            <Route path='/record' element={<Record/>}/>
            <Route path='/control' element={<Control/>}/>
            <Route path='/reports' element={<Reports/>}/>
            <Route path="/interface" element={<Interface/>}/>
            <Route path="*" element={<Home/>}/>
            <Route path="/scratch/" element={<Scratch/>}/>
        </Routes>
        </div>
        </BrowserRouter>
        </div>
    )
    
}

export default App; 