import React, { useEffect } from "react";
import { TetrisColors } from "../../colors";
import { TetrisFieldTile, ActivePiece } from "../types";
import tetrominos from "../tetrominos";
import { moveToGround } from "../reducers";
import * as constants from "../constants";

interface TetrisGameFieldProps {
  unit: number;
  field: TetrisFieldTile[][];
  activePiece: ActivePiece;
}

const TetrisGameField: React.FC<TetrisGameFieldProps> = props => {
  const width = props.unit * 10;
  const height = props.unit * 20;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ctx = canvasRef.current && canvasRef.current.getContext("2d");

  const renderGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#161616";
    for (let i = 0; i < constants.MATRIX_ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * props.unit);
      ctx.lineTo(width, i * props.unit);
      ctx.stroke();
    }
    for (let j = 0; j < constants.MATRIX_COLS; j++) {
      ctx.beginPath();
      ctx.moveTo(j * props.unit, 0);
      ctx.lineTo(j * props.unit, height);
      ctx.stroke();
    }
  };

  const renderLand = (ctx: CanvasRenderingContext2D) => {
    props.field.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell !== ".") {
          ctx.fillStyle = TetrisColors[cell].toString();
          ctx.fillRect(
            props.unit * j,
            props.unit * (i - 20),
            props.unit,
            props.unit
          );
        }
      });
    });
  };

  const renderActivePiece = (
    ctx: CanvasRenderingContext2D,
    activePiece: ActivePiece,
    alpha = 1
  ) => {
    for (const coord of tetrominos[activePiece.type].minos[
      activePiece.orientation
    ]) {
      ctx.fillStyle = TetrisColors[activePiece.type].alpha(alpha).toString();
      ctx.fillRect(
        (activePiece.position[1] + coord[1]) * props.unit,
        (activePiece.position[0] + coord[0] - 20) * props.unit,
        props.unit,
        props.unit
      );
    }
  };

  const render = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    renderGrid(ctx);
    renderLand(ctx);
    renderActivePiece(ctx, props.activePiece);
    const ghostPiece = moveToGround(props.activePiece, props.field);
    renderActivePiece(ctx, ghostPiece, 0.3);
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width * window.devicePixelRatio;
      canvasRef.current.height = height * window.devicePixelRatio;

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    }
  }, []);

  if (ctx) {
    render(ctx);
  }

  return (
    <canvas
      style={{ width, height, border: "1px solid #666" }}
      ref={canvasRef}
    ></canvas>
  );
};

export default TetrisGameField;
