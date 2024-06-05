import styled from "styled-components";
import { useContext } from "react";

import { PanelHandlerContext } from "../Context/PanelHandlerContext";

const StyledBar = styled.div`
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
`;

const TitleBar = () => {
  return <StyledBar></StyledBar>;
};
