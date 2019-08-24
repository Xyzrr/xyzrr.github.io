import EasingFunctions from "../util/easing";

export default class SceneObject {
  animatedProperties = {};

  animate(key, val, options) {
    options = {
      duration: 150,
      easingFunc: EasingFunctions.easeOutQuad,
      ...options
    };

    const prop = this.animatedProperties[key];

    if (prop != null && Date.now() < prop.startTime + prop.duration) {
      this[key] = prop.target;
    }

    this.animatedProperties[key] = {
      start: options.start != null ? options.start : this[key],
      target: val,
      startTime: Date.now(),
      duration: options.duration,
      onFinished: options.onFinished,
      easingFunc: options.easingFunc
    };
  }

  getTempVal(key) {
    const prop = this.animatedProperties[key];
    if (Date.now() < prop.startTime + prop.duration) {
      return (
        prop.start +
        (prop.target - prop.start) *
          prop.easingFunc((Date.now() - prop.startTime) / prop.duration)
      );
    } else {
      prop.start = prop.target;
      if (prop.onFinished) {
        prop.onFinished();
      }
      return prop.start;
    }
  }

  updateVals() {
    for (const [key, value] of Object.entries(this.animatedProperties)) {
      this[key] = this.getTempVal(key);
    }
  }
}
