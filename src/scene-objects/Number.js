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
    // this.initAnimatedProperty("newValOpacity", 1);
    this.setAnimatedProperty("newValOpacity", 0, { duration: 2000 });
    this.initAnimatedProperty("valOpacity", 1);
    this.initAnimatedProperty("valOffset", 0);
    this.val = this.newVal;
  }

  updateVal(newVal, animationDuration = 400) {
    if (newVal === this.newVal) {
      return;
    }
    if (newVal > this.val) {
      this.val = this.newVal;
      this.newVal = newVal;
      this.newValColor = colors.green;
      this.setAnimatedProperty("valOpacity", 0, {
        start: 1,
        duration: animationDuration
      });
      this.setAnimatedProperty("newValOpacity", 1, {
        start: 0,
        duration: animationDuration,
        onFinished: this.onAnimationFinish.bind(this)
      });
      this.setAnimatedProperty("valOffset", 25, {
        start: 0,
        duration: animationDuration
      });
      this.setAnimatedProperty("newValOffset", 0, {
        start: -25,
        duration: animationDuration
      });
    } else if (newVal < this.val) {
      this.val = this.newVal;
      this.newVal = newVal;
      this.newValColor = colors.red;
      this.setAnimatedProperty("valOpacity", 0, {
        start: 1,
        duration: animationDuration
      });
      this.setAnimatedProperty("newValOpacity", 1, {
        start: 0,
        duration: animationDuration,
        onFinished: this.onAnimationFinish.bind(this)
      });
      this.setAnimatedProperty("valOffset", -25, {
        start: 0,
        duration: animationDuration
      });
      this.setAnimatedProperty("newValOffset", 0, {
        start: 25,
        duration: animationDuration
      });
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
