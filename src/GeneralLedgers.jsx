import { useState, useEffect } from 'react' 

function CreateGL(){
    const [name,setname] = useState('')
    const [presentation,setpresentation] = useState('')
    const [costelement,setcostelement] = useState('false')
    const [opening,setopening] = useState(0)
    const [generalledgers,setgeneralledgers] = useState([])

    const GLData = [
        {"field":"Name", "type":"text", "value":name, "onchange":(e)=>{setname(e.target.value)}},
        {"field":"Presentation", "type":"text", "value":presentation, "onchange":(e)=>{setpresentation(e.target.value)}},
        {"field":"Cost Element", "type":"text", "value":costelement, "onchange":(e)=>{setcostelement(e.target.value)}},
        {"field":"Opening Balance", "type":"number", "value":opening, "onchange":(e)=>{setopening(e.target.value)}}
    ]

    useEffect(()=>{
        ('generalledgers' in localStorage) ? setgeneralledgers(JSON.parse(localStorage.getItem('generalledgers'))) : null;
      },[])

    function submitGL(){
        let GL = {}
        GLData.map((data)=>GL[data.field]= data.value);
        generalledgers.push(GL); 
        localStorage.setItem('generalledgers',JSON.stringify(generalledgers))
    }

    return(
        <form onSubmit={submitGL}>
            {GLData.map((data)=><label>{data.field}<input type={data.type} onChange={data.onchange}/></label>)}
            <input type="submit"/>
        </form>
    )
}

function GeneralLedger(){
    return(
        <CreateGL/>
    )
}

export default GeneralLedger