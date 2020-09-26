import TWEEN from "@tweenjs/tween.js";
import { darkGray } from "../common/colors";

export default class Scene {
  constructor(canvas, ctx, size, sceneObjects) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.size = size;
    this.sceneObjects = sceneObjects;
  }

  render() {
    requestAnimationFrame(this.render.bind(this));

    this.ctx.fillStyle = darkGray;
    this.ctx.fillRect(0, 0, this.size.width, this.size.height);
    this.sceneObjects.forEach((obj) => {
      obj.render(this.ctx, this.size);
    });

    TWEEN.update();
  }
}
