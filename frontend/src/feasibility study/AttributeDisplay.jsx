import React, { useState } from "react";
import styled from 'styled-components'
import axios from "axios"

const url = "http://10.23.40.185/api/project/get/EM700/1.1/"


const StyledDialogWrapper = styled.div`
    width:30vw;
    height:50vh;
    border: 1px solid black;
    overflow: hidden scroll;
    display:flex;
    flex-direction: column;
    user-select:none;
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

const AttributeNodeIcon = styled.span`
    width: 1rem;
    height: 1rem;
    background-color: gray;
`

const AttributeLabel = styled.span`
    width: 93%;

    .title{
        text-decoration: underline;
    }
`
const LabelWrapper = styled.div`
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

const AttributeNode = ({element, ischild}) => {
        return <StyledAttributeItem className={ischild&&"child"}>
            <LabelWrapper>
                <AttributeNodeIcon></AttributeNodeIcon>
                <AttributeLabel>{`${element._dtype}`}</AttributeLabel>
            </LabelWrapper>
            {
                element.children.map((child) => {
                    return <AttributeNode key={`node-${child.id}`} element={child} ischild={true}></AttributeNode>
                })
            }
        </StyledAttributeItem>
    
}

export default function AttributeDisplay(){
    const [object_name, set_objectname] = useState('');
    const [data, updateData] = useState('');

    function initialization(object_name) {
        axios.get(url+object_name)
            .then(response => {
                alert('GET ITEM');
                updateData(response.data);
            })
            .catch(error=>{
                console.log('ERROR fetching data: ', error);
        });
    }

    return <>
    <div>
        <label>Object Name: <input onChange={(event)=>set_objectname(event.target.value)}></input></label>
        <button onClick={()=>initialization(object_name)}>Get</button>
    </div>
    <br></br>
    <StyledDialogWrapper>
        {data !== '' && data.attribute.map((attribute_element, index)=>
            {
                return <div>
                <AttributeLabel>{`Att ${index+1}: ${attribute_element.title}`}</AttributeLabel>
                <AttributeNode key={`attribute-${index}`} element={attribute_element}></AttributeNode>
                </div>
            }
        )}
    </StyledDialogWrapper>
    </>
    
}