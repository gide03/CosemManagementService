import { createContext } from "react";

function getContext() {
  return createContext(null);
}

export const PanelHandlerContext = getContext();
