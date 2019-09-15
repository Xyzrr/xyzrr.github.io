import katex from "katex";
import React from "react";
import styled from "styled-components";
import * as colors from "../colors";

const KatexDiv = styled.div`
  color: ${colors.veryLightGray};
  position: fixed;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  font-size: ${props => props.fontSize}px;
`;

const Katex = props => {
  const html = katex.renderToString(props.expression);
  return (
    <KatexDiv
      position={props.position}
      fontSize={props.fontSize || 20}
      dangerouslySetInnerHTML={{ __html: html }}
    ></KatexDiv>
  );
};

export default Katex;
