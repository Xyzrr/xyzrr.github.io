import SceneObject from "./SceneObject";
import * as colors from "../colors";
import TWEEN from "@tweenjs/tween.js";

export default class Agent extends SceneObject {
  constructor(position) {
    super();
    this.position = position;
    this.redness = 0;
  }

  move(newY) {
    new TWEEN.Tween(this.position).to({ y: newY }, 150).start();
  }

  slip() {
    this.redness = 1;
    new TWEEN.Tween(this).to({ redness: 0 }, 500).start();
  }

  render(ctx) {
    ctx.fillStyle = colors.blue;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = colors.withOpacity(colors.red, this.redness);
    ctx.fill();
  }
}
