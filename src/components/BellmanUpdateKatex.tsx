import {number} from 'prop-types';
import React from 'react';

import {QLearningAgentUpdateData} from '../agents/QLearningAgent';
import {
  blue,
  brown,
  darkBlue,
  darkGreen,
  purple,
  toHex,
  yellow,
} from '../colors';
import Katex from '../components/Katex';
import {argMax} from '../util/helpers';

interface BellmanUpdateKatexProps {
  updateData?: QLearningAgentUpdateData;
}

const BellmanUpdateKatex: React.FC<BellmanUpdateKatexProps> = props => {
  const data = props.updateData;

  if (data == null) {
    return <></>;
  }

  const actionString = data.action ? "DOWN" : "UP";
  const nextActionString = data.nextAction ? "DOWN" : "UP";

  const stateColor = toHex(purple);
  const nextStateColor = toHex(darkBlue);
  const rewardColor = toHex(yellow);
  const actionColor = toHex(brown);
  const nextActionColor = toHex(darkGreen);

  return (
    <div style={{ position: "fixed", left: 50, top: 540 }}>
      <Katex
        expression={String.raw`Q(\textcolor{${stateColor}}{s}, \textcolor{${actionColor}}{a}) \leftarrow Q(\textcolor{${stateColor}}{s}, \textcolor{${actionColor}}{a}) + \alpha(\textcolor{${rewardColor}}{r} + \gamma \max_{\textcolor{${nextActionColor}}{a'}}Q(\textcolor{${nextStateColor}}{s'}, \textcolor{${nextActionColor}}{a'}) - Q(\textcolor{${stateColor}}{s}, \textcolor{${actionColor}}{a}))`}
      ></Katex>
      <Katex
        expression={String.raw`Q(\textcolor{${stateColor}}{${data.state}}, \textcolor{${actionColor}}{${actionString}}) \leftarrow Q(\textcolor{${stateColor}}{${data.state}}, \textcolor{${actionColor}}{${actionString}}) + ${data.lr}(\textcolor{${rewardColor}}{${data.reward}} + ${data.gamma} Q(\textcolor{${nextStateColor}}{${data.newState}}, \textcolor{${nextActionColor}}{${nextActionString}}) - Q(\textcolor{${stateColor}}{${data.state}}, \textcolor{${actionColor}}{${actionString}}))`}
      ></Katex>
      <Katex
        expression={String.raw`Q(\textcolor{${stateColor}}{${
          data.state
        }}, \textcolor{${actionColor}}{${actionString}}) \leftarrow ${data.currentQ.toFixed(
          2
        )} + ${data.lr}(\textcolor{${rewardColor}}{${data.reward}} + ${
          data.gamma
        } * ${data.nextQ.toFixed(2)} - ${data.currentQ.toFixed(2)})`}
      ></Katex>
      <Katex
        expression={String.raw`Q(\textcolor{${stateColor}}{${
          data.state
        }}, \textcolor{${actionColor}}{${actionString}}) \leftarrow ${(
          data.currentQ +
          data.lr * (data.reward + data.gamma * data.nextQ - data.currentQ)
        ).toFixed(2)}`}
      ></Katex>
    </div>
  );
};

export default BellmanUpdateKatex;
