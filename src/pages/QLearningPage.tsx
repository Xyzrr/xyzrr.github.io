import 'react-dat-gui/build/react-dat-gui.css';

import React from 'react';
import DatGui, {DatBoolean, DatButton, DatNumber} from 'react-dat-gui';
import styled from 'styled-components';

import QLearningAgent from '../agents/QLearningAgent';
import * as colors from '../colors';
import AspectRatioBox from '../components/AspectRatioBox';
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
import {argMax, transpose} from '../util/helpers';
import useWindowSize from '../util/useWindowSize';

const initialAgentOptions = {
  gamma: 0.95,
  lr: 0.1,
  eps: 0.5,
  epsDecay: 0.99
};

const glob = {
  envY: 130,
  centerX: 450
};

const env = new NChainEnv();
const agent = new QLearningAgent(initialAgentOptions);
agent.prepareForEnv(env);
const game = new Game(env, agent);

const rewardNumberObject = new NumberObject({ x: glob.centerX, y: 60 }, 0, {
  textAlign: "center",
  font: "40px KaTeX_Main",
  precision: 0
});
const bestRewardNumberObject = new NumberObject({ x: glob.centerX, y: 80 }, 0, {
  textAlign: "center",
  font: "20px KaTeX_Main",
  precision: 0,
  modifier: (v: number) => "Best: " + v
});
const envObject = new ChainEnvironment({
  x: glob.centerX,
  y: glob.envY
});
const agentObject = new AgentObject({
  x: glob.centerX - 2 * envObject.DIST,
  y: 130
});
const tableObject = new Table(
  { x: glob.centerX - envObject.DIST * 2.5, y: glob.envY + 55 },
  transpose(agent.qTable!)
);
tableObject.CELL_WIDTH = envObject.DIST;
const upActionObject = new ButtonObject(
  {
    x: glob.centerX - 3 * tableObject.CELL_WIDTH,
    y: glob.envY + 60 + tableObject.CELL_HEIGHT / 2
  },
  "right"
);
const downActionObject = new ButtonObject(
  {
    x: glob.centerX - 3 * tableObject.CELL_WIDTH,
    y: glob.envY + 60 + (tableObject.CELL_HEIGHT * 3) / 2
  },
  "left"
);

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
      envObject,
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

  agentObject.move(glob.centerX + envObject.DIST * ((game.state || 0) - 2));

  if (agent.qTable) {
    tableObject.updateData(transpose(agent.qTable));
  }

  rewardNumberObject.updateVal(game.totalReward);

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
      <BellmanUpdateKatex
        updateData={agent.updateData}
        position={{
          x: glob.centerX - tableObject.CELL_WIDTH * 3 - 10,
          y: tableObject.position.y + tableObject.CELL_HEIGHT * 2 + 30
        }}
      ></BellmanUpdateKatex>
      <DynamicMatrix></DynamicMatrix>
      <AspectRatioBox></AspectRatioBox>
    </Page>
  );
}

export default QLearningPage;
