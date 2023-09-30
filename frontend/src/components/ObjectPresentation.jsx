import React from "react";
import styled from 'styled-components'
import CosemStructureTree from "./CosemStructure";
import AttributePresentation from "./NodePresentation";

const StyledMainWrapper = styled.div`
    width:100vw;
    height:60vh;
    
    display: flex;
    justify-content: space-between;
    align-items: center;

    border: 1px solid black;
    box-sizing: border-box;
`

const ObjectPresentation= ({PanelContext, PresentationContext}) => {
    if (PanelContext.workfile){
        return <StyledMainWrapper>
            <CosemStructureTree PanelContext={PanelContext} PresentationContext={PresentationContext}/>
            {PresentationContext.selectedNode !== undefined &&<AttributePresentation PanelContext={PanelContext} PresentationContext={PresentationContext}/>}
        </StyledMainWrapper>
    }else{
        <div>
            
        </div>
    }
}

export default ObjectPresentation;