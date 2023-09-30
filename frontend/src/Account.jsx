import React, { useEffect, useState } from "react";
import styled, {keyframes}  from "styled-components";
import axios from 'axios';

const waveAnimation = keyframes`
  0%, 100% {
    transform: rotate(0deg);
    }
    25% {
        transform: rotate(-30deg);
    }
    75% {
        transform: rotate(30deg);
    }
`;

const spin = keyframes`
    0% {transform: rotate(0deg);}
    100% {transform: rotate(360deg);}
`;

const PageWrapper = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    user-select: none;

    .dialog{
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3rem;
        border: 1px solid black;
        border-radius: 1rem;
        box-sizing: border-box;
        max-width: 30vw;
        overflow: hidden;
    }

    .formbox{
        margin-top: 1rem;
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        
        input{
            text-align: center;
        }
        
    }

    ul{
        list-style-type: none;
        padding: 0;
        text-align: center;
        
        :hover{
            transition: all 0.3s;
            cursor: pointer;
            color: #bebebe;
            text-decoration: underline;
        }
    }

    .nametag{
        font-size: 1.7rem;
        font-weight: bolder;
        text-align: center;
        width:100%;
    }
    .submit{
        margin-top: 1rem;
    }

    p{
        text-align: center;
    }

    input{
        max-width: 100%;
        text-overflow: hidden;
        background-color: #c8c8c8;
        border-radius: 5px;
        text-align: center;
    }
`

const WavingHandIcon = styled.div`
  font-size: 20px;
  transform-origin: bottom; /* Adjust the rotation point */
  display: inline-block; /* Ensures the animation doesn't affect layout */
  line-height: 1; /* Prevents extra space below the icon */
  animation: ${waveAnimation} 2s infinite;
`;

const Loader = styled.div`
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: ${spin} 1s linear infinite;
    margin: 0 auto;
    margin-top: 100px;
