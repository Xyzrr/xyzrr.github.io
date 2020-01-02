import { Mino } from "../types";
import React from "react";
import tetrominos from "../tetrominos";

interface HoldSlotProps {
  unit: number;
  pieceType?: Mino;
}

const HoldSlot: React.FC<HoldSlotProps> = props => {
  const width = props.unit * 5;
  const height = props.unit * 5;

  const render = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);

    if (props.pieceType) {
      ctx.fillStyle = tetrominos[props.pieceType].color.toString();
      for (const coord of tetrominos[props.pieceType].minos[0]) {
        ctx.fillRect(
          coord[1] * props.unit,
          coord[0] * props.unit,
          props.unit,
          props.unit
        );
      }
    }
  };

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ctx = canvasRef.current && canvasRef.current.getContext("2d");

  React.useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width * window.devicePixelRatio;
      canvasRef.current.height = height * window.devicePixelRatio;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    }
  });

  if (ctx) {
    render(ctx);
  }

  return <canvas ref={canvasRef} style={{ width, height }}></canvas>;
};

export default HoldSlot;
