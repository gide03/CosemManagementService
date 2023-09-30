import React, { useEffect } from "react";
import styled from 'styled-components'
import MeterTypePanel from "./MeterTypePanel";
import FirmwareVersionPanel from "./FirmwareVersionPanel";
import CosemListPanel from "./CosemListPanel";
import ControlPanel from "./ControlPanel";

const StyledPanelsWrapper = styled.div`
    border: 1px solid black;
    width: 100vw;
    height: 40vh;

    padding: 1rem 1rem 0px 1rem;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    justify-content: space-evenly;
`

const PanelPresentation = ({PanelContext, PresentationContext, AssociationContext}) => {
    // EVENT HANDLER
    // end
    //
    
    function transform_access_right(workfile){
        const raw_accessRights = workfile.accessRight;
        const number_of_attributes = workfile.attribute.length;
        const number_of_methods = workfile.method.length;
        const attribute_accessRights = [];
        // const method_accessRight = [];
        const dlms_clients = Object.keys(raw_accessRights);
        const out_attribute_access_level = [];
        const out_method_access_level = [];

        
        // fill the attribute access level
        for (let att_idx=0 ; att_idx<number_of_attributes ; att_idx++){
            let temp_data = {};
            dlms_clients.forEach(client_name => {
                temp_data[client_name] = raw_accessRights[client_name].attribute[att_idx];
            });
            out_attribute_access_level.push(temp_data);
        }

        // fill the method access level
        for (let mtd_idx=0 ; mtd_idx<number_of_methods ; mtd_idx++){
            let temp_data = {};
            dlms_clients.forEach(client_name => {
                temp_data[client_name] = raw_accessRights[client_name].method[mtd_idx];
            });
            out_method_access_level.push(temp_data);
        }   
        return [out_attribute_access_level, out_method_access_level]
    }

    useEffect(()=>{
        if (PanelContext.workfile == null){
            return
        }
        const access_level = transform_access_right(PanelContext.workfile); // [0] Attribute [1] method
        const attribute = access_level[0];
        const method = access_level[1];
        PresentationContext.updateAttributeAccessLevel(attribute);
        PresentationContext.updateMethodAccessLevel(method);
    }, [PanelContext.selectedObject]);

    return (
        <StyledPanelsWrapper>
            <MeterTypePanel PanelContext={PanelContext} PresentationContext={PresentationContext} AssociationContext={AssociationContext}></MeterTypePanel>
            <FirmwareVersionPanel PanelContext={PanelContext} PresentationContext={PresentationContext} AssociationContext={AssociationContext}></FirmwareVersionPanel>
            <CosemListPanel PanelContext={PanelContext} PresentationContext={PresentationContext} AssociationContext={AssociationContext}></CosemListPanel>
            <ControlPanel PanelContext={PanelContext} PresentationContext={PresentationContext} AssociationContext={AssociationContext}></ControlPanel>
        </StyledPanelsWrapper>
    );
}

export default PanelPresentation;