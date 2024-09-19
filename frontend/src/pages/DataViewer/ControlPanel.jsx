import { useContext, useState, useEffect } from "react";
import { GuiStateContext } from "./Context/AppContext";
import { PanelHandlerContext } from "./Context/PanelHandlerContext";
import PanelContainer from "./Components/Panel";

const data_meterList = ["Dev", "RUBY", "SPAIN"];
const data_versionList = {
  SPAIN: [
    "1.00.20231215",
    "9.01 20231221 1429",
    "9.01 20231221 1638",
    "9.01 20240115 1343",
    "9.01 20240130 1540",
    "9.01 20240130 1605",
    "9.01 20240131 1641",
    "9.01 20240201 1427",
    "9.01 20240206 1440",
    "9.02 20240206 1441",
    "9.02 20240207 1607",
    "9.03 20240213 1337",
    "9.03 20240219 1351",
    "9.03 20240219_1635",
    "9.03 20240222 1501",
    "9.03 20240227 1500",
    "9.03 20240304 0915",
  ],
  RUBY: [
    "0.03",
    "0.04.20230908",
    "0.04_20230912",
    "0.04_20230920",
    "0.04_20230922",
  ],
};

/**
 * Control Panel
 * Widget interface for page control panel
 *
 * Parameter:
 * - handler `object` required key:Details
 *    - getProjectList `function`
 *    - onDeleteProject `onDeleteProject`
 * ....
 */
const ControlPanel = ({ debug = false }) => {
  //TODO: Use context
  const {
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
  } = useContext(GuiStateContext);
  const handler = useContext(PanelHandlerContext);

  const [filteredCosem, setFilteredCosem] = useState(cosemList);
  useEffect(() => {
    setFilteredCosem(cosemList);
  }, [cosemList])

  const getProjectList = () => {
    console.log("Fetch data");
    if (handler === null || handler.getProjectList === undefined) {
      console.warn("(getProjectList) Not implemented yet");
      setMeterList(data_meterList);
      return;
    }

    handler.getProjectList();
  };

  const onDeleteProject = (item) => {
    console.log(`Project delete ${item} ${item.length}`);
    if (handler === null || handler.onDeleteProject === undefined) {
      console.warn("(onDeleteProject) Not implemented yet");
      setMeterList(meterList.filter((m) => m !== item));
      return;
    }
    handler.onDeleteProject(item);
  };

  const onClickProject = (item) => {
    console.log(`Project clicked ${item}`);
    console.log(handler);
    if (handler === null || handler.onClickProject === undefined) {
      console.warn("(onClickProject) Not implemented yet");
      const versionList = data_versionList[item];
      if (item !== activeProject) {
        setCosemList([]);
        setActiveVersion("");
      }

      setActiveProject(item);
      setVersionList(versionList);
      return;
    }
    handler.onClickProject(item);
  };

  const onClickVersion = (item) => {
    console.log(`Version clicked ${item}`);

    // INTERNAL COMPONENT FUNCTIONALITY
    if (handler === null || handler.onClickVersion === undefined) {
      console.warn("(onClickVersion) Not implemented yet");
      setActiveVersion(item);
      setCosemList(["cosem1", "cosem2", "cosem3"]);

      if (activeVersion !== item) {
        setActiveObject("");
      }
      return;
    }
    handler.onClickVersion(item);
  };

  const onDeleteVersion = (item) => {
    console.log("Version delete", item);
    const isDelete = window.confirm(`Are you sure to delete ${item}?`);

    if (!isDelete) {
      return;
    }
    // INTERNAL COMPONENT FUNCTIONALITY
    if (handler === null || handler.onDeleteProject === undefined) {
      console.warn("(onDeleteVersion) Not implemented yet");
      if (activeVersion === item) {
        // setCosemList([]);
        // setActiveObject("");
      }
      setVersionList(versionList.filter((m) => m !== item));
      return;
    }

    handler.onDeleteVersion(item);
  };

  const onClickObject = (item) => {
    console.log(`Clicked cosem ${item}`);

    // INTERNAL COMPONENT FUNCTIONALITY
    if (handler == null || handler.onClickObject === undefined) {
      console.warn("(onClickObject) Not implemented yet");
      setActiveObject(item);
      return;
    }

    handler.onClickObject(item);
  };

  const onSearch = (search_text_input) => {
    if (search_text_input === 0){
        setFilteredCosem([...cosemList]);
        return;
    }
    setFilteredCosem(cosemList.filter((cosem) => cosem.toLowerCase().includes(search_text_input.toLowerCase())));
  }

  if (meterList.length === 0) {
    getProjectList();
  }

  return (
    <section id="content-selector">
      {debug && (
        <div>
          <p>Debug Control Panel</p>
          <ul>
            <li>Active Project: {activeProject}</li>
            <li>Active Version: {activeVersion}</li>
            <li>Active Object : {activeObject}</li>
          </ul>
        </div>
      )}
      {
        // Component development only
        handler === null && (
          <button onClick={() => getProjectList()}>Get Data</button>
        )
      }

      <PanelContainer
        title="Meter Type"
        itemList={meterList}
        activeItem={activeProject}
        showSearchBox={false}
        showDeleteItem={false}
        onDelete={onDeleteProject}
        onItemClicked={onClickProject}
      />

      <PanelContainer
        title="Version"
        itemList={versionList}
        activeItem={activeVersion}
        showSearchBox={false}
        showDeleteItem={true}
        onDelete={onDeleteVersion}
        onItemClicked={onClickVersion}
      ></PanelContainer>

      <PanelContainer
        title="Cosem object list"
        itemList={filteredCosem}
        activeItem={activeObject}
        showSearchBox={true}
        onSearch={onSearch}
        showDeleteItem={false}
        onItemClicked={onClickObject}
      ></PanelContainer>
    </section>
  );
};

export default ControlPanel;
