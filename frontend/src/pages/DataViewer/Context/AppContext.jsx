import { createContext } from "react";

function GuiState() {
  const GuiStateDefault = {
    meterList: [],
    setMeterList: () => {},
    activeProject: "",
    setActiveProject: () => {},
    versionList: [],
    setVersionList: () => {},
    activeVersion: "",
    setActiveVersion: () => {},
    activeObject: "",
    setActiveObject: () => {},
    cosemList: [],
    setCosemList: () => {},
  };
  return createContext(GuiStateDefault);
}

export const GuiStateContext = GuiState();
