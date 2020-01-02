import React from "react";
import TetrisGameField from "./TetrisGameField";
import { TetrisFieldTile, ActivePiece, Mino } from "../types";
import styled from "styled-components";
import HoldSlot from "./HoldSlot";

const TetrisGameFrameDiv = styled.div`
  display: flex;
`;

interface TetrisGameFrameProps {
  field: TetrisFieldTile[][];
  activePiece: ActivePiece;
  hold?: Mino;
}
const TetrisGameFrame: React.FC<TetrisGameFrameProps> = props => {
  const unitSize = 24;
  return (
    <TetrisGameFrameDiv>
      <HoldSlot unit={unitSize} pieceType={props.hold}></HoldSlot>
      <TetrisGameField
        unit={unitSize}
        field={props.field}
        activePiece={props.activePiece}
      ></TetrisGameField>
    </TetrisGameFrameDiv>
  );
};

export default TetrisGameFrame;
