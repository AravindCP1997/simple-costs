import { useEffect, useState } from 'react';

const costfields = ['Entry Date',	'Cost Element',	'Cost Centre or Cost Object',	'Type',	'Time Period from',	'Time Period to',	'Amount']

function CostFields(){
  return (
    <div className="row">
      <div className="cell"><p>Sl. No</p></div>
      {costfields.map((field)=><div className="cell">{field}</div>)}
      <div className="cell">Cost per Day</div>
    </div>
  )
}

function CostRecords(){
  const [costrecords,setcostrecords] = useState([{}]);

  useEffect(()=>{
    ('costrecords' in localStorage) ? setcostrecords(JSON.parse(localStorage.getItem('costrecords'))) : null;
  },[])
  
  return(
    <>
    {costrecords.map((record,index)=><div className='row'><div className='cell'>{index}</div>{costfields.map((field)=><div className='cell'>{record[field]}</div>)}<div className='cell'>{record["Amount"]*(1000*60*60*24)/(Date.parse(record["Time Period to"])-Date.parse(record["Time Period from"]))}</div></div>)}
    </>
  )
}




function CostTable(){
  return(
    <div className="costTable">
      <CostFields/>
      <CostRecords/>
    </div>
  )
}

export default CostTable