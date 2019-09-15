import Env from '../envs/Env';

export default interface Agent {
  prepareForEnv(env: Env): void;
  getAction(state: number): any;
  update(
    state: number,
    action: any,
    newState: number,
    reward: number,
    done: boolean
  ): void;
  finishEpisode(): void;
}
