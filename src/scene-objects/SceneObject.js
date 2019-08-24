import EasingFunctions from "../util/easing";

export default class SceneObject {
  animatedProperties = {};

  getVal(key) {
    const arr = key.split(".");
    let obj = this;
    for (let i = 0; i < arr.length - 1; i++) {
      obj = obj[arr[i]];
    }
    return obj[arr.pop()];
  }

  setVal(key, val) {
    const arr = key.split(".");
    let obj = this;
    for (let i = 0; i < arr.length - 1; i++) {
      obj = obj[arr[i]];
    }
    obj[arr.pop()] = val;
  }

  animate(key, val, options) {
    options = {
      duration: 150,
      easingFunc: EasingFunctions.easeOutQuad,
      ...options
    };

    const prop = this.animatedProperties[key];

    if (prop != null && Date.now() < prop.startTime + prop.duration) {
      this.setVal(key, prop.target);
    }

    this.animatedProperties[key] = {
      start: options.start != null ? options.start : this.getVal(key),
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
      this.setVal(key, this.getTempVal(key));
    }
  }
}
