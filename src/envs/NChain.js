export default class NChainEnv {
  constructor(n = 5, slip = 0.2, small = 2, large = 10, episode_length = 100) {
    this.n = n;
    this.slip = slip;
    this.small = small;
    this.large = large;
    this.episode_length = episode_length;
    this.state = 0;
    this.stepCount = 0;

    this.stateSpace = n;
    this.actionSpace = 2;
  }

  step(action) {
    let slipped = false;
    if (Math.random() < this.slip) {
      action = !action;
      slipped = true;
    }
    let reward = 0;
    if (action) {
      // 'backwards': go back to the beginning, get small reward
      reward = this.small;
      this.state = 0;
    } else if (this.state < this.n - 1) {
      // 'forwards': go up along the chain
      this.state += 1;
    } else {
      // 'forwards': stay at the end of the chain, collect large reward
      reward = this.large;
    }
    this.stepCount += 1;
    console.log(this.stepCount);
    return {
      newState: this.state,
      reward: reward,
      done: this.stepCount >= this.episode_length,
      info: { slipped }
    };
  }

  reset() {
    this.state = 0;
    this.stepCount = 0;
    return this.state;
  }
}
