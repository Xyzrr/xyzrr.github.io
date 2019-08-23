import React from "react";
import styled from "styled-components";
import * as colors from "../colors";
import useWindowSize from "../util/useWindowSize";
import NChainEnv from "../envs/NChain";
import QLearningAgent from "../agents/QLearningAgent";
import Game from "../Game";

const env = new NChainEnv();
const agent = new QLearningAgent();
const game = new Game(env, agent);

const capturer = new window.CCapture({ format: "webm" });

const Button = styled.button`
  outline: none;
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

  const [qTable, setQTable] = React.useState(agent.qTable);
  const [state, setState] = React.useState(0);

  const drawEnvironment = ctx => {
    const RADIUS = 30;
    const DIST = 100;
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(size.width / 2 - DIST * 2 + DIST * i - RADIUS, 400);
      ctx.stroke();
      //   ctx.moveTo(size.width / 2 - DIST * 2 + DIST * i + RADIUS, 400);
      ctx.beginPath();
      ctx.arc(
        size.width / 2 - DIST * 2 + DIST * i,
        400,
        RADIUS,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      if (state === i) {
        ctx.fillStyle = "cyan";
        ctx.fill();
      }
    }
  };

  const drawQTable = ctx => {
    ctx.lineWidth = 1;
    ctx.font = "30px Inconsolata";
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.beginPath();
        ctx.rect(size.width / 2 - 100 + 100 * j, 50 + 50 * i, 100, 50);
        ctx.strokeStyle = "gray";
        ctx.stroke();
        ctx.fillStyle = "cyan";
        ctx.fillText(
          qTable[i][j].toFixed(2),
          size.width / 2 - 88 + 100 * j,
          85 + 50 * i
        );
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

    capturer.capture(canvas);
  });

  React.useEffect(() => {
    game.reset();
  }, []);

  //   const takeAction = action => {
  //     const { newState, reward } = env.step(action);
  //     console.log("new state", newState);
  //     setState(newState);
  //   };

  const step = () => {
    game.step();
    setQTable(agent.qTable);
    setState(env.state);
  };

  const startRecording = () => {
    capturer.start();
  };
  const stopRecording = () => {
    capturer.stop();
    capturer.save();
  };

  return (
    <Page>
      <ControlPanel>
        {/* <Button onClick={() => takeAction(false)}>A</Button>
        <Button onClick={() => takeAction(true)}>B</Button> */}
        <Button onClick={() => step()}>Step</Button>
        <Button onClick={startRecording}>Record</Button>
        <Button onClick={stopRecording}>Stop</Button>
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
