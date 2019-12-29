import React from "react";

import styled from "styled-components";
import TetrisGameFrame from "../components/TetrisGameFrame";

const TetrisPage: React.FC = () => {
  const TetrisPageDiv = styled.div``;
  return (
    <TetrisPageDiv>
      <TetrisGameFrame></TetrisGameFrame>
    </TetrisPageDiv>
  );
};

export default TetrisPage;
