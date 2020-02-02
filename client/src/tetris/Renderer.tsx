import { getColor, getMinos } from "./tetrominos";
import * as constants from "./constants";
import {
  TetrisFieldTile,
  ActivePiece,
  Mino,
  ServerState,
  PlayerState
} from "./types";
import { gray } from "../colors";

const addCoords = (a: [number, number], b: [number, number]) => {
  const result: [number, number] = [a[0] + b[0], a[1] + b[1]];
  return result;
};

const translate = (activePiece: ActivePiece, translation: [number, number]) => {
  return {
    ...activePiece,
    position: addCoords(activePiece.position, translation)
  };
};

const activePieceIsColliding = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][]
) => {
  const minos = getMinos(activePiece.pieceType, activePiece.orientation);

  for (const coord of minos) {
    const pos = addCoords(activePiece.position, coord);
    if (
      pos[0] < 0 ||
      pos[0] >= constants.MATRIX_ROWS ||
      pos[1] < 0 ||
      pos[1] >= constants.MATRIX_COLS ||
      field[pos[0]][pos[1]]
    ) {
      return true;
    }
  }
  return false;
};

const moveToGround = (activePiece: ActivePiece, field: TetrisFieldTile[][]) => {
  let testShift = 0;
  while (
    !activePieceIsColliding(translate(activePiece, [testShift, 0]), field)
  ) {
    testShift++;
  }
  return translate(activePiece, [testShift - 1, 0]);
};

export default class Renderer {
  ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  getWidth() {
    return this.ctx.canvas.width / window.devicePixelRatio;
  }

  getHeight() {
    return this.ctx.canvas.height / window.devicePixelRatio;
  }

  renderGrid(x: number, y: number, unit: number) {
    const width = unit * 10;
    const height = unit * 20;
    this.ctx.strokeStyle = "#666";
    this.ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);

    this.ctx.strokeStyle = "#161616";
    for (let i = 0; i < constants.MATRIX_ROWS; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + i * unit);
      this.ctx.lineTo(x + width, y + i * unit);
      this.ctx.stroke();
    }
    for (let j = 0; j < constants.MATRIX_COLS; j++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + j * unit, y);
      this.ctx.lineTo(x + j * unit, y + height);
      this.ctx.stroke();
    }
  }

  renderActivePiece(
    x: number,
    y: number,
    unit: number,
    activePiece: ActivePiece,
    ghost: boolean = false
  ) {
    for (const coord of getMinos(
      activePiece.pieceType,
      activePiece.orientation
    )) {
      this.ctx.fillStyle = ghost
        ? getColor(activePiece.pieceType, constants.GHOST_ALPHA)
        : getColor(activePiece.pieceType);
      const col = activePiece.position[1] + coord[1];
      const row = activePiece.position[0] + coord[0] - 20;
      if (row >= 0) {
        this.ctx.fillRect(x + col * unit, y + row * unit, unit, unit);
      }
    }
  }

  renderLand(x: number, y: number, unit: number, field: TetrisFieldTile[][]) {
    for (let i = 20; i < field.length; i++) {
      for (let j = 0; j < field[i].length; j++) {
        const cell = field[i][j];
        if (cell !== 0) {
          this.ctx.fillStyle = getColor(cell);
          this.ctx.fillRect(x + unit * j, y + unit * (i - 20), unit, unit);
        }
      }
    }
  }

  renderGameField(
    x: number,
    y: number,
    unit: number,
    field: TetrisFieldTile[][],
    activePiece?: ActivePiece
  ) {
    this.renderGrid(x, y, unit);
    this.renderLand(x, y, unit, field);
    if (activePiece) {
      this.renderActivePiece(x, y, unit, activePiece);
      const ghostPiece = moveToGround(activePiece, field);
      this.renderActivePiece(x, y, unit, ghostPiece, true);
    }
  }

  renderBagPreview(x: number, y: number, unit: number, nextPieces: Mino[]) {
    for (let i = 0; i < Math.min(5, nextPieces.length); i++) {
      const type = nextPieces[i];
      if ((type as any) === ".") {
        break;
      }
      this.ctx.fillStyle = getColor(type);
      for (const coord of getMinos(type, 0)) {
        this.ctx.fillRect(
          x + coord[1] * unit,
          y + (i * 3 + coord[0]) * unit,
          unit,
          unit
        );
      }
    }
  }

  renderHoldSlot(
    x: number,
    y: number,
    unit: number,
    pieceType: Mino | undefined,
    held: boolean
  ) {
    if (pieceType) {
      this.ctx.fillStyle = held ? gray.toString() : getColor(pieceType);
      for (const coord of getMinos(pieceType, 0)) {
        this.ctx.fillRect(x + coord[1] * unit, y + coord[0] * unit, unit, unit);
      }
    }
  }

  renderGameFrame(x: number, y: number, unit: number, state: PlayerState) {
    this.renderHoldSlot(x, y, unit, state.hold, state.held);
    this.renderGameField(x + unit * 5, y, unit, state.field, state.activePiece);
    this.renderBagPreview(x + unit * 15, y, unit, state.nextPieces);
  }

  renderSelf(state: PlayerState) {
    const unit = 28;
    const frameWidth = unit * 20;
    this.renderGameFrame(this.getWidth() / 2 - frameWidth / 2, 64, 28, state);
  }

  renderEverything(
    worldState: ServerState,
    predictedStates: (PlayerState | null)[],
    clientID: string
  ) {
    this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
    Object.entries(worldState.playerStates).map(([cid, playerState]) => {
      if (cid === clientID) {
        console.log("correct client ID", cid, clientID);
        const lastPredictedFrame = predictedStates[predictedStates.length - 1];
        if (lastPredictedFrame != null) {
          this.renderSelf(lastPredictedFrame);
        }
      } else {
        console.log("wrong client ID", cid, clientID);
      }
    });
  }
}
