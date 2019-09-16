import * as colors from "../colors";

export default class ChainEnvironment {
  constructor(position) {
    this.position = position;
  }

  highlightStates(states) {
    this.highlightedStates = states;
  }

  render(ctx) {
    const RADIUS = 30;
    const DIST = 70;
    ctx.strokeStyle = colors.gray;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      if (i < 4) {
        ctx.beginPath();
        ctx.moveTo(
          this.position.x,
          4 * DIST + this.position.y - DIST * i - RADIUS
        );
        ctx.lineTo(
          this.position.x,
          4 * DIST + this.position.y - DIST * i - DIST + RADIUS
        );
      }
      ctx.stroke();
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
    if (this.highlightedStates) {
      this.highlightedStates.forEach(state => {
        ctx.beginPath();
        ctx.strokeStyle = state.color;
        ctx.arc(
          this.position.x,
          4 * DIST + this.position.y - DIST * state.index,
          RADIUS,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      });
    }
  }
}
