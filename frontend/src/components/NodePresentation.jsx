import React, { useEffect, useState } from "react";
import styled from 'styled-components'

const StyledAttributeDetailBox = styled.div`
    width: 70%;
    height: 100%;
    border: 1px solid black;
    overflow: hidden scroll;
    display:flex;
    flex-direction: column;
    user-select:none;
    box-sizing: border-box;
    z-index: 1;

    .object-topbar{
        width:100%;
        margin-bottom: 2rem;
        background: linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(9,9,121,1) 0%, rgba(142,139,139,1) 0%, rgba(224,224,224,1) 99%);
        position: sticky;
        padding:1rem;
        box-sizing: border-box;
        top: 0;
        z-index: 2;
    }
`

const StyledAttributeItem = styled.div`
    width:100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    box-sizing: border-box;

    .child{
        padding-left: 1rem;
    }
`

const StyledAttributeNodeIcon = styled.span`
    width: 1rem;
    height: 1rem;
    background-color: gray;
`

const StyledAttributeLabel = styled.span`
    width: 93%;

    .title{
        text-decoration: underline;
    }
`
const StyledLabelWrapper = styled.div`
    width:100%;
    height:1.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 0.5rem;
    box-sizing:border-box;

    :hover{
        cursor: pointer;
        font-weight: bolder;
    }
`

// const AttributeNode = ({element, ischild, handler}) => {
//     // event handler
//     function node_clicked(){
//         if (ischild){
//             handler.update_node(element);
//         }
//     }

//     return <StyledAttributeItem className={ischild&&"child"}>
//         <StyledLabelWrapper onClick={node_clicked}>
//             <StyledAttributeNodeIcon></StyledAttributeNodeIcon>
//             <StyledAttributeLabel>{`${element._dtype}`}</StyledAttributeLabel>
//         </StyledLabelWrapper>
//         {
//             element.children.map((child) => {
//                 return <AttributeNode key={`node-${child.id}`} element={child} ischild={true} handler={handler}></AttributeNode>
//             })
//         }
//     </StyledAttributeItem>
// }

const StyledGBWrapper = styled.div`
    width:100%;
    border: 1px solid gray;
    padding: 15px;
    border-radius: 5px; 
    box-sizing: border-box;
    position: relative;
    margin-bottom: 2rem;

    .group-title{
        position: absolute;
        padding: 0px 8px 0px 8px;
        margin-top: -1.5rem;
        border-radius: 5px;
        background-color: white;
        font-weight: bolder;
        font-size:smaller;
    }

    .content{
        width: 100%;
    }

    .info-table{
        font-size: 0.75rem;

        th{
            text-align:left;
            width: 10rem;
        }
    }

    .enumerator-table{
        border-collapse: collapse;
        margin-left:auto;
        margin-right: auto;
        margin-bottom: 2rem;

        th, td{
            border: 1px solid;
        }
    }
    .capture-object-table{
        border-collapse: collapse;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 2rem;
        th,td{
            border: 1px solid;
        }
    }
`

const AccessLevel = (AccessLevel) => {
    if (AccessLevel === undefined){
        return <div></div>
    } 

    const dlms_client_name = Object.keys(AccessLevel);
    return <div>
        {
            dlms_client_name.map(client => {
                return <>
                    <div key={`client-${client}`}>{client}</div>
                    <div key={`al-value-${client}`}>{AccessLevel[client]}</div>
                </>
            })
        }
    </div>
}

