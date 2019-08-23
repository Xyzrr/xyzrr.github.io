export default class Table {
  constructor(data) {
    this.data = data;
  }

  render(ctx, size) {
    ctx.lineWidth = 1;
    ctx.font = "30px Inconsolata";
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.beginPath();
        ctx.rect(size.width / 2 - 100 + 100 * j, 50 + 50 * i, 100, 50);
        ctx.strokeStyle = "gray";
        ctx.stroke();
        ctx.fillStyle = "cyan";
        ctx.fillText(
          this.data[i][j].toFixed(2),
          size.width / 2 - 88 + 100 * j,
          85 + 50 * i
        );
      }
    }
  }
}
