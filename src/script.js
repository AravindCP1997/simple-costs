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

const objects = {
    "Asset":{
        "name":"Asset",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Asset Class", "datatype":"single", "input":"option", "options":ListofItems(loadData("assetclasses"),0),"use-state":""},
            {"name": "Cost Center", "datatype":"single", "input":"option", "options":ListofItems(loadData("costcenters"),0),"use-state":""},
            {"name": "Useful Life", "datatype":"single", "input":"input", "type":"number","use-state":0},
            {"name": "Salvage Value", "datatype":"single", "input":"input", "type":"number","use-state":0},
            {"name": "Date of Capitalisation", "datatype":"single", "input":"input", "type":"date","use-state":0},
            {"name": "Income Tax Depreciation Rate", "datatype":"single", "input":"input", "type":"number","use-state":0}
        ],
        "collection":'assets'
    },
    "Asset Class":{
        "name":"Asset Class",
        "schema": [
            {"name": "Name", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "General Ledger", "datatype":"single", "input":"option", "options":ListofItems(loadData('generalledgers'),0), "use-state":""}
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
            {"name":"Ledger Type","datatype":"single","input":"option","options":["Fixed Asset", "Cost Element", "Customer", "Material", "Vendor","General"]}
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
            {"name": "Entry Date", "datatype":"single", "input":"input", "type":"date", "disabled":true, "use-state":new Date()},
            {"name": "Description", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Posting Date", "datatype":"single", "input":"input", "type":"date", "use-state":new Date()},
            {"name": "Document Date", "datatype":"single", "input":"input", "type":"date", "use-state":""},
            {"name": "Reference", "datatype":"single", "input":"input", "type":"text", "use-state":""},
            {"name": "Currency", "datatype":"single", "input":"option", "options":[], "use-state":""},
            {"name": "Calculate Tax", "datatype":"single", "input":"option", "options":["Yes","No"], "use-state":"No"},
            {"name":"Balance", "value":"calculated"},
            {"name": "Line Items", "datatype":"collection", "structure":
                [
                    {"name":"Account", "datatype":"single","input":"option","options":ListofItems(loadData('generalledgers'),0)},
                    {"name":"Account Type", "datatype":"single","input":"input","type":"text"},
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

                ],  
                "use-state":[{"id":0,"Ledger Type":"Asset","General Ledger":"Plant and Machinery","Amount":0,"Debit/ Credit":"Debit","GST":"Input 5%","Cost Center":"Head Office","Asset":"","Material":"","Quantity":"","Location":"","Profit Center":"","Purchase Order":"","Purchase Order Item":"","Sale Order":"","Sale Order Item":"","Consumption Time From":"","Consumption Time To":"","Employee":""}]}
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
}

class Intelli{
    constructor(){
        this.database = Database.loadAll();
        this.assets = this.database['Asset'];
        this.assetclasses = this.database['Asset Class']
    }
    search(collectionname,key,value,property){
        const collection = this.database[collectionname]
        const result = collection.filter(element=>element[key]==value)[0][property]
        return result
    }
    fixedassetsregister(){
        const register = this.assets.map(asset=>({...asset,['General Ledger']:this.search('Asset Class','Name',asset['Asset Class'],'General Ledger')}))
        return register
    }
    employeeregister(){
        const employees = Database.load('General Ledger')
        return employees
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

const ReportQuerySchema = {
    "Financial Statements":[
        {"Field":"Year"}
    ]
}

class ReportObject{
    constructor(name){
        this.name = name
        this.schema = ReportQuerySchema[this.name]
    }
    process(data){
        switch(this.name){
            case 'Financial Statements':
                const result = new Intelli().transactionstable().filter(item=>item['Reference']== data['Reference'])
                return result
        }
    }
}

export {Intelli,Database,objects,loadData,saveData,ListofItems,SumField,SumFieldIfs,Company, ReportObject}