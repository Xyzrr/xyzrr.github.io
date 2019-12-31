import { ActivePiece } from "./types";

const globals: {
  lastTick: number;
  lockStartTime: number;
  ghostPiece?: ActivePiece;
} = {
  lastTick: 0,
  lockStartTime: 0,
  ghostPiece: undefined
};

export default globals;
