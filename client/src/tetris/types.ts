export enum Mino {
  S = 1,
  Z,
  J,
  L,
  T,
  O,
  I
}
export type TetrisFieldTile = Mino | 8 | 0;
export interface ActivePiece {
  position: [number, number];
  pieceType: Mino;
  orientation: number;
  fallTimer: number;
  lockTimer: number;
}

export interface EverythingState {
  serverState: ServerState;
  predictedStates: (PlayerState | null)[];
  inputHistory: PlayerInput[][];
  actionIndex: number;
  clientID: string | undefined;
  frameStartTime: number;
  serverTimeOffset: number;
}

export interface ServerState {
  playerStates: { [clientID: string]: PlayerState };
}

export interface PlayerState {
  field: TetrisFieldTile[][];
  hold?: Mino;
  held: boolean;
  activePiece?: ActivePiece;
  nextPieces: Mino[];
  time: number;
}

export interface PlayerInput {
  time: number;
  index: number;
  command: number;
}

export interface EnemyAnimationState {
  animationType: "joining" | "disconnecting" | null;
  animationProgress: number;
  tween: TWEEN.Tween | null;
}
