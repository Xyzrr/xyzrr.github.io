import {number} from 'prop-types';
import React from 'react';

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

interface BellmanUpdateKatexProps {
  state: number;
  next_state: number;
  reward: number;
}

const BellmanUpdateKatex: React.FC<BellmanUpdateKatexProps> = props => {
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
    </div>
  );
};

export default BellmanUpdateKatex;
