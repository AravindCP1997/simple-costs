import {useState, useEffect} from 'react';

function loadData(collection){
    const [data,setdata] = useState([])
    
    useEffect(()=>{
    (collection in localStorage) ? setdata(JSON.parse(localStorage.getItem(collection))) : null;
  },[])

    return data;
}

export {loadData}