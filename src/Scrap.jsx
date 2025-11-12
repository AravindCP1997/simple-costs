function GenerateInput({item,k,value,onthischange,label,disabled, className}){
    return(
        <>
            <label className={className}>{label && item['name']}{item['input']==="input"&&<input key={k} disabled={disabled} value={value} onChange={onthischange} type={item['type']}/>}{item['input']==="option"&&<select key={k} value={value} onChange={onthischange} disabled={disabled}>{item['options'].map((option)=><option value={option}>{option}</option>)}</select>}{item['value']=="calculated" && <p>{value}</p>}</label>
        </>
    )
}

function InputRow({disabled, collection,structure,onchange,fieldname}){
    return(
        <>
        <label>{fieldname}</label>
            <div>{structure.map((field,i)=><GenerateInput className="querySingle" disabled={disabled} item={field} k={i} data-fieldname={fieldname} value={collection[field['name']]} onthischange={(e)=>onchange(fieldname,field['name'],e)} label={true}/>)} </div>
        </>
    )
}

export function MultipleEntry({disabled, collection,fieldname,structure,onchange,addfunction}){
    return(
        <>
        <label className='queryTable'>{fieldname}
        <div className='queryRow'>{structure.map(field=><label className='queryCell'>{field['name']}</label>)}</div>
        <div>{collection.map((item,index)=><div className="queryRow">{structure.map(field=><GenerateInput className="queryCell" disabled={disabled} item={field} k={index} value={collection[index][field['name']]} label={false} onthischange={(e)=>onchange(fieldname,index,field['name'],e)}/>)}</div>)}</div>
        </label>
        <div className='queryButtons'><button className="blue" onClick={addfunction}>Add</button></div>
        </>
    )
}



function ObjectUI({type,method}){
    const navigate = useNavigate();
    const {object,id} = useParams();
    const collection = (type==="Object") ? objects[object]['collection'] : transactions['collection'];
    const schema = (type==="Object") ? objects[object]['schema'] : transactions['schema'];
    const usestates = {};
    schema.map(item=>usestates[item['name']]=item['use-state']);
    const existingdata = (collection in localStorage) ? JSON.parse(localStorage.getItem(collection)) : [];
    const defaults = (method==="Create") ? usestates : existingdata[id];
    const [masterdata,setmaster] = useState(defaults);

    function addToList(list,defaults,e){
        e.preventDefault;
        const oldlist = masterdata[list];
        const newentry = {...defaults,['id']:oldlist.length}
        const newlist = [...oldlist,newentry]
        setmaster(prevdata=>({
            ...prevdata,
            [list]:newlist
        }))
    }

    function singlechange(field,e){
        const {value} = e.target
        setmaster(prevdata=>({
            ...prevdata,
            [field]:value
        }))
    }

    function objectchange(field,key,e){
        e.preventDefault
        const {value} = e.target
        e.preventDefault
        const oldobject = masterdata[field]
        const newobject = {...oldobject,[key]:value}
        setmaster(prevdata=>({
            ...prevdata,
            [field]:newobject
        }))
    }

    function collectionchange(field,index,key,e){
        e.preventDefault
        const {value} = e.target
        const oldlist = masterdata[field]
        const olddata = oldlist[index]
        const newdata = {...olddata,[key]:value}
        const newlist = oldlist.map((item)=>(item.id===index ? newdata : item))
        setmaster(prevdata=>({
            ...prevdata,
            [field]:newlist
        }))

    }

    function createObject(){
        const datapack = [...existingdata,masterdata];
        saveData(datapack,collection);
        alert(`${object} Created!`);
        cancel();
    }

    function updateObject(){
        const datapack = existingdata.map((item,index)=>(index==id)?masterdata:item);
        saveData(datapack,collection);
        alert(`${object} Updated!`);
        cancel();
    }

    function cancel(){
        (type=="Object") ? navigate(`/query/${object}`) : navigate(`/document`)
    }


    return(
        <div className='queryDisplay'>
        <label className='queryTitle'><h2>{ type=="Object" &&`${method} ${object}`} { type=="Transaction" &&`${method} Transaction`}</h2></label>
        {schema.map(field=>
        <div className='queryField'>
            {field['datatype']==="single"&&<GenerateInput className="querySingle" disabled={method==="Display"} label={true} item={field} k={0} value={masterdata[field['name']]} onthischange={(e)=>singlechange(field['name'],e)}/>}
            {field['datatype']==="object"&&<InputRow disabled={method==="Display"} collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} onchange={objectchange} />}
            {field['datatype']==="collection"&&<MultipleEntry disabled={method==="Display"} collection={masterdata[field['name']]} fieldname={field['name']} structure={field['structure']} addfunction={(e)=>addToList(field['name'],field['use-state'][0],e)} onchange={collectionchange}/>}
            </div>)}
            <div className='queryButtons'>
            {method!="Display" && <button className='blue' onClick={cancel}>Cancel</button>}
            {method=="Display" && <button className='blue' onClick={cancel}>Back</button>}
            {method=="Create" && <button className='green' onClick={createObject}>Create</button>}
            {method=="Update" && <button className='blue' onClick={updateObject}>Update</button>}
            </div>
        </div>
    )
}

