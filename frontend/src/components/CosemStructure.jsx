import React, { useEffect } from "react";
import styled from 'styled-components'

const StyledDialogWrapper = styled.div`
    width: 30%;
    height: 100%;
    border: 1px solid black;
    overflow: hidden scroll;
    display:flex;
    flex-direction: column;
    user-select:none;
    box-sizing: border-box;

    font-size: 1rem;
`

const StyledAttributeItem = styled.div`
    width:100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    box-sizing: border-box;

    .active{
        background-color: #efefef;
        font-weight: bolder;
    }

    .child{
        padding-left: 1rem;
    }
`

const AttributeNodeIcon = styled.span`
    width: 0.75rem;
    height: 0.75rem;
    background-color: gray;
`

const AttributeLabel = styled.span`
    width: 93%;
    font-size: 0.9rem;
    
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

    .nodeitem{
        font-size: 0.75rem;
    }

    .active{
        background-color: #efefef;
        font-weight: bolder;
    }

    :hover{
        cursor: pointer;
        font-weight: bolder;
    }
`

const AttributeNode = ({element, ischild, PresentationContext}) => {
    //event handler
    function click_handler(){
        console.log(`[AttributeNode] Clicked on ${element.id}`);
        PresentationContext.updateSelectedNode(element);
    }
    return <StyledAttributeItem className={`${ischild?`child`:undefined} ${PresentationContext.selectedNode && element.id === PresentationContext.selectedNode.id ? "active" : undefined}`}>
        <LabelWrapper onClick={click_handler} className={`${PresentationContext.selectedNode && element.id === PresentationContext.selectedNode.id ? "active" : undefined}`}>
            <AttributeNodeIcon></AttributeNodeIcon>
            <AttributeLabel className={`nodeitem`}>{`${element._dtype}`}</AttributeLabel>
        </LabelWrapper>
        {
            element.children.map((child) => {
                return <AttributeNode key={`node-${child.id}`} element={child} ischild={true} PresentationContext={PresentationContext}></AttributeNode>
            })
        }
    </StyledAttributeItem>
}

const CosemStructureTree = ({PanelContext, PresentationContext}) => {
    const data = PanelContext.workfile;

    useEffect(()=>{
        if (PresentationContext.selectedNode === undefined){
            return;
        }
        
        let accesslevel;
        let id = PresentationContext.selectedNode.id.split('-');
        id = parseInt(id[0])-1; // Get node id root. EXAMPLE: 1-2-3 to be 1 -> 0 NOTE: the index of access level start from 0. 

        if (id<128){ // get attribute
            accesslevel = PresentationContext.attributeAccessLevel[id];
        }else{ // get method
            accesslevel = PresentationContext.methodAccessLevel[id-128];
        }
        PresentationContext.updateSelectedAccessLevel(accesslevel);
    }, [PresentationContext.selectedNode])
    return <>
    <StyledDialogWrapper>
        {/* ATTRIBUTE */}
        {data !== '' && data.attribute.map((attribute_element, index)=>
            {
                if (attribute_element == null){

                }
                else{
                    return (
                        <div key={`${data.objectName}-attribute-${index}`}>
                            <AttributeLabel>{`Att ${index+1}: ${attribute_element.title}`}</AttributeLabel>
                            <AttributeNode key={`attribute-${index}`} element={attribute_element} PresentationContext={PresentationContext}></AttributeNode>
                        </div>
                    )
                }
            }
        )}

        {/* METHOD */}
        {data !== '' && data.method.map((method_element, index)=>
            {
                if (method_element == null){

                }
                else{
                    return (
                        <div key={`${data.objectName}-method-${index}`}>
                            <AttributeLabel>{`Mtd ${index+1}: ${method_element.title}`}</AttributeLabel>
                            <AttributeNode key={`Mtd-${index}`} element={method_element} PresentationContext={PresentationContext}></AttributeNode>
                        </div>
                    )
                }
            }
        )}
    </StyledDialogWrapper>
    </>
}

export default CosemStructureTree;