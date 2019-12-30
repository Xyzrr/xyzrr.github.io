export type Mino = "z" | "s" | "j" | "l" | "o" | "i" | "t";
export type TetrisFieldTile = Mino | "g" | ".";
export interface ActivePiece {
  x: number;
  y: number;
  type: Mino;
  orientation: number;
}