const CaptureObject = ({workfile}) => {
    return (
            <table>
                <table className="capture-object-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Logical Name</th>
                            <th>Class ID</th>
                            <th>Att. ID</th>
                            <th>Is optional</th>
                            <th>Is default</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workfile.captureObject.map((cap_obj, idx) => {
                            return <tr key={`capture-object-row-${idx}`}>
                                <td>{cap_obj[0]}</td>
                                <td>{cap_obj[2]}</td>
                                <td>{cap_obj[1]}</td>
                                <td>{cap_obj[3]}</td>
                                <td>{cap_obj[5]}</td>
                                <td>{cap_obj[6]}</td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </table>
    )
}


const AttributePresentation = ({PanelContext, PresentationContext}) => {
    const [modifier, update_modifier] = useState(PresentationContext.selectedNode.modifier);
    const [default_value, update_default_value] = useState(PresentationContext.selectedNode.defaultValue);
    const [min_value, update_min_value] = useState(PresentationContext.selectedNode.minValue);
    const [max_value, update_max_value] = useState(PresentationContext.selectedNode.maxValue);

    const [object_comment, update_object_comment] = useState(PanelContext.workfile.comment)
    const [node_comment, update_node_comment] = useState(PresentationContext.selectedNode.comment);
    const [attribute_access_right, update_attribute_access_right] = useState([]);

    const [isEnumerated, update_isEnumerated] = useState(false);
    const [enumerateAble, update_enumerateAble] = useState(false);
    const [isContainerDType, update_isContainerDType] = useState(false);

    let dlms_clients_name;
    if (PresentationContext.selectedAccessLevel !== undefined){
        dlms_clients_name = Object.keys(PresentationContext.selectedAccessLevel);
    }

    // HOOKS
    useEffect(()=>{
        const dtype = PresentationContext.selectedNode._dtype;
        const enumChoices = PresentationContext.selectedNode.enumChoices;

        if (dtype === 'Structure' || dtype === 'Array'){
            update_isContainerDType(true);
        }
        else{
            update_isContainerDType(false);
        }
        
        if(Object.keys(enumChoices).length > 0 ||
            PresentationContext.selectedNode._dtype.includes('Enumerated')){
                console.log('Enumerated');
                update_isEnumerated(true);
                update_enumerateAble(true);
        }
        else if (PresentationContext.selectedNode._dtype.includes('Unsigned')){
            update_isEnumerated(false);
            update_enumerateAble(true);
        }
        else{
            update_isEnumerated(false);
            update_enumerateAble(false);
        }

        update_node_comment(PresentationContext.selectedNode.comment);
        
        
    }, [PresentationContext.selectedNode])
    //

    const workitem = PanelContext.workfile;
    try {
        return workitem !== '' && <StyledAttributeDetailBox>
            <div className="object-topbar">
                {/* <span>{`${workitem.objectName} (${workitem.logicalName})`}</span>
                <br />
                <span>Id: {PresentationContext.selectedNode.id}</span> */}
            </div>

            <StyledGBWrapper>
                <span className="group-title">Object</span>
                <div className="content">
                    <table className="info-table">
                        <tbody>
                            <tr>
                                <th>Object Name</th>
                                <td>{workitem.objectName}</td>
                            </tr>
                            <tr>
                                <th>Logical Name</th>
                                <td>{workitem.logicalName}</td>
                            </tr>
                            <tr>
                                <th>Class ID</th>
                                <td>{workitem.classId}</td>
                            </tr>
                            <tr>
                                <th>Version</th>
                                <td>{workitem.selectedVersion}</td>
                            </tr>
                            <tr>
                                <th
                                    value={PanelContext.workfile.comment}
                                    onChange={(event)=>{
                                        const value = event.target.value;
                                        PanelContext.workfile.comment = value;
                                        update_object_comment(value); 
                                    }}
                                >Comment</th>
                                <td><textarea></textarea></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </StyledGBWrapper>

            <StyledGBWrapper>
                <span className="group-title">Attribute Information</span>
                <div className="content">
                    <table className="info-table">
                        <tbody>
                            <tr>
                                <th>Attribute name</th>
                                <td>{PresentationContext.selectedNode.title !== null ? PresentationContext.selectedNode.title : PresentationContext.selectedNode.id}</td>
                            </tr>
                            <tr>
                                <th>Comment</th>
                                <td><textarea
                                    value={PresentationContext.selectedNode.comment}
                                    onChange={(event)=>{
                                        const value = event.target.value;
                                        PresentationContext.selectedNode.comment = value;
                                        update_node_comment(value); 
                                    }}
                                ></textarea></td>
                            </tr>
                            <tr>
                                <th>Accessright</th>
                                <td>
                                    <table>
                                        <tbody>
                                            {dlms_clients_name !== undefined && dlms_clients_name.map((client)=>{
                                                return <tr key={`acesslevel-${client}`}>
                                                    <th>{client}</th>
                                                    <td>{PresentationContext.selectedAccessLevel[client]}</td>
                                                </tr>
                                            })}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            {
                                (PresentationContext.selectedNode.id.split('-')[0] === "3" && PanelContext.workfile.classId === '7') && (
                                    <tr>
                                        <th>Capture Object</th>
                                        <td>{<CaptureObject workfile={PanelContext.workfile}></CaptureObject>}</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </StyledGBWrapper>

            <StyledGBWrapper>
                <span className="group-title">Details</span>

                {// IF THE DATA TYPE IS STRUCTURE
                    PresentationContext.selectedNode._dtype === "StructureDTO" && <div>
                    </div>
                }

                {// IF THE DATA TYPE IS ARRAY
                    PresentationContext.selectedNode._dtype === "Array" && <div>
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Minimum Size</th>
                                    <td><input value={PresentationContext.selectedNode.minValue} 
                                        onChange={(event)=>{
                                            let value = event.target.value;
                                            PresentationContext.selectedNode.minValue = value;
                                            update_min_value(value);
                                        }}>
                                        </input>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Maximum Size</th>
                                    <td><input value={PresentationContext.selectedNode.maxValue}
                                        onChange={(event)=>{
                                            let value = event.target.value;
                                            PresentationContext.selectedNode.maxValue = value;
                                            update_max_value(value);
                                        }}>
                                        </input>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                }

                {// IF THE DATA TYPE COULD BE ACT AS AN ENUMERATOR
                    isEnumerated && <div className="content">
                        <table className="enumerator-table">
                            <thead>
                                <tr>
                                    <th>Enum Code</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    Object.keys(PresentationContext.selectedNode.enumChoices).map((_key)=>{
                                        const desc = PresentationContext.selectedNode.enumChoices[_key];
                                        return <tr key={`tr-${_key}`}>
                                            <td>{_key}</td>
                                            <td>{desc}</td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>

                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Modifier</th>
                                    <td>
                                    <input 
                                        id="input-modifier"
                                        value={PresentationContext.selectedNode.modifier !== null ? PresentationContext.selectedNode.modifier : ''}
                                        onChange={(event)=>{
                                            let value = event.target.value;
                                            PresentationContext.selectedNode.modifier = value;
                                            update_modifier(value);
                                        }}>
                                    </input>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Default value</th>
                                    <td>
                                        <select 
                                            value={PresentationContext.selectedNode.defaultValue} 
                                            onChange={(event)=>{
                                                const value = event.target.value;
                                                PresentationContext.selectedNode.defaultValue = value;
                                                update_default_value(value);
                                            }}
                                        >
                                        {
                                            Object.keys(PresentationContext.selectedNode.enumChoices).map(
                                                (_key) => {
                                                    const inner_text = PresentationContext.selectedNode.enumChoices[_key];
                                                    return <option key={`enum-choices-${_key}`} value={_key}>{`(${_key}) ${inner_text}`}</option>
                                                }
                                            )
                                        }
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                }

                {// ON ENUMERATED DATA TYPE
                   !isEnumerated && !isContainerDType &&  <div className="content">
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Modifier</th>
                                    <td><input 
                                        id="input-modifier"
                                        value={PresentationContext.selectedNode.modifier !== null ? PresentationContext.selectedNode.modifier : ''}
                                        onChange={(event)=>{
                                            let value = event.target.value;
                                            PresentationContext.selectedNode.modifier = value;
                                            update_modifier(value);
                                        }}
                                    >
                                        </input></td>
                                </tr>
                                <tr>
                                    <th>Minimum Value</th>
                                    <td><input 
                                        id="input-minimum-value"
                                        value={PresentationContext.selectedNode.minValue !== null ? PresentationContext.selectedNode.minValue : ''}
                                        onChange={(event)=>{
                                            let value = event.target.value;
                                            PresentationContext.selectedNode.minValue = value;
                                            update_min_value(value);
                                        }}
                                    >
                                        </input></td>
                                </tr>
                                <tr>
                                    <th>Maximum Value</th>
                                    <td><input 
                                    id="input-maximum-value"
                                        value={PresentationContext.selectedNode.maxValue !== null ? PresentationContext.selectedNode.maxValue : ''}
                                        onChange={(event)=>{
                                            let value = event.target.value;
                                            PresentationContext.selectedNode.maxValue = value;
                                            update_max_value(value);
                                        }}
                                        >
                                        </input></td>
                                </tr>
                                <tr>
                                    <th>Default Value</th>
                                    <td>
                                        <input 
                                            id="input-default-value"
                                            value={PresentationContext.selectedNode.defaultValue != null ? PresentationContext.selectedNode.defaultValue : ''}
                                            onChange={(event)=>{
                                                let value = event.target.value;
                                                PresentationContext.selectedNode.defaultValue = value;
                                                update_default_value(value);
                                            }}
                                        >
                                        </input></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                }

                {
                    (enumerateAble && PresentationContext.selectedNode._dtype !== 'EnumeratedDTO') && <div>
                        <label>
                            <input 
                                type="checkbox" 
                                onChange={(event)=>{
                                    const isChecked = event.target.checked;
                                    if (isChecked){
                                        update_isEnumerated(true);
                                    }
                                    else{
                                        update_isEnumerated(false);
                                    }
                                }}
                                checked={isEnumerated}
                            >
                            </input>Set as enumerator</label>
                    </div>
                }
            </StyledGBWrapper>
            {/* { 
                PresentationContext.selectedNode.id.split('-')[0] === "3" && (
                <CaptureObject workfile={PanelContext.workfile}></CaptureObject>)
            } */}
            
        </StyledAttributeDetailBox>
    }catch{
        return <div></div>
    }
}

export default AttributePresentation;