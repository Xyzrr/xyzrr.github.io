import React, { useEffect } from "react";
import { TetrisColors } from "../../colors";
import { TetrisFieldTile, ActivePiece } from "../types";
import tetrominos from "../tetrominos";
import { moveToGround } from "../reducers";

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

  const renderActivePiece = (
    ctx: CanvasRenderingContext2D,
    activePiece: ActivePiece,
    alpha = 1
  ) => {
    tetrominos[activePiece.type].matrices[activePiece.orientation].forEach(
      (row, i) => {
        row.forEach((cell, j) => {
          if (cell !== " ") {
            ctx.fillStyle = TetrisColors[activePiece.type]
              .alpha(alpha)
              .toString();
            ctx.fillRect(
              (activePiece.x + j) * unit,
              (activePiece.y + i - 20) * unit,
              unit,
              unit
            );
          }
        });
      }
    );
  };

  const render = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    renderLand(ctx);
    renderActivePiece(ctx, props.activePiece);
    const ghostPiece = moveToGround(props.activePiece, props.field);
    renderActivePiece(ctx, ghostPiece, 0.2);
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width * window.devicePixelRatio;
      canvasRef.current.height = height * window.devicePixelRatio;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        render(ctx);
      }
    }
  });

  if (ctx) {
    render(ctx);
  }

  return <canvas style={{ width, height }} ref={canvasRef}></canvas>;
};

export default TetrisGameField;
