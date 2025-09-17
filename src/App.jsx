import './App.css'
import {CreateObject, DisplayObjects, DisplayObject} from './Objects.jsx';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import { collection } from './scripts.js';
import {Transaction} from './Templates.jsx'

function Menu({Menu,list}){
  return(
    <div className='menu'>
      <div className='cell'><h2>{Menu}</h2></div>
      {list.map(item=><div className='cell'><Link to="/">{item}</Link></div>)}
      <div className="cell"><Link to="/">Home</Link></div>
    </div>
  )
}

function Home(){

  return(
    <div className='home'>
      <h1 className='title'>Simple Costs<sup>&reg;</sup></h1>
    <div className='actions'>{}
      <div className='cell'><Link to="/manage">Manage</Link></div>
      <div className='cell'><Link to="/record">Record</Link></div>
      <div className='cell'><Link to="/reports">Reports</Link></div>
    </div>
    </div>
  )
}




function App(){
  return(
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/manage' element={<Menu Menu={"Manage"} list={["Asset","Asset Class","Employee"]}/>}/>
      <Route path='/record' element={<Menu Menu={"Record"} list={["Purchase","Sale", "Cost Transfer"]}/>}/>
      <Route path='/reports' element={<Menu Menu={"Reports"} list={["Trial Balance","Financial Statements","Cost Statements"]}/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App;