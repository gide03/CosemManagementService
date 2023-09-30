import { useEffect, useState } from "react";
import ObjectPresentation from "./components/ObjectPresentation";
import PanelPresentation from "./components/PanelPresentation";
import axios from "axios";

const Backend_Server = 'http://10.23.40.185/api'

function DataViewer({AssociationContext}) {
  const [projectList, updateProjectList] = useState([]);
  const [selectedProject, updateSelectedProject] = useState('');
  const [firmwareList, updateFirmwareList] = useState([]);
  const [selectedFirmware, updateSelectedFirmware] = useState('');
  const [cosemObjectList, updateCosemObjectList] = useState([]);
  const [selectedObject, updateSelectedObject] = useState('');
  const [workfile, updateWorkfile] = useState();
  const [selectedNode, updateSelectedNode] = useState();
  const [attributeAccessLevel, updateAttributeAccessLevel] = useState([]);
  const [methodAccessLevel, updateMethodAccessLevel] = useState([]);
  const [selectedAccessLevel, updateSelectedAccessLevel] = useState();

  // CONTEXT CREATION
  // PanelContext
  const PanelContext = {
    projectList : projectList,
    updateProjectList : updateProjectList,
    selectedProject: selectedProject,
    updateSelectedProject: updateSelectedProject,
    firmwareList: firmwareList,
    updateFirmwareList: updateFirmwareList,
    selectedFirmware: selectedFirmware,
    updateSelectedFirmware: updateSelectedFirmware,
    cosemObjectList: cosemObjectList,
    updateCosemObjectList: updateCosemObjectList,
    selectedObject: selectedObject,
    updateSelectedObject: updateSelectedObject,
    workfile: workfile,
    updateWorkfile: updateWorkfile,
  }
  
  // PresentationContext
  const PresentationContext = {
    selectedNode: selectedNode,
    updateSelectedNode: updateSelectedNode,
    attributeAccessLevel: attributeAccessLevel,
    updateAttributeAccessLevel: updateAttributeAccessLevel,
    methodAccessLevel: methodAccessLevel,
    updateMethodAccessLevel: updateMethodAccessLevel,
    selectedAccessLevel: selectedAccessLevel,
    updateSelectedAccessLevel: updateSelectedAccessLevel
  }

  useEffect(()=>{
    console.log('[DataViewerPage] List projects')
    axios.get(`${Backend_Server}/project/listproject`)
      .then((response) => {
          let data = response.data;
          if(AssociationContext.jwt !== '' && AssociationContext.jwt !== null ){
            data.push('TEMPORARY')
          }
          updateProjectList(data);
      })
      .catch((error) => {
          console.log(`ERROR: ${error}`);
      })
  }, [AssociationContext.jwt])

  //end
  //

  return (
    <div className="App">
      <PanelPresentation PanelContext={PanelContext} PresentationContext={PresentationContext} AssociationContext={AssociationContext}/>
      <ObjectPresentation PanelContext={PanelContext} PresentationContext={PresentationContext} AssociationContext={AssociationContext}/>
    </div>
    );
  }
  
  export default DataViewer;
  