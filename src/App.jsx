import './App.css'
import CostTable from './CostTable.jsx'
import RecordCost from './RecordCost.jsx';
import Apportionment from './Apportionment.jsx';
import FixedAssets from './FixedAssets.jsx';
import GeneralLedger from './GeneralLedgers.jsx'
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Title(){
  return(
    <div className='title'>
      <h1>Simple Costs<sup>&reg;</sup></h1>
    </div>
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
      <Route path="/" element={<Navigation/>}/>
      <Route path="/record" element={<div className='verticalContainer'><CostNavigation/><RecordCost/></div>}/>
      <Route path="/apportion" element={<div className='verticalContainer'><Apportionment/></div>}/>
      <Route path="/fixedassets" element={<div className='verticalContainer'><FANavigation/><FixedAssets/></div>}/>
      <Route path="/generalledgers" element={<div className="verticalContainer"><GeneralLedger/></div>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App;