export default class Game {
  constructor(env, agent) {
    this.env = env;
    this.agent = agent;
    agent.initToEnvironment(env.stateSpace, env.actionSpace);
  }

  reset() {
    this.state = this.env.reset();
    this.totalReward = 0;
  }

  agentTakeAction(action) {
    const { newState, reward, done } = this.env.step(action);
    this.totalReward += reward;
    this.agent.update(this.state, action, newState, reward, done);
    this.state = newState;
    if (done) {
      this.agent.finishEpisode();
      this.reset();
    }
    return { action, newState, reward, done };
  }

  step() {
    const action = this.agent.getAction(this.state);
    return this.agentTakeAction(action);
  }
}
