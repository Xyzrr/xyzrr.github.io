import SceneObject from "./SceneObject";
import * as colors from "../colors";
import EasingFunctions from "../util/easing";

export default class ButtonObject extends SceneObject {
  constructor(position, content) {
    super();
    this.position = position;
    this.content = content;
    this.fillOpacity = 0;
  }

  click() {
    this.animate("fillOpacity", 0, {
      start: 1,
      duration: 200,
      easingFunc: EasingFunctions.easeInCubic
    });
  }

  render(ctx) {
    ctx.fillStyle = colors.withOpacity(colors.gray, this.fillOpacity);
    ctx.strokeStyle = colors.gray;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.font = "20px Inconsolata";
    ctx.fillStyle = colors.blue;
    ctx.textAlign = "center";
    ctx.fillText(this.content, this.position.x, this.position.y + 6);
  }
}