{field['datatype']=="single" && <div className='querySingle'><label>{field['name']}</label>{ field['input'] == "input" && <input disabled={field['disabled']} type={field['type']} onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:e.target.value}))} value={data[field['name']]}/>}{field['input']=="option" && <select onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:e.target.value}))} value={data[field['name']]}>{field['options'].map(option=><option value={option}>{option}</option>)}</select>}</div>}
        {field['datatype']=="object" && <div><label>{field['name']}</label>{field['structure'].map(subfield=><>{subfield['datatype']=="single"&&<div className='querySingle'><label>{subfield['name']}</label>{subfield['input']=="input" && <input type={subfield['type']} onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:{...data[field['name']],[subfield['name']]:e.target.value}}))} value={data[field['name']][subfield['name']]} />}{subfield['input'] == "option" && <select onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:{...data[field['name']],[subfield['name']]:e.target.value}}))} value={data[field['name']][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}</div>}</>)}</div>}
        {field['datatype']=="collection" && <><label>{field['name']}</label><div className='queryTable'><table><thead><tr>{field['structure'].map(subfield=><th className='queryCell'>{subfield['name']}</th>)}</tr></thead>{data[field['name']].map((item,index)=><tbody><tr>{field['structure'].map(subfield=><>{subfield['datatype']=="single" && <td>{subfield['value']=="calculated" && <input value={data[field['name']][index][subfield['name']]} disabled={true}/>} {subfield['input']=="input"&& <input className='queryCell' onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:data[field['name']].map((item,i)=>(i==index?{...item,[subfield['name']]:e.target.value}:item))}))} type={subfield['type']} value={data[field['name']][index][subfield['name']]}/>}{subfield['input']=="option" && <select onChange={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:data[field['name']].map((item,i)=>(i==index?{...item,[subfield['name']]:e.target.value}:item))}))} value={data[field['name']][index][subfield['name']]}>{subfield['options'].map(option=><option value={option}>{option}</option>)}</select>}</td>}</>)}</tr></tbody>)}</table></div><div className="queryButtons"><button onClick={(e)=>setmaster(new ControlObject(object,{...data,[field['name']]:[...data[field['name']],{...field['use-state'][0],['id']:data[field['name']].length}]}))} className='blue'>Add</button></div></>}


