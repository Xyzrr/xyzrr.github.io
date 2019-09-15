import * as colors from "../colors";
import TWEEN from "@tweenjs/tween.js";

export default class ButtonObject {
  constructor(position, content) {
    this.position = position;
    this.content = content;
    this.fillOpacity = 0;
  }

  click() {
    this.fillOpacity = 1;
    new TWEEN.Tween(this).to({ fillOpacity: 0 }, 200).start();
  }

  render(ctx) {
    ctx.fillStyle = colors.gray.fade(1 - this.fillOpacity);
    ctx.strokeStyle = colors.gray;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.font = "20px KaTeX_Main";
    ctx.fillStyle = colors.blue;
    ctx.textAlign = "center";
    ctx.fillText(this.content, this.position.x, this.position.y + 6);
  }
}
