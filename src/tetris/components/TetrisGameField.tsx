import React, { useEffect } from "react";
import { TetrisFieldTile, ActivePiece, Mino } from "../types";
import tetrominos from "../tetrominos";
import { moveToGround } from "../reducers";
import * as constants from "../constants";
import styled from "styled-components";

const colorStrings: { [key: string]: string } = {};
const ghostColorStrings: { [key: string]: string } = {};

for (let t in tetrominos) {
  colorStrings[t] = tetrominos[t as Mino].color.toString();
  ghostColorStrings[t] = tetrominos[t as Mino].color
    .alpha(constants.GHOST_ALPHA)
    .toString();
}

const TetrisGameFieldDiv = styled.div`
  position: relative;
  .field-foreground {
    top: 0;
    left: 0;
    position: absolute;
  }
`;

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

  const backgroundCanvasRef = React.useRef<HTMLCanvasElement>(null);

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
          ctx.fillStyle = colorStrings[cell].toString();
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
    ghost: boolean = false
  ) => {
    for (const coord of tetrominos[activePiece.type].minos[
      activePiece.orientation
    ]) {
      ctx.fillStyle = ghost
        ? ghostColorStrings[activePiece.type]
        : colorStrings[activePiece.type];
      ctx.fillRect(
        (activePiece.position[1] + coord[1]) * props.unit,
        (activePiece.position[0] + coord[0] - 20) * props.unit,
        props.unit,
        props.unit
      );
    }
  };

  const render = (ctx: CanvasRenderingContext2D) => {
    // ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.clearRect(0, 0, width, height);
    // ctx.fillRect(0, 0, width, height);
    renderLand(ctx);
    renderActivePiece(ctx, props.activePiece);
    const ghostPiece = moveToGround(props.activePiece, props.field);
    renderActivePiece(ctx, ghostPiece, true);
  };

  useEffect(() => {
    if (backgroundCanvasRef.current) {
      backgroundCanvasRef.current.width = width * window.devicePixelRatio;
      backgroundCanvasRef.current.height = height * window.devicePixelRatio;

      const ctx = backgroundCanvasRef.current.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        renderGrid(ctx);
      }
    }

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
    <TetrisGameFieldDiv>
      <canvas
        className="field-background"
        style={{ width, height, border: "1px solid #666" }}
        ref={backgroundCanvasRef}
      ></canvas>
      <canvas
        className="field-foreground"
        style={{ width, height, border: "1px solid #666" }}
        ref={canvasRef}
      ></canvas>
    </TetrisGameFieldDiv>
  );
};

export default TetrisGameField;
