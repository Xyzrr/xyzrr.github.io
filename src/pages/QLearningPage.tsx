import "react-dat-gui/build/react-dat-gui.css";

import React from "react";
import DatGui, { DatBoolean, DatButton, DatNumber } from "react-dat-gui";
import styled from "styled-components";

import QLearningAgent from "../agents/QLearningAgent";
import * as colors from "../colors";
import BellmanUpdateKatex from "../components/BellmanUpdateKatex";
import Button, { ButtonHandles } from "../components/Button";
import NChainEnv from "../envs/NChain";
import Game from "../Game";
import useStaging from "../hooks/useStaging";
import Scene from "../Scene";
import AgentObject from "../scene-objects/AgentObject";
import ChainEnvironment from "../scene-objects/ChainEnvironment";
import CoinEmitter from "../scene-objects/CoinEmitter";
import NumberObject from "../scene-objects/NumberObject";
import Table from "../scene-objects/Table";
import { transpose, resizeCanvas } from "../util/helpers";
import { textcolor } from "../util/latex";
import useWindowSize from "../util/useWindowSize";

const initialAgentOptions = {
  gamma: 0.95,
  lr: 0.1,
  eps: 0.5,
  epsDecay: 0.99
};

const glob = {
  envY: 180,
  centerX: 450
};

const env = new NChainEnv();
const agent = new QLearningAgent(initialAgentOptions);
agent.prepareForEnv(env);
const game = new Game(env, agent);

const rewardNumberObject = new NumberObject(
  { x: glob.centerX, y: glob.envY - 72 },
  0,
  {
    textAlign: "center",
    font: "40px KaTeX_Main",
    precision: 0
  }
);
// const lastRewardNumberObject = new NumberObject(
//   { x: glob.centerX, y: glob.envY - 100 },
//   undefined,
//   {
//     textAlign: "center",
//     font: "20px KaTeX_Main",
//     precision: 0,
//     color: colors.yellow,
//     modifier: (v: number) => "+" + v
//   }
// );
// const bestRewardNumberObject = new NumberObject(
//   { x: glob.centerX, y: glob.envY - 50 },
//   0,
//   {
//     textAlign: "center",
//     font: "20px KaTeX_Main",
//     precision: 0,
//     modifier: (v: number) => "Best: " + v
//   }
// );
const envObject = new ChainEnvironment({
  x: glob.centerX,
  y: glob.envY
});
const coinEmitter = new CoinEmitter();
const agentObject = new AgentObject({
  x: glob.centerX - 2 * envObject.DIST,
  y: glob.envY
});
const tableObject = new Table(
  { x: glob.centerX - envObject.DIST * 2.5, y: glob.envY + 55 },
  transpose(agent.qTable!)
);
tableObject.CELL_WIDTH = envObject.DIST;

const Page = styled.div`
  background-color: ${colors.darkGray.toString()};
`;

