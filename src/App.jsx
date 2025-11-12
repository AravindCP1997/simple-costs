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
    collection.map(item=>list.push(item[key]));
    return list
}

const ListUniqueItems = (collection,key)=>{
    const list = [];
    collection.map(item=>list.push(item[key]));
    const uniquelist = [...new Set(list)];
    return uniquelist
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

class Navigator{
    static codes = [
        {'code':'','url':'/','state':{},'type':'home'},
        {'code':'control','url':'/control','state':{},'type':'home'},
        {'code':'record','url':'/record','state':{},'type':'home'},
        {'code':'reports','url':'/reports','state':{},'type':'home'},
        {'code':'sc','url':'/scratch','state':{},'type':'home'},
        {'code':'a10c','name':'Create Asset','url':'/interface','state':{'type':'CollectionQuery','collection':'Asset','method':'Create'},'type':'Control','group':'Asset Lifecycle'},
        {'code':'a10u','name':'Update Asset','url':'/interface','state':{'type':'CollectionQuery','collection':'Asset','method':'Update'},'type':'Control','group':'Asset Lifecycle'},
        {'code':'a10d','name':'Display Asset','url':'/interface','state':{'type':'CollectionQuery','collection':'Asset','method':'Display'},'type':'Control','group':'Asset Lifecycle'},
        {'code':'a20c','name':'Create Asset Class','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetClass','method':'Create'},'type':'Control','group':'Asset Lifecycle'},
        {'code':'a20u','name':'Update Asset Class','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetClass','method':'Update'},'type':'Control','group':'Asset Lifecycle'},
        {'code':'a20d','name':'Display Asset Class','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetClass','method':'Display'},'type':'Control','group':'Asset Lifecycle'},
        {'code':'a30c','name':'Create Asset Construction Order','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetConstructionOrder','method':'Create'},'type':'Control','group':'Asset Lifecycle'},
        {'code':'a30u','name':'Update Asset Construction Order','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetConstructionOrder','method':'Update'},'type':'Control','group':'Asset Lifecycle'},
        {'code':'a30d','name':'Display Asset Construction Order','url':'/interface','state':{'type':'CollectionQuery','collection':'AssetConstructionOrder','method':'Display'},'type':'Control','group':'Asset Lifecycle'},
        {'code':'ch1c','name':'Create Attendance','url':'/interface','state':{'type':'CollectionQuery','collection':'Attendance','method':'Create'},'type':'Control','group':'Human Resources'},
        {'code':'ch1u','name':'Update Attendance','url':'/interface','state':{'type':'CollectionQuery','collection':'Attendance','method':'Update'},'type':'Control','group':'Human Resources'},
        {'code':'ch1d','name':'Display Attendance','url':'/interface','state':{'type':'CollectionQuery','collection':'Attendance','method':'Display'},'type':'Control','group':'Human Resources'},
        {'code':'ch2c','name':'Create Employee','url':'/interface','state':{'type':'CollectionQuery','collection':'Employee','method':'Create'},'type':'Control','group':'Human Resources'},
        {'code':'ch2u','name':'Update Employee','url':'/interface','state':{'type':'CollectionQuery','collection':'Employee','method':'Update'},'type':'Control','group':'Human Resources'},
        {'code':'ch2d','name':'Display Employee','url':'/interface','state':{'type':'CollectionQuery','collection':'Employee','method':'Display'},'type':'Control','group':'Human Resources'},
        {'code':'ch3c','name':'Create Holidays','url':'/interface','state':{'type':'CollectionQuery','collection':'Holidays','method':'Create'},'type':'Control','group':'Human Resources'},
        {'code':'ch3u','name':'Update Holidays','url':'/interface','state':{'type':'CollectionQuery','collection':'Holidays','method':'Update'},'type':'Control','group':'Human Resources'},
        {'code':'ch3d','name':'Display Holidays','url':'/interface','state':{'type':'CollectionQuery','collection':'Holidays','method':'Display'},'type':'Control','group':'Human Resources'},
        {'code':'cm1c','name':'Create Maintenance Order','url':'/interface','state':{'type':'CollectionQuery','collection':'MaintenanceOrder','method':'Create'},'type':'Control','group':'Material and Costing'},
        {'code':'cm1u','name':'Update Maintenance Order','url':'/interface','state':{'type':'CollectionQuery','collection':'MaintenanceOrder','method':'Update'},'type':'Control','group':'Material and Costing'},
        {'code':'cm1d','name':'Display Maintenance Order','url':'/interface','state':{'type':'CollectionQuery','collection':'MaintenanceOrder','method':'Display'},'type':'Control','group':'Material and Costing'},
        {'code':'cp1c','name':'Create Bank Account','url':'/interface','state':{'type':'CollectionQuery','collection':'BankAccount','method':'Create'},'type':'Control','group':'Payables and Receivables'},
        {'code':'cp1u','name':'Update Bank Account','url':'/interface','state':{'type':'CollectionQuery','collection':'BankAccount','method':'Update'},'type':'Control','group':'Payables and Receivables'},
        {'code':'cp1d','name':'Display Bank Account','url':'/interface','state':{'type':'CollectionQuery','collection':'BankAccount','method':'Display'},'type':'Control','group':'Payables and Receivables'},
        {'code':'g10c','name':'Create Chart of Accounts','url':'/interface','state':{'type':'Collection','collection':'ChartOfAccounts','method':'Create'},'type':'Control','group':'Global'},
        {'code':'g10d','name':'Display Chart of Accounts','url':'/interface','state':{'type':'CollectionQuery','collection':'ChartOfAccounts','method':'Display'},'type':'Control','group':'Global'},
        {'code':'g30c','name':'Create Group Chart of Accounts','url':'/interface','state':{'type':'Collection','collection':'GroupChartOfAccounts','method':'Create'},'type':'Control','group':'Global'},
        {'code':'g30u','name':'Update Group Chart of Accounts','url':'/interface','state':{'type':'CollectionQuery','collection':'GroupChartOfAccounts','method':'Update'},'type':'Control','group':'Global'},
        {'code':'g30d','name':'Display Group Chart of Accounts','url':'/interface','state':{'type':'CollectionQuery','collection':'GroupChartOfAccounts','method':'Display'},'type':'Control','group':'Global'},
        {'code':'g40c','name':'Create Income Tax Code','url':'/interface','state':{'type':'Collection','collection':'IncomeTaxCode','method':'Create'},'type':'Control','group':'Global'},
        {'code':'g40u','name':'Update Income Tax Code','url':'/interface','state':{'type':'CollectionQuery','collection':'IncomeTaxCode','method':'Update'},'type':'Control','group':'Global'},
        {'code':'g40d','name':'Display Income Tax Code','url':'/interface','state':{'type':'CollectionQuery','collection':'IncomeTaxCode','method':'Display'},'type':'Control','group':'Global'},
        {'code':'g60c','name':'Create Wage Type','url':'/interface','state':{'type':'Collection','collection':'WageType','method':'Create'},'type':'Control','group':'Global'},
        {'code':'g60u','name':'Update Wage Type','url':'/interface','state':{'type':'CollectionQuery','collection':'WageType','method':'Update'},'type':'Control','group':'Global'},
        {'code':'g60d','name':'Display Wage Type','url':'/interface','state':{'type':'CollectionQuery','collection':'WageType','method':'Display'},'type':'Control','group':'Global'},
        {'code':'c10c','name':'Create Company','url':'/interface','state':{'type':'Collection','collection':'Company','method':'Create'},'type':'Control','group':'Company'},
        {'code':'c10u','name':'Update Company','url':'/interface','state':{'type':'CollectionQuery','collection':'Company','method':'Update'},'type':'Control','group':'Company'},
        {'code':'c10d','name':'Display Company','url':'/interface','state':{'type':'CollectionQuery','collection':'Company','method':'Display'},'type':'Control','group':'Company'},
        {'code':'c20c','name':'Create Customisation','url':'/interface','state':{'type':'CollectionQuery','collection':'Customisation','method':'Create'},'type':'Control','group':'Company'},
        {'code':'c20u','name':'Update Customisation','url':'/interface','state':{'type':'CollectionQuery','collection':'Customisation','method':'Update'},'type':'Control','group':'Company'},
        {'code':'c20d','name':'Display Customisation','url':'/interface','state':{'type':'CollectionQuery','collection':'Cusomisation','method':'Display'},'type':'Control','group':'Company'},
        {'code':'c30c','name':'Create Time Control','url':'/interface','state':{'type':'CollectionQuery','collection':'TimeControl','method':'Create'},'type':'Control','group':'Company'},
        {'code':'c30u','name':'Update Time Control','url':'/interface','state':{'type':'CollectionQuery','collection':'TimeControl','method':'Update'},'type':'Control','group':'Company'},
        {'code':'c30d','name':'Display Time Control','url':'/interface','state':{'type':'CollectionQuery','collection':'TimeControl','method':'Display'},'type':'Control','group':'Company'},
        {'code':'tab10', 'name':'Currencies', 'url':'/interface','state':{'type':'Table','table':'Currencies','method':'Display'},'type':'Control','group':'Tables'},
        {'code':'tab20', 'name':'HSN', 'url':'/interface','state':{'type':'Table','table':'HSN','method':'Display'},'type':'Control','group':'Tables'},
        {'code':'tab30', 'name':'Segments', 'url':'/interface','state':{'type':'Table','table':'Segments','method':'Display'},'type':'Control','group':'Tables'},
        {'code':'tab40', 'name':'Units', 'url':'/interface','state':{'type':'Table','table':'Units','method':'Display'},'type':'Control','group':'Tables'},
        {'code':'tab50', 'name':'Wage Types', 'url':'/interface','state':{'type':'Table','table':'WageTypes','method':'Display'},'type':'Control','group':'Tables'},
        {'code':'tgen','name':'General','url':'/interface','state':{'type':'Transaction','transaction':'General','data':{}},'type':'Record','group':'Financial Accounting'},
        {'code':'tdep','name':'Depreciation','url':'/interface','state':{'type':'TransactionQuery','transaction':'Depreciation','data':{}},'type':'Record','group':'Asset Lifecycle'},
        {'code':'r1','name':'View Document','url':'/interface','state':{'type':'ReportQuery','report':'ViewDocument'},'type':'Reports','group':'Financial Accounting'},
        {'code':'itsimulate','name':'Income Tax Simulator', 'url':'/interface', 'state':{'type':'Report','report':'IncomeTaxSimulator','data':{}},'type':'Reports','group':'Intelligence'}

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
                        <div className='menuItem' onClick={()=>{navigate(code['url'],{state:code['state']})}}><h4>{code['name']}</h4></div>
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
    schema(data){
        let schema = {};
        switch (this.report){
            case 'IncomeTaxSimulator':
                schema = [
                    {'name':'Income Tax Code', 'datatype':'single','input':'option','options':["",...new Collection('IncomeTaxCode').listAll('Code')]},
                    {'name':'Financial Year', 'datatype':'single','input':'input','type':"number"},
                    {'name':'Total Income', 'datatype':'single','input':'input','type':"number"},
                    {'name':'Tax on Total Income','datatype':'single','noteditable':true},
                    {'name':'Marginal Relief','datatype':'single','noteditable':true},
                    {'name':'Net Tax on Total Income','datatype':'single','noteditable':true},
                ]
                break
            case 'ViewDocument':
                schema = [
                {"name":"Posting Date","datatype":"single","noteditable":true},
                {"name":"Document Number","datatype":"single","noteditable":true},
                {"name":"Line Items","datatype":"table"}
                ];
                break
        }
        return schema
    }
    defaults(data){
        let defaults = {};
        switch (this.report){
            case 'ViewDocument':
                const documentData = Transaction.getDocument(data['Company Code'],data['Year'],data['Document Number']);
                defaults = documentData;
                break
            case 'IncomeTaxSimulator':
                defaults = {'Income Tax Code':'115BAC','Financial Year':2024,'Total Income':0,'Tax on Total Income':0,'Marginal Relief':0,'Net Tax on Total Income':0};
                break
        }
        return defaults;
    }
    errors(data){
        const list = [];
        if (this.report==="IncomeTaxSimulator"){
            if (data['Income Tax Code']===""){
                list.push(`Incom Tax Code required`);
            } else {
                if (data['Financial Year']===""){
                    list.push('Financial Year required');
                } else {
                    if (!new IncomeTaxCode(data['Income Tax Code']).yearExists(data['Financial Year'])){
                        list.push(`Taxation for specified year not available in Income Tax Code: ${data['Income Tax Code']}`)
                    }
                }
            }   
                

        }
        return list;
    }
    process(data){
        let result = {...data};
        if (this.report=="IncomeTaxSimulator"){
            if (result['Income Tax Code']!=="" && data['Financial Year']!==""){
                const IT = new IncomeTaxCode(result['Income Tax Code']);
                if (IT.yearExists(data['Financial Year'])){
                    result['Tax on Total Income'] = IT.tax(Number(result['Financial Year']),Number(result['Total Income']));
                    result['Marginal Relief'] = IT.marginalRelief(result['Financial Year'],result['Total Income']);
                    result['Net Tax on Total Income'] = IT.netTax(Number(result['Financial Year']),Number(result['Total Income']));
                }
            }
        }
        return result;
    }
    navigation(data){
        let navigation = [];
        if (['ViewDocument'].includes(this.report)){  
            navigation = [
                {"name":"Back","type":"navigate","url":"/interface","state":{"type":"ReportQuery","report":this.report}}
            ]
        }
        return navigation;
    }
    title(){
        const titles = {
            "ViewDocument":"View Document",
            "IncomeTaxSimulator":"Income Tax Simulate"
        }
        return (titles[this.report]);
    }
}

