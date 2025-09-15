import './App.css'
import CostTable from './CostTable.jsx'
import RecordCost from './RecordCost.jsx';
import Apportionment from './Apportionment.jsx';
import FixedAssets from './FixedAssets.jsx';
import GeneralLedger from './GeneralLedgers.jsx'
import {CreateObject, Purchase} from './Transaction.jsx';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { collection } from './scripts.js';


function Title(){
  return(
    <div className='title'>
      <h2>Simple Costs<sup>&reg;</sup></h2>
    </div>
  )
}

function PageTitle({v}){
  return(
    <>
    <h2 className='pagetitle'>{v}</h2>
    </>
  )
}

function Menu({index}){

  
  const menus = [
    {"name":"Objects",
      "items":['Asset Classes','Assets','Cost Centers', 'Cost Objects','General Ledgers','Locations','Materials','Profit Center', 'Purchase Order', 'Service Order', 'Vendor' ]
    },
    {"name":"Transactions",
      "items":[]
    },
    {"name":"Reports",
      "items":[]
    }
  ]



  return(
    <>
    <div className='menus'>
      {menus.map((menu,index)=><div className="menu-cell"><p>{menu.name}</p></div>)}
    </div>
    <div className='menu'>
      {menus[index]["items"].map((item)=><Link to={`/${item}`}>{item}</Link>)}
    </div>
    </>
  )
}

function Navigation(){
  return(
  <div className='navigation'>
    <Link to="/">Home</Link>
    <Link to="/fixedassets">Fixed Assets</Link>
    <Link to="/costing">Costing</Link>
    <Link to="/generalledgers">General Ledgers</Link>
  </div>
  )
}

function Home(){
  return(
    <>
    <PageTitle v="Interface"/>
    <Menu index={0}/>
    </>
  )
}

function CostNavigation(){
  return(
    <div className='navigation'>
    <Link to="/">Home</Link>
    <Link to="/costing">Display</Link>
    <Link to="/record">Record</Link>
    </div>
  )
}

function FANavigation(){
  return(
    <div className='navigation'>
    <Link to="/">Home</Link>
    <Link to="/fixedassets">Display</Link>
    </div>
  )
}

function App(){
  return (
    <BrowserRouter>
    <Title/>
    <Routes>
      <Route path="/costing" element={<div className='verticalContainer'><CostNavigation/><CostTable/></div>}/>
      <Route path="/" element={<div><Navigation/><Home/></div>}/>
      <Route path="/record" element={<div className='verticalContainer'><CostNavigation/><RecordCost/></div>}/>
      <Route path="/apportion" element={<div className='verticalContainer'><Apportionment/></div>}/>
      <Route path="/fixedassets" element={<div className='verticalContainer'><FANavigation/><FixedAssets/></div>}/>
      <Route path="/generalledgers" element={<div className="verticalContainer"><GeneralLedger/></div>}/>
      <Route path="/purchase" element={<div className="verticalContainer"><Purchase/></div>}/>
      <Route path="/createobject" element={<div className="verticalContainer"><CreateObject Object={'Asset Class'}/></div>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App;