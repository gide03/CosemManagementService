import React, { useState } from "react";
import axios from "axios";
import "./style.css";

import ControlPanel from "./ControlPanel";
import { PanelHandlerContext } from "./Context/PanelHandlerContext";
import { GuiStateContext } from "./Context/AppContext";

import NodeView from "./Components/NodeItem";
import { WorkItemPresentationContext } from "./Context/WorkitemContext";

const DataViewerPage = () => {
  const [activeWorkItem, setActiveWorkItem] = useState(null); // JSON data (All data in string)
  const [activeNodeTreeId, setActiveNodeId] = useState(""); // Tree Node ID in string
  const [meterList, setMeterList] = useState([]); // Project list (list of string)
  const [activeProject, setActiveProject] = useState(""); // Project name in string
  const [versionList, setVersionList] = useState([]); // Version list (list of string)
  const [activeVersion, setActiveVersion] = useState(""); // Version name in string
  const [cosemList, setCosemList] = useState([]); // List of project name, (list of string)
  const [activeObject, setActiveObject] = useState("");

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
  };

  const ObjectPresentationContextValue = {
    workItem: activeWorkItem,
    updateWorkItem: updateWorkItem,
    onClicked: nodeOnClicked,
    activeNodeTreeId: activeNodeTreeId,
  };
  //

  /**
   * CONTROL PANEL HANLDER
   */
  //TODO: Override GuiStateDefault. NOTE: Need to sync to the context file

  const getProjectList = () => {
    console.log("Get project list");
    axios
      .get("http://10.23.40.185/api/project/listproject")
      .then((response) => {
        let respData = response.data;
        console.log(respData);
        console.debug("Update meter list");
        setMeterList(respData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //TODO: Override control panel event handler
  const onClickProject = (item) => {
    console.log(`[Page::onClickProject] onClickProject for project ${item}`);
    console.log(`[Page::onClickProject] get version list of ${item}`);
    axios
      .get(`http://10.23.40.185/api/project/listversion/${item}`)
      .then((response) => {
        let respData = response.data;
        console.debug("[Page::onClickProject] result", respData);
        console.debug("[Page::onClickProject] update active project");
        setActiveProject(item);
        console.debug("[Page::onClickProject] update version list");
        setVersionList(respData);

        if (item !== activeProject) {
          setCosemList([]);
          setActiveVersion("");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onClickVersion = (item) => {
    console.log(`[Page::onClickVersion] handler version on click for ${item}`);
    console.log(
      `[Page::onClickVersion] get cosem list for project ${activeProject} v${item}`
    );

    axios
      .get(
        `http://10.23.40.185/api/project/getcosemlist/${activeProject}/${item}`
      )
      .then((response) => {
        let respData = response.data;
        console.debug("[Page::onClickVersion] result", respData);
        console.debug("[Page::onClickVersion] cosem list");
        setActiveVersion(item);
        console.debug("[Page::onClickVersion] cosem list");

        setCosemList(respData);

        if (activeVersion !== item) {
          setActiveObject("");
          setActiveWorkItem(null);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  function onDeleteProject(item) {
    console.log(`handler version on delete for ${item}`);
  }

  function onClickObject(item) {
    console.log(`[Page::onClickObject] handler object on click ${item}`);

    axios
      .get(
        `http://10.23.40.185/api/project/get/${activeProject}/${activeVersion}/${item}`
      )
      .then((response) => {
        let respData = response.data;
        if (item !== activeObject) {
          setActiveNodeId(null);
        }
        console.debug("[Page::onClickObject] result", respData);
        setActiveObject(item);
        console.debug("[Page::onClickObject] Update active object data");
        setActiveWorkItem(respData);
      })
      .catch((error) => {
        console.log(error);
      });
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
          {/* <section id="content-selector"> */}
          <ControlPanel></ControlPanel>
          {/* </section> */}
          {/* <WorkItemPresentationContext.Provider
            value={ObjectPresentationContextValue}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "60vh",
              }}
            >
              {activeWorkItem !== null ? (
                <div id="preview-titlebar">
                  Preview: <span className="hl">{activeObject}</span> Obis:
                  <span className="hl">{activeWorkItem.logicalName}</span> Att:
                  <span className="hl">
                    {activeNodeTreeId === "" ? "-" : activeNodeTreeId}
                  </span>
                </div>
              ) : (
                <div id="preview-titlebar">
                  Preview: <span className="hl">-</span> Obis:
                  <span className="hl">-</span> Att:
                  <span className="hl">-</span>
                </div>
              )}
              <div id="content-presentation">
                <div id="attribute-tree-presentation">
                  <NodeView />
                </div>
                <div id="attribute-information">Node presentation</div>
              </div>
            </div>
          </WorkItemPresentationContext.Provider> */}
        </div>
      </PanelHandlerContext.Provider>
    </GuiStateContext.Provider>
  );
};

export default DataViewerPage;