class TransactionQuery{
    constructor(type){
        this.type = type;
    }
    schema(data){
        let schema = [];
        switch (this.type){
            case 'Depreciation':
                schema = [
                    {'name':'Company Code','datatype':'single','input':'option',"options":["",...Company.listAll]}
                ]
                break
            case 'VanAccounting':
                schema = [
                    {'name':'Bank Account', 'datatype':'single','input':'option','options':[''], 'noteditable':false},
                    {'name':'Virtual Account', 'datatype':'single','input':'option','options':[''], 'noteditable':false},
                    {'name':'Company Code', 'datatype':'single','input':'option','options':["",...Company.listAll], 'noteditable':false},
                ]
                break
        }
        return schema;
    }
    defaults(data){
        let defaults = {};
        switch (this.type){
            case 'Depreciation':
                defaults = {'Company Code':''};
                break
            case 'vanAccounting':
                defaults = {"Bank Account":"","Virtual Account":"","Company Code":Company.listAll[0]}
                break
        }
        return defaults
    }
    process(data){
        return data
    }
    errors(data){
        let errors = [];
        return errors;
    }
    navigation(data){
        const navigation = [
            {'name':'Go','type':'navigate','url':'/interface','state':{'data':data,'type':'Transaction','transaction':this.type}}
        ];
        return navigation
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
        const company = data['Company Code'];
        let schema = [
            {"name":"Company Code", "datatype":"single","input":"option","options":["",...new Collection('Company').listAll('Code')], "noteditable":!(data['Company Code']=="")},
            {"name":"Posting Date", "datatype":"single","input":"input","type":"date", "noteditable":(data['Company Code']=="")},
            {"name":"Document Date", "datatype":"single","input":"input","type":"date","noteditable":(data['Company Code']=="")},
            {"name":"Reference", "datatype":"single","input":"input","type":"text","noteditable":(data['Company Code']=="")},
            {"name":"Balance", "datatype":"single","input":"input","type":"text","noteditable":true},
            {"name":"Currency", "datatype":"single","input":"option","options":["",...new Table('Currencies').list], "noteditable":(data['Company Code']=="")},
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
            "schema":data['Line Items'].map(item=>this.lineItem(company,data,item))
        })
        return schema;
    }
    lineItem(company,data,item){
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
            {"name":"Cost Center","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'CostCenter').listAll('Code')]},
            {"name":"Cost Object","datatype":"single","input":"input","type":"text"},
            {"name":"Profit Center","datatype":"single","input":"option","options":["",...new CompanyCollection(company,'ProfitCenter').listAll('Code')], "noteditable":(data['Company Code']=="")},
            {"name":"Location","datatype":"single","input":"option","options":[""], "noteditable":(data['Company Code']=="")},
            {"name":"Quantity","datatype":"single","input":"input","type":"number"},
            {"name":"Material Valuation From","datatype":"single","input":"input","type":"date"},
            {"name":"Material Valuation To","datatype":"single","input":"input","type":"date"},
            {"name":"Cost Valuation From","datatype":"single","input":"input","type":"date"},
            {"name":"Cost Valuation To","datatype":"single","input":"input","type":"date"},
            {"name":"HSN","datatype":"single","input":"option","options":["",...new Table('HSN').list]}
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
            "Asset":new CompanyCollection(Company,'Asset').listAll('Code'),
            "Bank Account":new CompanyCollection(Company,'BankAccount').listAll('Code'),
            "Customer":new CompanyCollection(Company,'Customer').listAll('Code'),
            "General Ledger":new CompanyCollection(Company,'GeneralLedger').listAll('Code'),
            "Material":new CompanyCollection(Company,'Material').listAll('Code'),
            "Service":new CompanyCollection(Company,'Service').listAll('Code'),
            "Vendor":new CompanyCollection(Company,'Vendor').listAll('Code'),
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
                    <table>
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
                                                {(subfield['input']=="input" && !subfield['noteditable'])&& <input onChange={(e)=>handleChange(subfield['name'],index,e)} type={subfield['type']} placeholder={subfield['placeholder']} value={output[field['name']][index][subfield['name']]}/>}
                                                {(subfield['input']=="option"&& !subfield['noteditable']) && <select onChange={(e)=>handleChange(subfield['name'],index,e)} value={output[field['name']][index][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}
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
    const allfields = [];
    collection.map(item=>allfields.push(...Object.keys(item)));
    const fields = [...new Set(allfields)];
    const CSV = ()=>{
        Operations.downloadCSV(collection,'Table')
    }
    return (
        <div className='displayAsTable'>
            <table className='displayTable'>
                <thead><tr>{fields.map(field=><th className='displayTableCell'>{field}</th>)}</tr></thead>
                <tbody>{collection.map(data=><tr>{fields.map(field=><td className='displayTableCell'>{data[field]}</td>)}</tr>)}</tbody>
            </table>
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
        if (this.method=="Create"){
            switch (this.name){
                case 'Asset':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Description":"",
                        "Asset Class":"",
                        "Organisational Unit Type":"",
                        "Organisational Unit":"",
                        "Date of Capitalisation":"",
                        "Date of Retirement":"",
                        "Depreciation Method":"",
                        "Depreciation Rate":"",
                        "Useful Life":0,
                        "Salvage Value":0,
                        "Status":"Draft"
                        
                    }
                    break
                case 'AssetClass':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Description":"",
                        "Depreciable":"Yes",
                        "General Ledger - Depreciation":"",
                        "General Ledger - Asset":"",
                        "Status":"Draft"
                    }
                    break
                case 'AssetConstructionOrder':
                    defaults = {
                        "Company Code":data['Company Code'],
                        "Code":"",
                        "Description":"",
                        "Profit Center":"",
                        "Settlement Ratio":[
                            {"Asset":"","Ratio":""}
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
                        "Attendance":datesInMonth(data['Year'],data['Month']).map(item=>({'Date':item,'Status':'','Remarks':''}))
                    }
                    break
                case 'BankAccount':
                    defaults = {
                        "Code":"",
                        "Company Code":data['Company Code'],
                        "Name":"",
                        "Bank":"",
                        "Account":"",
                        "IFSC":"",
                        "Profit Center":"",
                        "Virtual Accounts":[{"Virtual Account Number":"","Ledger":"","Profit Center":""}],
                        "Group Keys":[]
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
                        "Name":"",
                        "Price":[
                            {"Location":"","From":"","To":"","Price":""}
                        ],
                        "General Ledger":"",
                        "General Ledger - Cost of Sales":"",
                        "General Ledger - Revenue":""
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
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Asset Class","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'AssetClass').listAll('Code')],"noteditable":!(this.method=="Create")},
                    {"name":"Organisational Unit Type","datatype":"single","input":"option","options":["","CostCenter","Location","Plant","RevenueCenter"],"noteditable":!(this.method=="Create")},
                    {"name":"Organisational Unit","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],data['Organisational Unit Type']).listAll('Code')],"noteditable":!(this.method=="Create")},
                    {"name":"Date of Capitalisation","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Date of Retirement","datatype":"single","input":"input","type":"date","noteditable":!this.editable},
                    {"name":"Depreciation Method","datatype":"single","input":"option","options":["","Straight Line","Reducing Balance"],"noteditable":!this.editable},
                    {"name":"Depreciation Rate","datatype":"single","input":"input","type":"number","noteditable":(!this.editable || data['Depreciation Method']!="Reducing Balance")},
                    {"name":"Useful Life","datatype":"single","input":"input","type":"number","noteditable":(!this.editable || data['Depreciation Method']!="Straight Line")},
                    {"name":"Salvage Value","datatype":"single","input":"input","type":"number","noteditable":(!this.editable || data['Depreciation Method']!="Straight Line")},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"]}
                ]
                break
            case 'AssetClass':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!(this.editable)},
                    {"name":"Depreciable","datatype":"single","input":"option","options":["Yes","No"],"noteditable":!(this.method=="Create")},
                    {"name":"General Ledger - Depreciation","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'Asset'},'Code')],"noteditable":(data['Depreciable']!="Yes" || this.method!="Create")},
                    {"name":"General Ledger - Asset","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'GeneralLedger').filteredList({'Ledger Type':'Depreciation'},'Code')],"noteditable":!(this.method=="Create")},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Blocked"],"noteditable":!(this.editable)}
                ]
                break
            case 'AssetConstructionOrder':
                schema = [
                    {"name":"Company Code","datatype":"single","input":"input","type":"text","noteditable":true},
                    {"name":"Code","datatype":"single","input":"input","type":"text","noteditable":!(this.method=="Create")},
                    {"name":"Description","datatype":"single","input":"input","type":"text","noteditable":!(this.editable)},
                    {"name":"Profit Center","datatype":"single","input":"option","options":["",...new CompanyCollection(data['Company Code'],'AssetConstructionOrder').listAll('Code')],"noteditable":!(this.method=="Create")},
                    {"name":"Settlement Ratio","datatype":"collection","noteditable":!this.editable,"schema":data['Settlement Ratio'].map(item=>[
                        {'name':'Asset','datatype':'single','input':'option','options':['',...new CompanyCollection(data['Company Code'],'Asset').listAll('Code')],'noteditable':!this.editable},
                        {"name":"Ratio","datatype":"single","input":"input","type":"number","noteditable":!(this.editable)},
                    ])},
                    {"name":"Status","datatype":"single","input":"option","options":["Draft","Ready","Completed"],"noteditable":!this.editable},
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
                    {"name":"General Ledger","datatype":"single","input":"option","options":["",...GeneralLedger.listBytype('Bank Account')],"noteditable":(!this.method=="Create")},
                    {"name":"Profit Center","datatype":"single","input":"option","options":["",...ProfitCenter.listAll('FACT')],"noteditable":(!this.method=="Create")},
                    {"name":"Business Place","datatype":"single","input":"option","options":[""],"noteditable":(!this.method=="Create")},
                    {"name":"Virtual Accounts","datatype":"collection","noteditable":!this.editable,"schema":data['Virtual Accounts'].map(item=>[
                        {"name":"Virtual Account Number","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                        {"name":"Ledger","datatype":"single","input":"option","options":[],"noteditable":!this.editable},
                        {"name":"Presentation","datatype":"single","input":"option","options":[],"noteditable":!this.editable},
                        {"name":"Profit Center","datatype":"single","input":"option","options":[],"noteditable":!this.editable},
                    ])},
                    {"name":"Group Keys","datatype":"list","input":"input","type":"text","noteditable":!this.editable},
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
                    {"name":"Functional Currency","datatype":"single","input":"option","options":["",...new Table('Currencies').list],"noteditable":!(this.method=="Create")},
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
                    {"name":"Name","datatype":"single","input":"input","type":"text","noteditable":!this.editable},
                    {"name":"Unit","datatype":"single","input":"option","options":["",...new Table('Units').list],"noteditable":!this.editable},
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
        let navigation = [
            {"name":"Back","type":"navigate","url":'/control','state':{},'onClick':()=>alert('Hi')},
            {"name":"Save","type":"action","onClick":()=>alert(this.save(data))},
        ];
        if (this.method!="Create"){
            navigation.push({"name":"Export JSON","type":"action","onClick":()=>Operations.downloadJSON(data,this.name)})
        }
        if (this.method==="Display"){
            navigation = navigation.filter(item=>item['name']!=="Save");
        }
        return navigation;

    }
    errors(data){
        const list = [];
        let mandatory = Collection.mandatory[this.name];
        const nonNegatives = [];
        (this.method=="Create" && this.exists(data))?list.push(`Record of ${this.title} with same identfiers ${JSON.stringify(this.identifiers)} already exists`):()=>{};
        (KB.AccountTypes.includes(this.title) && data['Code']!="" && !valueInRange(data['Code'],new Company(data['Company Code']).CollectionRange(this.title)))?list.push(`${this.title} code ${data['Code']} not in range for Company ${data['Company Code']} (${JSON.stringify(new Company(data['Company Code']).CollectionRange(this.title))})`):()=>{};
        switch (this.name){
            case 'Asset':
                data['Date of Retirement']!="" && (new Date(data['Date of Retirement']) < new Date(data['Date of Capitalisation']))?list.push("Date of Retirement cannot be before Date of Capitalisation"):()=>{};
                data['Date of Capitalisation']!="" && (new Date(data['Date of Capitalisation']) > new Date())?list.push("Date of Capitalisation cannot be in future"):()=>{};
                (data['Depreciation Rate']>100)?list.push(`Depreciation Rate cannot exceed 100%`):()=>{};
                nonNegatives.push(...["Useful Life","Salvage Value","Depreciation Rate"]);
                if (data['Depreciation Method']==="Straight Line"){
                    mandatory = [...Collection.mandatory[this.name],"Useful Life","Salvage Value"];
                } else if (data['Depreciation Method']==="Reducing Balance") {
                    mandatory = [...Collection.mandatory[this.name],"Depreciation Rate"];
                }
                break
            case 'AssetClass':
                if (data['Depreciable']=="Yes"){
                    mandatory = [...Collection.mandatory[this.name],"General Ledger - Depreciation"];
                }
                break
            case 'AssetConstructionOrder':
                (SumField(data['Settlement Ratio'],'Ratio')>100?list.push(`Total of ratio cannot be more than 100`):()=>{});
                for (let i=0; i<data['Settlement Ratio'].length;i++){
                    let ratio = data['Settlement Ratio'][i];
                    if (ratio['Ratio']<0){
                        list.push(`Ratio ${i+1} is negative.`)
                    }
                    if (ratio['Asset']===""){
                        list.push(`Ratio ${i+1} requires an Asset Code.`)
                    }
                }
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
                break
            case 'UserSettings':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
            case 'Vendor':
                this.exists(data)?list.push(`${this.title} with same identifier(s) already exists`):()=>{};
                break
        }
        const missed = [];
        mandatory.map(field=>data[field]==""?missed.push(field):()=>{});
        (missed.length>0)?list.push(`${missed.join(", ")} necessary`):()=>{};
        nonNegatives.map(field=>data[field]<0?list.push(`${field} cannot be negative.`):()=>{});
        const uniquelist = [...new Set(list)];
        return uniquelist;
    }
    process(data){
        let result = {...data};
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
        "AssetConstructionOrder":"assetconstructionorders",
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
        "MaintenanceOrder":"maintenanceorders",
        "Material":"materials",
        "OrganizationUnit":"organisationalunits",
        "PaymentTerms":"paymentterms",
        "ProfitCenter":"profitcenters",
        "PurchaseOrder":"purchaseorders",
        "SaleOrder":"saleorders",
        "Service":"services",
        "TimeControl":"timecontrols",
        "UserSettings":"usersettings",
        "Vendor":"vendors",
    }
    static mandatory = {
        "Asset":["Company Code","Code","Description","Asset Class","Organisational Unit Type","Organisational Unit","Date of Capitalisation","Depreciation Method"],
        "AssetClass":["Code","Company Code","Description","Depreciable","General Ledger - Asset"],
        "AssetConstructionOrder":["Company Code","Code","Description","Profit Center"],
        "Attendance":["Company Code","Employee","Year","Month"],
        "BankAccount":["Code","Company Code","Name","Account","Bank","IFSC"],
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
        "MaintenanceOrder":["Code","Company Code","Organisational Unit","Type of Activity"],
        "Material":["Code","Company Code","Name","Unit","General Ledger","General Ledger - Cost of Sales", "General Ledger - Revenue"],
        "OrganisationalUnit":["Code","Company Code","Name","Cost Center","Business Place"],
        "PaymentTerms":["Code","Description"],
        "ProfitCenter":["Company Code","Code","Segment","Name"],
        "PurchaseOrder":["Code","Company Code","Vendor","Date","Business Place"],
        "SaleOrder":["Code","Company Code","Customer","Date","Business Place"],
        "Service":["Code","Company Code","Name","Unit","General Ledger - Expense","General Ledger - Revenue"],
        "TimeControl":["Company Code"],
        "UserSettings":["User"],
        "Vendor":["Code","Company Code","Name","State"],
    }
    static identifiers = {
        "Asset":["Company Code","Code"],
        "AssetClass":["Code","Company Code"],
        "AssetConstructionOrder":["Company Code","Code"],
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
        "MaintenanceOrder":["Company Code"],
        "Material":["Code","Company Code"],
        "OrganisationalUnit":["Code","Company Code"],
        "PaymentTerms":["Code","Company Code"],
        "ProfitCenter":["Company Code","Code"],
        "PurchaseOrder":["Code","Company Code"],
        "SaleOrder":["Code","Company Code"],
        "Service":["Code","Company Code"],
        "TimeControl":["Company Code"],
        "UserSettings":["User"],
        "Vendor":["Code","Company Code"],
    }
    static titles = {
        "Asset":"Asset",
        "AssetClass":"Asset Class",
        "AssetConstructionOrder":"Asset Construction Order",
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
        "MaintenanceOrder":"Maintenance Order",
        "Material":"Material",
        "OrganisationalUnit":"Organizational Unit",
        "PaymentTerms":"Payment Terms",
        "ProfitCenter":"Profit Center",
        "PurchaseOrder":"Purchase Order",
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
    schema(data){
        let schema = [];
        switch (this.collection){
            case 'Asset':
                schema = [
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text'},
                    {'name':'Company Code', 'datatype':'single','input':'option', 'options':["", ...new Collection('Company').listAll('Code')]}
                ]
                break
            case 'AssetClass':
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
                    {'name':'Code', 'datatype':'single','input':'input', 'type':'text', 'maxLength':4},
                ]
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
        return schema
    }
    errors(data){
        const missing = [];
        const errors = [];
        this.createRequirements.map(field=>(data[field]=="")?missing.push(field):()=>{});
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
        "AssetClass":{"Code":"","Company Code":''},
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
        "Holidays":{"Company Code":'',"Year":""},
        "IncomeTaxCode":{"Code":""},
        "Location":{"Code":"","Company Code":''},
        "MaintenanceOrder":{"Code":"","Company Code":''},
        "Material":{"Code":"","Company Code":""},
        "MaterialGroup":{"Code":"","Company Code":''},
        "PaymentTerms":{"Code":""},
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

class Asset extends CompanyCollection{
    constructor(code,company,name="Asset"){
        super(company,name)
        this.code = code;
        this.data = super.getData({'Code':this.code})
    }
}

class AssetConstructionOrder extends CompanyCollection{
     constructor(code,company,name="AssetConstructionOrder"){
        super(company,name)
        this.code = code;
        this.data = super.getData({'Code':this.code})
    }
}

class BankAccount extends CompanyCollection{
    constructor(code,company,name="BankAccount"){
        super(company,name)
        this.code = code;
        this.data = super.getData({'Code':this.code})
    }
}

class GeneralLedger extends CompanyCollection{
    constructor(code,company,name="BankAccount"){
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

class ReportQuery{
    constructor(report){
        this.report = report;
    }
    schema(data){
        let schema = [];
        switch (this.report){
            case 'ViewDocument':
                schema = [
                {"name":"Company Code","datatype":"single","input":"option","options":["",...Company.listAll]},
                {"name":"Year","datatype":"single","input":"input","type":"text"},
                {"name":"Document Number","datatype":"single","input":"input","type":"text"},
                {"name":"Segment","datatype":"multiple","input":"input","type":"number","req":["values","ranges","exclValues","exclRanges"]}
            ]
            break
        }
        return schema;
    }
    defaults(data){
        let defaults = {};
        switch (this.report){
            case 'ViewDocument':
                defaults = {"Company Code":"","Year":"","Document Number":"","Segment":{"values":[""],"exclValues":[""],"ranges":[{"from":"","to":""}],"exclRanges":[{"from":"","to":""}]}};
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
    let isTable = false;
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
        editable = true;
        title = Display.title();
    }
    const [data,setdata] = useState(defaults);
    const output = Display.process(data);
    const schema = Display.schema(output);
    const errors = Display.errors(output);
    const navigation = Display.navigation(output);

    return(<>
        <View table={isTable} title={title} editable={editable} output={output} schema={schema} defaults={defaults} setdata={setdata} errors={errors} navigation={navigation}/>
        </>
    )
}

function View({title,editable,output,schema,defaults,setdata,errors,navigation,table}){
    const navigate = useNavigate();
    const goto = (url,data)=>{
        navigate(url,{state:data});
        window.location.reload();
    }

    return(
        <div className='display'>
            <div className='displayTitle'>
                <h2>{title}</h2>
            </div>
            <div className='displayInputFields'>
                {!table && schema.map(field=>
                    <>
                        {field['datatype']=="single" && <SingleInput field={field} output={output} setdata={setdata}/>}
                        {field['datatype']=="list" && <ListInput field={field} output={output} setdata={setdata}/>}
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
                <Collapsible title={`Alert (${errors.length}) `} children={<ul>
                    {errors.map(error=>
                        <li>{error}</li>
                    )}
                </ul>}/>
            </div>}
            {navigation.length>0 && <div className='navigation'>
                {navigation.map(item=><>
                    {item['type']=="navigate" && <button onClick={()=>goto(item['url'],item['state'])}>{item['name']}</button>}
                    {item['type']=="action" && <button onClick={item['onClick']}>{item['name']}</button>}
                    </>
                )}
            </div>}
        </div>
    )
}

class Company{
    constructor(Code){
        this.code = Code;
        this.data = new Collection('Company').getData({"Code":this.code});
        this.BusinessPlaces = ListItems(this.data['Places of Business'],"Place");
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
    
    return(
        <>
            {JSON.stringify(new IncomeTaxCode('115BAC').yearExists(2024))}        
        </>
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
    return(
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
    )
    
}

export default App; 