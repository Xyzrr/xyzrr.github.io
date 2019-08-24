import SceneObject from "./SceneObject";

export default class ChainEnvironment extends SceneObject {
  constructor(position) {
    super();
    this.position = position;
  }

  render(ctx) {
    const RADIUS = 30;
    const DIST = 70;
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      // ctx.lineTo(
      //   this.position.x,
      //   4 * DIST + this.position.y - DIST * i - RADIUS
      // );
      // ctx.stroke();
      ctx.beginPath();
      ctx.arc(
        this.position.x,
        4 * DIST + this.position.y - DIST * i,
        RADIUS,
        0,
        2 * Math.PI
      );
      ctx.stroke();
    }
  }
}
