import SceneObject from "./SceneObject";
import * as colors from "../colors";

export default class NumberObject extends SceneObject {
  constructor(position, val) {
    super();
    this.position = position;
    this.val = val;
    this.newVal = 0;
    this.newValColor = colors.red;
    this.initAnimatedProperty("newValOpacity", 0);
    this.initAnimatedProperty("newValOffset", 0);
    this.initAnimatedProperty("valOpacity", 1);
    this.initAnimatedProperty("valOffset", 0);
  }

  onAnimationFinish() {
    console.log("just finished" + Math.random());
    this.initAnimatedProperty("newValOpacity", 0);
    this.initAnimatedProperty("valOpacity", 1);
    this.initAnimatedProperty("valOffset", 0);
    this.val = this.newVal;
  }

  updateVal(newVal) {
    if (newVal === this.newVal) {
      return;
    }
    if (newVal > this.val) {
      this.val = this.newVal;
      this.newVal = newVal;
      this.newValColor = colors.green;
      this.initAnimatedProperty("valOpacity", 1);
      this.setAnimatedProperty("valOpacity", 0, { duration: 400 });
      this.initAnimatedProperty("newValOpacity", 0);
      this.setAnimatedProperty("newValOpacity", 1, {
        duration: 400,
        onFinished: this.onAnimationFinish.bind(this)
      });
      this.initAnimatedProperty("valOffset", 0);
      this.setAnimatedProperty("valOffset", 25, { duration: 400 });
      this.initAnimatedProperty("newValOffset", -25);
      this.setAnimatedProperty("newValOffset", 0, { duration: 400 });
    } else if (newVal < this.val) {
      this.val = this.newVal;
      this.newVal = newVal;
      this.newValColor = colors.red;
      this.initAnimatedProperty("valOpacity", 1);
      this.setAnimatedProperty("valOpacity", 0, { duration: 400 });
      this.initAnimatedProperty("newValOpacity", 0);
      this.setAnimatedProperty("newValOpacity", 1, {
        duration: 400,
        onFinished: this.onAnimationFinish.bind(this)
      });
      this.initAnimatedProperty("valOffset", 0);
      this.setAnimatedProperty("valOffset", -25, { duration: 400 });
      this.initAnimatedProperty("newValOffset", 25);
      this.setAnimatedProperty("newValOffset", 0, { duration: 400 });
    }
  }

  render(ctx, size) {
    ctx.font = "30px Inconsolata";
    ctx.fillStyle = colors.withOpacity(
      colors.blue,
      this.getTempVal("valOpacity")
    );
    ctx.fillText(
      this.val.toFixed(2),
      this.position.x,
      this.position.y + this.getTempVal("valOffset")
    );
    ctx.fillStyle = colors.withOpacity(
      this.newValColor,
      this.getTempVal("newValOpacity")
    );
    ctx.fillText(
      this.newVal.toFixed(2),
      this.position.x,
      this.position.y + this.getTempVal("newValOffset")
    );
  }
}
