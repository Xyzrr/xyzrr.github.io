import Color from 'color';
import {number} from 'prop-types';
import React from 'react';

import {QLearningAgentUpdateData} from '../agents/QLearningAgent';
import {QLearningColors as colors} from '../colors';
import Katex from '../components/Katex';
import {colorbox, textcolor} from '../util/latex';
import Position from '../util/Position';

interface BellmanUpdateKatexProps {
  updateData?: QLearningAgentUpdateData;
  position: Position;
}

const BellmanUpdateKatex: React.FC<BellmanUpdateKatexProps> = props => {
  const data = props.updateData;

  if (data == null) {
    return <></>;
  }
  const actionString = data.action
    ? String.raw`\text{left}`
    : String.raw`\text{right}`;
  const nextActionString = data.nextAction
    ? String.raw`\text{left}`
    : String.raw`\text{right}`;

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
    <div
      style={{
        position: "fixed",
        left: props.position.x,
        top: props.position.y
      }}
    >
      <Katex
        expression={String.raw`
        \begin{aligned}${Qsa} &\leftarrow ${Qsa} + \alpha(${textcolor(
          colors.reward,
          "r"
        )} + \gamma ${Qsan} - ${Qsa}) \\ 
        
        ${Qsa2} &\leftarrow ${Qsa2} + ${data.lr}(${textcolor(
          colors.reward,
          data.reward.toString()
        )} + ${data.gamma} ${Qsan2} - ${Qsa2}) \\ 
        
        ${Qsa2} &\leftarrow ${colorbox(
          colors.currentQ,
          data.currentQ.toFixed(2)
        )} + ${data.lr}(${textcolor(colors.reward, data.reward.toString())} + ${
          data.gamma
        } * ${colorbox(colors.nextQ, data.nextQ.toFixed(2))} - ${colorbox(
          colors.currentQ,
          data.currentQ.toFixed(2)
        )}) \\

        ${Qsa2} &\leftarrow ${(
          data.currentQ +
          data.lr * (data.reward + data.gamma * data.nextQ - data.currentQ)
        ).toFixed(2)}
        \end{aligned}`}
      ></Katex>
    </div>
  );
};

export default BellmanUpdateKatex;
