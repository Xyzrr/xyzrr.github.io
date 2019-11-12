import Agent from "./agents/Agent";
import Env from "./envs/Env";

export default class Game {
  env: Env;
  agent: Agent;
  state!: number;
  prevState?: number;
  lastReward?: number;
  totalReward: number = 0;
  lastAction: any;

  constructor(env: Env, agent: Agent) {
    this.env = env;
    this.agent = agent;
    this.reset();
  }

  reset() {
    this.state = this.env.reset() as number;
    this.prevState = undefined;
    this.totalReward = 0;
  }

  agentTakeAction(action: any) {
    const { newState, reward, done, info } = this.env.step(action);
    this.lastAction = action;
    this.lastReward = reward;
    this.totalReward += reward;
    this.agent.update(this.state, action, newState, reward, done);
    this.prevState = this.state;
    this.state = newState;
    const totalReward = this.totalReward;
    if (done) {
      this.agent.finishEpisode();
      this.reset();
    }
    return { action, newState, reward, done, totalReward, info };
  }

  step() {
    const action = this.agent.getAction(this.state);
    return this.agentTakeAction(action);
  }
}
