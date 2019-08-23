export default class Agent {
  constructor(position) {
    this.position = position;
  }
  render(ctx, size) {
    ctx.fillStyle = "cyan";
    ctx.fillRect(this.position.x - 10, this.position.y - 10, 20, 20);
  }
}
