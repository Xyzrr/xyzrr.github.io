import Env from "../envs/Env";
import { argMax, randInt, zero2D } from "../util/helpers";
import Agent from "./Agent";

export interface QLearningAgentUpdateData {
  state: number;
  action: number;
  lr: number;
  reward: number;
  done: boolean;
  gamma: number;
  newState: number;
  nextAction: number;
  currentQ: number;
  nextQ: number;
}

export default class QLearningAgent implements Agent {
  gamma: number;
  lr: number;
  eps: number;
  epsDecay: number;
  qTable?: number[][];

  updateData?: QLearningAgentUpdateData;

  constructor(options: any) {
    options = {
      gamma: 0.95,
      lr: 0.1,
      eps: 0.5,
      epsDecay: 0.99,
      ...options
    };
    this.gamma = options.gamma;
    this.lr = options.lr;
    this.eps = options.eps;
    this.epsDecay = options.epsDecay;
  }

  prepareForEnv(env: Env) {
    this.qTable = zero2D(env.stateSpace!, env.actionSpace!);
  }

  getAction(state: number) {
    if (this.qTable == null) {
      console.error("Q learning agent not prepared");
      return;
    }

    if (Math.random() < this.eps) {
      return randInt(0, this.qTable[0].length);
    } else {
      return argMax(this.qTable[state]);
    }
  }

  update(
    state: number,
    action: number,
    newState: number,
    reward: number,
    done: boolean
  ) {
    if (this.qTable == null) {
      console.error("Q learning agent not prepared");
      return;
    }

    this.updateData = {
      state,
      action,
      lr: this.lr,
      reward,
      done,
      gamma: this.gamma,
      newState,
      nextAction: argMax(this.qTable[newState]),
      currentQ: this.qTable[state][action],
      nextQ: Math.max(...this.qTable[newState])
    };

    this.qTable[state][action] +=
      this.lr *
      (reward +
        (done ? 0 : this.gamma * Math.max(...this.qTable[newState])) -
        this.qTable[state][action]);
  }

  finishEpisode() {
    this.eps *= this.epsDecay;
  }
}
