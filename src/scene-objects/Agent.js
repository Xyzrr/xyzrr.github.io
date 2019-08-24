import SceneObject from "./SceneObject";
import * as colors from "../colors";

export default class Agent extends SceneObject {
  constructor(position) {
    super();
    this.position = position;
  }

  move(newY) {
    this.animate("position.y", newY);
  }

  render(ctx) {
    ctx.fillStyle = colors.blue;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 20, 0, 2 * Math.PI);
    ctx.fill();
  }
}
