import React from "react";
import TetrisGameField from "./TetrisGameField";
import { TetrisFieldTile, ActivePiece, Mino } from "../types";
import styled from "styled-components";
import HoldSlot from "./HoldSlot";
import BagPreview from "./BagPreview";

const TetrisGameFrameDiv = styled.div`
  display: flex;
`;

interface TetrisGameFrameProps {
  field: TetrisFieldTile[][];
  activePiece?: ActivePiece;
  hold?: Mino;
  nextPieces: Mino[];
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
      <BagPreview unit={unitSize} nextPieces={props.nextPieces}></BagPreview>
    </TetrisGameFrameDiv>
  );
};

export default TetrisGameFrame;
