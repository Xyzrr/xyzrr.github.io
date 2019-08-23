import SceneObject from "./SceneObject";

export default class Agent extends SceneObject {
  constructor(position) {
    super();
    this.position = position;
    this.initAnimatedProperty("x", position.x);
  }

  render(ctx, size) {
    ctx.fillStyle = "cyan";
    ctx.fillRect(this.getTempVal("x") - 10, this.position.y - 10, 20, 20);
  }
}
