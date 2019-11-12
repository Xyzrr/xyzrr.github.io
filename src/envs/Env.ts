import { Tensor } from "@tensorflow/tfjs";

export default interface Env {
  stateSpace?: number;
  actionSpace?: number;
  reset(): number | Tensor;
  step(action: any): any;
}
