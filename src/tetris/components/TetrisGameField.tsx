import React, { useEffect } from "react";
import { TetrisColors } from "../../colors";
import styled from "styled-components";
import { TetrisTile } from "../types";

interface TetrisGameFieldProps {
  width?: number;
  field: TetrisTile[][];
}

const TetrisGameField: React.FC<TetrisGameFieldProps> = props => {
  const width = props.width || 400;
  const height = width * 2;
  const unit = width / 10;

  const GameFieldCanvas = styled.canvas`
    width: ${width}px;
    height: ${height}px;
  `;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const renderLand = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      if (ctx) {
        props.field.forEach((row, i) => {
          row.forEach((cell, j) => {
            if (cell !== ".") {
              ctx.fillStyle = TetrisColors[cell].toString();
              ctx.fillRect(unit * j, unit * i, unit, unit);
            }
          });
        });
      }
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width * window.devicePixelRatio;
      canvasRef.current.height = height * window.devicePixelRatio;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      renderLand();
    }
  });

  renderLand();

  return <GameFieldCanvas ref={canvasRef}></GameFieldCanvas>;
};

export default TetrisGameField;
