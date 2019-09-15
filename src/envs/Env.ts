export default interface Env {
  stateSpace: number;
  actionSpace: number;
  reset(): number;
  step(action: any): any;
}
