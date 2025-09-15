import {useState, useEffect} from 'react';

function loadData(collection){
    const [data,setdata] = useState([])
    
    useEffect(()=>{
    (collection in localStorage) ? setdata(JSON.parse(localStorage.getItem(collection))) : null;
  },[])

    return data;
}

function saveData(data,collection){
  localStorage.setItem(collection,JSON.stringify(data));
}

class collection{
  constructor(name){
    this.name = name;
  }
  load(){
    return  loadData(this.name);
  }
  csave(data){
    saveData(data, this.name)
  }
  length(){
    return loadData(this.name).length
  }
  item(index){
    return loadData(this.name)[index]
  }
}

export {loadData, saveData, collection}