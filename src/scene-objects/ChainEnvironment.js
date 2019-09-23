import * as colors from "../colors";

export default class ChainEnvironment {
  RADIUS = 30;
  DIST = 100;

  constructor(position) {
    this.position = position;
  }

  highlightStates(states) {
    this.highlightedStates = states;
  }

  render(ctx) {
    ctx.strokeStyle = colors.gray;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      if (i < 4) {
        ctx.beginPath();
        ctx.moveTo(
          this.position.x + this.DIST * (i - 2) + this.RADIUS,
          this.position.y
        );
        ctx.lineTo(
          this.position.x + this.DIST * (i - 1) - this.RADIUS,
          this.position.y
        );
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(
        this.position.x + this.DIST * (i - 2),
        this.position.y,
        this.RADIUS,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      ctx.font = "16px KaTeX_Main";
      ctx.fillStyle = colors.gray.toString();
      ctx.textAlign = "center";
      ctx.fillText(
        i,
        this.position.x + this.DIST * (i - 2),
        this.position.y + 4
      );
    }
    if (this.highlightedStates) {
      this.highlightedStates.forEach(state => {
        ctx.beginPath();
        ctx.strokeStyle = state.color.toString();
        ctx.arc(
          this.position.x + this.DIST * (state.index - 2),
          this.position.y,
          this.RADIUS,
          0,
          2 * Math.PI
        );
        ctx.stroke();

        ctx.font = "16px KaTeX_Main";
        ctx.fillStyle = state.color.toString();
        ctx.textAlign = "center";
        ctx.fillText(
          state.index,
          this.position.x + this.DIST * (state.index - 2),
          this.position.y + 4
        );
      });
    }
  }
}
