import React from "react";
import styled from "styled-components";
import * as colors from "../colors";
import useWindowSize from "../util/useWindowSize";

const Button = styled.button`
  padding: 8px;
  background-color: ${colors.veryLightGray};
  border: none;
  border-radius: 6px;
  :hover {
    background-color: ${colors.lightGray};
  }
`;

const ControlPanel = styled.div`
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  position: fixed;
  top: 8px;
  left: 8px;
  padding: 8px;
`;

const Page = styled.div`
  background-color: ${colors.darkGray};
`;

function QLearningPage() {
  const canvasRef = React.useRef(null);
  const size = useWindowSize();

  const [qTable, setQTable] = React.useState([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ]);
  const [state, setState] = React.useState(0);

  const drawEnvironment = ctx => {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(size.width / 2 - 200 + 100 * i - 25, 400);
      ctx.moveTo(size.width / 2 - 200 + 100 * i + 25, 400);
      ctx.arc(size.width / 2 - 200 + 100 * i, 400, 25, 0, 2 * Math.PI);
      ctx.stroke();
    }
    // ctx.fill();
  };

  const drawQTable = ctx => {
    ctx.lineWidth = 1;
    ctx.font = "30px Arial";
    ctx.fillStyle = "cyan";
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.beginPath();
        ctx.rect(size.width / 2 - 100 + 100 * j, 50 + 50 * i, 100, 50);
        ctx.stroke();
        ctx.fillText(qTable[i][j], size.width / 2 - 90 + 100 * j, 86 + 50 * i);
      }
    }
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = size.width * window.devicePixelRatio;
    canvas.height = size.height * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, size.width, size.height);

    drawEnvironment(ctx);
    drawQTable(ctx);
  });

  return (
    <Page>
      <ControlPanel>
        Hello world <Button>Hey</Button>
      </ControlPanel>
      <canvas
        style={{
          width: "100%",
          height: "100%",
          background: "black"
        }}
        ref={canvasRef}
      />
    </Page>
  );
}

export default QLearningPage;
