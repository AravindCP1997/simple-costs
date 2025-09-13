import { useEffect, useState } from 'react';
import './RecordCost.css'


function RecordCost(){
    const [edate,setedate] = useState(new Date())
    const [amount,setamount] = useState(0)
    const [costrecords,setcostrecords] = useState([]);
    const [costelement,setcostelement] = useState();
    const [costcentre,setcostcentre] = useState();
    const [type,settype] = useState();
    const [timefrom,settimefrom] = useState(new Date());
    const [timeto,settimeto]= useState(new Date());

   useEffect(()=>{
    ('costrecords' in localStorage) ? setcostrecords(JSON.parse(localStorage.getItem('costrecords'))) : null;
  },[])

  function submitCost(){
    let costrecord = {};
    costrecord['Entry Date'] = edate;
    costrecord['Amount'] = amount;
    costrecord['Cost Element'] = costelement;
    costrecord['Cost Centre or Cost Object'] = costcentre;
    costrecord['Type'] = type;
    costrecord['Time Period from'] = timefrom;
    costrecord['Time Period to'] = timeto;
    costrecords.push(costrecord);
    localStorage.setItem('costrecords',JSON.stringify(costrecords));
    alert("Saved Successfully");
  }

    return(
        <form onSubmit={submitCost}>
            <label>Entry Date: 
                <input value={edate} type="date" onChange={(e)=>setedate(e.target.value)}/>
            </label>
            <label>Cost Element: 
                <input value={costelement} type="text" onChange={(e)=>setcostelement(e.target.value)}/>
            </label>
            <label>Cost Centre or Cost Object: 
                <input value={costcentre} type="text" onChange={(e)=>setcostcentre(e.target.value)}/>
            </label>
            <label>Type: 
                <input value={type} type="text" onChange={(e)=>settype(e.target.value)}/>
            </label>
            <label>Time Period from: 
                <input value={timefrom} type="date" onChange={(e)=>settimefrom(e.target.value)}/>
            </label>
            <label>Time Period to: 
                <input value={timeto} type="date" onChange={(e)=>settimeto(e.target.value)}/>
            </label>
            <label>Amount: 
                <input value={amount} type="number" onChange={(e)=>setamount(e.target.value)}/>
            </label>
            <button type="submit">Submit</button>
        </form>
    )
}

export default RecordCost