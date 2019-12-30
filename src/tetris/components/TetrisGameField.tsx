import React, { useEffect } from "react";
import { TetrisColors } from "../../colors";
import styled from "styled-components";
import { TetrisFieldTile, ActivePiece } from "../types";
import tetromino from "../tetromino";

interface TetrisGameFieldProps {
  width?: number;
  field: TetrisFieldTile[][];
  activePiece: ActivePiece;
}

const TetrisGameField: React.FC<TetrisGameFieldProps> = props => {
  const width = props.width || 400;
  const height = width * 2;
  const unit = width / 10;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ctx = canvasRef.current && canvasRef.current.getContext("2d");

  const renderLand = (ctx: CanvasRenderingContext2D) => {
    props.field.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell !== ".") {
          ctx.fillStyle = TetrisColors[cell].toString();
          ctx.fillRect(unit * j, unit * (i - 20), unit, unit);
        }
      });
    });
  };

  const renderActivePiece = (ctx: CanvasRenderingContext2D) => {
    console.log("orientation", props.activePiece.orientation);
    tetromino[props.activePiece.type].matrix[
      props.activePiece.orientation
    ].forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell !== " ") {
          ctx.fillStyle = TetrisColors[props.activePiece.type].toString();
          ctx.fillRect(
            (props.activePiece.x + j) * unit,
            (props.activePiece.y + i - 20) * unit,
            unit,
            unit
          );
        }
      });
    });
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width * window.devicePixelRatio;
      canvasRef.current.height = height * window.devicePixelRatio;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        renderLand(ctx);
        renderActivePiece(ctx);
      }
    }
  });

  if (ctx) {
    renderLand(ctx);
    renderActivePiece(ctx);
  }

  return <canvas style={{ width, height }} ref={canvasRef}></canvas>;
};

export default TetrisGameField;
