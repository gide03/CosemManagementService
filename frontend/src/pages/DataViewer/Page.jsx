import React, { useState } from "react";
import axios from "axios";
import "./style.css";

import ControlPanel from "./ControlPanel";
import AttributePresentation from "./Components/AttributePresentation";
import NodeView from "./Components/NodeItem";

import { WorkItemPresentationContext } from "./Context/WorkitemContext";
import { PanelHandlerContext } from "./Context/PanelHandlerContext";
import { GuiStateContext } from "./Context/AppContext";
import { ReqApi } from "./Hook/ApiReq";

const DataViewerPage = ({AssociationContext}) => {
  const [activeWorkItem, setActiveWorkItem] = useState(null); // JSON data (All data in string)
  const [activeNodeTreeId, setActiveNodeId] = useState(""); // Tree Node ID in string
  const [meterList, setMeterList] = useState([]); // Project list (list of string)
  const [activeProject, setActiveProject] = useState(""); // Project name in string
  const [versionList, setVersionList] = useState([]); // Version list (list of string)
  const [activeVersion, setActiveVersion] = useState(""); // Version name in string
  const [cosemList, setCosemList] = useState([]); // List of project name, (list of string)
  const [activeObject, setActiveObject] = useState("");
  const [activeNode, setActiveNode] = useState(null); // Information of attribute node

  /**
   * OBJECT PRESENTATION
   */
  const updateWorkItem = (item) => {
    console.log(`[Page::updateWorkItem] update work item`);
    setActiveWorkItem(item);
  };

  const nodeOnClicked = (node) => {
    console.log(`[Page::nodeOnClicked] item clicked node id ${node.id}`);
    setActiveNodeId(node.id);
    setActiveNode(node);
  };

  const ObjectPresentationContextValue = {
    workItem: activeWorkItem,
    updateWorkItem: updateWorkItem,
    onClicked: nodeOnClicked,
    activeNodeTreeId: activeNodeTreeId,
    activeNode: activeNode,
  };
  //

  /**
   * CONTROL PANEL HANLDER
   */
  //TODO: Override GuiStateDefault. NOTE: Need to sync to the context file
  const getProjectList = () => {
    console.log("Get project list");
    ReqApi.getProjectList(setMeterList);
  };

  //TODO: Override control panel event handler
  const onClickProject = (item) => {
    if (item === activeProject) {
      return;
    }
    console.log(`[Page::onClickProject] onClickProject for project ${item}`);
    console.log(`[Page::onClickProject] get version list of ${item}`);
    ReqApi.getVersionList(item, setVersionList);
    setActiveProject(item);

    setActiveWorkItem(null);
    setActiveNodeId("");
    setVersionList([]);
    setActiveVersion("");
    setCosemList([]);
    setActiveObject("");
  };

  const onClickVersion = (item) => {
    console.log(`[Page::onClickVersion] handler version on click for ${item}`);
    console.log(
      `[Page::onClickVersion] get cosem list for project ${activeProject} v${item}`
    );
    if (activeVersion !== item) {
      setActiveObject("");
      setActiveWorkItem(null);
      setActiveVersion(item);
      ReqApi.getCosemList(activeProject, item, setCosemList);
    }
  };

  function onDeleteProject(item) {
    console.log(`handler version on delete for ${item}`);
  }

  function onClickObject(item) {
    if (item === activeObject) {
      return;
    }
    console.log(`[Page::onClickObject] handler object on click ${item}`);
    ReqApi.getCosemInfo(activeProject, activeVersion, item, setActiveWorkItem);
    setActiveObject(item);
    setActiveNodeId("");
    setActiveNode(null);
  }

  //TODO: Generate new context value
  const GuiStateDefault = {
    meterList,
    setMeterList,
    activeProject,
    setActiveProject,
    versionList,
    setVersionList,
    activeVersion,
    setActiveVersion,
    activeObject,
    setActiveObject,
    cosemList,
    setCosemList,
    AssociationContext
  };
  const ControlPanelEvtHandler = {
    getProjectList: getProjectList,
    onClickProject: onClickProject,
    onClickVersion: onClickVersion,
    onClickObject: onClickObject,
    // onDeleteProject: onDeleteProject,
  };
  // END PANEL HANDLER

  return (
    <GuiStateContext.Provider value={GuiStateDefault}>
      <PanelHandlerContext.Provider value={ControlPanelEvtHandler}>
        <div id="page-dataviewer">
          <section id="content-selector">
            <ControlPanel></ControlPanel>
          </section>
          <WorkItemPresentationContext.Provider
            value={ObjectPresentationContextValue}
          >
            <div id="content-presentation">
              <div id="preview-title">
                {activeWorkItem && (
                  <>
                    <span>{`${activeObject}`}</span>
                    <div>
                      <span className="prv-obis">
                        {activeWorkItem.logicalName}
                      </span>
                    </div>
                    <div>
                      {activeWorkItem === null
                        ? ""
                        : `Class ID: ${activeWorkItem.classId}`}
                    </div>
                    <div>
                      {activeNodeTreeId === null
                        ? ""
                        : `Attribute: ${activeNodeTreeId}`}
                    </div>
                  </>
                )}
              </div>
              <div id="preview-content">
                {activeWorkItem && (
                  <>
                    <NodeView></NodeView>
                    {activeNode !== null && (
                      <AttributePresentation></AttributePresentation>
                    )}
                  </>
                )}
              </div>
            </div>
          </WorkItemPresentationContext.Provider>
        </div>
      </PanelHandlerContext.Provider>
    </GuiStateContext.Provider>
  );
};

export default DataViewerPage;
