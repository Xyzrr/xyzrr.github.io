import SceneObject from "./SceneObject";

export default class Agent extends SceneObject {
  constructor(position) {
    super();
    this.position = position;
    this.xPos = position.x;
  }

  move(newX) {
    this.animate("xPos", newX);
  }

  render(ctx, size) {
    ctx.fillStyle = "cyan";
    ctx.fillRect(this.xPos - 10, this.position.y - 10, 20, 20);
  }
}
