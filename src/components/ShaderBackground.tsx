import React from "react";
import styled from "styled-components";

const ShaderBackgroundDiv = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: lightgray;
`;

const ShaderBackground: React.FC = () => {
  return <ShaderBackgroundDiv>hello world</ShaderBackgroundDiv>;
};

export default ShaderBackground;
