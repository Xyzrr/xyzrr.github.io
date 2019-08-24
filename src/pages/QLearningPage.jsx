import React from "react";
import styled from "styled-components";
import * as colors from "../colors";
import useWindowSize from "../util/useWindowSize";
import NChainEnv from "../envs/NChain";
import QLearningAgent from "../agents/QLearningAgent";
import Game from "../Game";
import Table from "../scene-objects/Table";
import ChainEnvironment from "../scene-objects/ChainEnvironment";
import AgentObject from "../scene-objects/Agent";
import Scene from "../Scene";
import NumberObject from "../scene-objects/Number";

const env = new NChainEnv();
const agent = new QLearningAgent();
const game = new Game(env, agent);

const tableObject = new Table(agent.qTable);
const rewardNumberObject = new NumberObject({ x: 50, y: 80 }, 0);
const environmentObject = new ChainEnvironment();
const agentObject = new AgentObject({ x: 0, y: 0 });

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
  const sceneRef = React.useRef();

  const [state, setState] = React.useState(0);

  //   const takeAction = action => {
  //     const { newState, reward } = env.step(action);
  //     console.log("new state", newState);
  //     setState(newState);
  //   };

  const step = () => {
    game.step();
    setState(env.state);
  };

  const startRecording = () => {
    if (sceneRef.current) {
      sceneRef.current.startRecording();
    }
  };
  const stopRecording = () => {
    if (sceneRef.current) {
      sceneRef.current.stopRecording();
    }
  };

  const resizeCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.width = size.width * window.devicePixelRatio;
      canvasRef.current.height = size.height * window.devicePixelRatio;
      const ctx = canvasRef.current.getContext("2d");
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      if (sceneRef.current) {
        sceneRef.current.size = size;
      }
    }
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    resizeCanvas();

    sceneRef.current = new Scene(canvas, ctx, size, [
      environmentObject,
      tableObject,
      agentObject,
      rewardNumberObject
    ]);

    sceneRef.current.render();
  }, []);

  React.useEffect(() => {
    game.reset();
  }, []);

  resizeCanvas();

  agentObject.position = {
    x: size.width / 2 - 100 * 2 + 100 * state,
    y: 400
  };

  agentObject.animate("x", size.width / 2 - 100 * 2 + 100 * state);

  tableObject.updateData(agent.qTable);

  rewardNumberObject.updateVal(game.totalReward);

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
