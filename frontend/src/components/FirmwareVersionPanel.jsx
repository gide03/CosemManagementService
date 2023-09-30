import React from "react";
import styled from 'styled-components'
import axios from "axios";
import { StyledPanel, StyledBoxTitle } from "./PanelDialog";

const StyledListBox = styled.ul`
    width: 100%;
    height: 100%;
    overflow: hidden scroll;
    padding: 0;
    margin: 0;

    :hover{
        cursor: pointer;
        background-color: #efefef;
    }

    .active{
        background-color: #efefef;
        border: 1px solid #8b8b8b;
    }

    li{
        width: 100%;
        padding: 2px 0px 2px 10px;
        box-sizing: border-box;
    }

    li .fw-item{
        display: flex;
        width: 100%;
        justify-content: space-between;
        padding-right: 1rem;
        box-sizing: border-box;
    }
`
const FirmwareVersionPanel = ({PanelContext, AssociationContext}) => {
    function item_clicked(fw_ver){     
        const selected_project_name = PanelContext.selectedProject; 
        const selected_version = fw_ver;

        if(PanelContext.selectedProject !== "TEMPORARY"){
            axios.get(`http://10.23.40.185/api/project/getcosemlist/${selected_project_name}/${selected_version}`)
                .then((resp)=>{
                    PanelContext.updateSelectedFirmware(selected_version);
                    PanelContext.updateCosemObjectList(resp.data);
                })
                .catch((error)=>{
                    console.log(`ERROR: ${error}`);
                })
        }else{
            axios.get(`http://10.23.40.185/api/project/temporary/getcosemlist/${selected_version}`, {
                headers:{
                    Authorization: `Bearer ${AssociationContext.jwt}`
                }
            })
                .then((resp)=>{
                    PanelContext.updateSelectedFirmware(selected_version);
                    PanelContext.updateCosemObjectList(resp.data);
                })
                .catch((error)=>{
                    console.log(`ERROR: ${error}`);
                })
        }

    }

    return <StyledPanel>
        <StyledBoxTitle>Firmware Version</StyledBoxTitle>
        <StyledListBox>
            {PanelContext.firmwareList!==undefined && PanelContext.firmwareList.map((fw_ver, idx)=>{
                return <li key={`item-${PanelContext.selectedProject}-${fw_ver}`} className={PanelContext.selectedFirmware === fw_ver ? "active" : undefined}>
                    <div className="fw-item" id={`item-fwver-${idx}`} onClick={()=>item_clicked(fw_ver)}>
                        <span>{fw_ver}</span>
                        {PanelContext.selectedFirmware === fw_ver && AssociationContext.username !== '' && PanelContext.selectedProject !== 'TEMPORARY' && <button onClick={()=>{
                            let is_confirmed = window.confirm(`Areyou sure want to delete version ${fw_ver}?`);
                            if (!is_confirmed){
                                console.log('KEEP');
                                return;
                            } 
                            const payload = {
                                "projectname":PanelContext.selectedProject,
                                "version":fw_ver
                            }
                            axios.post(`http://10.23.40.185/api/project/removecollection`, payload,{
                                headers:{
                                    Authorization: `Bearer ${AssociationContext.jwt}`
                                }
                            })
                            .then((response)=>{
                                if (response.data === 'OK'){
                                    alert("Collection removed");
                                }
                            })
                            .catch((error) => {
                                alert(error);
                            })
                            
                        }}>x</button>}
                    </div>
                </li>
            })}
        </StyledListBox>    
    </StyledPanel>
}

export default FirmwareVersionPanel;