function CRUDCollection(){
    const location = useLocation();
    const query = location.state || {};
    const {collection,method,parameters} = query;
    const CRUD = new Collection(collection,method);
    const defaults = CRUD.defaults(parameters);
    const [data,setdata] = useState(defaults);
    const output = CRUD.process(data);
    const schema = CRUD.schema(data);
    const errors = CRUD.errors(data);
    const navigate = useNavigate();

    const singleChange = (field,e)=>{
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:value
        }))
    }

    function objectChange(field,subfield,e){
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:{...prevdata[field],[subfield]:value}
        }))
    }

    function collectionChange(field,subfield,index,e){
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].map((item,i)=>(i===index)?{...item,[subfield]:value}:item)
        }))
    }

    function nestChange(field,index,subfield,subindex,subsubfield,e){
        const {value} = e.target;
        setdata(prevdata=>({
            ...prevdata,[field]:prevdata[field].map((item,i)=>
            (i==index)?{...item,[subfield]:item[subfield].map((subitem,ii)=>
            (ii==subindex)?{...subitem,[subsubfield]:value}:subitem)}:item)
        }))
    }

    function addCollection(field,e){
        e.preventDefault;
        setdata(prevdata=>({
            ...prevdata,
            [field]:[...prevdata[field],defaults[field][0]]
        }))
    }

    function removeCollection(field,index,e){
        e.preventDefault;
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].filter((item,i)=>i!==index)
        }))
        
    }

    function addNest(field,index,subfield){
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].map((item,i)=>
            (i==index)?{...item,[subfield]:[...item[subfield],defaults[field][0][subfield][0]]}:item
            )
        }))
    }

    function removeNest(field,index,subfield,subindex){
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].map((item,i)=>
            (i==index)?{...item,[subfield]:item[subfield].filter((subitem,ii)=>ii!=subindex)}:item)
        }))
    }

    function cancel(){
        navigate(`/c/${collection}`);
        window.location.reload();
    }

    function save(){
        const result = CRUD.save(data);
        alert(result);
        cancel();
    }

    return(
        <div className='crudUI'>
            <div className='crudTitle'>
                <h2>{method} {CRUD.title}</h2>
            </div>
            <div className='crudFields'>
                {schema.map(field=>
                    <>
                        {field['datatype']=="single" && <SingleInput field={field} output={output} handleChange={singleChange}/>}
                        {field['datatype']=="collection" && <CollectionInput field={field} output={output} handleChange={collectionChange} addItem={addCollection} removeItem={removeCollection}/>}
                        {field['datatype']=="nest" && <NestInput field={field} output={output} handleChange1={collectionChange} handleChange2={nestChange} addItem1={addCollection} addItem2={addNest} removeItem1={removeCollection} removeItem2={removeNest}/>}
                    </>
                )}
            </div>
            <div className='crudButtons'>
                <button onClick={()=>cancel()}><FaArrowLeft/></button>
                {method!="Display" && <button onClick={()=>save()}>Save</button>}
            </div>
            {(errors.length>0 && method!="Display") && <div className='crudError'>
                <h4>Things to Consider:</h4>
                <ul>
                    {errors.map(error=>
                        <li>{error}</li>
                    )}
                </ul>
            </div>}
        </div>
    )
}

