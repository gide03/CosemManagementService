import React, { useEffect, useState } from "react";
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
`

const CosemListPanel = ({PanelContext, PresentationContext, AssociationContext}) => {
    const [search_input, set_search_input] = useState('');
    const [filtered_cosem, set_filtered_cosem] = useState([...PanelContext.cosemObjectList]);

    useEffect(()=>{
        if (search_input === 0){
            set_filtered_cosem([...PanelContext.cosemObjectList]);
            return;
        }
        set_filtered_cosem(PanelContext.cosemObjectList.filter((element) => element.toLowerCase().includes(search_input)));
    },[search_input])

    useEffect(()=>{
        set_search_input('');
        set_filtered_cosem([...PanelContext.cosemObjectList]);
    },[PanelContext.selectedFirmware]);

    function item_clicked(event){
        const selected_project_name = PanelContext.selectedProject; 
        const selected_version = PanelContext.selectedFirmware;
        const selected_cosem = event.target.innerText;

        if (selected_cosem.length === 0){
            return;
        }
        else if (selected_cosem === PanelContext.selectedObject){
            return;
        }
        else if (PanelContext.selectedProject !== 'TEMPORARY'){
            axios.get(`http://10.23.40.185/api/project/get/${selected_project_name}/${selected_version}/${selected_cosem}`)
                .then((resp)=>{
                    PanelContext.updateSelectedObject(selected_cosem);
                    PanelContext.updateWorkfile(resp.data);
                    PresentationContext.updateSelectedNode(undefined);
                })
                .catch((error)=>{
                    console.log(`ERROR: ${error}`);
                }
            )
        }
        else{
            axios.get(`http://10.23.40.185/api/project/temporary/get/${selected_version}/${selected_cosem}`,{
                headers:{
                    Authorization: `Bearer ${AssociationContext.jwt}`
                }
            })
                .then((resp)=>{
                    PanelContext.updateSelectedObject(selected_cosem);
                    PanelContext.updateWorkfile(resp.data);
                    PresentationContext.updateSelectedNode(undefined);
                })
                .catch((error)=>{
                    console.log(`ERROR: ${error}`);
                }
            )
        }


    }

    return <StyledPanel>
        <StyledBoxTitle>
            <span>Object List</span>
            <input value={search_input} placeholder={"Search Object"} onChange={(event) => set_search_input(event.target.value)}></input>
        </StyledBoxTitle>

        <StyledListBox onClick={(event)=>item_clicked(event)}>
            {filtered_cosem!==undefined && filtered_cosem.map((cosem)=>{
                if (search_input.length !== 0){
                    const object_lower = cosem.toLowerCase();
                    if(object_lower.includes(search_input)){
                        <li id={`cosem-item-${cosem}`} key={`cosem-item-${cosem}`} className={PanelContext.selectedObject === cosem ? "active":undefined}>{cosem}</li>
                    }
                }
                return <li id={`cosem-item-${cosem}`} key={`cosem-item-${cosem}`} className={PanelContext.selectedObject === cosem ? "active":undefined}>{cosem}</li>
            })}
        </StyledListBox>
    </StyledPanel>
}

export default CosemListPanel;