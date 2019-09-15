import {number} from 'prop-types';
import React from 'react';

import {QLearningAgentUpdateData} from '../agents/QLearningAgent';
import {
  bgBrown,
  bgGreen,
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

  const actionString = data.action
    ? String.raw`\mathit{down}`
    : String.raw`\mathit{up}`;
  const nextActionString = data.nextAction
    ? String.raw`\mathit{down}`
    : String.raw`\mathit{up}`;

  const stateColor = toHex(purple);
  const nextStateColor = toHex(darkBlue);
  const rewardColor = toHex(yellow);
  const actionColor = toHex(brown);
  const nextActionColor = toHex(darkGreen);
  const currentQColor = toHex(bgBrown);
  const nextQColor = toHex(bgGreen);

  const colorbox = (color: string, text: string) =>
    String.raw`\colorbox{${color}}{$${text}$}`;

  const Qsa = colorbox(
    currentQColor,
    String.raw`Q(\textcolor{${stateColor}}{s}, \textcolor{${actionColor}}{a})`
  );
  const Qsa2 = colorbox(
    currentQColor,
    String.raw`Q(\textcolor{${stateColor}}{${data.state}}, \textcolor{${actionColor}}{${actionString}})`
  );
  const Qsan = colorbox(
    nextQColor,
    String.raw`\max_{\textcolor{${nextActionColor}}{a'}}Q(\textcolor{${nextStateColor}}{s'}, \textcolor{${nextActionColor}}{a'})`
  );
  const Qsan2 = colorbox(
    nextQColor,
    String.raw`Q(\textcolor{${nextStateColor}}{${data.newState}}, \textcolor{${nextActionColor}}{${nextActionString}})`
  );

  return (
    <div style={{ position: "fixed", left: 50, top: 540 }}>
      <Katex
        expression={String.raw`${Qsa} \leftarrow ${Qsa} + \alpha(\textcolor{${rewardColor}}{r} + \gamma ${Qsan} - ${Qsa})`}
      ></Katex>
      <Katex
        expression={String.raw`${Qsa2} \leftarrow ${Qsa2} + ${data.lr}(\textcolor{${rewardColor}}{${data.reward}} + ${data.gamma} ${Qsan2} - ${Qsa2})`}
      ></Katex>
      <Katex
        expression={String.raw`${Qsa2} \leftarrow ${colorbox(
          currentQColor,
          data.currentQ.toFixed(2)
        )} + ${data.lr}(\textcolor{${rewardColor}}{${data.reward}} + ${
          data.gamma
        } * ${colorbox(nextQColor, data.nextQ.toFixed(2))} - ${colorbox(
          currentQColor,
          data.currentQ.toFixed(2)
        )})`}
      ></Katex>
      <Katex
        expression={String.raw`${Qsa2} \leftarrow ${(
          data.currentQ +
          data.lr * (data.reward + data.gamma * data.nextQ - data.currentQ)
        ).toFixed(2)}`}
      ></Katex>
    </div>
  );
};

export default BellmanUpdateKatex;
