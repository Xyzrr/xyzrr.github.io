import React, { useEffect } from "react";
import { TetrisColors } from "../../colors";
import styled from "styled-components";

interface TetrisGameFieldProps {
  width?: number;
}

const TetrisGameField: React.FC<TetrisGameFieldProps> = props => {
  const width = props.width || 400;
  const height = width * 2;

  const GameFieldCanvas = styled.canvas`
    width: ${width}px;
    height: ${height}px;
  `;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width * window.devicePixelRatio;
      canvasRef.current.height = height * window.devicePixelRatio;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) {
        return;
      }
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.fillStyle = TetrisColors.blue.toString();
      ctx.fillRect(0, 0, 50, 50);
      ctx.fillStyle = TetrisColors.red.toString();
      ctx.fillRect(50, 0, 50, 50);
    }
  });

  return <GameFieldCanvas ref={canvasRef}></GameFieldCanvas>;
};

export default TetrisGameField;
