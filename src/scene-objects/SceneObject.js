import EasingFunctions from "../util/easing";

export default class SceneObject {
  // Example
  // animatedProperties: {
  //     x: {
  //         current: 50
  //         target: 100
  //         startTime: 12125124
  //         duration: 500
  //     }
  // }
  animatedProperties = {};

  initAnimatedProperty(key, val) {
    this.animatedProperties[key] = {
      current: val,
      target: val,
      startTime: 0,
      duration: 0,
      onFinished: undefined
    };
  }

  setAnimatedProperty(key, val, options) {
    options = {
      duration: 150,
      ...options
    };

    const prop = this.animatedProperties[key];

    if (Date.now() < prop.startTime + prop.duration) {
      prop.current = prop.target;
    }
    if (options.start != null) {
      prop.current = options.start;
    }
    prop.target = val;
    prop.startTime = Date.now();
    prop.duration = options.duration;
    prop.onFinished = options.onFinished;
  }

  getTempVal(key, easingFunction = EasingFunctions.easeOutQuad) {
    const prop = this.animatedProperties[key];
    if (Date.now() < prop.startTime + prop.duration) {
      return (
        prop.current +
        (prop.target - prop.current) *
          easingFunction((Date.now() - prop.startTime) / prop.duration)
      );
    } else {
      if (prop.onFinished) {
        prop.onFinished();
      }
      prop.current = prop.target;
      return prop.current;
    }
  }
}
