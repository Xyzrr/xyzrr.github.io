import SceneObject from "./SceneObject";

export default class ChainEnvironment extends SceneObject {
  render(ctx, size) {
    const RADIUS = 30;
    const DIST = 100;
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(size.width / 2 - DIST * 2 + DIST * i - RADIUS, 400);
      ctx.stroke();
      //   ctx.moveTo(size.width / 2 - DIST * 2 + DIST * i + RADIUS, 400);
      ctx.beginPath();
      ctx.arc(
        size.width / 2 - DIST * 2 + DIST * i,
        400,
        RADIUS,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      //   if (state === i) {
      //     ctx.fillStyle = "cyan";
      //     ctx.fill();
      //   }
    }
  }
}
