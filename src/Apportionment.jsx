import { useEffect, useState } from 'react';

const apportionratios = [{"Cost Center":"Office","From":"01-06-2025","To":"30-06-2025","Ratio":{"Marketing":0.30,"Plant":0.50}}]
const fields = ["Cost Center", "From", "To"]

function RatioButton(){
    return(
        <button className='ratiobutton'>
            Display
        </button>
    )
}

function Apportionment(){
    return(
        <div className='apportionment'>
            <div className='center-time'>
                <div className='cell'><p>Cost Centre</p></div>
                <div className='cell'><p>Start Date</p></div>
                <div className='cell'><p>End Date</p></div>
                <div className='cell'><p>Ratio</p></div>
            </div>
                {apportionratios.map((ratio)=><div className='center-time'>{fields.map((field)=><div className='cell'><p>{ratio[field]}</p></div>)}<div className='cell'><button>Display</button></div></div>)}
        </div>
    )
}

export default Apportionment