import './App.css'
import {CreateObject, DisplayObjects, DisplayObject, objects} from './Objects.jsx';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import { collection } from './scripts.js';
import {Transaction} from './Templates.jsx'

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
      "items":Object.keys(objects),
      "onclick":"/displayobjects/"
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
      {menus[index]["items"].map((item)=>
        <div className="menu-cell">
        <Link to={`${menus[index]["onclick"]}${item}`}>{item}</Link>
        </div>
      )}
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
      <Route path="/" element={<Navigate to="/scratch"/>}/>
      <Route path="/home/:ui" element={<div className='verticalContainer'><Home/></div>}/>
      <Route path="/createobject/:Object" element={<div className="verticalContainer"><CreateObject/></div>}/>
      <Route path="/displayobjects/:Object" element={<div className='verticalContainer'><DisplayObjects/></div>}/>
      <Route path="/displayobject/:Object" element={<div className="verticalContainer"><DisplayObject/></div>}/>
      <Route path="/displayobject/:Object/:id" element={<div className='verticalContainer'></div>}/>
      <Route path="/scratch" element={<div><Transaction/></div>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App;