function QLearningPage() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sceneRef = React.useRef<Scene>();
  const size = useWindowSize();

  const [stepCount, setStepCount] = React.useState(0);
  const [options, setOptions] = React.useState({
    autoPlay: false,
    ...initialAgentOptions
  });

  //   const takeAction = action => {
  //     const { newState, reward } = env.step(action);
  //     console.log("new state", newState);
  //     setState(newState);
  //   };

  useStaging([
    () => {
      window.alert("hello world");
    },
    () => {
      window.alert("hello world 2");
    }
  ]);

  const agentTookAction = (
    action: any,
    done: boolean,
    totalReward: number,
    info: any
  ) => {
    if (action) {
      if (leftButtonRef.current) {
        leftButtonRef.current.click();
      }
    } else {
      if (rightButtonRef.current) {
        rightButtonRef.current.click();
      }
    }
    if (info.slipped) {
      agentObject.slip();
    }
    if (done) {
      // if (totalReward > bestRewardNumberObject.val) {
      //   bestRewardNumberObject.updateVal(totalReward);
      // }
      setOptions({ ...options, eps: agent.eps });
    }
    setStepCount(stepCount + 1);
  };

  const step = () => {
    const { action, done, totalReward, info } = game.step();
    agentTookAction(action, done, totalReward, info);
  };

  const handleKeyDown = (e: any) => {
    if (e.keyCode === 39) {
      // right arrow
      e.preventDefault();
      const { done, totalReward, info } = game.agentTakeAction(0);
      agentTookAction(0, done, totalReward, info);
    }
    if (e.keyCode === 37) {
      // left arrow
      e.preventDefault();
      const { done, totalReward, info } = game.agentTakeAction(1);
      agentTookAction(1, done, totalReward, info);
    }
  };

  const handleUpdate = (data: any) => {
    setOptions(data);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext("2d");
    if (size.width && size.height) {
      resizeCanvas(canvasRef, size.width, size.height);
    }

    sceneRef.current = new Scene(canvas, ctx, size, [
      coinEmitter,
      envObject,
      tableObject,
      agentObject,
      rewardNumberObject
      // bestRewardNumberObject,
      // lastRewardNumberObject,
    ]);

    sceneRef.current.render();
  }, [size]);

  React.useEffect(() => {
    game.reset();
  }, []);

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  if (options.autoPlay) {
    window.setTimeout(step, 200);
  }

  agent.gamma = options.gamma;
  agent.lr = options.lr;
  agent.eps = options.eps;
  agent.epsDecay = options.epsDecay;

  if (size.width && size.height) {
    resizeCanvas(canvasRef, size.width, size.height);
  }

  agentObject.move(glob.centerX + envObject.DIST * ((game.state || 0) - 2));

  window.setTimeout(() => {
    if (agent.qTable) {
      tableObject.updateData(transpose(agent.qTable));
    }
  }, 500);

  window.setTimeout(() => {
    rewardNumberObject.updateVal(game.totalReward);
  }, 150);

  // lastRewardNumberObject.updateVal(game.lastReward, false);
  coinEmitter.clear();
  if (game.lastReward) {
    const startX =
      game.lastReward === 2
        ? glob.centerX - 2 * envObject.DIST
        : glob.centerX + 2 * envObject.DIST;

    for (let i = 0; i < game.lastReward; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = 40;
      coinEmitter.emit(
        { x: startX, y: glob.envY },
        {
          x: glob.centerX + radius * Math.cos(angle),
          y: glob.envY - 85 + radius * Math.sin(angle)
        },
        150 + i * 10
      );
    }
  }

  if (agent.updateData) {
    tableObject.highlightCells([
      {
        row: agent.updateData.action,
        col: agent.updateData.state,
        color: colors.QLearningColors.currentQ
      },
      {
        row: agent.updateData.nextAction,
        col: agent.updateData.newState,
        color: colors.QLearningColors.nextQ
      }
    ]);

    envObject.highlightStates([
      {
        index: agent.updateData.state,
        color: colors.QLearningColors.state
      },
      {
        index: agent.updateData.newState,
        color: colors.QLearningColors.nextState
      }
    ]);
  }

  const rightButtonRef = React.useRef<ButtonHandles>(null);
  const leftButtonRef = React.useRef<ButtonHandles>(null);

  return (
    <Page>
      <DatGui data={options} onUpdate={handleUpdate}>
        <DatNumber
          path="lr"
          label="Learning rate (α)"
          min={0}
          max={1}
          step={0.01}
        />
        <DatNumber
          path="eps"
          label="Rnd chance (ε)"
          min={0}
          max={1}
          step={0.01}
        />
        <DatNumber
          path="gamma"
          label="Discount rate (γ)"
          min={0}
          max={1}
          step={0.01}
        ></DatNumber>
        <DatNumber
          path="epsDecay"
          label="ε decay"
          min={0}
          max={1}
          step={0.01}
        ></DatNumber>
        <DatBoolean path="autoPlay" label="Auto-play"></DatBoolean>
        <DatButton label="Step" onClick={step} />
      </DatGui>
      <canvas
        style={{
          width: "100%",
          height: "100%",
          background: "black"
        }}
        ref={canvasRef}
      />
      <BellmanUpdateKatex
        updateData={agent.updateData}
        position={{
          x: glob.centerX - tableObject.CELL_WIDTH * 3 - 12,
          y: tableObject.position.y + tableObject.CELL_HEIGHT * 2 + 30
        }}
      ></BellmanUpdateKatex>
      <Button
        ref={rightButtonRef}
        expression={textcolor(
          agent.updateData && agent.updateData.action === 0
            ? colors.QLearningColors.action
            : agent.updateData && agent.updateData.nextAction === 0
            ? colors.QLearningColors.nextAction
            : colors.lightGray,
          String.raw`\text{right}`
        )}
        position={{
          x: glob.centerX - tableObject.CELL_WIDTH * 3 - 20,
          y: tableObject.position.y + 20
        }}
        onClick={() => {
          const { done, totalReward, info } = game.agentTakeAction(0);
          agentTookAction(0, done, totalReward, info);
        }}
      ></Button>
      <Button
        ref={leftButtonRef}
        expression={textcolor(
          agent.updateData && agent.updateData.action === 1
            ? colors.QLearningColors.action
            : agent.updateData && agent.updateData.nextAction === 1
            ? colors.QLearningColors.nextAction
            : colors.lightGray,
          String.raw`\text{left}`
        )}
        position={{
          x: glob.centerX - tableObject.CELL_WIDTH * 3 - 20,
          y: tableObject.position.y + tableObject.CELL_HEIGHT * 1 + 20
        }}
        onClick={() => {
          const { done, totalReward, info } = game.agentTakeAction(1);
          agentTookAction(1, done, totalReward, info);
        }}
      ></Button>
      {/* <AspectRatioBox></AspectRatioBox> */}
    </Page>
  );
}

export default QLearningPage;
