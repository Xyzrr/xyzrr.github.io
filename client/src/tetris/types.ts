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
