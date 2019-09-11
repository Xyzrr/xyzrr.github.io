import SceneObject from "./SceneObject";
import * as colors from "../colors";
import constants from "jest-haste-map/build/constants";
import TWEEN from "@tweenjs/tween.js";

export default class Agent extends SceneObject {
  constructor(position) {
    super();
    this.position = position;
  }

  move(newY) {
    new TWEEN.Tween(this.position).to({ y: newY }, 150).start();
  }

  render(ctx) {
    ctx.fillStyle = colors.blue;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 20, 0, 2 * Math.PI);
    ctx.fill();
  }
}
