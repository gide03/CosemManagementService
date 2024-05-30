import React, { useState } from "react";
import axios from "axios";
import "./style.css";

import ControlPanel from "./ControlPanel";
import { PanelHandlerContext } from "./Context/PanelHandlerContext";
import { GuiStateContext } from "./Context/AppContext";

const DataViewerPage = () => {
  /**
   * OBJECT PRESENTATION
   */
  const [activeObjectData, setObjectData] = useState("");

  //

  /**
   * CONTROL PANEL HANLDER
   */
  //TODO: Override GuiStateDefault. NOTE: Need to sync to the context file
  const [meterList, setMeterList] = useState([]);
  const [activeProject, setActiveProject] = useState("");
  const [versionList, setVersionList] = useState([]);
  const [activeVersion, setActiveVersion] = useState("");
  const [activeObject, setActiveObject] = useState("");
  const [cosemList, setCosemList] = useState([]);

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
          setObjectData(null);
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

    // http://10.23.40.185/api/project/get/SPAIN/9.05%2020240515%200935/EnergyReactiveIncrBillingQ3
    axios
      .get(
        `http://10.23.40.185/api/project/get/${activeProject}/${activeVersion}/${item}`
      )
      .then((response) => {
        let respData = response.data;
        console.debug("[Page::onClickObject] result", respData);
        setActiveObject(item);
        setObjectData(respData);
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

  //   <GuiStateContext.Provider value={GuiStateDefault}>
  //     <PanelHandlerContext.Provider value={ControlPanelEvtHandler}>
  return (
    <GuiStateContext.Provider value={GuiStateDefault}>
      <PanelHandlerContext.Provider value={ControlPanelEvtHandler}>
        <div id="page-dataviewer">
          {/* <section id="content-selector"> */}
          <ControlPanel></ControlPanel>
          {/* </section> */}
          <section id="content-presentation">
            <div>Object tree</div>
            <div>Node presentation</div>
          </section>
        </div>
      </PanelHandlerContext.Provider>
    </GuiStateContext.Provider>
  );
};

export default DataViewerPage;
