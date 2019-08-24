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
import ButtonObject from "../scene-objects/ButtonObject";

const env = new NChainEnv();
const agent = new QLearningAgent();
const game = new Game(env, agent);

const tableObject = new Table({ x: 50, y: 150 }, agent.qTable);
const rewardNumberObject = new NumberObject({ x: 430, y: 330 }, 0, {
  textAlign: "left",
  font: "40px Inconsolata",
  precision: 0
});
const environmentObject = new ChainEnvironment({ x: 320, y: 185 });
const agentObject = new AgentObject({ x: 320, y: 500 });
const upActionObject = new ButtonObject({ x: 100, y: 100 }, "UP");
const downActionObject = new ButtonObject({ x: 200, y: 100 }, "DOWN");

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

  const [stepCount, setStepCount] = React.useState(0);

  //   const takeAction = action => {
  //     const { newState, reward } = env.step(action);
  //     console.log("new state", newState);
  //     setState(newState);
  //   };

  const agentTookAction = action => {
    if (action) {
      downActionObject.click();
    } else {
      upActionObject.click();
    }
    setStepCount(stepCount + 1);
  };

  const step = () => {
    const { action, done } = game.step();
    agentTookAction(action);
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

  const handleKeyDown = e => {
    if (e.keyCode === 38) {
      // up arrow
      e.preventDefault();
      game.agentTakeAction(0);
      agentTookAction(0);
    }
    if (e.keyCode === 40) {
      // down arrow
      e.preventDefault();
      game.agentTakeAction(1);
      agentTookAction(1);
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
      rewardNumberObject,
      downActionObject,
      upActionObject
    ]);

    sceneRef.current.render();
  }, []);

  React.useEffect(() => {
    game.reset();
  }, []);

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  resizeCanvas();

  agentObject.move(465 - 70 * (game.state || 0));

  tableObject.updateData(agent.qTable.slice().reverse());

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
