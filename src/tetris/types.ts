export type Mino = "z" | "s" | "j" | "l" | "o" | "i" | "t";
export type TetrisFieldTile = Mino | "g" | ".";
export interface ActivePiece {
  position: [number, number];
  type: Mino;
  orientation: number;
}
