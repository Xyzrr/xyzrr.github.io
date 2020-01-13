import { Mino } from "../types";
import { resizeCanvas } from "../../util/helpers";
import React from "react";
import { getColor, getMinos } from "../tetrominos";

interface BagPreviewProps {
  unit: number;
  nextPieces: Mino[];
}

const BagPreview: React.FC<BagPreviewProps> = props => {
  const width = props.unit * 5;
  const height = props.unit * 20;
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ctx = canvasRef.current && canvasRef.current.getContext("2d");

  const render = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < Math.min(5, props.nextPieces.length); i++) {
      const type = props.nextPieces[i];
      if ((type as any) === ".") {
        break;
      }
      ctx.fillStyle = getColor(type);
      for (const coord of getMinos(type, 0)) {
        ctx.fillRect(
          coord[1] * props.unit,
          (i * 3 + coord[0]) * props.unit,
          props.unit,
          props.unit
        );
      }
    }
  };

  React.useEffect(() => {
    resizeCanvas(canvasRef, width, height);
  }, [width, height]);

  if (ctx) {
    render(ctx);
  }

  return <canvas ref={canvasRef} style={{ width, height }}></canvas>;
};

export default BagPreview;
