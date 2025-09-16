import { useState} from 'react';
import { collection, loadData, saveData } from './scripts.js';
import { Link, useParams } from 'react-router-dom';

const RecordTemplate = [
    {
        "Purchase":{
            "Header Data":[
                {"Name":"Posting Date"},
                {"Name":"Entry Date"},
                {"Reversed":"Posting Date"},
            ],
            "Line Item Data":[
                {"Name":""}
            ]
        }
}
]


export function Record(){

}