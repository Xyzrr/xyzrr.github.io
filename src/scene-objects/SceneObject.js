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
      duration: 0
    };
  }

  setAnimatedProperty(key, val, duration = 100) {
    this.animatedProperties[key].target = val;
    this.animatedProperties[key].startTime = Date.now();
    this.animatedProperties[key].duration = duration;
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
      prop.current = prop.target;
      return prop.current;
    }
  }
}
