import React, { useState } from "react";
import styled from 'styled-components'
import axios from "axios";
import WaitingBox from "./WaitingBox";

const StyledButtonWrapper = styled.div`
    width: 10%;
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
`

const ControlPanel = ({PanelContext, AssociationContext}) => {
    const [waitingBox, setWaitingBox] = useState(false);

    function send_changes(){
        const workfile = PanelContext.workfile;
        const payload = {
            "projectname":PanelContext.selectedProject,
            "version":PanelContext.selectedFirmware,
            "workfile":workfile,
        }

        if(PanelContext.selectedProject !== 'TEMPORARY'){
            axios.post(`http://10.23.40.185/api/project/update`, payload)
                .then((resp)=>{
                    if (resp.data === 'OK'){
                        alert(`Update ${PanelContext.workfile.objectName} successfull`)
                    }
                })
                .catch((error)=>{
                    console.log(`ERROR: ${error}`);
                }
            )
        }
        else{
            axios.post(`http://10.23.40.185/api/project/temporary/update`, payload, {
                headers:{
                    Authorization: `Bearer ${AssociationContext.jwt}`
                }
            })
                .then((resp)=>{
                    if (resp.data === 'OK'){
                        alert(`Update ${PanelContext.workfile.objectName} successfull`)
                    }
                })
                .catch((error)=>{
                    console.log(`ERROR: ${error}`);
                }
        )
        }
    }

    function request_download(){
        console.log(`Request to download db. Project: ${PanelContext.selectedProject} -- ${PanelContext.selectedFirmware}`);
        if (PanelContext.selectedProject !== '' && PanelContext.selectedFirmware !== ''){
            setWaitingBox(true);
    
            window.location.href = `http://10.23.40.185/api/data/download/${PanelContext.selectedProject}/${PanelContext.selectedFirmware}`
    
            setTimeout(() => {
                setWaitingBox(false);
            }, 3000);
        }
    }

    return <StyledButtonWrapper>
        {!waitingBox && PanelContext.selectedProject !== "TEMPORARY" && <button onClick={request_download}>Download</button>}
        {(AssociationContext.jwt !== '' && AssociationContext.jwt !== null) && <button onClick={send_changes}>Submit Change</button>}
        {waitingBox && <WaitingBox message={"Database will be be received soon"}></WaitingBox>}
    </StyledButtonWrapper>
}

export default ControlPanel;