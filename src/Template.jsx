import {useState,useEffect} from 'react'

export function SubmitButton(){
    return(
        <input type="submit"/>
    )
}

export function Date({v,f,l,n}){
    return(
        <label>{l}
            <input type="date" value={v} onChange={f} name={n}/>
        </label>
    )
}

export function Description({v,f,l,n}){
    return(
        <label>{l}
            <textarea value={v} onChange={f} name={n}/>
        </label>
    )
}