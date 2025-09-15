import './App.css'
import {CreateObject, Purchase} from './Transaction.jsx';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import { collection } from './scripts.js';


function Title(){
  return(
    <div className='title'>
      <h2>Simple Costs<sup>&reg;</sup></h2>
    </div>
  )
}

function Menu({index}){

  
  const menus = [
    {"name":"Objects",
      "items":['Asset Classes','Assets','Cost Centers', 'Cost Objects','General Ledgers','Locations','Materials','Profit Center', 'Purchase Order', 'Service Order', 'Vendor' ]
    },
    {"name":"Transactions",
      "items":['Purchase','Sale']
    },
    {"name":"Reports",
      "items":['Trial Balance','Financial Statements','Cost Statement']
    }
  ]



  return(
    <>
    <div className='menus'>
      {menus.map((menu,index)=><div className="menu-cell"><Link to={"/home/"+index}>{menu.name}</Link></div>)}
    </div>
    <div className='menu'>
      {menus[index]["items"].map((item)=><Link className="menu-cell" to={`/${item}`}>{item}</Link>)}
    </div>
    </>
  )
}

function Home(){

  const {ui} = useParams();
  const i = ui || 0;

  return(
    <div className='home'>
    <Menu index={i}/>
    </div>
  )
}


function App(){
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/home/0"/>}/>
      <Route path="/home/:ui" element={<div className='verticalContainer'><Home/></div>}/>
      <Route path="/createobject/:Object" element={<div className="verticalContainer"><CreateObject/></div>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App;