`

const AccountPage = ({AssociationContext}) => {
    const [selectedMenu, setSelectedMenu] = useState('account');
    const [waitStatusFlag, setWaitstatusFlag] = useState(false);
    const [file, setFile] = useState(null);

    const [metertype, setMetertype] = useState('');
    const [fwversion, setFwversion] = useState('');
    const [mergedata, setMergedata] = useState(true);

    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');

    // hooks
    useEffect(()=>{
        setWaitstatusFlag(false);
        setFile(null);
        setMetertype('');
        setFwversion('');
        setMergedata(true);
        setProjectName('');
        setProjectDesc('');
    }, [selectedMenu])

    // Request publish
    function publish(){
        const payload = {
            projectname:metertype,
            version:fwversion,
        };
        axios.post("http://10.23.40.185/api/project/import", payload, {
            headers:{
                Authorization: `Bearer ${AssociationContext.jwt}`,
            }

        })
        .then((resp)=>{
            alert(resp.data);
            window.location.href = '/';
        })
        .catch((error)=>{
            alert(error);
        })
    }

    // Request to create new project
    function create_new_project(){
        if (projectName.length === 0 || projectDesc.length === 0){
            alert("Please fill all the forms");
            return;
        }

        const payload = {
            projectname: projectName,
            description: projectDesc
        }
        axios.post("http://10.23.40.185/api/project/createproject", payload, {
            headers:{
                Authorization: `Bearer ${AssociationContext.jwt}`,
            }
        })
        .then((resp)=>{
            alert(resp.data);
            window.location.href = '/';
        })
        .catch((error)=>{
            alert(error);
        })
    }

    function import_modifier(){
        if (metertype.length === 0 || file === null){
            alert("Please fill all the forms");
            return;
        }

        const formData = new FormData();
        const jwt_token = AssociationContext.jwt;

        formData.append('file', file);
        formData.append('projectname', metertype);

        setWaitstatusFlag(true);
        axios.post("http://10.23.40.185/api/data/importenumsection", formData, {
            headers:{
                Authorization: `Bearer ${jwt_token}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((resp) => {
            setWaitstatusFlag(false);
            alert(`${resp.data}`);
            if (resp.data === 'OK'){
                window.location.href = '/';
            }
        })
        .catch((error) => {
            setWaitstatusFlag(false);
            alert(error);
        })
    }

    return (
        <PageWrapper>
            {selectedMenu === "account" && <div className="dialog">
                <div>
                    <div className="nametag">Hi {AssociationContext.username} <WavingHandIcon>🖐️</WavingHandIcon> </div>
                </div>
                <ul onClick={(event)=>{
                    console.log(event.target.id);
                    setSelectedMenu(event.target.id);
                }}>
                    <li id="createproject">
                        Create Project
                    </li>
                    <li id="importxml">
                        Import XML
                    </li>
                    <li id="publish">
                        Publish Temp Database
                    </li>
                    <li id="importmodifier">
                        Import Modifier Section
                    </li>
                </ul>
                <ul onClick={(event) => {
                    console.log(event.target.id);
                    setSelectedMenu(event.target.id);
                }}>
                    <li id="logout">Logout</li>
                    <li id="changepassword">Change your password?</li>
                </ul>
            </div>}


            {selectedMenu === "importxml" && <div className="dialog">
                <h1>Import XML</h1>
                <p>The XML will be stored at your workspace database. It is Temporary until you publish it later, it will be replaced to the latest one if you re-send the XML file. </p>
                <span>Customer</span>
                <input id="customer" type="file" accept=".xml" onChange={(event)=>{
                    let m_file;
                    if (file === null){
                        m_file = [null, null];
                        m_file[0] = event.target.files[0];
                    }
                    else{
                        m_file = [...file];
                        m_file[0] = event.target.files[0];
                    }
                    setFile(m_file);
                }}></input>
                <span>Manuf</span>
                <input id="manuf" type="file" accept=".xml" onChange={(event)=>{
                    let m_file;
                    if (file === null){
                        m_file = [null, null];
                        m_file[1] = event.target.files[0];
                    }
                    else{
                        m_file = [...file];
                        m_file[1] = event.target.files[0];
                    }
                    setFile(m_file);
                }}></input>
                <label><input type="checkbox" checked={mergedata} onChange={(event)=>setMergedata(event.target.checked)}></input>Merge data from the latest version</label>
                {mergedata && <input value={metertype} placeholder="Reference (Meter Type)" onChange={(event)=>setMetertype(event.target.value)}></input>}

                {waitStatusFlag && <div>Please wait <Loader></Loader></div>}
                {!waitStatusFlag && <>
                    <button className="submit" onClick={()=>{
                        if (metertype.length === 0 && mergedata == true){
                            alert('Need meter type as reference in merging process');
                        }

                        if(file !== null){
                            const jwt_token = AssociationContext.jwt;
                            const formData = new FormData();
                            formData.append('filecustomer',file[0]);
                            formData.append('filemanuf',file[1]);
                            formData.append('ismerge', mergedata);
                            formData.append('reference', metertype);

                            setWaitstatusFlag(true);
                            axios.post("http://10.23.40.185/api/data/upload", formData, {
                                headers:{
                                    Authorization: `Bearer ${jwt_token}`,
                                    'Content-Type': 'multipart/form-data'
                                }
                            })
                            .then((resp) => {
                                setWaitstatusFlag(false);
                                alert(`${resp.data}`);
                                if (resp.data === 'OK'){
                                    window.location.href = '/';
                                }                                
                            })
                            .catch((error) => {
                                setWaitstatusFlag(false);
                                alert(error.message);
                            })
                        }
                        else{
                            alert("Please fill the form correctly")
                        }
                        }}>
                            Submit
                    </button>
                    <button onClick={()=>setSelectedMenu("account")}>Back</button>
                </>
                }
            </div>}

            {selectedMenu === 'logout' && <div className="dialog">
                {window.location.href = '/logout'}
            </div>
            }

            {selectedMenu === 'publish' && <div className="dialog">
                <h1>Publish Database</h1>
                <p>You will make your temporary database to be published to specified Meter Type and Firmware Version. If the fw_version already exist, your request will be rejected. If Project name is not exist, I'll create it for you :)</p>
                <p>Right after you publish, your temporary database will be removed</p>
                <input value={metertype} onChange={(event) => setMetertype(event.target.value)} placeholder="Meter Type"></input>
                <input value={fwversion} onChange={(event) => setFwversion(event.target.value)} placeholder="Firmware Version"></input>
                <label><input type="checkbox" checked={mergedata} onChange={(event)=>setMergedata(event.target.checked)}></input>Merge data from the latest version</label>
                <button onClick={()=>{
                    publish();
                }}>Publish</button>
                <button onClick={()=>setSelectedMenu("account")}>Back</button>
            </div>
            }

            {selectedMenu === 'createproject' && <div className="dialog">
                <h1>Create New Project</h1>
                <p>Note: Project name will not be created if already exist</p>
                <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="project name"></input>
                <textarea value={projectDesc} onChange={(event) => setProjectDesc(event.target.value)} placeholder="project description"></textarea>
                <button onClick={()=>{
                    create_new_project();
                }}>Submit</button>
                <button onClick={()=>setSelectedMenu("account")}>Back</button>
                </div>  
            }

            {selectedMenu === 'importmodifier' && <div className="dialog">
                <h1>Import Modifier</h1>
                <p>{`.json format -> {"LR":[ ], "NLR2":[ ]}`}</p>
                <p>Data will be overrided after import</p>
                <input id="fileinput" type="file" onChange={(event)=>{
                    setFile(event.target.files[0])
                }} accept=".json"></input>
                <input value={metertype} onChange={(event) => setMetertype(event.target.value)} placeholder="METER TYPE"></input>
                <button onClick={()=>{import_modifier()}}>Submit</button>
                <button onClick={()=>setSelectedMenu("account")}>Back</button>
                </div>  
            }
        </PageWrapper>
    )
}

export default AccountPage;