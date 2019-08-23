export default class Game {
  constructor(env, agent) {
    this.env = env;
    this.agent = agent;
    agent.initToEnvironment(env.stateSpace, env.actionSpace);
  }

  reset() {
    this.state = this.env.reset();
  }

  step() {
    const action = this.agent.getAction(this.state);
    const { newState, reward, done } = this.env.step(action);
    this.agent.update(this.state, action, newState, reward, done);
    this.state = newState;
    return done;
  }
}