function TransactionUI(){
    const {type} = useParams();
    const transaction = new Transaction(type);
    const navigate = useNavigate();
    const defaults = transaction.defaults();
    const [data,setdata] = useState(defaults);
    const output = transaction.process(data);
    const schema = transaction.schema(output);
    const errors = transaction.errors(output);
    const singleChange = (field,e)=>{
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:value
        }))
    }

    function objectChange(field,subfield,e){
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:{...prevdata[field],[subfield]:value}
        }))
    }

    function collectionChange(field,subfield,index,e){
        e.preventDefault;
        const {value} = e.target
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].map((item,i)=>(i===index)?{...item,[subfield]:value}:item)
        }))
    }

    function nestChange(field,index,subfield,subindex,subsubfield,e){
        const {value} = e.target;
        setdata(prevdata=>({
            ...prevdata,[field]:prevdata[field].map((item,i)=>
            (i==index)?{...item,[subfield]:item[subfield].map((subitem,ii)=>
            (ii==subindex)?{...subitem,[subsubfield]:value}:subitem)}:item)
        }))
    }

    function addCollection(field,e){
        e.preventDefault;
        setdata(prevdata=>({
            ...prevdata,
            [field]:[...prevdata[field],defaults[field][0]]
        }))
    }

    function removeCollection(field,index,e){
        e.preventDefault;
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].filter((item,i)=>i!==index)
        }))
        
    }

    function addNest(field,index,subfield){
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].map((item,i)=>
            (i==index)?{...item,[subfield]:[...item[subfield],defaults[field][0][subfield][0]]}:item
            )
        }))
    }

    function removeNest(field,index,subfield,subindex){
        setdata(prevdata=>({
            ...prevdata,
            [field]:prevdata[field].map((item,i)=>
            (i==index)?{...item,[subfield]:item[subfield].filter((subitem,ii)=>ii!=subindex)}:item)
        }))
    }

    function cancel(){
        navigate('/report');
        window.location.reload();
    }

    function save(){
        if (errors.length==0){
            const result = transaction.completeTransaction(output);
            alert(result);
            cancel();
        } else {
            alert('Validation unsuccesful with errors!')
        }
    }

    return(
        <div className='crudUI'>
            <div className='crudTitle'>
                <h2>{type}</h2>
            </div>
            <div className='crudFields'>
                {schema.map(field=>
                    <>
                        {field['datatype']=="single" && <SingleInput field={field} output={output} handleChange={singleChange}/>}
                        {field['datatype']=="object" && <ObjectInput field={field} output={output} handleChange={objectChange}/>}
                        {field['datatype']=="collection" && <CollectionInput field={field} output={output} handleChange={collectionChange} addItem={addCollection} removeItem={removeCollection}/>}
                        {field['datatype']=="nest" && <NestInput field={field} output={output} handleChange1={collectionChange} handleChange2={nestChange} addItem1={addCollection} addItem2={addNest} removeItem1={removeCollection} removeItem2={removeNest}/>}
                    </>
                )}
            </div>
            <div className='crudButtons'>
                <button onClick={()=>cancel()}><FaArrowLeft/></button>
                <button onClick={()=>save()}>Save</button>
            </div>
            {errors.length>0 && <div className='crudError'>
                <h4>Things to Consider:</h4>
                <ul>
                    {errors.map(error=>
                        <li>{error}</li>
                    )}
                </ul>
            </div>}
        </div>
    )
}

    const ratios = {
        "A":[
            {"Type":"Cost Center","To":"B","Ratio":50},
            {"Type":"General Ledger","To":"A","Ratio":50},
        ],
        "B":[
            {"Type":"Cost Center","To":"C","Ratio":50},
            {"Type":"General Ledger","To":"B","Ratio":50},
        ],
        "C":[
            {"Type":"Cost Center","To":"D","Ratio":50}
        ],
        "D":[
            {"Type":"Cost Center","To":"E","Ratio":50},
            {"Type":"Cost Center","To":"B","Ratio":50},
        ],
        "E":[
            {"Type":"Cost Center","To":"C","Ratio":50},
            {"Type":"Cost Center","To":"A","Ratio":50},
        ]
    }


    function Costing(){
    const ratio = (Receiver,Sender,NotThrough)=>{
        const data = ratios[Sender];
        let sum = 0;
        for (let i = 0; i< data.length;i++){
            let to = data[i];
            if (to['Type']=="Cost Center" && to['To']==Receiver){
                sum += to['Ratio']/100
            } else if (to['Type']=="Cost Center" && !NotThrough.includes(to['To'])){
                sum += to['Ratio'] * ratio(Receiver,to['To'],[...NotThrough,Sender])/100
            }
        }
        sum = sum / (1-selfRatio(Sender,[Receiver,...NotThrough]))
        return sum
    }

    const selfRatio = (Center,NotThrough)=>{
        const data = ratios[Center];
        let sum = 0;
        for (let i = 0;i<data.length;i++){
            let to = data[i];
            if (to['Type']=="Cost Center" && to['To'] == ""){
                sum += to['Ratio']/100;
            } else if (to['Type']=="Cost Center" && !NotThrough.includes(to['To'])){
                sum += to['Ratio'] * ratio(Center,to['To'],NotThrough)/100;
            }
        }
        return sum;
    }

    const AllocationRatios = (Center,Weight,Self,NotThrough)=>{
        const list = [];
        const data = ratios[Center];
        for (let i = 0; i<data.length;i++){
            let to = data[i];
            if (to['Type']!=="Cost Center"){
                list.push({...to,['Absolute Ratio']:Weight*to['Ratio']/100/Self/(1-selfRatio(Center,[]))})
            }
            else if (to['Type']=="Cost Center" && !NotThrough.includes(to['To'])){
                list.push(...AllocationRatios(to['To'],to['Ratio'],(1-selfRatio(Center,[...NotThrough,Center])),[...NotThrough,Center]))
            }
        }

        return list
    }
}


 const defaults = {"General Ledger":{"value":"","values":[""]}};
    const [data,setdata] = useState(defaults);
    
    function valueChange(itemname,field,e){
        const {value} = e.target;
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:value}
        }))
    }

    function rangeChange(itemname,field,i,e){
        const {value} = e.target;
        const prevrange = [...query[itemname][field]];
        const newrange = prevrange.map((item,index)=>(i==index)?value:item);
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:newrange}
        }))
    }

    function valuesChange(itemname,field,i,e){
        const {value} = e.target;
        const prevvalues = [...query[itemname][field]];
        const newvalues = prevvalues.map((item,index)=>(i==index)?value:item);
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:newvalues}
        }))
    }

    function rangesChange(itemname,field,i,j,e){
        const {value} = e.target;
        const prevranges = [...query[itemname][field]];
        const prevrange = prevranges[i];
        const newrange = prevrange.map((item,index)=>(j==index)?value:item);
        const newranges = prevranges.map((item,index)=>(i==index)?newrange:item);
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:newranges}
        }))
    }

    function addValues(itemname,field){
        const defaults = Report.defaults(field);
        const newvalues = [...query[itemname][field],...defaults]
        setquery(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:newvalues}}))
    }

    function addRanges(itemname,field){
        const defaults = defaults(field);
        const newvalues = [...query[itemname][field],...defaults]
        setdata(prevdata=>({
            ...prevdata,[itemname]:{...prevdata[itemname],[field]:newvalues}}))
    }

    const buildTree = (data,parentId=null) =>{
    const list = [];
    const array = ArrayJSON(data).array;
    const parents = array.filter(item=>(item['elementType']==='index' && item['arrayId']===parentId) ||(item['elementType']==='key' && item['key']===parentId) )
    for (let i=0; i<parents.length;i++){
        let parent = parents[i];
        if (parent['valueType']==='value'){
            parent = {...parent,['value']:array.find(item=>item.elementType==='value' && (item['key']===parent['id'] || item['arrayId']===parent['id']))};
        } else {
            parent = {...parent,...{'children':buildTree(data,parent['id'])}};
        }
        list.push(parent);
    }
    return list;
}

