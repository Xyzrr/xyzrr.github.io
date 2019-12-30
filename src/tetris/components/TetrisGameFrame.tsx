import React from "react";
import TetrisGameField from "./TetrisGameField";
import { TetrisFieldTile, ActivePiece } from "../types";

interface TetrisGameFrameProps {
  field: TetrisFieldTile[][];
  activePiece: ActivePiece;
}
const TetrisGameFrame: React.FC<TetrisGameFrameProps> = props => {
  return (
    <TetrisGameField
      field={props.field}
      activePiece={props.activePiece}
    ></TetrisGameField>
  );
};

export default TetrisGameFrame;
