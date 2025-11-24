import './App.css'
import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { FaDesktop,FaPlus, FaHome, FaArrowRight, FaArrowLeft, FaCopy, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import {MdComputer} from 'react-icons/md';
import exportFromJSON from 'export-from-json';
import { PiTreeView } from 'react-icons/pi';

function loadData(collection){
    const data = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];
    return data;
}

function saveData(data,collection){
  localStorage.setItem(collection,JSON.stringify(data));
}

const FieldsInCollection = (collection) =>{
    const fields = [];
    collection.map(item=>fields.push(...Object.keys(item)));
    const result = [...new Set(fields)];
    return result
}

const TrimCollection=(collection,fields)=>{
    const trimmed = [];
    collection.forEach(item=>{
        const data = {};
        fields.forEach(field=>{
            data[field]=item[field];
        });
        trimmed.push(data);
    })
    return trimmed;
}

const ListItems = (collection,key)=>{
    const list = [];
    collection.map(item=>list.push(item[key]));
    return list
}

const ListUniqueItems = (collection,key)=>{
    const list = [];
    collection.map(item=>list.push(item[key]));
    const uniquelist = [...new Set(list)];
    return uniquelist
}

const ExistsDuplicates = (value,collection,key)=>{
    const list = ListItems(collection,key);
    const count = Count(value,list);
    const result = (count>1);
    return result;
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

function rangeOverlap(range1,range2){
    let result = true;
    if ((range1[0]<range2[0] && range1[1]<range2[0]) || (range1[0]>range2[1] && range1[1]>range2[1])){
        result = false;
    }
    return result;
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

function monthStructure(year,month){
    const start = new Date(`${year}-${month.toString().padStart(2,0)}-01`);
    const end = new Date(start.getFullYear(),start.getMonth()+1,0);
    const days = daysInPeriod([`${start.getFullYear()}-${start.getMonth()+1}-01`,`${end.getFullYear()}-${end.getMonth()+1}-${end.getDate()}`]);
    const dates = datesInPeriod([`${start.getFullYear()}-${start.getMonth()+1}-01`,`${end.getFullYear()}-${end.getMonth()+1}-${end.getDate()}`]);
    const startDate = numberDay(dayNumber(start));
    const endDate = numberDay(dayNumber(end));
    return {'start':startDate,'end':endDate,'days':days,'dates':dates}
}

function negativeError(data,fields){
    const list = [];
    fields.forEach(field=>{
        if (data[field]<0){
            list.push(`${field} cannot be negative.`);
        }
    })
    return list;
};

function blankError(data,fields){
   const list = [];
    fields.forEach(field=>{
        if (data[field]===""){
            list.push(`${field} cannot be blank.`);
        }
    }) 
    return list;
}

function futureDateError(data,fields){
    const list = [];
    fields.forEach(field=>{
        if (new Date(data[field])>new Date()){
            list.push(`${field} cannot be future date.`);
        }
    }) 
    return list;
};

function timeSeriesError(Name,Collection,Fromfield,Tofield,LastDate="9999-12-31",FirstDate="9999-12-31"){
    const list = [];
    const ToDateStrings = ListUniqueItems(Collection,Tofield);
    const ToDateNumbers = ToDateStrings.map(date=>dayNumber(date));
    const maxToDateNumber = Math.max(...ToDateNumbers);
    const maxToDateString = numberDay(maxToDateNumber);
    const FromDateStrings = ListUniqueItems(Collection,Fromfield);
    const FromDateNumbers = FromDateStrings.map(date=>dayNumber(date));
    const minToDateNumber = Math.min(...FromDateNumbers);
    const minToDateString = numberDay(minToDateNumber);
    if (new Date(LastDate)>new Date(maxToDateString)){list.push(`At least one ${Name} should have period up to ${LastDate}.`)}
    if (new Date(FirstDate)<new Date(minToDateString)){list.push(`At least one ${Name} should have period from ${FirstDate}.`)}
    Collection.forEach((item,i)=>{
        if (item[Fromfield]>item[Tofield]){
            list.push(`At ${Name} ${i+1}, 'From' is greater than 'To'.`);
        }
    })
    return list
}

function collectionError(Name,Collection,nonBlanks,Fromfield="",Tofield=""){
    const list = [];
    Collection.forEach((item,i)=>{
        if (item[Fromfield]!=="" && item[Tofield]!=="" && item[Fromfield]>item[Tofield]){
            list.push(`At ${Name} ${i+1} ${Fromfield} is greater than ${Tofield}`);
        }
        if (nonBlanks.length!==0){
            nonBlanks.forEach(field=>{
                if (item[field]===""){
                    list.push(`At ${Name} ${i+1}, ${field} is necessary`);
                }
            })
        }
    });
    return list;
}

function totalError(Name,Collection,Field,Maximum){
    if (SumField(Collection,Field)>Maximum){
        return `Total of ${Name} ${Field} cannot be more than ${Maximum}`;
    }
}

function maxError(Name,Value,Maximum){
    let list = [];
    if (Value>Maximum){
        list.push(`${Name} cannot be more than ${Maximum}.`);
    }
    return list;
}

function setBlank(data,fields){
    fields.map(item=>data[item]="");
    return data;
}

class Navigator{
    static codes = [
        {'code':'','url':'/','state':{},'type':'home'},
        {'code':'control','url':'/control','state':{},'type':'home'},
        {'code':'record','url':'/record','state':{},'type':'home'},
        {'code':'reports','url':'/reports','state':{},'type':'home'},
        {'code':'sc','url':'/scratch','state':{},'type':'home'},
        {'code':'gb10c','name':'Create Chart of Accounts','url':'/interface','state':{'type':'Collection','collection':'ChartOfAccounts','method':'Create'},'type':'Control','group':'Global'},
        {'code':'gb10d','name':'Display Chart of Accounts','url':'/interface','state':{'type':'CollectionQuery','collection':'ChartOfAccounts','method':'Display'},'type':'Control','group':'Global'},
        {'code':'gb30c','name':'Create Group Chart of Accounts','url':'/interface','state':{'type':'Collection','collection':'GroupChartOfAccounts','method':'Create'},'type':'Control','group':'Global'},
        {'code':'gb30d','name':'Display Group Chart of Accounts','url':'/interface','state':{'type':'CollectionQuery','collection':'GroupChartOfAccounts','method':'Display'},'type':'Control','group':'Global'},
        {'code':'gb40c','name':'Create Group General Ledger','url':'/interface','state':{'type':'CollectionQuery','collection':'GroupGeneralLedger','method':'Create'},'type':'Control','group':'Global'},
        {'code':'gb40d','name':'Display Group General Ledger','url':'/interface','state':{'type':'CollectionQuery','collection':'GroupGeneralLedger','method':'Display'},'type':'Control','group':'Global'},
        {'code':'gb50c','name':'Create Income Tax Code','url':'/interface','state':{'type':'Collection','collection':'IncomeTaxCode','method':'Create'},'type':'Control','group':'Global'},
        {'code':'gb50u','name':'Update Income Tax Code','url':'/interface','state':{'type':'CollectionQuery','collection':'IncomeTaxCode','method':'Update'},'type':'Control','group':'Global'},
        {'code':'gb50d','name':'Display Income Tax Code','url':'/interface','state':{'type':'CollectionQuery','collection':'IncomeTaxCode','method':'Display'},'type':'Control','group':'Global'},
        {'code':'gb60c','name':'Create Wage Type','url':'/interface','state':{'type':'Collection','collection':'WageType','method':'Create'},'type':'Control','group':'Global'},
        {'code':'gb60u','name':'Update Wage Type','url':'/interface','state':{'type':'CollectionQuery','collection':'WageType','method':'Update'},'type':'Control','group':'Global'},
        {'code':'gb60d','name':'Display Wage Type','url':'/interface','state':{'type':'CollectionQuery','collection':'WageType','method':'Display'},'type':'Control','group':'Global'},
        {'code':'tab10', 'name':'Currencies', 'url':'/interface','state':{'type':'Table','table':'Currencies','method':'Display'},'type':'Control','group':'Global'},
        {'code':'tab20', 'name':'HSN', 'url':'/interface','state':{'type':'Table','table':'HSN','method':'Display'},'type':'Control','group':'Global'},
        {'code':'tab30', 'name':'Segments', 'url':'/interface','state':{'type':'Table','table':'Segments','method':'Display'},'type':'Control','group':'Global'},
        {'code':'tab40', 'name':'Units', 'url':'/interface','state':{'type':'Table','table':'Units','method':'Display'},'type':'Control','group':'Global'},
        {'code':'tab50', 'name':'Wage Types', 'url':'/interface','state':{'type':'Table','table':'WageTypes','method':'Display'},'type':'Control','group':'Global'},
        {'code':'com10c','name':'Create Company','url':'/interface','state':{'type':'Collection','collection':'Company','method':'Create'},'type':'Control','group':'Company'},
        {'code':'com10u','name':'Update Company','url':'/interface','state':{'type':'CollectionQuery','collection':'Company','method':'Update'},'type':'Control','group':'Company'},
        {'code':'com10d','name':'Display Company','url':'/interface','state':{'type':'CollectionQuery','collection':'Company','method':'Display'},'type':'Control','group':'Company'},
        {'code':'com20c','name':'Create Customisation','url':'/interface','state':{'type':'CollectionQuery','collection':'Customisation','method':'Create'},'type':'Control','group':'Company'},
        {'code':'com20u','name':'Update Customisation','url':'/interface','state':{'type':'CollectionQuery','collection':'Customisation','method':'Update'},'type':'Control','group':'Company'},
        {'code':'com20d','name':'Display Customisation','url':'/interface','state':{'type':'CollectionQuery','collection':'Customisation','method':'Display'},'type':'Control','group':'Company'},
        {'code':'com30c','name':'Create Time Control','url':'/interface','state':{'type':'CollectionQuery','collection':'TimeControl','method':'Create'},'type':'Control','group':'Company'},
        {'code':'com30u','name':'Update Time Control','url':'/interface','state':{'type':'CollectionQuery','collection':'TimeControl','method':'Update'},'type':'Control','group':'Company'},
        {'code':'com30d','name':'Display Time Control','url':'/interface','state':{'type':'CollectionQuery','collection':'TimeControl','method':'Display'},'type':'Control','group':'Company'},
        {'code':'org10c','name':'Create Cost Center','url':'/interface','state':{'type':'CollectionQuery','collection':'CostCenter','method':'Create'},'type':'Control','group':'Controlling'},
        {'code':'org10d','name':'Display Cost Center','url':'/interface','state':{'type':'CollectionQuery','collection':'CostCenter','method':'Display'},'type':'Control','group':'Controlling'},
        {'code':'org10u','name':'Update Cost Center','url':'/interface','state':{'type':'CollectionQuery','collection':'CostCenter','method':'Update'},'type':'Control','group':'Controlling'},
        {'code':'org20c','name':'Create Location','url':'/interface','state':{'type':'CollectionQuery','collection':'Location','method':'Create'},'type':'Control','group':'Controlling'},
        {'code':'org20u','name':'Update Location','url':'/interface','state':{'type':'CollectionQuery','collection':'Location','method':'Update'},'type':'Control','group':'Controlling'},
        {'code':'org20d','name':'Display Location','url':'/interface','state':{'type':'CollectionQuery','collection':'Location','method':'Display'},'type':'Control','group':'Controlling'},
        {'code':'org30c','name':'Create Plant','url':'/interface','state':{'type':'CollectionQuery','collection':'Plant','method':'Create'},'type':'Control','group':'Controlling'},
        {'code':'org30u','name':'Update Plant','url':'/interface','state':{'type':'CollectionQuery','collection':'Plant','method':'Update'},'type':'Control','group':'Controlling'},
        {'code':'org30d','name':'Display Plant','url':'/interface','state':{'type':'CollectionQuery','collection':'Plant','method':'Display'},'type':'Control','group':'Controlling'},
        {'code':'org40c','name':'Create Profit Center','url':'/interface','state':{'type':'CollectionQuery','collection':'ProfitCenter','method':'Create'},'type':'Control','group':'Controlling'},
        {'code':'org40u','name':'Update Profit Center','url':'/interface','state':{'type':'CollectionQuery','collection':'ProfitCenter','method':'Update'},'type':'Control','group':'Controlling'},
        {'code':'org40d','name':'Display Profit Center','url':'/interface','state':{'type':'CollectionQuery','collection':'ProfitCenter','method':'Display'},'type':'Control','group':'Controlling'},
        {'code':'org50c','name':'Create Revenue Center','url':'/interface','state':{'type':'CollectionQuery','collection':'RevenueCenter','method':'Create'},'type':'Control','group':'Controlling'},
        {'code':'org50u','name':'Update Revenue Center','url':'/interface','state':{'type':'CollectionQuery','collection':'RevenueCenter','method':'Update'},'type':'Control','group':'Controlling'},
        {'code':'org50d','name':'Display Revenue Center','url':'/interface','state':{'type':'CollectionQuery','collection':'RevenueCenter','method':'Display'},'type':'Control','group':'Controlling'},
        {'code':'op10c','name':'Create Maintenance Order','url':'/interface','state':{'type':'CollectionQuery','collection':'MaintenanceOrder','method':'Create'},'type':'Control','group':'Controlling'},
        {'code':'op10u','name':'Update Maintenance Order','url':'/interface','state':{'type':'CollectionQuery','collection':'MaintenanceOrder','method':'Update'},'type':'Control','group':'Controlling'},
        {'code':'op10d','name':'Display Maintenance Order','url':'/interface','state':{'type':'CollectionQuery','collection':'MaintenanceOrder','method':'Display'},'type':'Control','group':'Controlling'},
        {'code':'asc10','name':'Create Asset','url':'/interface','state':{'type':'Collection','collection':'Asset','method':'Create'},'type':'Control','group':'Asset'},
        {'code':'asu10','name':'Update Asset','url':'/interface','state':{'type':'CollectionQuery','collection':'Asset','method':'Update'},'type':'Control','group':'Asset'},
        {'code':'asd10','name':'Display Asset','url':'/interface','state':{'type':'CollectionQuery','collection':'Asset','method':'Display'},'type':'Control','group':'Asset'},
        {'code':'asc20','name':'Create Asset Group','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetGroup','method':'Create'},'type':'Control','group':'Asset'},
        {'code':'asu20','name':'Update Asset Group','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetGroup','method':'Update'},'type':'Control','group':'Asset'},
        {'code':'asd20','name':'Display Asset Group','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetGroup','method':'Display'},'type':'Control','group':'Asset'},
        {'code':'asc30','name':'Create Asset Construction Order','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetConstructionOrder','method':'Create'},'type':'Control','group':'Asset'},
        {'code':'asu30','name':'Update Asset Construction Order','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetConstructionOrder','method':'Update'},'type':'Control','group':'Asset'},
        {'code':'asd30','name':'Display Asset Construction Order','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetConstructionOrder','method':'Display'},'type':'Control','group':'Asset'},
        {'code':'acc10c','name':'Create General Ledger','url':'/interface','state':{'type':'CollectionQuery','collection':'GeneralLedger','method':'Create'},'type':'Control','group':'Costs and Accounting'},
        {'code':'acc10d','name':'Display General Ledger','url':'/interface','state':{'type':'CollectionQuery','collection':'GeneralLedger','method':'Display'},'type':'Control','group':'Costs and Accounting'},
        {'code':'acc10u','name':'Update General Ledger','url':'/interface','state':{'type':'CollectionQuery','collection':'GeneralLedger','method':'Update'},'type':'Control','group':'Costs and Accounting'},
        {'code':'hr10c','name':'Create Attendance','url':'/interface','state':{'type':'CollectionQuery','collection':'Attendance','method':'Create'},'type':'Control','group':'Human Resources'},
        {'code':'hr10u','name':'Update Attendance','url':'/interface','state':{'type':'CollectionQuery','collection':'Attendance','method':'Update'},'type':'Control','group':'Human Resources'},
        {'code':'hr10d','name':'Display Attendance','url':'/interface','state':{'type':'CollectionQuery','collection':'Attendance','method':'Display'},'type':'Control','group':'Human Resources'},
        {'code':'hr20c','name':'Create Employee','url':'/interface','state':{'type':'CollectionQuery','collection':'Employee','method':'Create'},'type':'Control','group':'Human Resources'},
        {'code':'hr20u','name':'Update Employee','url':'/interface','state':{'type':'CollectionQuery','collection':'Employee','method':'Update'},'type':'Control','group':'Human Resources'},
        {'code':'hr20d','name':'Display Employee','url':'/interface','state':{'type':'CollectionQuery','collection':'Employee','method':'Display'},'type':'Control','group':'Human Resources'},
        {'code':'hr30c','name':'Create Holidays','url':'/interface','state':{'type':'CollectionQuery','collection':'Holidays','method':'Create'},'type':'Control','group':'Human Resources'},
        {'code':'hr30u','name':'Update Holidays','url':'/interface','state':{'type':'CollectionQuery','collection':'Holidays','method':'Update'},'type':'Control','group':'Human Resources'},
        {'code':'hr30d','name':'Display Holidays','url':'/interface','state':{'type':'CollectionQuery','collection':'Holidays','method':'Display'},'type':'Control','group':'Human Resources'},
        {'code':'mat10c','name':'Create Material','url':'/interface','state':{'type':'CollectionQuery','collection':'Material','method':'Create'},'type':'Control','group':'Material'},
        {'code':'mat10u','name':'Update Material','url':'/interface','state':{'type':'CollectionQuery','collection':'Material','method':'Update'},'type':'Control','group':'Material'},
        {'code':'mat10d','name':'Display Material','url':'/interface','state':{'type':'CollectionQuery','collection':'Material','method':'Display'},'type':'Control','group':'Material'},
        {'code':'mat10c','name':'Create Material Group','url':'/interface','state':{'type':'CollectionQuery','collection':'MaterialGroup','method':'Create'},'type':'Control','group':'Material'},
        {'code':'mat10u','name':'Update Material Group','url':'/interface','state':{'type':'CollectionQuery','collection':'MaterialGroup','method':'Update'},'type':'Control','group':'Material'},
        {'code':'mat10d','name':'Display Material Group','url':'/interface','state':{'type':'CollectionQuery','collection':'MaterialGroup','method':'Display'},'type':'Control','group':'Material'},
        {'code':'p10c','name':'Create Bank Account','url':'/interface','state':{'type':'CollectionQuery','collection':'BankAccount','method':'Create'},'type':'Control','group':'Payables and Receivables'},
        {'code':'p10u','name':'Update Bank Account','url':'/interface','state':{'type':'CollectionQuery','collection':'BankAccount','method':'Update'},'type':'Control','group':'Payables and Receivables'},
        {'code':'p10d','name':'Display Bank Account','url':'/interface','state':{'type':'CollectionQuery','collection':'BankAccount','method':'Display'},'type':'Control','group':'Payables and Receivables'},
        {'code':'p20c','name':'Create Customer','url':'/interface','state':{'type':'CollectionQuery','collection':'Customer','method':'Create'},'type':'Control','group':'Payables and Receivables'},
        {'code':'p20u','name':'Update Customer','url':'/interface','state':{'type':'CollectionQuery','collection':'Customer','method':'Update'},'type':'Control','group':'Payables and Receivables'},
        {'code':'p20d','name':'Display Customer','url':'/interface','state':{'type':'CollectionQuery','collection':'Customer','method':'Display'},'type':'Control','group':'Payables and Receivables'},
        {'code':'p30c','name':'Create Vendor','url':'/interface','state':{'type':'CollectionQuery','collection':'Vendor','method':'Create'},'type':'Control','group':'Payables and Receivables'},
        {'code':'p30u','name':'Update Vendor','url':'/interface','state':{'type':'CollectionQuery','collection':'Vendor','method':'Update'},'type':'Control','group':'Payables and Receivables'},
        {'code':'p30d','name':'Display Vendor','url':'/interface','state':{'type':'CollectionQuery','collection':'Vendor','method':'Display'},'type':'Control','group':'Payables and Receivables'},
        {'code':'stlaco','name':'ACO Settlement','url':'/interface','state':{'type':'Transaction','transaction':'ACOSettlement','data':{}},'type':'Record','group':'Asset'},
        {'code':'rundpct','name':'Depreciation','url':'/interface','state':{'type':'Transaction','transaction':'Depreciation','data':{}},'type':'Record','group':'Asset'},
        {'code':'rvltas','name':'Asset Revaluation','url':'/interface','state':{'type':'Transaction','transaction':'AssetRevaluation','data':{}},'type':'Record','group':'Asset'},
        {'code':'scrapas','name':'Asset Scrap','url':'/interface','state':{'type':'Transaction','transaction':'AssetScrap','data':{}},'type':'Record','group':'Asset'},
        {'code':'dispas','name':'Asset Disposal','url':'/interface','state':{'type':'Transaction','transaction':'AssetDisposal','data':{}},'type':'Record','group':'Asset'},
        {'code':'accgen','name':'General Accounting','url':'/interface','state':{'type':'Transaction','transaction':'GeneralAccounting','data':{}},'type':'Record','group':'Cost and Accounting'},
        {'code':'clrgen','name':'General Ledger Clearing','url':'/interface','state':{'type':'Transaction','transaction':'GeneralLegderClearing','data':{}},'type':'Record','group':'Cost and Accounting'},
        {'code':'amsprepaid','name':'Prepaid Amortisation','url':'/interface','state':{'type':'Transaction','transaction':'PrepaidAmortisation','data':{}},'type':'Record','group':'Cost and Accounting'},
        {'code':'consprepaid','name':'Prepaid Consumption','url':'/interface','state':{'type':'Transaction','transaction':'PrepaidConsumption','data':{}},'type':'Record','group':'Cost and Accounting'},
        {'code':'runcost','name':'Costing Run','url':'/interface','state':{'type':'Transaction','transaction':'CostingRun','data':{}},'type':'Record','group':'Cost and Accounting'},
        {'code':'runrem','name':'Remuneration Run','url':'/interface','state':{'type':'Transaction','transaction':'RemunerationRun','data':{}},'type':'Record','group':'Human Resources'},
        {'code':'postrem','name':'Remuneration Posting','url':'/interface','state':{'type':'Transaction','transaction':'RemunerationPosting','data':{}},'type':'Record','group':'Human Resources'},
        {'code':'payrem','name':'Remuneration Payment','url':'/interface','state':{'type':'Transaction','transaction':'RemunerationPayment','data':{}},'type':'Record','group':'Human Resources'},
        {'code':'rcvmat','name':'Material Receipt','url':'/interface','state':{'type':'Transaction','transaction':'MaterialReceipt','data':{}},'type':'Record','group':'Material'},
        {'code':'acptmat','name':'Material Acceptance','url':'/interface','state':{'type':'Transaction','transaction':'MaterialAcceptance','data':{}},'type':'Record','group':'Material'},
        {'code':'rtnmat','name':'Material Return','url':'/interface','state':{'type':'Transaction','transaction':'MaterialReturn','data':{}},'type':'Record','group':'Material'},
        {'code':'issmat','name':'Material Issue','url':'/interface','state':{'type':'Transaction','transaction':'MaterialIssue','data':{}},'type':'Record','group':'Material'},
        {'code':'scrapmat','name':'Material Scrap','url':'/interface','state':{'type':'Transaction','transaction':'MaterialScrap','data':{}},'type':'Record','group':'Material'},
        {'code':'lossitmat','name':'Material Loss in Transit','url':'/interface','state':{'type':'Transaction','transaction':'MaterialLossInTransit','data':{}},'type':'Record','group':'Material'},
        {'code':'invven','name':'Vendor Invoice','url':'/interface','state':{'type':'Transaction','transaction':'VendorInvoice','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'cnoteven','name':'Vendor Credit Note','url':'/interface','state':{'type':'Transaction','transaction':'VendorCreditNote','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'payven','name':'Vendor Payment','url':'/interface','state':{'type':'Transaction','transaction':'VendorPayment','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'clrven','name':'Vendor Clearing','url':'/interface','state':{'type':'Transaction','transaction':'VendorClearing','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'invcus','name':'Customer Invoice','url':'/interface','state':{'type':'Transaction','transaction':'CustomerInvoice','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'cnotecus','name':'Customer Credit Note','url':'/interface','state':{'type':'Transaction','transaction':'CustomerCreditNote','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'paycus','name':'Customer Payment','url':'/interface','state':{'type':'Transaction','transaction':'CustomerPayment','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'clrcus','name':'Customer Clearing','url':'/interface','state':{'type':'Transaction','transaction':'CustomerClearing','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'payven','name':'Vendor Payment','url':'/interface','state':{'type':'Transaction','transaction':'VendorPayment','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'paybatch','name':'Batch Payments','url':'/interface','state':{'type':'Transaction','transaction':'VANReceipts','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'rcvvan','name':'VAN Receipts','url':'/interface','state':{'type':'Transaction','transaction':'VANReceipts','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'runint','name':'Interest Run','url':'/interface','state':{'type':'Transaction','transaction':'InterestRun','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'runforex','name':'Foreign Exchange Run','url':'/interface','state':{'type':'Transaction','transaction':'ForeignExchangeRun','data':{}},'type':'Record','group':'Payables and Receivables'},
        {'code':'regas','name':'Asset Register','url':'/interface','state':{'type':'ReportQuery','report':'AssetRegister'},'type':'Reports','group':'Asset'},
        {'code':'lgras','name':'Asset Ledger','url':'/interface','state':{'type':'ReportQuery','report':'AssetLedger'},'type':'Reports','group':'Asset'},
        {'code':'balas','name':'Asset Ledger Balance','url':'/interface','state':{'type':'ReportQuery','report':'AssetLedgerBalance'},'type':'Reports','group':'Asset'},
        {'code':'schas','name':'Asset Schedule','url':'/interface','state':{'type':'ReportQuery','report':'AssetSchedule'},'type':'Reports','group':'Asset'},
        {'code':'fordpct','name':'Forecast Depreciation','url':'/interface','state':{'type':'ReportQuery','report':'ForecastDepreciation'},'type':'Reports','group':'Asset'},
        {'code':'fs','name':'Financial Statements','url':'/interface','state':{'type':'ReportQuery','report':'FinancialStatements'},'type':'Reports','group':'Cost and Accounting'},
        {'code':'lgrgen','name':'General Ledger','url':'/interface','state':{'type':'ReportQuery','report':'GeneralLedger'},'type':'Reports','group':'Cost and Accounting'},
        {'code':'balgen','name':'General Ledger Balance','url':'/interface','state':{'type':'ReportQuery','report':'GeneralLedgerBalance'},'type':'Reports','group':'Cost and Accounting'},
        {'code':'lgrcost','name':'Cost Ledger','url':'/interface','state':{'type':'ReportQuery','report':'CostLedger'},'type':'Reports','group':'Cost and Accounting'},
        {'code':'balcost','name':'Cost Ledger Balance','url':'/interface','state':{'type':'ReportQuery','report':'CostLedgerBalance'},'type':'Reports','group':'Cost and Accounting'},
        {'code':'forcost','name':'Forecast Cost','url':'/interface','state':{'type':'ReportQuery','report':'ForecastCost'},'type':'Reports','group':'Cost and Accounting'},
        {'code':'docacc','name':'Accounting Document','url':'/interface','state':{'type':'ReportQuery','report':'AccountingDocument'},'type':'Reports','group':'Cost and Accounting'},
        {'code':'smtrem','name':'Remuneration Statement','url':'/interface','state':{'type':'ReportQuery','report':'RemunerationStatement'},'type':'Reports','group':'Human Resources'},
        {'code':'forrem','name':'Forecast Remuneration','url':'/interface','state':{'type':'ReportQuery','report':'RemunerationStatement'},'type':'Reports','group':'Human Resources'},
        {'code':'regemp','name':'Employee Register','url':'/interface','state':{'type':'ReportQuery','report':'EmployeeRegister'},'type':'Reports','group':'Human Resources'},
        {'code':'lgremp','name':'Employee Ledger','url':'/interface','state':{'type':'ReportQuery','report':'RemunerationStatement'},'type':'Reports','group':'Human Resources'},
        {'code':'regmat','name':'Material Register','url':'/interface','state':{'type':'ReportQuery','report':'MaterialRegister'},'type':'Reports','group':'Material'},
        {'code':'lgrmat','name':'Material Ledger','url':'/interface','state':{'type':'ReportQuery','report':'MaterialLedger'},'type':'Reports','group':'Material'},
        {'code':'balmat','name':'Material Ledger Balance','url':'/interface','state':{'type':'ReportQuery','report':'MaterialLedgerBalance'},'type':'Reports','group':'Material'},
        {'code':'schmat','name':'Material Schedule','url':'/interface','state':{'type':'ReportQuery','report':'MaterialSchedule'},'type':'Reports','group':'Material'},
        {'code':'regven','name':'Vendor Register','url':'/interface','state':{'type':'ReportQuery','report':'VendorRegister'},'type':'Reports','group':'Payables and Receivables'},
        {'code':'lgrven','name':'Vendor Ledger','url':'/interface','state':{'type':'ReportQuery','report':'VendorLedger'},'type':'Reports','group':'Payables and Receivables'},
        {'code':'balven','name':'Vendor Ledger Balance','url':'/interface','state':{'type':'ReportQuery','report':'VendorLedgerBalance'},'type':'Reports','group':'Payables and Receivables'},
        {'code':'regcus','name':'Customer Register','url':'/interface','state':{'type':'ReportQuery','report':'CustomerRegister'},'type':'Reports','group':'Payables and Receivables'},
        {'code':'lgrcus','name':'Customer Ledger','url':'/interface','state':{'type':'ReportQuery','report':'CustomerLedger'},'type':'Reports','group':'Payables and Receivables'},
        {'code':'balcus','name':'Customer Ledger Balance','url':'/interface','state':{'type':'ReportQuery','report':'CustomerLedgerBalance'},'type':'Reports','group':'Payables and Receivables'},
        {'code':'master','name':'Master Collection', 'url':'/interface', 'state':{'type':'Report','report':'MasterCollection','data':{}},'type':'Reports','group':'Business Intelligence'},
        {'code':'simtax','name':'Income Tax Simulator', 'url':'/interface', 'state':{'type':'Report','report':'IncomeTaxSimulator','data':{}},'type':'Reports','group':'Business Intelligence'}

    ]
    static getRoute(code){
        const route = this.codes.find(item=>item['code']==code.toLowerCase());
        return route;
    }
    static codesByType(type){
        return singleFilter(this.codes,'type',type)
    }
}

function SearchBar(){
    const navigate = useNavigate();
    const [code,setcode] = useState()
    function search(){
        const route = Navigator.getRoute(code);
        if (route){
            navigate(route['url'],{state:route['state']})
            setcode('');
            window.location.reload();
        } else {
            alert("We're Sorry! The code may have been misspelled. Please check!");
            setcode('');
            inputRef.current.focus();
        }
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

    function changeCode(e){
        setcode(e.target.value)
    }
    return(
        <div className='searchBarOuter'>
        <div className='searchBar'>
            <button className="searchBarButton" onClick={()=>navigate(`/`)}><FaHome/></button>
            <button className="searchBarButton" onClick={()=>navigate(-1)}><FaArrowLeft/></button>
            <div className='search'>
                <input type="text" value={code} ref={inputRef} onChange={changeCode} placeholder="Go to . . ."/>
            </div>
            <button className="searchBarButton" onClick={search}><FaArrowRight/></button>
            <button className="searchBarButton" onClick={()=>{navigate('/interface',{state:{'type':'DeviceUI','data':{}}});window.location.reload()}}><FaDesktop/></button>
        </div>
        </div>
    )
}

function TitleCard(){
    return (
    <h1 className='title'>Simple Costs</h1>
    )
}

function Home(){
    const navigate = useNavigate();
  return(
    <div className='homeOuter'>
        <div className='home'>
            <TitleCard/>
            <div className='actions'>                
                <div className='menu green' onClick={()=>navigate(`/record`)}><h2>Record</h2></div>
                <div className='menu red' onClick={()=>navigate(`/control`)}><h2>Control</h2></div>
                <div className='menu blue'  onClick={()=>navigate(`/reports`)}><h2>Report</h2></div>  
            </div>
        </div>
    </div>
  )
}

function Navigation({type,next}){
    const navigate = useNavigate();
    const codes = Navigator.codesByType(type);
    const groups = ListUniqueItems(codes,'group');
    return(
    <div className='menuContainer'>
            <h3 className='menuContainerTitle' onClick={()=>navigate(`/${next}`)}>{type}</h3>
            {groups.map(group=>
                <div className='menuList'>
                    <div className='menuTitle'><h4>{group}</h4></div>
                    <div className='menuItems'>
                    {singleFilter(codes,'group',group).map(code=>
                        <div className='menuItem' onClick={()=>{navigate(code['url'],{state:code['state']})}}><h4>{code['name']}</h4><p>{code['code'].toUpperCase()}</p></div>
                    )}
                    </div>
                    
                </div>
            )}
    </div>
  )
}

function Record(){
  
  return(
    <Navigation type={'Record'} next={'reports'}/>
  )
}

function Control(){

    return(
        <Navigation type={'Control'} next={'record'}/>
    )
}

function Reports(){

    return(
        <Navigation type={'Reports'} next={'control'}/>
    )
    
}


class Report{
    constructor(report){
        this.report = report;
    }
    defaults(data){
        let defaults = {};
        switch (this.report){
            case 'AccountingDocument':
                const documentData = Transaction.Accountingdoc(data['Company Code'],Number(data['Year']),Number(data['Document Number'])).document;
                defaults = documentData;
                break
            case 'IncomeTaxSimulator':
                defaults = {'Income Tax Code':'115BAC','Financial Year':2024,'Total Income':0,'Tax on Total Income':0,'Marginal Relief':0,'Net Tax on Total Income':0};
                break
            case 'MasterCollection':
                defaults = {'Collection':'Asset'}
                break
        }
        if (['AssetRegister','MaterialRegister','CustomerRegister','VendorRegister','EmployeeRegister'].includes(this.report)){
            defaults = {...data};
        }
        return defaults;
    }
    interface(data){
        let schema = [];
        let errors = [];
        let navigation = [];
        let result = {...data};
        
        //Introducing Back Button
        if (['AccountingDocument','AssetRegister','MaterialRegister','CustomerRegister','VendorRegister','EmployeeRegister'].includes(this.report)){  
            navigation = [
                {"name":"Back","type":"navigate","url":"/interface","state":{"type":"ReportQuery","report":this.report}}
            ]
        }
        switch (this.report){
            case 'IncomeTaxSimulator':
                //Schema 
                schema = [
                    {'name':'Income Tax Code', 'datatype':'single','input':'option','options':["",...new Collection('IncomeTaxCode').listAll('Code')]},
                    {'name':'Financial Year', 'datatype':'single','input':'input','type':"number"},
                    {'name':'Total Income', 'datatype':'single','input':'input','type':"number"},
                    {'name':'Tax on Total Income','datatype':'single','noteditable':true},
                    {'name':'Marginal Relief','datatype':'single','noteditable':true},
                    {'name':'Net Tax on Total Income','datatype':'single','noteditable':true},
                ];
                //Errors
                if (data['Income Tax Code']===""){
                errors.push(`Incom Tax Code required`);
                } else {
                    if (data['Financial Year']===""){
                        errors.push('Financial Year required');
                    } else {
                        if (!new IncomeTaxCode(data['Income Tax Code']).yearExists(data['Financial Year'])){
                            errors.push(`Taxation for specified year not available in Income Tax Code: ${data['Income Tax Code']}`)
                        }
                    }
                }
                //Processing
                if (result['Income Tax Code']!=="" && data['Financial Year']!==""){
                    const IT = new IncomeTaxCode(result['Income Tax Code']);
                    if (IT.yearExists(data['Financial Year'])){
                        result['Tax on Total Income'] = IT.tax(Number(result['Financial Year']),Number(result['Total Income']));
                        result['Marginal Relief'] = IT.marginalRelief(result['Financial Year'],result['Total Income']);
                        result['Net Tax on Total Income'] = IT.netTax(Number(result['Financial Year']),Number(result['Total Income']));
                    }
                }
                break
            case 'AccountingDocument':
                schema = [
                {"name":"Posting Date","datatype":"single","noteditable":true},
                {"name":"Document Number","datatype":"single","noteditable":true},
                {"name":"Year","datatype":"single","noteditable":true},
                {"name":"Line Items","datatype":"table"}
                ];
                break
            case 'MasterCollection':
                schema = [
                    {"name":"Collection","datatype":"single","input":"option","options":[...Collection.list],"noteditable":false},
                    {"name":"Data","datatype":"table"}
                ]
                result['Data']=new Collection(result['Collection']).register();
                break
        }
        if (['AssetRegister','MaterialRegister','CustomerRegister','VendorRegister','EmployeeRegister'].includes(this.report)){
            const collectionname = {
                "AssetRegister":"Asset",
                "CustomerRegister":"Customer",
                "EmployeeRegister":"Employee",
                "MaterialRegister":"Material",
                "VendorRegister":"Vendor"
            }
            result['Register'] = new CompanyCollection(result['Company Code'],collectionname[this.report]).register();
            schema = [
                {"name":"Company Code","datatype":"single","noteditable":true},
                {"name":"Register","datatype":"table"}
            ]
        }
        return {'schema':schema,'output':result,'errors':errors,'navigation':navigation}
    }
    title(){
        const titles = {
            "AccountingDocument":"View Accounting Document",
            "IncomeTaxSimulator":"Income Tax Simulate",
            "AssetRegister":"Asset Register",
            "CustomerRegister":"Customer Register",
            "EmployeeRegister":"Employee Register",
            "MaterialRegister":"Material Register",
            "VendorRegister":"Vendor Register",
            "MasterCollection":"Master Collection"
        }
        return (titles[this.report]);
    }
}

class TransactionQuery{
    constructor(type){
        this.type = type;
    }
    defaults(data){
        let defaults = {};
        return defaults
    }
    interface(data){
        let schema = [];
        let result = {...data};
        let navigation = [];
        let errors = [];
        return {'schema':schema,'errors':errors,'output':result,'navigation':navigation}
    }

}

class Transaction{
    constructor(type){
        this.type = type;
    }
    defaults(data){
        let defaults = {};
        if (Transaction.IntraCompanyTransactions.includes(this.type)){
            defaults = {'Company Code':''};
            if (this.type==='ACOSettlement'){
                defaults = {...defaults,...{'Asset Construction Order':'','Posting Date':'','Asset Value Date':''}}

            }
            if (Transaction.AccountingTypes.includes(this.type)){
                defaults = {
                    'Company Code':'',
                    'Posting Date':'',
                    'Document Date':'',
                    'Year':'',
                    'Reference':'',
                    'Text':'',
                    'Line Items':[{'Debit/ Credit':'Debit','Account Type':'','Account':''}]
                }
                if (['VendorInvoice','VendorCredtiNote'].includes(this.type)){
                    defaults['Vendor Info'] = {"Vendor":"","Presentation":"","Amount":""}
                }
                if (['CustomerInvoice','CustomerCreditNote'].includes(this.type)){
                    defaults['Customer Info'] = {"Customer":"","Presentation":"","Amount":""}
                }
            }
        }
        return defaults;
    }
    interface(data){
        let schema = [];
        let result = {...data};
        let errors = [];
        let navigation = [];
        let necessary = [];
        const lineItemProcess =(data,itemData,i)=>{
            const company = data['Company Code'];
            const accType = itemData['Account Type'];
            const account = itemData['Account'];
            let noteditables = ['Transaction'];
            let blankfields = [];
            const result = {...itemData};
            const errors = [];
            const required = ["Account Type","Account","Amount","Debit/ Credit"];
            let schema = [
                {"name":"Debit/ Credit","datatype":"single","input":"option","options":["Debit","Credit"]},
                {"name":"Account Type","datatype":"single","input":"option","options":["","Asset","Bank Account","Customer","General Ledger","Material","Vendor"]},
                {"name":"Account","datatype":"single","input":"option","options":[""]},
                {"name":"Presentation","datatype":"single","input":"option","options":[""]},
                {"name":"TransactionType","datatype":"single","input":"option","options":[""]},
                {"name":"Amount","datatype":"single","input":"input","type":"number"},
                {"name":"Quantity","datatype":"single","input":"input","type":"number"},
                {"name":"Text","datatype":"single","input":"input","type":"text"},
                {"name":"Cost Center","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'CostCenter').listAll('Code')]},
                {"name":"Location","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'Location').listAll('Code')]},
                {"name":"Plant","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'Plant').listAll('Code')]},
                {"name":"Revenue Center","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'RevenueCenter').listAll('Code')]},
                {"name":"Profit Center","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'ProfitCenter').listAll('Code')]},
                {"name":"HSN","datatype":"single","input":"option","options":["",...new Table('HSN').list]},
                {"name":"Asset Construction Order","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'AssetConstructionOrder').listAll('Code')]},
                {"name":"Maintenance Order","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'MaintenanceOrder').listAll('Code')]},
                {"name":"Process Order","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'ProcessOrder').listAll('Code')]},
                {"name":"Production Order","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'ProductionOrder').listAll('Code')]},
                {"name":"Purchase Order","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'PurchaseOrder').listAll('Code')]},
                {"name":"Sale Order","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'SaleOrder').listAll('Code')]},
                {"name":"Transport Order","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'TransportOrder').listAll('Code')]},
                {"name":"Value Date","datatype":"single","input":"input","type":"date"},
                {"name":"Asset Value Date","datatype":"single","input":"input","type":"date"},
            ];
            if (['VendorInvoice','CustomerInvoice','VendorCreditNote','CustomerCreditNote'].includes(this.type)){
                schema = schema.map(item=>item['name']==="Account Type"?{...item,['options']:["","Asset","Material","General Ledger"]}:item);
                noteditables.push(...['Debit/ Credit']);
                if (['VendorCreditNote','CustomerInvoice'].includes(this.type)){
                    result['Debit/ Credit']="Credit"
                }
            }
            if (["Asset","Bank Account","Customer","Material","Vendor"].includes(accType)){
                const collectionname = {"Asset":"Asset","Bank Account":"BankAccount","Customer":"Customer","Material":"Material","Vendor":"Vendor"};
                schema = schema.map(item=>item['name']==="Account"?{...item,['options']:["",...new CompanyCollection(company,collectionname[itemData['Account Type']]).listAll('Code')]}:item);
            } else if (accType==="General Ledger"){
                schema = schema.map(item=>item['name']==="Account"?{...item,['options']:["",...new CompanyCollection(company,'GeneralLedger').filteredList({'Ledger Type':'General'},'Code'),...new CompanyCollection(company,'GeneralLedger').filteredList({'Ledger Type':'Cost Element'},'Code')]}:item);
            }
            if (!["General Ledger","Material"].includes(accType) ){
                noteditables.push(...["Location","Quantity","Value Date"]);
            };
            if (!['Asset','Material'].includes(accType)){
                blankfields.push(...["Transaction"]);
            };
            if (!(accType==="General Ledger")){
                noteditables.push(...["Cost Center","Revenue Center","Plant","Asset Construction Order","Maintenance Order","Process Order","Production Order","Purchase Order","Sale Order","Transport Order"])
            }
            if (!["Customer","Vendor","General Ledger"].includes(accType) || new CompanyCollection(company,'GeneralLedger').filteredList({'Ledger Type':'Cost Element'},'Code').includes(account)){
                noteditables.push(...["Profit Center"])
            }
            if (!['Customer','Vendor'].includes(accType)){
                noteditables.push(...['Presentation']);
                blankfields.push(...['Presentation']);
            }
            if (accType==="Asset"){
                result['Transaction']="Cost";
                
            }
            schema = schema.map(field=>noteditables.includes(field['name'])?{...field,['noteditable']:true}:field);
            blankfields.map(field=>result[field]="");
            required.map(field=>itemData[field]===""?errors.push(`At line item ${i+1}, ${field} necessary.`):()=>{});
            itemData['Amount']<0?errors.push(`At line item ${i+1}, Amount negative.`):()=>{};
            return {'schema':schema,'output':result,'errors':errors}
        }
        if (Transaction.IntraCompanyTransactions.includes(this.type)){
            const company = data['Company Code'];
            schema = [
                {"name":"Company Code","datatype":"single","input":"option","options":["",...new Collection('Company').listAll('Code')]}
            ];
            necessary.push('Company Code');
            if (this.type==="ACOSettlement" && company !== ""){
                schema.push(...[
                    {"name":"Asset Construction Order", "datatype":"single","input":"option","options":["",...new CompanyCollection(company,'AssetConstructionOrder').listAll('Code')]},
                    {"name":"Posting Date", "datatype":"single","input":"input","type":"date"},
                    {"name":"Asset Value Date", "datatype":"single","input":"input","type":"date"},
                    {"name":"Text", "datatype":"single","input":"input","type":"text"},
                ]);
                necessary.push(...['Asset Construction Order', 'Posting Date','Asset Value Date']);
            }
            if (Transaction.AccountingTypes.includes(this.type)){
                schema = [
                    {"name":"Company Code","datatype":"single","input":"option","options":["",...new Collection('Company').listAll('Code')]},
                    {"name":"Posting Date","datatype":"single","input":"input","type":"date"},
                    {"name":"Year","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Document Date","datatype":"single","input":"input","type":"date"},
                    {"name":"Reference","datatype":"single","input":"input","type":"text"},
                    {"name":"Text","datatype":"single","input":"input","type":"text"},
                    {"name":"Balance","datatype":"single","input":"input","type":"number","noteditable":true},
                ]
                    if (data['Company Code']!==""){
                        !new Company(company).IsPostingOpen(data['Posting Date'])?errors.push(`Posting Period not Open.`):()=>{};
                        if (['VendorInvoice','VendorCreditNote'].includes(this.type)){
                            schema.push({
                                "name":"Vendor Info","datatype":"object","schema":[
                                    {"name":"Vendor","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'Vendor').listAll('Code')]},
                                    {"name":"Presentation","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'GeneralLedger').filteredList({'Ledger Type':'Vendor'},'Code')]},
                                    {"name":"Amount","datatype":"single","input":"input","type":"number"},
                                ]
                            });

                            necessary = ["Vendor","Presentation","Amount"];
                            necessary.map(field=>data['Vendor Info'][field]===""?errors.push(`Vendor ${field} necessary`):()=>{})

                        }
                        if (['CustomerInvoice','CustomerCreditNote'].includes(this.type)){
                            schema.push({
                                "name":"Customer Info","datatype":"object","schema":[
                                    {"name":"Customer","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'Customer').listAll('Code')]},
                                    {"name":"Presentation","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'GeneralLedger').filteredList({'Ledger Type':'Customer'},'Code')]},
                                    {"name":"Amount","datatype":"single","input":"input","type":"number"},
                                ]
                            })
                            necessary = ["Customer","Presentation","Amount"];
                            necessary.map(field=>data['Customer Info'][field]===""?errors.push(`Cusomer Info ${field} necessary`):()=>{})   
                        }
                        schema.push(    
                        {"name":"Line Items","datatype":"collection","schema":data['Line Items'].map((item,i)=>lineItemProcess(data,item,i).schema)}
                        )
                    }
                    if (company!=="" && data['Posting Date']!==""){
                        result['Year'] = new Company(company).PostingYear(data['Posting Date']);
                    }
                result['Balance']=SumFieldIfs(result['Line Items'],'Amount',['Debit/ Credit'],['Debit'])-SumFieldIfs(result['Line Items'],'Amount',['Debit/ Credit'],['Credit']);
                result['Line Items'] = result['Line Items'].map((item,i)=>lineItemProcess(data,item,i).output);
                necessary = ['Company Code','Posting Date','Document Date'];
                necessary.map(field=>data[field]===""?errors.push(`${field} necessary`):()=>{});
                (data['Balance']!==0?errors.push(`Balance not zero`):()=>{});
                data['Line Items'].map((item,i)=>errors.push(...lineItemProcess(data,item,i).errors));
                navigation = [
                    {"name":"POST","type":"action","onClick":()=>alert(new AccountingDocument(data['Company Code'],data['Year']).postDocument(data))}
                ]
            }
        if (Transaction.MaterialTransactions.includes(this.type)){
            schema.push(...[
                {"name":"Value Date","datatype":"single","input":"input","type":"date"},
                {"name":"Plant/ Location","datatype":"single","input":"option","options":[""]},
            ])
        }
        necessary.map(field=>data[field]===""?errors.push(`${field} necessary`):()=>{});
    }

        return {'schema':schema,'output':result,'errors':errors,'navigation':navigation}
    }
    generateAccountingEntry(data,docNo){
        let result = {...data};
        const company = new Company(result['Company Code']);
        result['Year']= company.PostingYear(data['Posting Date']);
        result['Document Number'] = docNo;
        return result
    }
    postAccountingEntries(company,year,listofdata){
        const oldData = Transaction.Accountingdocuments;
        const documentnumberstart = Transaction.NewAccountingDocNo(company,year)
        const newEntries = listofdata.map((data,i)=>this.generateAccountingEntry(data,documentnumberstart+i));
        const newData = [...oldData,...newEntries];
        saveData(newData,'accountingdocuments'); 
        return ('Success!')
    }
    static Accountingdocuments = loadData('accountingdocuments');
    static Accountingdoc(company,year,documentno){
        const database = this.Accountingdocuments;
        const document = database.find(item=>item['Company Code']===company && item['Year']===Number(year) && item['Document Number']===Number(documentno));
        const result = (document!==undefined);
        return {'document':document,'result':result};
    }
    static NewAccountingDocNo(company,year){
        let start = 0;
        do {
            start ++;
        } while (this.Accountingdoc(company,year,start).result);
        return start;
    }
    static AccountingTypes = ['CustomerInvoice','CustomerCreditNote','GeneralAccounting','VendorInvoice','VendorCreditNote'];
    static MaterialTransactions = ['MaterialReceipt','MaterialIssue','MaterialAcceptance','MaterialScrap','MaterialLossInTransit','MaterialReturn']
    static AssetTransactions = ["ACOSettlement","AssetScrap","AssetDisposal","Depreciation","AssetRevaluation"];
    static IntraCompanyTransactions = [...this.MaterialTransactions,...this.AssetTransactions,'CustomerInvoice','CustomerCreditNote','CustomerClearing','CustomerPayment',"Depreciation","GeneralAccounting",'Salary','VendorInvoice','VendorCreditNote','VendorClearing','VendorPayment',];
    static titles = {
        "ACOSettlement":"ACO Settlement",
        "AssetRevaluation":"Asset Revaluation",
        "Depreciation":"Depreciation",
        "AssetScrap":"Asset Scrap",
        "AssetDisposal":"Asset Disposal",
        "CustomerClearing":"Customer Clearing",
        "CustomerCreditNote":"Customer Credit Note",
        "CustomerInvoice":"Customer Invoice",
        "CustomerPayment":"Customer Payment",
        "GeneralAccounting":"General Accounting",
        "MaterialAcceptance":"Material Acceptance",
        "MaterialIssue":"Material Issue",
        "MaterialLossInTransit":"Material Loss in Transit",
        "MaterialReceipt":"Material Receipt",
        "MaterialReturn":"Material Return",
        "MaterialScrap":"Material Scrap",
        "Salary":"Salary",
        "VendorClearing":"Vendor Clearing",
        "VendorCreditNote":"Vendor Credit Note",
        "VendorInvoice":"Vendor Invoice",
        "VendorPayment":"Vendor Payment"
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
                    <input type={field['type']} maxLength={field['maxLength']} placeholder={field['placeholder']} onChange={(e)=>handleChange(e)} value={output[field['name']]} max={field['max']} min={field['min']} step={field['step']}/>}
                {(field['input']=="option" && !field['noteditable']) && 
                    <select onChange={(e)=>handleChange(e)} value={output[field['name']]}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}
            </div>
        </div>
    )
}

function ObjectInput({field,setdata,output}){
    const handleChange=(subfield,e)=>{
        const {value} = e.target;
        setdata(prevdata=>({
            ...prevdata,[field['name']]:{...prevdata[field['name']],[subfield]:value}
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
                <div className='displayObjectHead'><label>{field['name']}</label><button onClick={()=>addItem()}>+</button></div>
                <div className='displayList'>
                    {output[field['name']].length>0 && output[field['name']].map((item,i)=>
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

function CollectionInput({field,output,setdata,defaults}){

    function handleChange(subfield,index,e){
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:prevdata[field['name']].map((item,i)=>(i===index)?{...item,[subfield]:value}:item)
        }))
    }

    function addItem(){
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:[...prevdata[field['name']],defaults[field['name']][0]]
        }))
    }

    function removeItem(index){
        setdata(prevdata=>({
            ...prevdata,
            [field['name']]:prevdata[field['name']].filter((item,i)=>i!==index)
        }))   
    }

    return (
        <div className='displayField'>
            <div className='displayObject'>
                <div className='displayObjectHead'>
                    <label>{field['name']}</label>
                        <div className='displayObjectButtons'>
                            {!field['noteditable'] && <button className="blue" onClick={()=>addItem()}>Add</button>}
                        </div>
                </div>
                
                <div className='displayTable'>
                    {field['schema'].length>0 && <table>
                        <thead>
                            <tr>
                                {!field['noteditable'] && <th className='displayTableCell'></th>}
                                {field['schema'][0].map(subfield=><th className='displayTableCell'>{subfield['name']}</th>)}</tr>
                        </thead>
                        {output[field['name']].map((item,index)=>
                            <tbody>
                                <tr>
                                    {!field['noteditable'] && <td className='displayTableCell'><button onClick={()=>removeItem(index)}>-</button></td>}
                                    {field['schema'][index].map(subfield=>
                                        <>{subfield['datatype']=="single" && 
                                            <td className='displayTableCell'>
                                                {subfield['noteditable'] && <input disabled value={output[field['name']][index][subfield['name']]}/>}
                                                {(subfield['input']=="input" && !subfield['noteditable'])&& <input onChange={(e)=>handleChange(subfield['name'],index,e)} type={subfield['type']} placeholder={subfield['placeholder']} value={output[field['name']][index][subfield['name']]} maxLength={subfield['maxLength']}/>}
                                                {(subfield['input']=="option"&& !subfield['noteditable']) && <select onChange={(e)=>handleChange(subfield['name'],index,e)} value={output[field['name']][index][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}
                                            </td>}
                                        </>)}
                                </tr>
                            </tbody>)}
                    </table>}
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
                <div className='displayObjectHead'>
                    <label>{field['name']}</label>
                    <div className='displayObjectButtons'>
                        <button onClick={()=>addCollection()}>Add</button>
                    </div>
                </div>
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
                                <div className='displayObjectHead'>
                                    <label>{subfield['name']}</label>
                                    <div className='displayObjectButtons'>
                                        <button onClick={()=>addNest(index,subfield['name'])}>+</button>
                                    </div>
                                </div>
                                <div className='displayTable'>
                                    {subfield['schema'].length>0 && <table>
                                        <thead>
                                            <tr><th className='displayTableCell'></th>{subfield['schema'][0].map(subsubfield=><th className='displayTableCell'>{subsubfield['name']}</th>)}</tr>
                                        </thead>
                                        <tbody>{output[field['name']][index][subfield['name']].map((subitem,subindex)=>
                                            <tr>
                                                <td><div className='displayTableCell'><button onClick={()=>removeNest(index,subfield['name'],subindex)}>-</button></div></td>
                                                {subfield['schema'][subindex].map(subsubfield=>
                                                <td>
                                                    <div className='displayTableCell'>
                                                        {subsubfield['input']==='input' && <input value={output[field['name']][index][subfield['name']][subindex][subsubfield['name']]} onChange={(e)=>nestChange(index,subfield['name'],subindex,subsubfield['name'],e)} type={subsubfield['type']}/>}
                                                        {subsubfield['input']==='option' && <select value={output[field['name']][index][subfield['name']][subindex][subsubfield['name']]} onChange={(e)=>nestChange(index,subfield['name'],subindex,subsubfield['name'],e)}>{subsubfield['options'].map(option=><option value={option}>{option}</option>)}</select>}
                                                        </div>
                                                </td>)}
                                            </tr>)}
                                        </tbody>
                                    </table>}
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

const TableInput = ({schema,data,setdata,defaults,editable})=>{
    const handleChange= (i,field,e)=>{
        const {value} = e.target;
        setdata(prevdata=>prevdata.map((item,index)=>(i==index)?{...item,[field]:value}:item))
    }
    
    const addRow = () =>{
        setdata(prevdata=>([...prevdata,defaults[0]]))
    }
    const removeRow = (i) =>{
        setdata(prevdata=>prevdata.filter((item,index)=>i!=index))
    }
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
                                    {editable && <td className='displayTableCell'><button onClick={()=>removeRow(i)}>-</button></td>}
                                    {schema.map(field=><td className='displayTableCell'>
                                        {editable && <>
                                        {field['input']=="input" && <input value={item[field['name']]} onChange={(e)=>handleChange(i,field['name'],e)} maxLength={field['maxLength']}/>}
                                        {field['input']=='option' && <select value={item[field['name']]} onChange={(e)=>handleChange(i,field['name'],e)}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}
                                        </>}
                                        {!editable && <input disabled value={item[field['name']]}/>}
                                    </td>)}
                                </tr>
                            )}
                        </tbody>
                    </table>
            {editable && <div className='tableButtons'><button onClick={()=>addRow()}>+</button></div>}
        </div>
    )
}

const DropDown = ({options,onSelect})=>{
    const [isOpen,setIsOpen] = useState(false);
    const [selectedOption,setselectedOption] = useState(null);
    const toggleDropDown = ()=>{
        setIsOpen(!isOpen);
    }
    const handleOptionClick = (option) =>{
        setselectedOption(option);
        onSelect(option);
        setIsOpen(false);
    }

    return (
        <div className='dropDown'>
            <div className='dropDownHead' onClick={()=>toggleDropDown()}>
                {selectedOption? selectedOption.value : 'Select'}
                {isOpen? <FaChevronUp />: <FaChevronDown className='dropArrow'/>}
            </div>
            {isOpen && (
                <div className='dropDownList'>
                    {options.map(option=>(
                        <label key={option.value} onClick={()=>handleOptionClick(option)}>{option.label}</label>
                    ))}
                </div>
            )}
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
            <div className="left">
                <button onClick={toggleCollapse} aria-expanded={isOpen}>{isOpen && <>{`${title} `}<FaChevronUp/></>}{!isOpen && <>{`${title} `}<FaChevronDown/></>}</button>
            </div>  
            <div ref={contentRef} style={{maxHeight: isOpen ? `${contentRef.current.scrollHeight}px` : '0',overflow: 'hidden',transition: 'max-height 0.3s ease-in-out',}}>
            {children}
            </div>
        </div>
      );
};

function DisplayAsTable({collection}){

    if (collection.length!=0){
    const allfields = [];
    collection.map(item=>allfields.push(...Object.keys(item)));
    const fields = [...new Set(allfields)];
    const CSV = ()=>{
        Operations.downloadCSV(collection,'Table')
    }
    return (
        <div className='displayField'>
            <div className='displayTable'>
                <table>
                    <thead><tr>{fields.map(field=><th className='displayTableCell'>{field}</th>)}</tr></thead>
                    <tbody>{collection.map(data=><tr>{fields.map(field=><td className='displayTableCell'>{data[field]}</td>)}</tr>)}</tbody>
                </table>
            </div>
            <div className='left'><button onClick={()=>CSV()}>&darr; CSV</button></div>
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

function JsonFileReader(){
    const [jsonData,setJsonData] = useState(null);
    const [error,setError] = useState(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) =>{
                try {
                    const content = e.target.result;
                    const parsedData = JSON.parse(content);
                    setJsonData(parsedData);
                    setError(null);
                } catch (err){
                    setError('Error parsing JSON file. Please ensure it is a valid JSON format');
                    setJsonData(null);
                }
            }
            reader.onerror=()=>{
                setError('Error reading the File');
                setJsonData(null);
            }
            reader.readAsText(file);
        } else {
            setJsonData(null);
            setError("No file selected.");
        }
    }

    return (
        <div>
            <input type="file" accept=".json" onChange={handleFileChange}/>
            {error && <p style={{color:'red'}}>{error}</p>}
            {jsonData && (
                <div>
                    <h3>JSON Data: </h3>
                    <pre>{JSON.stringify(jsonData,null,2)}</pre>
                </div>
            )}
        </div>
    )
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
    static AccountTypes = ["Asset","Asset Group","Asset Development","Bank Account","Cost Center","Cost Object","Customer","Employee","Location","Material","Organisational Unit","Profit Center","Purchase Order","Sale Order","Service","Vendor",];
    static PostingAccounts = ["Asset","Asset Development","Bank Account","Customer","General Ledger","Material","Service","Vendor"];
    static GeneralLedgerGroups = ["Asset","Liability","Equity","Income","Expense"];
    static LedgerTypes = ["Asset","Bank Account","Cost Element","Customer","General","Depreciation","Material","Vendor"];
    static Numbering = ["Asset","AssetConstructionOrder","BankAccount","CostCenter","Customer","Employee","Location","MaintenanceOrder","Material","Plant","ProcessOrder","ProductionOrder","ProfitCenter","PurchaseOrder","RevenueCenter","SaleOrder","Service","TransportOrder","Vendor"];
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
    register(){
        const data = this.load();
        let fields = FieldsInCollection(data);
        data.map(item=>fields.map(field=>typeof(item[field])==='object'?fields=fields.filter(f=>f!==field):()=>{}))
        const trimmedData = TrimCollection(data,fields);
        return trimmedData;
    }
    listAll(key){
        return ListItems(this.load(),key)
    }
    filtered(data){
        const collection = this.load();
        const fields = Object.keys(data);
        let filtered = collection;
            for (let i = 0; i<fields.length;i++){
                filtered = singleFilter(filtered,fields[i],data[fields[i]])
            }
        return filtered;
    }
    filteredList(data,key){
        const filtered = this.filtered(data);
        return ListItems(filtered,key); 
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
        if (this.method==="Create"){
            switch (this.name){
                case 'Asset':
                    defaults = {
                        "Company Code":"",
                        "Code":"",
                        "Description":"",
                        "Asset Group":"",
                        "Asset Group Description":"",
                        "Organisational Assignment":[
                            {"From":'',"To":'',"Type":"CostCenter","Assignment":''}
                        ],
                        "Date of Capitalisation":"",
                        "Depreciation Method":"Straight Line",
                        "Depreciation Rate":"",
                        "Useful Life":0,
                        "Salvage Value":0,
                        "Status":"Draft"
                    }
                    break
                case 'AssetGroup':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Description":"",
                        "Depreciable":"Yes",
                        "General Ledger - Asset":"",
                        "General Ledger - Depreciation":"",
                        "General Ledger - Accumulated Depreciation":"",
                        "General Ledger - Gain on Disposal":"",
                        "General Ledger - Loss on Disposal":"",
                        "General Ledger - Loss on Retirement":"",
                        "Status":"Draft"
                    }
                    break
                case 'AssetConstructionOrder':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Description":"",
                        "Settlement":[
                            {"Receiver":"","Percentage":""}
                        ],
                        "Status":"Draft"
                    }
                    break
                case 'Attendance':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Year":data['Year'],
                        "Month":data['Month'],
                        "Employee":data['Employee'],
                        "Attendance":datesInMonth(data['Year'],data['Month']).map(item=>({'Date':item,'Status':'Present','Remarks':''}))
                    }
                    break
                case 'BankAccount':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Description":"",
                        "Bank Name":"",
                        "Address":"",
                        "Postal Code":"",
                        "State":"",
                        "Account":"",
                        "SWIFT Code":"",
                        "General Ledger":"",
                        "Business Place":"",
                        "Profit Center":"",
                        "Currency":"",
                        "Post Forex":"Yes",
                        "Interest Code":"",
                        "Interest Calculation":"Account Balance",
                        "Post Interest":"",
                        "Interest Rate":[{"From":"","To":"","Rate":"","Debit":"Yes","Credit":"Yes"}],
                        "Virtual Accounts":[{"Virtual Account Number":"","Customer":"","Presentation":"","Profit Center":""}],
                        "Groups":[],
                        "Status":"Draft"
                    }
                    break
                case 'ChartOfAccounts':
                    defaults = {
                        "Code":"",
                        "Description":"",
                        "General Ledger Numbering":['Equity','Liability','Asset','Income','Expense'].map(item=>({"Group":item,"From":"","To":""})),
                        "Status":"Draft"
                    }
                    break
                case 'Company':
                    defaults = {
                        "Code":"",
                        "Name":"",
                        "Registered Address":"",
                        "Postal Code":"",
                        "Permanent Account Number":"",
                        "Corporate Identification Number":"",
                        "Places of Business":[{"Place":"","Address":"","Postal Code":"","State":"Kerala", "GSTIN":"","Phone":"","Email":""}],
                        "Functional Currency":"",
                        "Year Zero":"",
                        "Financial Year Beginning":"",
                        "Chart of Accounts":"",
                        "Group Chart of Accounts":"", 
                        "Status":"Draft"                       
                    }
                    break
                case 'CostCenter':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Description":"",
                        "Profit Center":"",
                        "Business Place":"",
                        "Allocation Ratio":[
                            {"From":"","To":"","Ratio":[
                                {"Type":"","To":"","Percentage":0}
                            ]}
                        ],
                        "Status":"Draft"
                    }
                    break
                case 'Customer':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Name":"",
                        "PAN":"",
                        "GSTIN":"",
                        "Address":"",
                        "Postal Code":"",
                        "State":"",
                        "Phone":"",
                        "Email":"",
                        "Payment Terms":"",
                        "Bank Accounts":[{"Ref Id":"","Bank Name":"","IFSC":"","Account":"","Confirm Account":""}],
                        "Groups":[""],
                        "Status":"Draft"
                    }
                    break
                case 'Customisation':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Numbering":KB.Numbering.map(item=>({"Item":item,"From":"","To":""}))
                    };
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
                case 'FinancialStatement':
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
                        "Description":"",
                        "Ledger Type":"General Ledger",
                        "Group":"Expense",
                        "Cost Element":"No",
                        "Allow Manual Entry":"Yes",
                        "Currency":"",
                        "Post Forex":"Yes",
                        "Post Interest":"Yes",
                        "Group Chart of Accounts":new Company(data['Company Code']).data['Group Chart of Accounts'],
                        "Group General Ledger":"",
                    }
                    break
                case 'GroupChartOfAccounts':
                    defaults = {
                        "Code":"",
                        "General Ledger Numbering":KB.GeneralLedgerGroups.map(item=>({"Group":item,"From":"","To":""})),
                    }
                    break
                case 'GroupGeneralLedger':
                    defaults = {
                        "Code":"",
                        "Description":"",
                        "Chart of Accounts":data['Chart of Accounts'],
                        "Group":"Expense"
                    };
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
                                "Marginal Relief":"Yes",
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
                        "Description":"",
                        "Profit Center":"",
                        "Business Place":"",
                        "Cost Distribution":[
                            {"From":"","To":"","Ratio":[
                                {"Material":"","Multiplier":"","Remarks":""}
                            ]}
                        ],
                        "Status":""
                    }
                    break
                case 'MaintenanceOrder':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Organisational Unit":"",
                        "Status":"",
                        "Type of Activity":"",
                        "Date of Maintenance":"",
                        "Period From":"",
                        "Period To":""
                    }
                    break
                case 'Material':
                    defaults = {
                        "Code":"",
                        "Company Code": data['Company Code'],
                        "Description":"",
                        "Unit":"",
                        "Material Group":"",
                        "Price":[
                            {"Location":"","From":"","To":"","Price":""}
                        ],
                    }
                    break
                case 'MaterialGroup':
                    defaults = {
                        "Code":"",
                        "Company Code": data['Company Code'],
                        "Description":"",
                        "General Ledger - Material":"",
                        "General Ledger - Revenue":"",
                        "General Ledger - Cost of Sales":"",
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
                case 'Plant':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Description":"",
                        "Profit Center":"",
                        "Business Place":"",
                        "Allocation Ratio":[
                            {"From":"","To":"","Ratio":[
                                {"To":"","Percentage":""}
                            ]}
                        ],
                        "Status":"Draft",
                    };
                    break
                case 'ProfitCenter':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Segment":"",
                        "Description":"",
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
                case 'RevenueCenter':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Description":"",
                        "Profit Center":"",
                        "Business Place":"",
                        "Allocation Ratio":[
                            {"From":"","To":"","Ratio":[
                                {"Type":"","To":"","Percentage":0}
                            ]}
                        ],
                        "Status":"Draft"
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
                        "PAN":"",
                        "GSTIN":"",
                        "Address":"",
                        "Postal Code":"",
                        "State":"",
                        "Phone":"",
                        "Email":"",
                        "Payment Terms":"",
                        "Bank Accounts":[{"Ref Id":"","Bank Name":"","IFSC":"","Account":"","Confirm Account":""}],
                        "Groups":[""],
                        "Status":"Draft"
                    }
                    break
                
            }
        } else if (this.method=="Update" || this.method =="Display") {
            defaults = this.getData(data);
        }
        return defaults
    }
    process(data){
        let result = {...data};
        if (this.name==="Asset"){
            if (result['Company Code']!=="" && result['Asset Group']!==""){
                const assetgroup = new AssetGroup(result['Asset Group'],result['Company Code']);
                const depreciable = assetgroup.data['Depreciable']==="Yes";
                result['Depreciable'] = assetgroup.data['Depreciable'];
                if (!depreciable){result['Depreciation Method']=""}
                result['Asset Group Description'] = assetgroup.data['Description'];
        }
    } else if (this.name==="AssetGroup"){
        if (result['Depreciable']==="No"){
            result ===setBlank(result,['General Ledger - Depreciation', 'General Ledger - Accumulated Depreciation'])
        }
    }
        return result;
    }
    schema(data){
        let schema = [];
        if (this.name==="Asset"){
            if (data['Company Code']!=="" && data['Asset Group']!==""){
                const depreciable = data['Depreciable']==="Yes";
                schema = [
                {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                {"name":"Asset Group","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'AssetGroup').listAll('Code')],"noteditable":!this.editable},
                {"name":"Asset Group Description","datatype":"single","noteditable":true},
                {"name":"Depreciable","datatype":"single","noteditable":true},
                {"name":"Date of Capitalisation","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                {"name":"Organisational Assignment", "datatype":"collection","noteditable":!this.editable, "schema":data['Organisational Assignment'].map(item=>[
                    {"name":"From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"To","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {'name':'Type','datatype':'single','input':'option','options':["CostCenter","Location","Plant","RevenueCenter"],'noteditable':!this.editable},
                    {'name':'Assignment','datatype':'single','input':'option','options':["",...new CompanyCollection(data['Company Code'],item['Type']).listAll('Code')],'noteditable':!this.editable}
                ])},
                {"name":"Depreciation Method","datatype":"single","input":"option","options":["","Straight Line","Reducing Balance"],"noteditable":(!this.editable || !depreciable)},
                {"name":"Depreciation Rate","datatype":"single","input":"input","type":"number","noteditable":(!this.editable || data['Depreciation Method']!="Reducing Balance" || !depreciable)},
                {"name":"Useful Life","datatype":"single","input":"input","type":"number","noteditable":(!this.editable || data['Depreciation Method']!="Straight Line" || !depreciable)},
                {"name":"Salvage Value","datatype":"single","input":"input","type":"number","noteditable":(!this.editable || data['Depreciation Method']!="Straight Line" || !depreciable)},
                {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"]}
            ];
            } else {
                schema = [
                    {"name":"Company Code","datatype":"single","input":"option","options":["",...new Collection('Company').listAll('Code')],"noteditable":false},
                    {"name":"Asset Group","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'AssetGroup').listAll('Code')],"noteditable":false},
                ]
            }
        } else if (this.name==="AssetGroup"){
            schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create"), 'maxLength':6},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!(this.editable)},
                    {"name":"Depreciable","datatype":"single","input":"option","options":["Yes","No"],"noteditable":!(this.method=="Create")},
                    {"name":"General Ledger - Asset","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'Asset'},'Code')],"noteditable":(this.method!="Create")},
                    {"name":"General Ledger - Depreciation","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'Depreciation'},'Code')],"noteditable":!(data['Depreciable']==="Yes" && this.method==="Create")},
                    {"name":"General Ledger - Accumulated Depreciation","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'General'},'Code')],"noteditable":!(data['Depreciable']==="Yes" && this.method==="Create")},
                    {"name":"General Ledger - Gain on Disposal","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'General'},'Code')],"noteditable":!(this.method=="Create")},
                    {"name":"General Ledger - Loss on Disposal","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'General'},'Code')],"noteditable":!(this.method=="Create")},
                    {"name":"General Ledger - Loss on Retirement","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'General'},'Code')],"noteditable":!(this.method=="Create")},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!(this.editable)}
                ];
        } else if (this.name==="AssetConstructionOrder"){
            schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!(this.editable)},
                    {"name":"Settlement","datatype":"collection","noteditable":!this.editable,"schema":data['Settlement'].map(item=>[
                        {'name':'Asset','datatype':'single','input':'option','options':['',...new CompanyCollection(data['Company Code'],'Asset').listAll('Code')],'noteditable':!this.editable},
                        {'name':'Description','datatype':'single','noteditable':true},
                        {"name":"Percentage","datatype":"single","input":"input","type":"number","noteditable":!(this.editable)},
                    ])},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Completed"],"noteditable":!this.editable},
                ];
        }
        return schema;
    }
    errors(data){
        let errors = [];
        if (this.name==="Asset"){
            errors.push(
                ...blankError(data,['Asset Group','Date of Capitalisation','Description','Code',]),
                ...maxError('Depreciation Rate',data['Depreciation Rate'],100),
                ...negativeError(data,['Useful Life','Salvage Value','Depreciation Rate']),
                ...timeSeriesError('Organisational Assignment',data['Organisational Assignment'],'From','To'),
                ...collectionError('Organisational Assignment',data['Organisational Assignment'],['Assignment'])
            );
            if (data['Depreciation Method']==="Straight Line"){
                errors.push(...blankError(data,['Useful Life','Salvage Value']));
            } else if (data['Depreciation Method']==="Reducing Balance") {
                errors.push(...blankError(data,['Depreciation Rate']));
            };
        } else if (this.name==="AssetGroup"){
            errors.push(
                ...blankError(data,['Code','Description','General Ledger - Asset','General Ledger - Gain on Disposal','General Ledger - Loss on Disposal', 'General Ledger - Loss on Retirement'])
            );
            if (data['Depreciable']==='Yes'){
                errors.push(
                    ...blankError(data,['General Ledger - Depreciation', 'General Ledger - Accumulated Depreciation'])
                );
            }
        }
        return errors;
    }
    navigation(data){
        const errors = this.errors(data).length;
        let navigation = [
            {"name":"Export","type":"action","onClick":()=>Operations.downloadJSON(result,'Collection'),'refresh':false},
            {"name":"Back","type":"navigate","url":'/control','state':{},'refresh':true},
            {"name":"Save","type":"action","onClick":()=>alert(this.save(data)), 'refresh':errors.length===0},
        ];
        if (this.method==="Display"){
            navigation = navigation.filter(item=>item['name']!=="Save");
        }
        return navigation;
    }
    interface(data){
        let result = this.process(data);
        let schema= this.schema(result);
        let errors = this.errors(result);
        let navigation = this.navigation(data);
        const list = [];
        let mandatory = Collection.mandatory[this.name];
        const nonNegatives = [];
        switch (this.name){
            case 'AssetConstructionOrder':
                //errors:
                (SumField(data['Settlement'],'Percentage')>100?list.push(`Total of settlement percentage cannot be more than 100`):()=>{});
                data['Settlement'].forEach((ratio,i)=>{
                    const errorText = `At settlement receiver ${i+1},`
                    if (ratio['Percentage']<0){
                        list.push(`${errorText} percentage is negative.`)
                    }
                    if (ratio['Asset']===""){
                        list.push(`${errorText} receiver asset necessary.`)
                    }
                });
                //processing
                result['Settlement'] = result['Settlement'].map(item=>(item['Asset']!==""&& result['Company Code']!=="")?{...item,['Description']:new Asset(item['Asset'],result['Company Code']).data['Description']}:item);
                break
            case 'Attendance':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Employee","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Year","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Month","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Attendance","datatype":"collection","noteditable":true,"schema":data['Attendance'].map(item=>[
                        {"name":"Date","datatype":"single","input":"input","type":"date","noteditable":true},
                        {"name":"Status","datatype":"single","input":"option","options":["Present","Leave","Absent"],"noteditable":!this.editable},
                        {"name":"Remarks","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    ])}
                ]
                break
            case 'BankAccount':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!this.method=="Create"},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Bank Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Address","datatype":"single","input":"input","type":"textarea","noteditable":!this.editable},
                    {"name":"Postal Code","datatype":"single","input":"input","type":"textarea","noteditable":!this.editable},
                    {"name":"State","datatype":"single","input":"option","options":["",...KB.States,...KB.UTs],"noteditable":!this.editable},
                    {"name":"SWIFT Code","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Account","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"General Ledger","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'Bank Account'},'Code')],"noteditable":(!this.method=="Create")},
                    {"name":"Business Place","datatype":"single","input":"option","options":["",...new Company(data['Company Code']).BusinessPlaces],"noteditable":!this.editable},
                    {"name":"Profit Center","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'ProfitCenter').listAll('Code')],"noteditable":(!this.method=="Create")},
                    {"name":"Currency","datatype":"single","input":"option","options":["",...new Table('Currencies').list],"noteditable":!this.editable},
                    {"name":"Post Forex","datatype":"single","input":"option","options":["Yes","No"],"noteditable":!this.editable},
                    {"name":"Post Interest","datatype":"single","input":"option","options":["Yes","No"],"noteditable":!this.editable},
                    {"name":"Interest Code","datatype":"single","input":"option","options":[""],"noteditable":!this.editable},
                    {"name":"Interest Rate","datatype":"collection","noteditable":!this.editable, "schema":data['Interest Rate'].map(item=>[
                        {"name":"From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"To","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"Rate","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"Debit","datatype":"single","input":"option","options":["Yes","No"],"noteditable":!this.editable},
                        {"name":"Credit","datatype":"single","input":"option","options":["Yes","No"],"noteditable":!this.editable},
                    ])},
                    {"name":"Virtual Accounts","datatype":"collection","noteditable":!this.editable,"schema":data['Virtual Accounts'].map(item=>[
                        {"name":"Virtual Account Number","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Customer","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'Customer').listAll('Code')],"noteditable":!this.editable},
                        {"name":"Presentation","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'Customer'},'Code')],"noteditable":!this.editable},
                        {"name":"Profit Center","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'ProfitCenter').listAll('Code')],"noteditable":!this.editable},
                    ])},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!this.editable}
                ]
                break
            case 'ChartOfAccounts':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","maxLength":4,"type":"text","noteditable":!(this.method=="Create")},
                    {"name":"General Ledger Numbering","datatype":"collection","noteditable":true,"schema":data['General Ledger Numbering'].map(item=>[
                        {"name":"Group","datatype":"single","input":"input","type":"text","noteditable":true},
                        {"name":"From","input":"input","datatype":"single","type":"number","noteditable":!(this.method=="Create")},
                        {"name":"To","input":"input","datatype":"single","type":"number","noteditable":!(this.method=="Create")},        
                    ])},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!this.editable}
                ]
                break
            case 'Company':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","maxLength":4,"type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Address","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Postal Code","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"Permanent Account Number","datatype":"single","input":"input","type":"text","maxLength":10,"noteditable":!this.editable},
                    {"name":"Corporate Identification Number","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Places of Business","datatype":"collection","noteditable":!this.editable,"schema":data['Places of Business'].map(item=>[
                        {"name":"Place","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"State","input":"option","datatype":"single","options":["",...KB.States,...KB.UTs],"noteditable":!this.editable},    
                        {"name":"GSTIN","input":"input","datatype":"single","type":"text","maxLength":15,"noteditable":!this.editable},    
                    ])},
                    {"name":"Functional Currency","datatype":"single","input":"option","options":["",...new Table('Currencies').list],"noteditable":!(this.method=="Create")},
                    {"name":"Year Zero","datatype":"single","input":"input","type":"number","maxLength":4,"noteditable":!(this.method=="Create")},
                    {"name":"Financial Year Beginning","datatype":"single","input":"option","options":["","01","02","03","04","05","06","07","08","09","10","11","12"],"noteditable":!(this.method=="Create")},
                    {"name":"Chart of Accounts","datatype":"single","input":"option","options":["",...new Collection('ChartOfAccounts').listAll('Code')],"noteditable":!(this.method=="Create")},
                    {"name":"Group Chart of Accounts","datatype":"single","input":"option","options":["",...new Collection('GroupChartOfAccounts').listAll('Code')],"noteditable":!(this.method=="Create")},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!this.editable}
                ];
                break
            case 'CostCenter':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Profit Center","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'ProfitCenter').listAll('Code')],"noteditable":(!this.method=="Create")},
                    {"name":"Business Place","datatype":"single","input":"option","options":["",...new Company(data['Company Code']).BusinessPlaces],"noteditable":!this.editable},
                    {"name":"Allocation Ratio","datatype":"nest","noteditable":!this.editable,"schema":data['Allocation Ratio'].map(item=>[
                        {"name":"From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"To","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"Ratio","datatype":"collection","noteditable":!this.editable,"schema":item['Ratio'].map((subitem,i)=>[
                            {"name":"Type","datatype":"single","input":"option","options":["","CostCenter","Location","Plant","RevenueCenter","AssetConstructionOrder","MaintenanceOrder","ProcessOrder","ProductionOrder","PurchaseOrder","SaleOrder","TransportOrder"],"noteditable":!this.editable},
                            {"name":"To","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],subitem['Type']).listAll('Code')],"noteditable":!this.editable},
                            {"name":"Percentage","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        ])},
                    ])},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!this.editable}
                ]
                break
            case 'Customer':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Address","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"PAN","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"GSTIN","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Postal Code","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"State","datatype":"single","input":"option","options":["",...KB.States,...KB.UTs],"noteditable":!this.editable},
                    {"name":"Phone","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"Email","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Payment Terms","datatype":"single","input":"option","options":["",...new Collection('PaymentTerms').listAll('Code')],"noteditable":!this.editable},
                    {"name":"Bank Accounts","datatype":"collection","noteditable":!this.editable,"schema":data['Bank Accounts'].map(item=>[
                        {"name":"Ref ID","datatype":"single","input":"input","type":"text","noteditable":!this.editable, "maxLength":4},
                        {"name":"Bank Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},   
                        {"name":"IFSC","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Account","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Confirm Account","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    ])},
                    {"name":"Groups","datatype":"list","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!this.editable}
                ]
                break
            case 'Customisation':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Numbering","datatype":"collection","noteditable":true,"schema":data['Numbering'].map(item=>[
                        {"name":"Item","datatype":"single","input":"input","type":"text","noteditable":true},
                        {"name":"From","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        {"name":"To","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    ])},
                ];
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
            case 'FinancialStatement':
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
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Group","datatype":"single","input":"option","options":["Asset","Liability","Equity","Income","Expense"],"noteditable":!this.editable},
                    {"name":"Ledger Type","datatype":"single","input":"option","options":["Asset","Bank Account","Customer","Material","General Ledger","Vendor"],"noteditable":!this.editable},
                    {"name":"Cost Element","datatype":"single","input":"option","options":["Yes","No"], "noteditable":(this.method!=='Create' || data['Ledger Type']!=="General Ledger")},
                    {"name":"Allow Manual Entry","datatype":"single","input":"option","options":["Yes","No"], "noteditable":(this.method!=='Create' || ["Asset","Material","Customer","Vendor","Bank Account"].includes(data['Ledger Type']))},
                    {"name":"Currency","datatype":"single","input":"option","options":["",...new Table('Currencies').list], "noteditable":(this.method!=='Create')},
                    {"name":"Post Forex","datatype":"single","input":"option","options":["Yes","No"], "noteditable":(!this.editable)},
                    {"name":"Post Interest","datatype":"single","input":"option","options":["Yes","No"], "noteditable":(!this.editable)},
                    {"name":"Group Chart of Accounts","datatype":"single","input":"option","options":[""],"noteditable":true},
                    {"name":"Group General Ledger", "datatype":"single","input":"option","options":[""],"noteditable":!this.editable},
                ];
                // Errors
                (data['Code']!="" && data["Group"]!="" && !valueInRange(data['Code'],new ChartOfAccounts(data['Company Code']).range(data['Group'])))?list.push(`General Ledger code ${data['Code']} not in range for ${data['Group']} ${JSON.stringify(new ChartOfAccounts(data['Company Code']).range(data['Group']))}`):()=>{};
                break
            case 'GroupChartOfAccounts':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","maxLength":5,"type":"text","noteditable":!(this.method=="Create")},
                    {"name":"General Ledger Numbering","datatype":"collection","noteditable":true,"schema":data['General Ledger Numbering'].map(item=>[
                        {"name":"Group","datatype":"single","input":"input","type":"text","noteditable":true},
                        {"name":"From","input":"input","datatype":"single","type":"number","noteditable":!(this.method=="Create")},
                        {"name":"To","input":"input","datatype":"single","type":"number","noteditable":!(this.method=="Create")},        
                    ])},
                ]
                break
            case 'GroupGeneralLedger':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Chart of Accounts","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Group","datatype":"single","input":"option","options":["Asset","Liability","Equity","Income","Expense"],"noteditable":!this.editable},
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
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Profit Center","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'ProfitCenter').listAll('Code')],"noteditable":(!this.method=="Create")},
                    {"name":"Business Place","datatype":"single","input":"option","options":["",...new Company(data['Company Code']).BusinessPlaces],"noteditable":!this.editable},
                    {"name":"Cost Distribution","datatype":"nest","noteditable":!this.editable,"schema":data['Cost Distribution'].map(item=>[
                        {"name":"From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"To","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"Ratio","datatype":"collection","noteditable":!this.editable,"schema":item['Ratio'].map((subitem,i)=>[
                            {"name":"Material","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'Material').listAll('Code')],"noteditable":!this.editable},
                            {"name":"Multiplier","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                            {"name":"Remarks","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        ])},
                    ])},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!this.editable}
                ]
                break
            case 'MaintenanceOrder':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Cost Center","datatype":"single","input":"option","options":["", ...new CompanyCollection(data['Company Code'],'CostCenter').listAll('Code')], 'noteditable':!this.editable},
                    {"name":"Status","datatype":"single","input":"option","options":["","Draft","Ready","Completed"],"noteditable":!this.editable},
                    {"name":"Organisational Unit","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'CostCenter').listAll('Code'),...new CompanyCollection(data['Company Code'],'Plant').listAll('Code'),...new CompanyCollection(data['Company Code'],'Location').listAll('Code'),...new CompanyCollection(data['Company Code'],'RevenueCenter').listAll('Code')],"noteditable":!this.editable},
                    {"name":"Type of Activity","datatype":"single","input":"option","options":["","Period","Time Point"],"noteditable":!this.editable},
                    {"name":"Date of Maintenance","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Period From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Period To","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                ]
                break
            case 'Material':
                schema = [
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Unit","datatype":"single","input":"option","options":["",...new Table('Units').list],"noteditable":!this.editable},
                    {"name":"Material Group","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'MaterialGroup').listAll('Code')],"noteditable":!this.editable},
                    {"name":"Price","datatype":"collection","noteditable":!this.editable, "schema":data['Price'].map(item=>[
                        {"name":"Location","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'Location').listAll('Code')],"noteditable":!this.editable},
                        {"name":"From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"To","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"Price","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    ])},
                ]
                break
            case 'MaterialGroup':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","maxLength":6,"noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"General Ledger - Material","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'Material'},'Code')],"noteditable":!(this.method=="Create")},
                    {"name":"General Ledger - Revenue","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'General'},'Code')],"noteditable":!(this.method=="Create")},
                    {"name":"General Ledger - Cost of Sales","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'General'},'Code')],"noteditable":!(this.method=="Create")},
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
            case 'Plant':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Profit Center","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'ProfitCenter').listAll('Code')],"noteditable":(!this.method=="Create")},
                    {"name":"Business Place","datatype":"single","input":"option","options":["",...new Company(data['Company Code']).BusinessPlaces],"noteditable":!this.editable},
                    {"name":"Allocation Ratio","datatype":"nest","noteditable":!this.editable,"schema":data['Allocation Ratio'].map(item=>[
                        {"name":"From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"To","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"Ratio","datatype":"collection","noteditable":!this.editable,"schema":item['Ratio'].map((subitem,i)=>[
                            {"name":"Type","datatype":"single","input":"option","options":["","CostCenter","Location","Plant","RevenueCenter","AssetConstructionOrder","MaintenanceOrder","ProcessOrder","ProductionOrder","PurchaseOrder","TransportOrder"],"noteditable":!this.editable},
                            {"name":"To","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],subitem['Type']).listAll('Code')],"noteditable":!this.editable},
                            {"name":"Percentage","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        ])},
                    ])},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!this.editable}
                ]
                break
            case 'ProfitCenter':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Segment","datatype":"single","input":"option","options":["",...new Table('Segments').list],"noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
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
            case 'RevenueCenter':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Profit Center","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'ProfitCenter').listAll('Code')],"noteditable":(!this.method=="Create")},
                    {"name":"Business Place","datatype":"single","input":"option","options":["",...new Company(data['Company Code']).BusinessPlaces],"noteditable":!this.editable},
                    {"name":"Allocation Ratio","datatype":"nest","noteditable":!this.editable,"schema":data['Allocation Ratio'].map(item=>[
                        {"name":"From","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"To","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                        {"name":"Ratio","datatype":"collection","noteditable":!this.editable,"schema":item['Ratio'].map((subitem,i)=>[
                            {"name":"To","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'SaleOrder').listAll('Code')],"noteditable":!this.editable},
                            {"name":"Percentage","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                        ])},
                    ])},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!this.editable}
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
            case 'Vendor':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Address","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"PAN","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"GSTIN","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Postal Code","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"State","datatype":"single","input":"option","options":["",...KB.States,...KB.UTs],"noteditable":!this.editable},
                    {"name":"Phone","datatype":"single","input":"input","type":"number","noteditable":!this.editable},
                    {"name":"Email","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Payment Terms","datatype":"single","input":"option","options":["",...new Collection('PaymentTerms').listAll('Code')],"noteditable":!this.editable},
                    {"name":"Bank Accounts","datatype":"collection","noteditable":!this.editable,"schema":data['Bank Accounts'].map(item=>[
                        {"name":"Ref ID","datatype":"single","input":"input","type":"text","noteditable":!this.editable, "maxLength":4},
                        {"name":"Bank Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},   
                        {"name":"IFSC","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Account","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Confirm Account","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    ])},
                    {"name":"Groups","datatype":"list","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!this.editable}
                ]
                break
        }
        (this.method=="Create" && this.exists(data))?list.push(`Record of ${this.title} with same identfiers ${JSON.stringify(this.identifiers)} already exists`):()=>{};
        (KB.AccountTypes.includes(this.title) && data['Code']!="" && !valueInRange(data['Code'],new Company(data['Company Code']).CollectionRange(this.title)))?list.push(`${this.title} code ${data['Code']} not in range for Company ${data['Company Code']} (${JSON.stringify(new Company(data['Company Code']).CollectionRange(this.title))})`):()=>{};
        switch (this.name){
            case 'Attendance':
                data['Attendance'].map(item=>(item['Status']=="")?list.push(`Attendance missing for ${item['Date']}`):()=>{});
                break
            case 'BankAccount':
                const vans = data['Virtual Accounts'];
                for (let i = 0; i < vans.length; i++){
                    const van = vans[i];
                    if (ExistsDuplicates(van['Virtual Account Number'],vans,'Virtual Account Number')){
                        list.push(`VAN '${van['Virtual Account Number']}' exists in duplicate`);
                    }
                    const necessary = ["Virtual Account Number","Customer","Presentation","Profit Center"];
                    necessary.map(field=>van[field]===""?list.push(`At VAN ${i+1}, ${field} necessary.`):()=>{})
                }
                break
            case 'ChartOfAccounts':
                (this.method=="Create" && new Collection("GroupChartOfAccounts").exists(data))?list.push(`Group Chart of Accounts with same identifier(s) already exists`):()=>{};
                data['General Ledger Numbering'].map((item,i)=>(item['From']=="" || item['To']=="")?list.push(`Group ${item['Group']} requires range`):()=>{})
                data['General Ledger Numbering'].map((item,i)=>(Number(item['From'])>=Number(item['To']))?list.push(`${item['Group']}: 'To' range needs to be greater than 'from' range`):()=>{})
                for (let i=1;i<data['General Ledger Numbering'].length;i++){
                    (Number(data['General Ledger Numbering'][i]['From']) <= Number(data['General Ledger Numbering'][i-1]['To']))?list.push(`'From' range of ${data['General Ledger Numbering'][i]['Group']} to be greater than 'To' range of ${data['General Ledger Numbering'][i-1]['Group']}`):()=>{};
                }
                break
            case 'Company':
                const businessplaces = data['Places of Business'];
                businessplaces.length==0?list.push("At least one Place of Business is required"):()=>{};
                for (let i=0;i<businessplaces.length;i++){
                    const place = businessplaces[i];
                    if (ExistsDuplicates(place['Place'],businessplaces,'Place')){
                        list.push(`Business Place '${place['Place']}' exists in duplicate.`)
                    }
                    if (place['Place']===""){
                        list.push(`At Business Place ${i+1}, Place required`);
                    }
                    if (place['State']===""){
                        list.push(`At Business Place ${i+1}, State required`);
                    }
                }
                break
            case 'CostCenter':
                const allocations = data['Allocation Ratio'];
                for (let i = 0; i<allocations.length; i ++){
                    const allocation = allocations[i];
                    if (allocation['From']>allocation['To']){
                        list.push(`At allocation ${i+1}, 'From' is greater than 'To'`);
                    }
                    if (i>0 && allocation['From']<=allocations[i-1]['To']){
                        list.push(`At allocation ${i+1}, 'From' is lower than previous 'To'`);
                    }
                    const ratios = allocation['Ratio'];
                    for (let j = 0; j<ratios.length; j++){
                        const ratio = ratios[j];
                        const necessary = ["Type","To","Percentage"];
                        necessary.map(field=>ratio[field]===""?list.push(`At allocation ${i+1}, item ${j+1}, '${field}' necessary.`):()=>{});
                        (ratio['Percentage']<0)?list.push(`At allocation ${i+1}, item ${j+1}, 'Percentage is negative'`):()=>{};
                    }
                    if (SumField(ratios,'Percentage')>100){
                        list.push(`At allocation ${i+1}, total of ratios greater than 100.`)
                    }
                }
                break
            case 'Customer':
                const banks = data['Bank Accounts'];
                for (let i = 0; i < banks.length; i++){
                    const bank = banks[i];
                    if (ExistsDuplicates(bank['Ref ID'],banks,'Ref ID')){
                        list.push(`'Ref ID' ${bank['Ref ID']} exists in duplicate.`)
                    }
                    if (bank['Account']!==bank['Confirm Account']){
                        list.push(`Bank ${i+1}, Account number does not match`);
                    }
                }
                break
            case 'Customisation':
                const numbering = data['Numbering'];
                numbering.forEach(item=>{
                    Number(item['From'])<0?list.push(`For ${item['Item']}, 'From' is negative.`):()=>{};
                    Number(item['To'])<0?list.push(`For ${item['Item']}, 'To' is negative.`):()=>{};
                    (Number(item['From'])>Number(item['To'])?list.push(`For ${item['Item']}, 'From' is greater than 'To'.`):()=>{})
                })
                break
            case 'Employee':
                break
            case 'FinancialStatement':
                data['Hierarchy'].map((item,i)=>(item['Presentation']=="" || item['Hierarchy']=="")?list.push(`Hierarchy ${i+1}: Information incomplete.`):()=>{});
                data['Hierarchy'].length==0?list.push("At least one Hierarchy is required"):()=>{};
                data['Hierarchy'].map(item=>Count(item['Hierarchy'],ListItems(data['Hierarchy'],"Hierarchy"))>1?list.push(`${item['Hierarchy']} repeats in Hierarchy`):()=>{})
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'GeneralLedger':
                break
            case 'GroupChartOfAccounts':
                (this.method=="Create" && new Collection("ChartOfAccounts").exists(data))?list.push(`Chart of Accounts with same identifier(s) already exists`):()=>{};
                data['General Ledger Numbering'].map((item,i)=>(item['From']=="" || item['To']=="")?list.push(`Group ${item['Group']} requires range`):()=>{})
                data['General Ledger Numbering'].map((item,i)=>(Number(item['From'])>=Number(item['To']))?list.push(`${item['Group']}: 'To' range needs to be greater than 'from' range`):()=>{})
                for (let i=1;i<data['General Ledger Numbering'].length;i++){
                    (Number(data['General Ledger Numbering'][i]['From']) <= Number(data['General Ledger Numbering'][i-1]['To']))?list.push(`'From' range of ${data['General Ledger Numbering'][i]['Group']} to be greater than 'To' range of ${data['General Ledger Numbering'][i-1]['Group']}`):()=>{};
                }
                break
            case 'Holidays':
                const holidays = data['Holidays'];
                for (let i=0; i<holidays.length; i++){
                    const holiday = holidays[i];
                    const necessary = ["Date","Description"];
                    necessary.map(field=>holiday[field]===""?list.push(`At holiday ${1+i}, ${field} necessary.`):()=>{});
                    !valueInRange(new Date (holiday['Date']),[new Date(new Company(data['Company Code']).yearData(data['Year']).begin),new Date(new Company(data['Company Code']).yearData(data['Year']).end)])?list.push(`Date ${i+1} not in the year.`):()=>{};
                }
                break
            case 'IncomeTaxCode':
                const taxations = data['Taxation'];
                taxations.forEach((taxation,i)=>{
                    const necessary = ["From Year","To Year","Exemption Limit","Marginal Relief","Standard Deduction - Salary", "Cess"];
                    necessary.forEach(field=>{
                        if (taxation[field]===""){
                            list.push(`At taxation ${i+1}, '${field}' necessary.`)
                        };
                    });
                    const nonNegatives = ["From Year","To Year","Exemption Limit","Standard Deduction - Salary", "Cess"];
                    nonNegatives.forEach(field=>{
                        if (taxation[field]<0){
                            list.push(`At taxation ${i+1}, '${field}' cannot be negative.`)
                        }
                    });
                    if (taxation['From Year']> taxation['To Year']){
                        list.push(`At taxation ${i+1}, 'From Year' greater than 'To Year'.`)
                    };
                    if (i>0 && taxation['From Year']> taxations[i-1]['To Year']){
                        list.push(`At taxation ${i+1}, 'From Year' lower than previous 'To Year'.`)
                    };
                    const slabs = taxation['Slab'];
                    if (slabs.length==0){
                        list.push(`At taxation ${i+1}, provide at least one slab.`);
                    };
                    slabs.forEach((slab,s)=>{
                        const necessary = ['From','To','Rate'];
                        necessary.forEach(field=>{
                            if (slab[field]===""){
                                list.push(`At taxation ${i+1}, slab ${s+1}, '${field}' necessary.`)
                            };
                            if (slab[field]<0){
                                list.push(`At taxation ${i+1}, slab ${s+1}, '${field}' is negative.`)
                            };
                        });
                        if (slab['From']>=slab['To']){
                            list.push(`At taxation ${i+1}, slab ${s+1}, 'To' should be greater than 'From'.`)
                        }
                        if (s>0 && slab['From']<slabs[s-1]['To']){
                            list.push(`At taxation ${i+1}, slab ${s+1}, 'From' is lower than previous 'To'.`)
                        }
                    })
                    if (slabs[slabs.length-1]['To']<999999999){
                        list.push(`At taxation ${i+1}, 'To of last tax slab must be 999999999 or higher.'`)
                    }
                })
                break
            case 'Location':
                const lcostdist = data['Cost Distribution'];
                for (let i = 0; i<lcostdist.length; i ++){
                    const distribution = lcostdist[i];
                    const necessary = ["From", "To"];
                    necessary.map(field=>distribution[field]===""?list.push(`At distribution ${i+1}, ${field} required.`):()=>{})
                    if (distribution['From']>distribution['To']){
                        list.push(`At distribution ${i+1}, 'From' is greater than 'To'`);
                    }
                    if (i>0 && distribution['From']<=distribution[i-1]['To']){
                        list.push(`At distribution ${i+1}, 'From' is lower than previous 'To'`);
                    }
                    const ratios = distribution['Ratio'];
                    for (let j = 0; j<ratios.length; j++){
                        const ratio = ratios[j];
                        const necessary = ["Material","Multiplier"];
                        necessary.map(field=>ratio[field]===""?list.push(`At distribution ${i+1}, item ${j+1}, '${field}' necessary.`):()=>{});
                        (ratio['Multiplier']<0)?list.push(`At distribution ${i+1}, item ${j+1}, 'Multiplier is negative'`):()=>{};
                    }
                }
                break
            case 'Material':
                data['Price'].map((item,i)=>(item['Location']=="" || item['From']=="" || item['To']=="" && item['Price']=="")?list.push(`At Price line ${i}, information incomplete`):()=>{})
                break
            case 'PaymentTerms':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                data['Discount Criteria'].map((item,i)=>(item['Days']=="" || item['Discount %']=="")?list.push(`At Terms line ${i}, information incomplete`):()=>{})
                data['Interest Criteria'].map((item,i)=>(item['Days']=="" || item['Interest %']=="")?list.push(`At Interest Criteria line ${i}, information incomplete`):()=>{})
                break
            case 'Plant':
                const plantallocations = data['Allocation Ratio'];
                for (let i = 0; i<plantallocations.length; i ++){
                    const allocation = plantallocations[i];
                    if (allocation['From']>allocation['To']){
                        list.push(`At allocation ${i+1}, 'From' is greater than 'To'`);
                    }
                    if (i>0 && allocation['From']<=plantallocations[i-1]['To']){
                        list.push(`At allocation ${i+1}, 'From' is lower than previous 'To'`);
                    }
                    const ratios = allocation['Ratio'];
                    for (let j = 0; j<ratios.length; j++){
                        const ratio = ratios[j];
                        const necessary = ["Type","To","Percentage"];
                        necessary.map(field=>ratio[field]===""?list.push(`At allocation ${i+1}, item ${j+1}, '${field}' necessary.`):()=>{});
                        (ratio['Percentage']<0)?list.push(`At allocation ${i+1}, item ${j+1}, 'Percentage is negative'`):()=>{};
                    }
                    if (SumField(ratios,'Percentage')>100){
                        list.push(`At allocation ${i+1}, total of ratios greater than 100.`)
                    }
                }
                break
            case 'ProfitCenter':
                break
            case 'PurchaseOrder':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                data['Items'].map((item,i)=>(item['Material']=="" || item['Quantity']=="" || item['Unit Price']=="" || item['Total Price']=="")?list.push(`At Items line ${i}, information incomplete`):()=>{})
                break
            case 'RevenueCenter':
                const rcallocations = data['Allocation Ratio'];
                for (let i = 0; i<rcallocations.length; i ++){
                    const allocation = rcallocations[i];
                    if (allocation['From']>allocation['To']){
                        list.push(`At allocation ${i+1}, 'From' is greater than 'To'`);
                    }
                    if (i>0 && allocation['From']<=rcallocations[i-1]['To']){
                        list.push(`At allocation ${i+1}, 'From' is lower than previous 'To'`);
                    }
                    const ratios = allocation['Ratio'];
                    for (let j = 0; j<ratios.length; j++){
                        const ratio = ratios[j];
                        const necessary = ["Type","To","Percentage"];
                        necessary.map(field=>ratio[field]===""?list.push(`At allocation ${i+1}, item ${j+1}, '${field}' necessary.`):()=>{});
                        (ratio['Percentage']<0)?list.push(`At allocation ${i+1}, item ${j+1}, 'Percentage is negative'`):()=>{};
                    }
                    if (SumField(ratios,'Percentage')>100){
                        list.push(`At allocation ${i+1}, total of ratios greater than 100.`)
                    }
                }
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
                break
            case 'UserSettings':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'Vendor':
                const vendorbanks = data['Bank Accounts'];
                for (let i = 0; i < vendorbanks.length; i++){
                    const bank = vendorbanks[i];
                    if (ExistsDuplicates(bank['Ref ID'],vendorbanks,'Ref ID')){
                        list.push(`'Ref ID' ${bank['Ref ID']} exists in duplicate.`)
                    }
                    if (bank['Account']!==bank['Confirm Account']){
                        list.push(`Bank ${i+1}, Account number does not match`);
                    }
                }
                break
        }
        const missed = [];
        mandatory.map(field=>data[field]===""?missed.push(field):()=>{});
        (missed.length>0)?list.push(`${missed.join(", ")} necessary`):()=>{};
        nonNegatives.map(field=>data[field]<0?list.push(`${field} cannot be negative.`):()=>{});
        const uniquelist = [...new Set(errors)];
        switch (this.name){
            case 'Asset':
                result['Depreciation Rate'] = (result['Depreciation Method']!="Reducing Balance")?"":result['Depreciation Rate'];
                if (result['Depreciation Method']!=="Straight Line"){
                    result['Salvage Value']="";
                    result['Useful Life']="";
                }
                break
            case 'GeneralLedger':
                break
        }
        return {'schema':schema, 'output':result,'errors':uniquelist, 'navigation':navigation}
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
        const errors = this.interface(data).errors;
        if (errors.length>0) {
            return 'Errors remaining unresolved. Could not process request';
        } else {
            saveData(this.updatedCollection(data),this.collectionname);
            return 'Successfully saved';
        }
    }
    static collectionname = {
        "Asset":"assets",
        "AssetGroup":"assetgroups",
        "AssetConstructionOrder":"assetconstructionorders",
        "Attendance":"attendances",
        "BankAccount":"bankaccounts",
        'ChartOfAccounts':'chartsofaccounts',
        'Company':'companies',
        'CostObject':'costobjects',
        'CostCenter':'costcenters',
        'Customer':'customers',
        "Customisation":"customisations",
        "Employee":"employees",
        "FinancialAccountsSettings":"financialaccountsettings",
        "FinancialStatementVersion":"financialstatementversions",
        "GeneralLedger":"generalledgers",
        'GroupChartOfAccounts':'groupchartsofaccounts',
        "Holidays":"holidays",
        "IncomeTaxCode":"incometaxcodes",
        "Location":"locations",
        "MaintenanceOrder":"maintenanceorders",
        "Material":"materials",
        "MaterialGroup":"materialgroups",
        "OrganizationUnit":"organisationalunits",
        "PaymentTerms":"paymentterms",
        "Plant":"plants",
        "ProfitCenter":"profitcenters",
        "PurchaseOrder":"purchaseorders",
        "RevenueCenter":"revenuecenters",
        "SaleOrder":"saleorders",
        "Service":"services",
        "TimeControl":"timecontrols",
        "UserSettings":"usersettings",
        "Vendor":"vendors",
    }
    static list = Object.keys(this.collectionname);
    static mandatory = {
        "Asset":["Company Code","Code","Description","Asset Group","Organisational Unit Type","Organisational Unit","Date of Capitalisation","Depreciation Method"],
        "AssetGroup":["Code","Company Code","Description","Depreciable","General Ledger - Asset","General Ledger - Gain on Revaluation","General Ledger - Gain on Disposal","General Ledger - Loss on Disposal","General Ledger - Loss on Retirement"],
        "AssetConstructionOrder":["Company Code","Code","Description"],
        "Attendance":["Company Code","Employee","Year","Month"],
        "BankAccount":["Code","Company Code","Name","Business Place","General Ledger","Profit Center"],
        "ChartOfAccounts":["Code"],
        "Company":["Code","Name","Year Zero","Financial Year Beginning","Functional Currency","Chart of Accounts"],
        "CostCenter":["Company Code","Code","Description","Profit Center","Business Place"],
        "Customer":["Code","Company Code","Name","State"],
        "Customisation":["Company Code"],
        "Employee":["Code","Company Code","Name","State","Income Tax Code"],
        "FinancialAccountsSettings":["Company Code","General Ledger for Profit and Loss Account","General Ledger for Cash Discount","General Ledger for Salary TDS"],
        "FinancialStatementVersion":["Code"],
        "GeneralLedger":["Code","Company Code","Chart of Accounts","Description","Ledger Type","Group","Currency"],
        "GroupChartOfAccounts":["Code"],
        "GroupGeneralLedger":["Code","Chart of Accounts","Description"],
        "Holidays":["Company Code","Year"],
        "IncomeTaxCode":["Code"],
        "Location":["Code","Company Code","Name","Cost Center","Business Place","Profit Center"],
        "MaintenanceOrder":["Code","Company Code","Organisational Unit","Type of Activity"],
        "Material":["Code","Company Code","Description","Unit","Material Group"],
        "MaterialGroup":["Code","Company Code","Description","General Ledger - Material","General Ledger - Cost of Sales", "General Ledger - Revenue"],
        "OrganisationalUnit":["Code","Company Code","Name","Cost Center","Business Place"],
        "PaymentTerms":["Code","Description"],
        "Plant":["Company Code","Code","Description","Profit Center","Business Place"],
        "ProfitCenter":["Company Code","Code","Segment","Description"],
        "PurchaseOrder":["Code","Company Code","Vendor","Date","Business Place"],
        "RevenueCenter":["Company Code","Code","Description","Profit Center","Business Place"],
        "SaleOrder":["Code","Company Code","Customer","Date","Business Place"],
        "Service":["Code","Company Code","Name","Unit","General Ledger - Expense","General Ledger - Revenue"],
        "TimeControl":["Company Code"],
        "UserSettings":["User"],
        "Vendor":["Code","Company Code","Name","State"],
    }
    static identifiers = {
        "Asset":["Company Code","Code"],
        "AssetGroup":["Code","Company Code"],
        "AssetConstructionOrder":["Company Code","Code"],
        "Attendance":["Company Code","Employee","Year","Month"],
        "BankAccount":["Code","Company Code"],
        "ChartOfAccounts":["Code"],
        "Company":["Code"],
        "CostCenter":["Company Code","Code"],
        "Customer":["Code","Company Code"],
        "Customisation":["Company Code"],
        "Employee":["Code","Company Code"],
        "FinancialAccountsSettings":["Company Code"],
        "FinancialStatementVersion":["Code"],
        "GeneralLedger":["Code","Company Code"],
        "GroupChartOfAccounts":["Code"],
        "GroupGeneralLedger":["Code","Chart of Accounts"],
        "Holidays":["Company Code","Year"],
        "IncomeTaxCode":["Code"],
        "Location":["Code","Company Code"],
        "MaintenanceOrder":["Company Code"],
        "Material":["Code","Company Code"],
        "MaterialGroup":["Code","Company Code"],
        "OrganisationalUnit":["Code","Company Code"],
        "PaymentTerms":["Code","Company Code"],
        "Plant":["Company Code","Code"],
        "ProfitCenter":["Company Code","Code"],
        "PurchaseOrder":["Code","Company Code"],
        "RevenueCenter":["Company Code","Code"],
        "SaleOrder":["Code","Company Code"],
        "Service":["Code","Company Code"],
        "TimeControl":["Company Code"],
        "UserSettings":["User"],
        "Vendor":["Code","Company Code"],
    }
    static titles = {
        "Asset":"Asset",
        "AssetGroup":"Asset Group",
        "AssetConstructionOrder":"Asset Construction Order",
        "Attendance":"Attendance",
        "BankAccount":"Bank Account",
        'ChartOfAccounts':'Chart of Accounts',
        'Company':'Company',
        'CostCenter':'Cost Center',
        'Customer':'Customer',
        "Customisation":'Customisation',
        "Employee":"Employee",
        "FinancialAccountsSettings":"Financial Accounts Settings",
        "FinancialStatementVersion":"Financial Statement Version",
        "GeneralLedger":"General Ledger",
        'GroupChartOfAccounts':'Group Chart of Accounts',
        "GroupGeneralLedger":"Group General Ledger",
        "Holidays":"Holidays",
        "IncomeTaxCode":"Income Tax Code",
        "Location":"Location",
        "MaintenanceOrder":"Maintenance Order",
        "Material":"Material",
        "MaterialGroup":"Material Group",
        "PaymentTerms":"Payment Terms",
        "Plant":"Plant",
        "ProfitCenter":"Profit Center",
        "PurchaseOrder":"Purchase Order",
        "RevenueCenter":"Revenue Center",
        "SaleOrder":"Sale Order",
        "Service":"Service",
        "TimeControl":"Time Control",
        "UserSettings":"User Settings",
        "Vendor":"Vendor",
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
    interface(data){
        let schema = [];
        switch (this.collection){
            case 'Asset':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'AssetGroup':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'AssetConstructionOrder':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'Attendance':
                schema = [
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]},
                    {'name':'Employee', 'datatype':'single','input':'option','options':["",... new CompanyCollection(data['Company Code'],'Employee').listAll('Code')]},
                    {'name':'Year', 'datatype':'single','input':'input','type':'text','maxLength':4},
                    {'name':'Month', 'datatype':'single','input':'input','type':'text','maxLength':2},
                ]
                break
            case 'BankAccount':
               schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'ChartOfAccounts':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text', 'maxLength':4},
                ]
                break
            case 'Company':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text','maxLength':4},
                ]
                break
            case 'CostCenter':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'Customer':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'Customisation':
                schema = [
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'Employee':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'ExchangeRate':
                schema = [
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]},
                    {'name':'Currency', 'datatype':'single','input':'option', 'options':["", ...new Table('Currencies').list]},
                ]
                break
            case 'FinancialStatement':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text', 'maxLength':4},
                ]
                break
            case 'GeneralLedger':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'GroupChartOfAccounts':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text', 'maxLength':6},
                ]
                break
            case 'GroupGeneralLedger':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Chart of Accounts','datatype':'single','input':'option','options':["",...new Collection('GroupChartOfAccounts').listAll('Code')]}
                ];
                break
            case 'Holidays':
                schema = [
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]},
                    {'name':'Year', 'datatype':'single','input':'input','type':'text','maxLength':4},
                ]
                break
            case 'IncomeTaxCode':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                ]
                break
            case 'Location':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'MaintenanceOrder':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'Material':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'MaterialGroup':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'PaymentTerms':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text', 'maxLength':4},
                ]
                break
            case 'Plant':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'ProcessOrder':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'ProductionOrder':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'ProfitCenter':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'PurchaseOrder':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'RevenueCenter':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'SaleOrder':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'Service':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'ServiceGroup':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'TimeControl':
                schema = [
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'TransportOrder':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'Vendor':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
             
        }
        if (this.method=="Create"){
            schema = schema.filter(field=>this.createRequirements.includes(field['name']));
        }
        const missing = [];
        const errors = [];
        let fields = [];
        if (this.method!=="Create"){
            fields = ListItems(schema,'name');
            const query = {};
            fields.map(field=>query[field]=data[field]);
            if (!new Collection(this.collection).exists(query)){
                errors.push(`Record of ${this.collection} with ${JSON.stringify(query)} does not exist.`);
            }
        } else if (this.method==="Create"){
            fields = this.createRequirements;
            if (['Holidays','Attendance'].includes(this.collection)){
                const query = {};
                fields.map(field=>query[field]=data[field]);
                if (new Collection(this.collection).exists(query)){
                    errors.push(`Record of ${this.collection} with ${JSON.stringify(query)} already exists.`);
                }
            }
        }
        fields.map(field=>(data[field]=="")?missing.push(field):()=>{});
        (fields.includes("Employee") && new Collection("Employee").exists({"Company Code":data["Company Code"], "Code":data['Employee']})==false)?errors.push(`Employee with Code ${data["Employee"]} does not exist in Company ${data["Company Code"]}.`):()=>{};
        (missing.length>0)?errors.push(`${missing.join(", ")} required.`):()=>{};
        let result = {...data};
        let navigation = [
            {"name":"Back","type":"navigate","url":"/control","state":{}, "refresh":true},
            {"name":this.method,"type":"navigate","url":"/interface","state":{'type':'Collection','collection':this.collection,'method':this.method,'data':data},"refresh":true}
        ];

        return {'schema':schema,'output':result,'navigation':navigation, 'errors':errors}
        
    }
    checkAvailability(data){
        const availability = new Collection(this.collection).exists(data);
        return availability;
    }
    static createRequirements = {
        "Asset":["Company Code"],
        "AssetGroup":["Company Code"],
        "AssetConstructionOrder":["Company Code"],
        "Attendance":["Company Code","Year","Month","Employee"],
        "BankAccount":["Company Code"],
        "ChartOfAccounts":[],
        "Company":[],
        "CostCenter":["Company Code"],
        "Customer":["Company Code"],
        "Customisation":["Company Code"],
        "Employee":["Company Code"],
        "ExchangeRate":["Company Code","Currency"],
        "FinancialStatement":[],
        "GeneralLedger":["Company Code"],
        "GroupChartOfAccounts":[],
        "GroupGeneralLedger":["Chart of Accounts"],
        "Holidays":["Company Code","Year"],
        "IncomeTaxCode":[],
        "Location":["Company Code"],
        "MaintenanceOrder":["Company Code"],
        "Material":["Company Code"],
        "MaterialGroup":["Company Code"],
        "PaymentTerms":[],
        "Plant":["Company Code"],
        "ProcessOrder":["Company Code"],
        "ProductionOrder":["Company Code"],
        "ProfitCenter":["Company Code"],
        "PurchaseOrder":["Company Code"],
        "RevenueCenter":["Company Code"],
        "SaleOrder":["Company Code"],
        "Service":["Company Code"],
        "ServiceGroup":["Company Code"],
        "TimeControl":["Company Code"],
        "TransportOrder":["Company Code"],
        "Vendor":["Company Code"],
    }
    static defaults = {
        "Asset":{"Code":"","Company Code":''},
        "AssetGroup":{"Code":"","Company Code":''},
        "AssetConstructionOrder":{"Code":"","Company Code":''},
        "Attendance":{"Company Code":'',"Year":"","Month":"","Employee":""},
        "BankAccount":{"Code":"","Company Code":''},
        "ChartOfAccounts":{"Code":""},
        "Company":{"Code":""},
        "CostCenter":{"Code":"","Company Code":''},
        "Customer":{"Code":"","Company Code":''},
        "Customisation":{"Company Code":''},
        "Employee":{"Code":"","Company Code":''},
        "FinancialStatement":{"Code":""},
        "GeneralLedger":{"Code":"","Company Code":''},
        "GroupChartOfAccounts":{"Code":""},
        "GroupGeneralLedger":{"Code":"","Chart of Accounts":""},
        "Holidays":{"Company Code":'',"Year":""},
        "IncomeTaxCode":{"Code":""},
        "Location":{"Code":"","Company Code":''},
        "MaintenanceOrder":{"Code":"","Company Code":''},
        "Material":{"Code":"","Company Code":""},
        "MaterialGroup":{"Code":"","Company Code":''},
        "PaymentTerms":{"Code":""},
        "Plant":{"Company Code":"","Code":""},
        "ProcessOrder":{"Code":"","Company Code":''},
        "ProductionOrder":{"Code":"","Company Code":''},
        "ProfitCenter":{"Code":"","Company Code":''},
        "PurchaseOrder":{"Code":"","Company Code":''},
        "RevenueCenter":{"Code":"","Company Code":''},
        "SaleOrder":{"Code":"","Company Code":''},
        "Service":{"Code":"","Company Code":''},
        "ServiceGroup":{"Code":"","Company Code":''},
        "TimeControl":{"Company Code":''},
        "TransportOrder":{"Code":"","Company Code":''},
        "Vendor":{"Code":"","Company Code":''},
    }
}

class CompanyCollection extends Collection{
    constructor(company,name,method="Display"){
        super(name,method)
        this.company = company;
    }
    load(){
        const data = super.load();
        const filtered = singleFilter(data,'Company Code',this.company)
        return filtered;
    }
    listAll(key){
        const data = super.listAll(key);
        return data;
    }
    exists(data){
        const result = super.exists({...data,['Company Code']:this.company});
        return result;
    }
    getData(data){
        const result = super.getData({...data,['Company Code']:this.company});
        return result;
    }
}

class AccountingDocument{
    constructor(company,year){
        this.company = company;
        this.year = year;
    }
    load(){
        const data = AccountingDocument.database;
        const result = data.filter(item=>item['Company Code']===this.company && item['Year']===this.year);
        return result;
    }
    getDocument(docNo){
        const data = this.load();
        const document = data.find(item=>item['Document Number']===docNo);
        const result = (document!==undefined);
        return {'result':result,'document':document}
    }
    newDocumentNumber(){
        let start = 0;
        do {
            start ++;
        } while (this.getDocument(start).result)
        return start
    }
    postDocument(data){
        let result = {...data};
        result['Document Number'] = this.newDocumentNumber();
        const updatedDB = [...AccountingDocument.database,result];
        const status = AccountingDocument.updatedatabase(updatedDB);
        if (status){
            return `Success, Document ${result['Document Number']} created!`;
        } else {
            return `Could not process the request`;
        }
    }
    tabular(){
        const data = this.load();
        const list = [];
        data.forEach(item=>{
            const fields = Object.keys(item).filter(field=>field!=='Line Items');
            const datapack = {};
            fields.map(field=>datapack[field]=item[field]);
            item['Line Items'].map(line=>list.push({...datapack,...line}))
        });
        return list;
    }
    lineItemProcess(data){
        let result = {...data};
        const accType = data['Account Type'];
        if (accType ==='Asset'){
            const asset = new Asset(data['Account'],this.company);
            result['Account Description']= asset.data['Description'];
            result['General Ledger'] = asset.assetgroup.data['General Ledger  - Asset'];
            result['General Ledger Description'] = asset.assetgroup.GLData('General Ledger - Asset').data['Description'];
            result['Profit Center']= asset.orgassignment(data['Asset Value Date']).assignment.profitcenter.code;
        }
    }
    static collectionname = 'accountingdocuments';
    static database = loadData(this.collectionname);
    static updatedatabase(data){
        saveData(data,this.collectionname);
        return true;
    }
}

class MaterialDocument{
    constructor(company,year){
        this.company = company;
        this.year = year;
    }
    static collectionname = 'materialdocuments';
    static database = loadData(this.collectionname);
    static updatedatabase(data){
        saveData(data,this.collectionname);
        return true;
    }
}

class CostDocument{
    constructor(company,year){
        this.company = company;
        this.year = year;
    }
    static collectionname = 'costdocuments';
    static database = loadData(this.collectionname);
    static updatedatabase(data){
        saveData(data,this.collectionname);
        return true;
    }
}

class AssetGroup extends CompanyCollection{
    constructor(code,company,name="AssetGroup"){
        super(company,name);
        this.code = code;
        this.data = super.getData({'Code':this.code});
    }
    GLData(type){
        const GL = new GeneralLedger(this.data[type],this.company);
        return GL;
    }
}

class Asset extends CompanyCollection{
    constructor(code,company,name="Asset"){
        super(company,name)
        this.code = code;
        this.data = super.getData({'Code':this.code});
        this.assetgroup = new AssetGroup(this.data['Asset Group'],this.company);
    }
    orgassignment(date){
        const assignments = this.data['Organisational Assignment'];
        const result = assignments.find(item=>valueInRange(new Date(date),[new Date(item['From']),new Date(item['To'])]));
        if (result){
            const type = result['Assignment Type'];
            let assignment = {};
            switch (type){
                case 'CostCenter':
                    assignment = new CostCenter(result['Assignment'],this.company);
                    break
                case 'Location':
                    assignment = new Location(result['Assignment'],this.company);
                break
                case 'Plant':
                    assignment = new Plant(result['Assignment'],this.company);
                    break
                case 'RevenueCenter':
                    assignment = new RevenueCenter(result['Assignment'],this.company);
                    break
            }
            return {'result':true, 'type':type, 'assignment':assignment}
        } else {
            return {'result':false}
        }
    }
    depreciationUpTo(date){
        if (this.data['Date of Capitalisation']<=date && this.assetgroup.data['Depreciable']==='Yes'){
            if (this.data['Depreciation Method']==="Straight Line"){
                
            } else if (this.data['Depreciation Method']==="Reducing Balance"){
                return 'Reducing Balance'
            }
        } else {
            return 0
        }
    }
    SLMDepreciation(date,Opening){
        const year = new Company(this.company).PostingYear(date);
        const costdata = new AccountingDocument(this.company,year).tabular().filter(item=>item['Account']===this.code && item['Transaction']==='Cost' && new Date(item['Asset Value Date'])<=new Date(date));
        const cost = SumFieldIfs(costdata,'Amount',['Debit/ Credit'],['Debit']) - SumFieldIfs(costdata,'Amount',['Debit/ Credit'],['Credit']);
        const sv = this.data['Salvage Value'];
        return sv;
    }
    RBDepreciationUpto(date){

    }
}

class AssetConstructionOrder extends CompanyCollection{
     constructor(code,company,name="AssetConstructionOrder"){
        super(company,name)
        this.code = code;
        this.data = super.getData({'Code':this.code})
    }
    accumulatedCost(date){
        const year = new Company(this.company).PostingYear(date);
        const data = new AccountingDocument(this.company, year).load();
        const result = data.filter(item=>item['Asset Construction Order']===this.code && item['Posting Date']<=date);
        const cost = SumFieldIfs(result,'Amount',['Debit/ Credit'],['Debit'])-SumFieldIfs(result,'Amount',['Debit/ Credit'],['Credit'])
        return {'data':result,'cost':cost}
    }
    settlement(date){
        const ratio = this.data['Settlement Ratio'];
        const cost = this.accumulatedCost(date).cost;
        const list = [];
        ratio.map(item=>list.push({
            'Asset':item['Asset'],
            'Percentage':item['Percentage'],
            'Amount':cost * item['Percentage']/100,
        }));
        return list;
    }
}

class BankAccount extends CompanyCollection{
    constructor(code,company,name="BankAccount"){
        super(company,name)
        this.code = code;
        this.data = super.getData({'Code':this.code})
    }
}

class Company extends Collection{
    constructor(Code, name="Company"){
        super(name);
        this.code = Code;
        this.data = super.getData({'Code':this.code});
        this.BusinessPlaces = ListItems(this.data['Places of Business'],"Place");
    }
    yearData(year){
        const beginMonth = this.data['Financial Year Beginning'];
        const yearBeginning = KB.YearStart(year,beginMonth);
        const yearEnd = KB.YearEnd(year,beginMonth);
        return {'begin':yearBeginning, 'end':yearEnd};
    }
    collection(collectionname){
        const data = new Collection(collectionname).filtered({'Company Code':this.code});
        return data
    }
    listCollection(collectionname,key){
        const data = this.collection(collectionname);
        return ListItems(data,key)
    }
    filteredCollection(collectionname,data){
        const collection = this.collection(collectionname);
        const fields = Object.keys(data);
        let filtered = collection;
            for (let i = 0; i<fields.length;i++){
                filtered = singleFilter(filtered,fields[i],data[fields[i]]);
            }
        return filtered;
    }
    filteredList(collectionname,data,key){
        const filtered = this.filteredCollection(collectionname,data);
        return ListItems(filtered,key);
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
        const data = this.data['General Ledger Numbering'];
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

class CostCenter extends CompanyCollection{
    constructor(code,company,name="CostCenter"){
        super(company,name);
        this.code = code;
        this.data = super.getData({'Code':this.code});
        this.profitcenter = new ProfitCenter(this.data['Profit Center'],this.company);
    }
}

class Employee extends CompanyCollection{
    constructor(code, company, name="Employee"){
        super(company, name);
        this.code = code;
        this.data = super.getData({'Code':this.code});
    }
    wage(date){
        const vwages = this.data['Variable Wages'].filter(item=>valueInRange(new Date(date),[new Date(item['From']),new Date(item['To'])]));
        const fwages = this.data['Fixed Wages'].filter(item=>valueInRange(new Date(date),[new Date(monthStructure(item['From Year'],item['From Month']).start),new Date(monthStructure(item['To Year'],item['To Month']).end)]));
        const owages = this.data['One Time Wages'].filter(item=>item['Date']===date);
        return owages
    }
}

class GeneralLedger extends CompanyCollection{
    constructor(code,company,name="GeneralLedger"){
        super(company,name)
        this.code = code;
        this.data = super.getData({'Code':this.code})
    }
}

class IncomeTaxCode extends Collection{
    constructor(code,name="IncomeTaxCode"){
        super(name);
        this.code = code;
        this.data = super.getData({'Code':this.code});
    }
    taxOnSlab(slab,income){
        const {From,To,Rate} = slab;
        const applicableIncome = Math.max(0,income-From);
        const slabLimit = To - From;
        const tax = Math.min(slabLimit,applicableIncome)* Rate/100;
        return tax
    }
    yearExists(year){
        const result = this.data['Taxation'].find(item=>(year>=item['From Year'] && year<=item['To Year']));
        return (result!==undefined)
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
        return netTax
    }
}

class Location extends CompanyCollection{
    constructor(code,company,name="Location"){
        super(company,name);
        this.code = code;
        this.data = super.getData({'Code':this.code});
        this.profitcenter = new ProfitCenter(this.data['Profit Center'],this.company);
    }
}

class Plant extends CompanyCollection{
    constructor(code,company,name="Plant"){
        super(company,name);
        this.code = code;
        this.data = super.getData({'Code':this.code});
        this.profitcenter = new ProfitCenter(this.data['Profit Center'],this.company);
    }
}

class ProfitCenter extends CompanyCollection{
    constructor(code,company,name="ProfitCenter"){
        super(company,name);
        this.code = code;
        this.data = super.getData({'Code':this.code});
    }
}

class RevenueCenter extends CompanyCollection{
    constructor(code,company,name="RevenueCenter"){
        super(company,name);
        this.code = code;
        this.data = super.getData({'Code':this.code});
        this.profitcenter = new ProfitCenter(this.data['Profit Center'],this.company);
    }
}


class Table{
    constructor(name,method="Display"){
        this.name = name;
        this.title = Table.title[this.name];
        this.method = method;
        this.key = Table.keys[this.name];
        this.data = (this.name in localStorage)?JSON.parse(localStorage.getItem(this.name)):Table.defaults[this.name];
        this.list = ListItems(this.data,this.key);
        this.defaults = (this.method=="Create")?Table.defaults[this.name]:this.data;
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
            case 'Segments':
                schema = [
                {"name":"Segment","datatype":"single","input":"input","type":"text","maxLength":6},
                {"name":"Description","datatype":"single","input":"input","type":"text"},
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
            case 'WageTypes':
                schema = [
                    {"name":"Wage Type","datatype":"single","input":"input","type":"text","maxLength":6},
                    {"name":"Description","datatype":"single","input":"input","type":"text"},
                    {"name":"Type","datatype":"single","input":"option","options":["","Earning","Deduction"]},
                    {"name":"Nature","datatype":"single","input":"option","options":["","One Time","Fixed","Variable"]},
                ]
        }
        return schema;
    }
    static defaults = {
        "Currencies":[{"Code":"","Description":""}],
        "HSN":[{"Code":"","Type":"","Description":""}],
        "Units":[{"Symbol":"","Name":"","Quantity":"","Description":""}],
        "Segments":[{"Segment":"","Description":""}],
        "WageTypes":[{"Wage Type":"","Description":"","Type":"","Nature":""}]
    }
    static keys = {
        "Currencies":"Code",
        "HSN":"Code",
        "Segments":"Segment",
        "Units":"Symbol",
        "WageTypes":"Wage Type"
    }
    static mandatory = {
        "Currencies":["Code"],
        "HSN":["Code","Type"],
        "Segments":["Segment"],
        "Units":["Symbol","Name","Quantity"],
        "WageTypes":["Wage Type","Type","Nature"]
    }
    static title = {
        "Currencies":"Currencies",
        "HSN":"HSN",
        "Segments":"Segments",
        "Units":"Units",
        "WageTypes":"Wage Types"
    }
}

class DeviceUI{
    static defaults = {"Background":"Tech","Font":"Lexend"};
    static data = 'DeviceUI' in localStorage? JSON.parse(localStorage.getItem('DeviceUI')):this.defaults;
    static interface(data,method){
        let errors = [];
        let result = {...data};
        const schema = [
            {"name":"Background", "datatype":"single","input":"option","options":["Tech", "Fabric","Intersect"], "noteditable":method==="Display"},
            {"name":"Font", "datatype":"single","input":"option","options":["Helvetica","Lexend","Times New Roman","Trebuchet MS"], "noteditable":method==="Display"},
        ];
        const save = ()=>{
            saveData(result,'DeviceUI');
            return ('Saved');
        }
        const navigation = [            
            {"name":"Save","type":"action",'onClick':()=>alert(save()), 'refresh':true},
            {"name":"Cancel","type":"navigate","url":"/home","state":{}, 'refresh':true},
        ]
        return {'output':result,'schema':schema,'errors':errors,'navigation':navigation};
    }
}

class ReportQuery{
    constructor(report){
        this.report = report;
    }
    defaults(data){
        let defaults = {};
        switch (this.report){
            case 'AccountingDocument':
                defaults = {"Company Code":"","Year":"","Document Number":""};
            break
        }
        if (['AssetRegister','MaterialRegister','EmployeeRegister','VendorRegister','CustomerRegister'].includes(this.report)){
            defaults['Company Code'] = '';
        }
        return defaults;
    }
    interface(data){
        let schema = [];
        let result = {...data};
        let navigation = [
            {"name":"Back","type":"navigate","url":"/reports","state":{}},
            {"name":"Get","type":"navigate","url":"/interface","state":{'type':'Report','report':this.report,'data':result}}
        ];
        let errors = [];

        switch (this.report){
            case 'AccountingDocument':
                schema = [
                {"name":"Company Code","datatype":"single","input":"option","options":["",...new Collection('Company').listAll('Code')]},
                {"name":"Year","datatype":"single","input":"input","type":"text"},
                {"name":"Document Number","datatype":"single","input":"input","type":"number"},
                ]
                !Transaction.Accountingdoc(data['Company Code'],data['Year'],data['Document Number']).result?errors.push(`Document does not exist!`):()=>{};
            break
        }
        if (['AssetRegister','MaterialRegister','EmployeeRegister','VendorRegister','CustomerRegister'].includes(this.report)){
            schema = [
                {"name":"Company Code","datatype":"single","input":"option","options":["",...new Collection('Company').listAll('Code')]},
            ]
            if (data['Company Code']===""){
                errors.push(`Company Code necessary.`)
            }
        }
        return {'schema':schema,'output':result,'errors':errors,'navigation':navigation}
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
    let isTable = false;
    let viewJSON = true;
    if (type=="CollectionQuery"){
        const {collection,method} = inputData;
        Display = new CollectionQuery(collection,method);
        defaults = Display.defaults;
        editable = true;
        viewJSON = false;
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
        title = Display.title;
        isTable = true;
    } else if (type=="TransactionQuery"){
        const {transaction} = inputData;
        Display = new TransactionQuery(transaction);
        defaults = Display.defaults('');
        editable = true;
        title = transaction;
    } else if (type=="Transaction"){
        const {transaction} = inputData;
        Display = new Transaction(transaction);
        defaults = Display.defaults();
        editable = true;
        title = Transaction.titles[transaction];
    } else if (type=="ReportQuery"){
        const {report} = inputData;
        Display = new ReportQuery(report);
        defaults = Display.defaults();
        editable = true;
        title = new Report(report).title();
    } else if (type=="Report"){
        const {report,data} = inputData;
        Display = new Report(report);
        defaults = Display.defaults(data);
        editable = true;
        title = Display.title();
    } else if (type==="DeviceUI"){
        Display = DeviceUI;
        defaults = Display.data;
        editable = true;
        title = 'Device UI Settings';
        viewJSON = false;
    }
    
    const [data,setdata] = useState(defaults);
    const {schema,output,errors,navigation} = Display.interface(data);

    return(<>
        <View table={isTable} title={title} editable={editable} output={output} schema={schema} defaults={defaults} setdata={setdata} errors={errors} navigation={navigation} viewJSON={viewJSON}/>
        </>
    )
}

function View({title,editable,output,schema,defaults,setdata,errors,navigation,table, viewJSON}){
    const navigate = useNavigate();
    
    const runFunction=(func)=>{
        if (func['type']==="navigate"){
            navigate(func['url'],{state:func['state']});
        } else if (func['type']==="action"){
            func['onClick']();
        }
        if (func['refresh']){
            window.location.reload();
        }
    }


    return(
        <div className='display'>
            <div className='displayTitle'>
                <h3>{title}</h3>
            </div>
            <div className='displayInputFields'>
                {!table && schema.map(field=>
                    <>
                        {field['datatype']=="single" && <SingleInput field={field} output={output} setdata={setdata}/>}
                        {field['datatype']=="list" && <ListInput field={field} output={output} setdata={setdata}/>}
                        {field['datatype']==='object' && <ObjectInput output={output} setdata={setdata} field={field}/>}
                        {field['datatype']=="collection" && <CollectionInput field={field} output={output} setdata={setdata} defaults={defaults}/>}
                        {field['datatype']=="nest" && <NestInput field={field} output={output} setdata={setdata} defaults={defaults}/>}
                        {field['datatype']=="multiple" && <MultipleInput field={field} output={output} setdata={setdata}/>}
                        {field['datatype']=="table" && <DisplayAsTable collection={output[field['name']]}/>}
                        {field['datatype']==='tree'&& <TreeInput data={output} setdata={setdata} schema={field['schema']}/>}
                    </>
                )}
                {table && <TableInput  data={output} schema={schema} setdata={setdata} defaults={defaults} editable={editable}/>}
            </div>
            {(editable && (errors.length>0)) && <div className='error'>
                <Collapsible title={`Alert (${errors.length}) `} children={<ol>
                    {errors.map(error=>
                        <li>{error}</li>
                    )}
                </ol>}/>
            </div>}
            {navigation.length>0 && <div className='navigation'>
                {navigation.map(item=><>
                    <button onClick={()=>runFunction(item)}>{item['name']}</button>
                    </>
                )}
            </div>}
        </div>
    )
}





const buildTree = (data,parentId=null)=>{
    const list = [];
    const keys = data.filter(item=>item['parentId']===parentId && item['type']=='key');
    for (let i=0;i<keys.length;i++){
        const key = {...keys[i]};
        key['children']=buildTree(data,key['id']);
        key['value']=data.find(item=>item['type']==='value' && item['parentId']===key.id)
        list.push(key);
    }
    return list
}

const TreeInput = ({data,setdata,schema}) =>{
    const treeStructure = buildTree(data);
    return(
        <ol>
            {treeStructure.map(node=><Node schema={schema} setdata={setdata} node={node}/>)}
        </ol>
    )
}

const Node = ({node,schema,setdata})=>{
    
    const keyChange =(id,e)=>{
        const {value} = e.target;
        setdata(prevdata=>(prevdata.map(item=>item.id===id?{...item,['name']:value}:item)))
    }

    const singleChange = (parentId,e)=>{
        const {value} = e.target;
        setdata(prevdata=>(prevdata.map(item=>item.parentId===parentId?{...item,['value']:value}:item)))
    }
    const listChange = (parentId,index,e)=>{
        const {value} = e.target;
        setdata(prevdata=>(prevdata.map(item=>item.parentId===parentId?{...item,['value']:item['value'].map((subitem,i)=>i===index?value:subitem)}:item)))
    }
    const tableChange = (parentId,index,field,e)=>{
        const {value} = e.target;
        setdata(prevdata=>(prevdata.map(item=>item.parentId===parentId?{...item,['value']:item['value'].map((subitem,i)=>i===index?{...subitem,[field]:value}:subitem)}:item)))
    }
    const addNode=(id)=>{
        let defaults = "";
        switch (schema.datatype){
            case 'single':
                defaults = '';
                break
            case 'list':
                defaults = [''];
                break
            case 'table':
                const item = {};
                schema.schema.map(field=>item[field.name]="");
                defaults = [item];
                break 
        }
        setdata(prevdata=>([...prevdata,...[{'type':'key','id':prevdata.length,'parentId':id,'name':''},{'type':'value','parentId':prevdata.length,'value':defaults}]]));
    }

    const listAdd = (parentId)=>{
        setdata(prevdata=>(prevdata.map(item=>item.parentId===parentId?{...item,['value']:[...item['value'],""]}:item)))
    }

    const tableAdd = (parentId)=>{
        const defaults = {}; 
        schema.schema.map(field=>defaults[field.name]="");  
        setdata(prevdata=>(prevdata.map(item=>item.parentId===parentId?{...item,['value']:[...item['value'],defaults]}:item)))
    }

    return (
        <>
        {node.children.length===0 && <li>
            <input value={node.name} onChange={(e)=>keyChange(node.id,e)}/>
            <button onClick={()=>addNode(node.id)}>Node +</button>
            <div>
                {schema.datatype==='single' && <input value={node.value.value} onChange={(e)=>singleChange(node.id,e)}/>}
                {schema.datatype==='list' && <div>{node.value.value.map((item,i)=><input type={schema.type} value={item} onChange={(e)=>listChange(node.id,i,e)}/>)}<button onClick={()=>listAdd(node.id)}>+</button></div>}
                {schema.datatype==='table' && <div className='displayTable'>
                    <table>
                        <thead>
                            <tr>
                                {schema.schema.map(field=><td className='displayTableCell'>{field.name}</td>)}
                            </tr>
                            {node.value.value.map((item,i)=><tr>
                                {schema.schema.map(field=><td className='displayTableCell'><input onChange={(e)=>tableChange(node.id,i,field.name,e)} value={item[field.name]}/></td>)}
                                </tr>)}
                        </thead>
                    </table>
                    <button onClick={()=>tableAdd(node.id)}>+</button>    
                </div>}
            </div>    
        </li>}
        {node.children.length>0 && <li>
            <input value={node.name} onChange={(e)=>keyChange(node.id,e)}/>
            <button onClick={()=>addNode(node.id)}>N</button>
            <ul>
                {node.children.map(child=><Node node={child} schema={schema} setdata={setdata}/>)}
            </ul>
        </li>}
        </>
    )
}

function Scratch(){
    const collection = [{"To":"9999-12-31"},{"To":"2026-02-28"}]
    return(
        <div>
            {JSON.stringify(timeSeriesError('A',collection,'From','To'))}
        </div>
    )
}

function isPlainObject(value){
    return (typeof(value)==='object' && value!==null && !Array.isArray(value))
}
function ArrayJSON(data,parentId=null,id=0){
    const array = [];
    if (isPlainObject(data)){
        const keys = Object.keys(data);
        for (let i=0;i<keys.length;i++){
            const key = keys[i];
            const value = data[key];
            const keyinfo = {'id':id,'elementType':'key','elementOf':'object','key':parentId, 'name':key};
            if (typeof(value)!=='object'){
                keyinfo['valueType']='value';
                const valueinfo = {'id':id+1,'elementType':'value','elementOf':'object','key':id, 'name':value};
                array.push(valueinfo);
                id+=2
            } else if (isPlainObject(value)){
                keyinfo['valueType']='object';
                const valuesinfo = ArrayJSON(value,id,id+1);
                id = valuesinfo.id;
                array.push(...valuesinfo.array);
            } else if (Array.isArray(value)){
                keyinfo['valueType']='array';
                const valuesinfo = ArrayJSON(value,id,id+1);
                id = valuesinfo.id;
                array.push(...valuesinfo.array);
            }
            array.push(keyinfo);
        }
    } else if (Array.isArray(data)){
        for (let i=0;i<data.length;i++){
            const value = data[i];
            const indexinfo = {'id':id,'elementType':'index','index':i,'elementOf':'array','arrayId':parentId,'name':''};
            if (typeof(value)!=='object'){
                indexinfo['valueType']='value';
                const valueinfo = {'id':id+1,'elementType':'value','elementOf':'array','arrayId':parentId, 'index':i, 'name':value};
                array.push(valueinfo);
                id+=2
            } else if (isPlainObject(value)){
                indexinfo['valueType']='object';
                const valuesinfo = ArrayJSON(value,id,id+1);
                id = valuesinfo.id;
                array.push(...valuesinfo.array);
            } else if (Array.isArray(value)){
                indexinfo['valueType']='array';
                const valuesinfo = ArrayJSON(value,id,id+1);
                id = valuesinfo.id;
                array.push(...valuesinfo.array);
            }
            array.push(indexinfo);
        }
    }
    return {'array':array.sort((a,b)=>a.id-b.id),'id':id}
}

function JSONArray(array,parentId=null){
    const type = array.find(item=>((item['elementType']==='key' && item['key']===parentId)||(item['elementType']==='index' && item['arrayId']===parentId)))['elementOf'];
    let result = {};
    if (type==="object"){
        const keys = array.filter(item=>item['key']==parentId && item['elementType']=='key');
        for (let i = 0; i<keys.length;i++){
            const key = keys[i];
            const valueType = key['valueType'];
            if (valueType=="value"){
                result[key['name']]=array.find(item=>(item['elementType']=="value" && item['key']==key['id']))['name'];
            } else if (valueType=="object" || valueType=="array"){
                result[key['name']]=JSONArray(array,key['id']);
            }
        }
    } else if (type==="array"){
        result = [];
        const indexes = array.filter(item=>item['arrayId']==parentId && item['elementType']=='index');
        for (let i =0; i<indexes.length; i++){
            const index = indexes[i];
            const valueType = index['valueType'];
            if (valueType=="value"){
                result[index['index']]=array.find(item=>(item['elementType']=="value" && item['index']==index['index'] && item['arrayId']==parentId))['name'];
            } else if (valueType=="object" || valueType=="array"){
                result[index['index']]=JSONArray(array,index['id']);
            }
        }
    }
    return result
}

function App(){

    const {Background,Font,BackgroundColor,FontColor} = DeviceUI.data;
    const backgroundStyle = {
        'backgroundImage':`url('../${Background}.png')`,
        'fontFamily':`${Font},'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    }
    return(
        <div className='background' style={backgroundStyle}>
            <div className='container'>
                <BrowserRouter>
                <SearchBar/>
                    <div className="innerContainer">
                        <Routes>
                            <Route path='/' element={<Home/>}/>
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
        </div>
    )
    
}

export default App; 