const Node = ({node, setkey, setvalue, schema})=>{

    const keyChange = (id,e) =>{
        const {value}= e.target;
        setkey(prevdata=>JSONArray(ArrayJSON(prevdata).array.map(item=>item.id===id?{...item,['name']:value}:item)))
    }

    const valueChange = (id,field,e)=>{
        const {value} = e.target;
        setvalue(prevdata=>prevdata.map(item=>item.id===id?{...item,[field]:value}:item));
    }

        return (
            <>
                {node.elementType==='key' && <>
                {node.valueType==='value' && <tr><td>{node.id}</td><td><input onChange={(e)=>keyChange(node['id'],e)} value={node['name']}/></td>
                <td><input onChange={(e)=>valueChange(node.value['id'],'a',e)} value={node.value['name']}/></td></tr>}
                {node.valueType!=='value' && <><tr><td>{node.id}</td><td><input onChange={(e)=>keyChange(node['id'],e)} value={node['name']}/></td></tr>{node.children.map(subNode=><Node node={subNode} schema={schema} setkey={setkey}/>)}</>}
                </>}
                {node.elementType==='index' && <>
                {node.valueType==='value' && <tr><td>{node.id}</td><td><input onChange={(e)=>keyChange(node.value['id'],e)} value={node.value['name']}/></td></tr>}
                {node.valueType!=='value' && <><tr><td>{node.id}</td><td>{node['index']}</td></tr>{node.children.map(subNode=><Node node={subNode} schema={schema} setkey={setkey}/>)}</>}
                </>}
            </>
        )
    }

const TreeInput=()=>{
    const [key,setkey] = useState(new CompanyCollection('1000','Employee').getData({'Code':201052}))
    const [value,setvalue] = useState([]);
    const treeStructure  = buildTree(key);
    const inputSchema = {'datatype':'single',"input":"input","type":"text"};

    return (
        <table>
            {treeStructure.map(item=><Node node={item} setkey={setkey} setvalue={setvalue} schema={inputSchema}/>)}
        </table>
    )
}