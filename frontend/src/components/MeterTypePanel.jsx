import React from "react";
import styled from 'styled-components'
import { StyledPanel, StyledBoxTitle } from "./PanelDialog";
import axios from "axios";

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
`

const MeterTypePanel = ({PanelContext, PresentationContext, AssociationContext}) => {
    function item_clicked(event){
        let selected_project_name = event.target.innerText; 
        PanelContext.updateSelectedProject(selected_project_name);
        PanelContext.updateCosemObjectList([]);
        PanelContext.updateSelectedObject('');
        PanelContext.updateWorkfile();
        PresentationContext.updateSelectedNode();

        if(selected_project_name === "TEMPORARY"){
            axios.get("http://10.23.40.185/api/project/temporary/listversion", {
                    headers:{
                        Authorization: `Bearer ${AssociationContext.jwt}`,
                    }
                })
                .then((resp)=>{
                    PanelContext.updateFirmwareList(resp.data);
                })
                .catch((error)=>{
                    console.log(`ERROR: ${error}`);
            })
        }else{
            axios.get(`http://10.23.40.185/api/project/listversion/${selected_project_name}`)
                .then((resp)=>{
                    PanelContext.updateFirmwareList(resp.data);
                })
                .catch((error)=>{
                    console.log(`ERROR: ${error}`);
            })
        }
        PanelContext.updateSelectedFirmware('');
    }

    return <StyledPanel>
        <StyledBoxTitle>Meter Type</StyledBoxTitle>
        <StyledListBox>
            {PanelContext.projectList!==undefined && PanelContext.projectList.map((projectname)=>{
                return <li onClick={(event)=>item_clicked(event)} key={`metertype-item-${projectname}`} className={PanelContext.selectedProject === projectname ? "active" : undefined}>{projectname}</li>
            })}
        </StyledListBox>
    </StyledPanel>
}

export default MeterTypePanel;