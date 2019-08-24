import SceneObject from "./SceneObject";
import * as colors from "../colors";

export default class NumberObject extends SceneObject {
  constructor(position, val, options) {
    super();

    options = {
      font: "30px Inconsolata",
      textAlign: "center",
      precision: 2,
      ...options
    };

    this.position = position;
    this.val = val;
    this.font = options.font;
    this.textAlign = options.textAlign;
    this.precision = options.precision;
    this.newVal = 0;
    this.newValColor = colors.red;
    this.newValOpacity = 0;
    this.newValOffset = 0;
    this.valOpacity = 1;
    this.valOffset = 0;
  }

  onAnimationFinish() {
    this.animate("newValOpacity", 0, { duration: 2000 });
    this.animate("valOpacity", 1, { duration: 0 });
    this.animate("valOffset", 0, { duration: 0 });
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
      this.animate("valOpacity", 0, {
        start: 1,
        duration: animationDuration
      });
      this.animate("newValOpacity", 1, {
        start: 0,
        duration: animationDuration,
        onFinished: this.onAnimationFinish.bind(this)
      });
      this.animate("valOffset", 25, {
        start: 0,
        duration: animationDuration
      });
      this.animate("newValOffset", 0, {
        start: -25,
        duration: animationDuration
      });
    } else if (newVal < this.val) {
      this.val = this.newVal;
      this.newVal = newVal;
      this.newValColor = colors.red;
      this.animate("valOpacity", 0, {
        start: 1,
        duration: animationDuration
      });
      this.animate("newValOpacity", 1, {
        start: 0,
        duration: animationDuration,
        onFinished: this.onAnimationFinish.bind(this)
      });
      this.animate("valOffset", -25, {
        start: 0,
        duration: animationDuration
      });
      this.animate("newValOffset", 0, {
        start: 25,
        duration: animationDuration
      });
    }
  }

  render(ctx) {
    ctx.textAlign = this.textAlign;
    ctx.font = this.font;
    ctx.fillStyle = colors.withOpacity(colors.blue, this.valOpacity);
    ctx.fillText(
      this.val.toFixed(this.precision),
      this.position.x,
      this.position.y + this.valOffset
    );
    ctx.fillStyle = colors.withOpacity(this.newValColor, this.newValOpacity);
    ctx.fillText(
      this.newVal.toFixed(this.precision),
      this.position.x,
      this.position.y + this.newValOffset
    );
  }
}
