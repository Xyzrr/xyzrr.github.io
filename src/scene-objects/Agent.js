import SceneObject from "./SceneObject";
import * as colors from "../colors";

export default class Agent extends SceneObject {
  constructor(position) {
    super();
    this.position = position;
  }

  move(newX) {
    this.animate("position.x", newX);
  }

  render(ctx, size) {
    ctx.fillStyle = colors.blue;
    ctx.fillRect(this.position.x - 10, this.position.y - 10, 20, 20);
  }
}
