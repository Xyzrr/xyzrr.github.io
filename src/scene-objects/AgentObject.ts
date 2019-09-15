import TWEEN from '@tweenjs/tween.js';

import * as colors from '../colors';
import Position from '../util/Position';
import SceneObject from './SceneObject';

export default class AgentObject implements SceneObject {
  position: Position;
  redness: number;
  constructor(position: Position) {
    this.position = position;
    this.redness = 0;
  }

  move(newY: number) {
    new TWEEN.Tween(this.position).to({ y: newY }, 150).start();
  }

  slip() {
    this.redness = 1;
    new TWEEN.Tween(this).to({ redness: 0 }, 500).start();
  }

  render(ctx: any) {
    ctx.fillStyle = colors.blue;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = colors.withOpacity(colors.red, this.redness);
    ctx.fill();
  }
}
