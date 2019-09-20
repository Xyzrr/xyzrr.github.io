import 'react-dat-gui/build/react-dat-gui.css';

import React from 'react';
import DatGui, {DatBoolean, DatButton, DatNumber} from 'react-dat-gui';
import styled from 'styled-components';

import QLearningAgent from '../agents/QLearningAgent';
import * as colors from '../colors';
import BellmanUpdateKatex from '../components/BellmanUpdateKatex';
import DynamicMatrix from '../components/DynamicMatrix';
import NChainEnv from '../envs/NChain';
import Game from '../Game';
import Scene from '../Scene';
import AgentObject from '../scene-objects/AgentObject';
import ButtonObject from '../scene-objects/ButtonObject';
import ChainEnvironment from '../scene-objects/ChainEnvironment';
import NumberObject from '../scene-objects/Number';
import Table from '../scene-objects/Table';
import {argMax} from '../util/helpers';
import useWindowSize from '../util/useWindowSize';

const initialAgentOptions = {
  gamma: 0.95,
  lr: 0.1,
  eps: 0.5,
  epsDecay: 0.99
};

const env = new NChainEnv();
const agent = new QLearningAgent(initialAgentOptions);
agent.prepareForEnv(env);
const game = new Game(env, agent);

const tableObject = new Table({ x: 50, y: 150 }, agent.qTable);
const rewardNumberObject = new NumberObject({ x: 430, y: 320 }, 0, {
  textAlign: "left",
  font: "40px KaTeX_Main",
  precision: 0
});
const bestRewardNumberObject = new NumberObject({ x: 430, y: 350 }, 0, {
  textAlign: "left",
  font: "20px KaTeX_Main",
  precision: 0,
  modifier: (v: number) => "Best: " + v
});
const environmentObject = new ChainEnvironment({ x: 320, y: 185 });
const agentObject = new AgentObject({ x: 320, y: 500 });
const upActionObject = new ButtonObject({ x: 100, y: 120 }, "up");
const downActionObject = new ButtonObject({ x: 200, y: 120 }, "dn");

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

  const agentTookAction = (
    action: any,
    done: boolean,
    totalReward: number,
    info: any
  ) => {
    if (action) {
      downActionObject.click();
    } else {
      upActionObject.click();
    }
    if (info.slipped) {
      agentObject.slip();
    }
    if (done) {
      if (totalReward > bestRewardNumberObject.val) {
        bestRewardNumberObject.updateVal(totalReward);
      }
      setOptions({ ...options, eps: agent.eps });
    }
    setStepCount(stepCount + 1);
  };

  const step = () => {
    const { action, done, totalReward, info } = game.step();
    agentTookAction(action, done, totalReward, info);
  };

  const resizeCanvas = () => {
    if (canvasRef.current && size.width && size.height) {
      canvasRef.current.width = size.width * window.devicePixelRatio;
      canvasRef.current.height = size.height * window.devicePixelRatio;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      if (sceneRef.current) {
        sceneRef.current.size = size;
      }
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.keyCode === 38) {
      // up arrow
      e.preventDefault();
      const { done, totalReward, info } = game.agentTakeAction(0);
      agentTookAction(0, done, totalReward, info);
    }
    if (e.keyCode === 40) {
      // down arrow
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
    resizeCanvas();

    sceneRef.current = new Scene(canvas, ctx, size, [
      environmentObject,
      tableObject,
      agentObject,
      rewardNumberObject,
      bestRewardNumberObject,
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

  if (options.autoPlay) {
    window.setTimeout(step, 150);
  }

  agent.gamma = options.gamma;
  agent.lr = options.lr;
  agent.eps = options.eps;
  agent.epsDecay = options.epsDecay;

  resizeCanvas();

  agentObject.move(465 - 70 * (game.state || 0));

  if (agent.qTable) {
    tableObject.updateData(agent.qTable.slice().reverse());
  }

  rewardNumberObject.updateVal(game.totalReward);

  if (agent.updateData) {
    tableObject.highlightCells([
      {
        row: 4 - agent.updateData.state,
        col: agent.updateData.action,
        color: colors.QLearningColors.currentQ
      },
      {
        row: 4 - agent.updateData.newState,
        col: agent.updateData.nextAction,
        color: colors.QLearningColors.nextQ
      }
    ]);

    environmentObject.highlightStates([
      {
        index: agent.updateData.state,
        color: colors.QLearningColors.state
      },
      {
        index: agent.updateData.newState,
        color: colors.QLearningColors.nextState
      }
    ]);

    console.log(agent.updateData);

    upActionObject.setColor(
      agent.updateData.action === 0
        ? colors.QLearningColors.action
        : agent.updateData.nextAction === 0
        ? colors.QLearningColors.nextAction
        : colors.lightGray
    );

    downActionObject.setColor(
      agent.updateData.action === 1
        ? colors.QLearningColors.action
        : agent.updateData.nextAction === 1
        ? colors.QLearningColors.nextAction
        : colors.lightGray
    );
  }

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
      <BellmanUpdateKatex updateData={agent.updateData}></BellmanUpdateKatex>
      <DynamicMatrix></DynamicMatrix>
    </Page>
  );
}

export default QLearningPage;
