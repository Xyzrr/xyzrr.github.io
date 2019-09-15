import Color from 'color';
import {number} from 'prop-types';
import React from 'react';

import {QLearningAgentUpdateData} from '../agents/QLearningAgent';
import {QLearningColors as colors} from '../colors';
import Katex from '../components/Katex';

interface BellmanUpdateKatexProps {
  updateData?: QLearningAgentUpdateData;
}

const BellmanUpdateKatex: React.FC<BellmanUpdateKatexProps> = props => {
  const data = props.updateData;

  if (data == null) {
    return <></>;
  }
  const actionString = data.action
    ? String.raw`\mathit{dn}`
    : String.raw`\mathit{up}`;
  const nextActionString = data.nextAction
    ? String.raw`\mathit{dn}`
    : String.raw`\mathit{up}`;

  const colorbox = (color: Color, text: string) =>
    String.raw`\colorbox{${color.hex()}}{$${text}$}`;

  const textcolor = (color: Color, text: string) =>
    String.raw`\textcolor{${color.hex()}}{${text}}`;

  const Qsa = colorbox(
    colors.currentQ,
    String.raw`Q(${textcolor(colors.state, "s")}, ${textcolor(
      colors.action,
      "a"
    )})`
  );
  const Qsa2 = colorbox(
    colors.currentQ,
    String.raw`Q(${textcolor(colors.state, data.state.toString())}, ${textcolor(
      colors.action,
      actionString
    )})`
  );
  const Qsan = colorbox(
    colors.nextQ,
    String.raw`\max_{${textcolor(colors.nextAction, "a'")}}Q(${textcolor(
      colors.nextState,
      "s'"
    )}, ${textcolor(colors.nextAction, "a'")})`
  );
  const Qsan2 = colorbox(
    colors.nextQ,
    String.raw`Q(${textcolor(
      colors.nextState,
      data.newState.toString()
    )}, ${textcolor(colors.nextAction, nextActionString.toString())})`
  );

  return (
    <div style={{ position: "fixed", left: 50, top: 540 }}>
      <Katex
        expression={String.raw`${Qsa} \leftarrow ${Qsa} + \alpha(${textcolor(
          colors.reward,
          "r"
        )} + \gamma ${Qsan} - ${Qsa})`}
      ></Katex>
      <Katex
        expression={String.raw`${Qsa2} \leftarrow ${Qsa2} + ${
          data.lr
        }(${textcolor(colors.reward, data.reward.toString())} + ${
          data.gamma
        } ${Qsan2} - ${Qsa2})`}
      ></Katex>
      <Katex
        expression={String.raw`${Qsa2} \leftarrow ${colorbox(
          colors.currentQ,
          data.currentQ.toFixed(2)
        )} + ${data.lr}(${textcolor(colors.reward, data.reward.toString())} + ${
          data.gamma
        } * ${colorbox(colors.nextQ, data.nextQ.toFixed(2))} - ${colorbox(
          colors.currentQ,
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
