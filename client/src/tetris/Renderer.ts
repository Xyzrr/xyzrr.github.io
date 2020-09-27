import TWEEN from "@tweenjs/tween.js";
import { getColor, getMinos } from "./tetrominos";
import * as constants from "./constants";
import {
  TetrisFieldTile,
  ActivePiece,
  Mino,
  ServerState,
  PlayerState,
  EnemyAnimationState,
} from "./types";
import { gray } from "../common/colors";
import { EnemyGrid } from "./EnemyGrid";

const addCoords = (a: [number, number], b: [number, number]) => {
  const result: [number, number] = [a[0] + b[0], a[1] + b[1]];
  return result;
};

const translate = (activePiece: ActivePiece, translation: [number, number]) => {
  return {
    ...activePiece,
    position: addCoords(activePiece.position, translation),
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
  enemyGrid: EnemyGrid;
  enemyStates: { [clientID: string]: PlayerState & EnemyAnimationState } = {};
  playerState: PlayerState | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.enemyGrid = new EnemyGrid();
  }

  getWidth() {
    return this.ctx.canvas.width / window.devicePixelRatio;
  }

  getHeight() {
    return this.ctx.canvas.height / window.devicePixelRatio;
  }

  renderBorder(x: number, y: number, unit: number, completeness: number) {
    const width = unit * constants.MATRIX_COLS;
    const height = unit * constants.MATRIX_ROWS_VISIBLE;

    this.ctx.strokeStyle = "#666";
    if (completeness === 1) {
      this.ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
    } else {
      const verticalCompleteness = Math.min(completeness * 2, 1);
      const centerY = y + height / 2;
      const topY = centerY - (height / 2 + 1) * verticalCompleteness;
      const bottomY = centerY + (height / 2 + 1) * verticalCompleteness;

      const horizontalCompleteness = Math.max((completeness - 0.5) * 2, 0);
      const leftX = x + (width / 2) * horizontalCompleteness;
      const rightX = x + width - (width / 2) * horizontalCompleteness;

      this.ctx.beginPath();
      this.ctx.moveTo(x - 1, topY);
      this.ctx.lineTo(x - 1, bottomY);
      this.ctx.moveTo(x + width + 1, topY);
      this.ctx.lineTo(x + width + 1, bottomY);

      this.ctx.moveTo(x, y - 1);
      this.ctx.lineTo(leftX, y - 1);
      this.ctx.moveTo(x, y + height + 1);
      this.ctx.lineTo(leftX, y + height + 1);
      this.ctx.moveTo(x + width, y - 1);
      this.ctx.lineTo(rightX, y - 1);
      this.ctx.moveTo(x + width, y + height + 1);
      this.ctx.lineTo(rightX, y + height + 1);

      this.ctx.stroke();
    }
  }

  renderGrid(x: number, y: number, unit: number) {
    const width = unit * constants.MATRIX_COLS;
    const height = unit * constants.MATRIX_ROWS_VISIBLE;

    this.ctx.strokeStyle = "#161616";
    for (let i = 0; i < constants.MATRIX_ROWS_VISIBLE; i++) {
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
      const row =
        activePiece.position[0] + coord[0] - constants.MATRIX_ROWS_HIDDEN;
      if (row >= 0) {
        this.ctx.fillRect(x + col * unit, y + row * unit, unit, unit);
      }
    }
  }

  renderLand(x: number, y: number, unit: number, field: TetrisFieldTile[][]) {
    for (let i = constants.MATRIX_ROWS_HIDDEN; i < constants.MATRIX_ROWS; i++) {
      for (let j = 0; j < constants.MATRIX_COLS; j++) {
        const cell = field[i][j];
        if (cell !== 0) {
          this.ctx.fillStyle = getColor(cell);
          this.ctx.fillRect(
            x + unit * j,
            y + unit * (i - constants.MATRIX_ROWS_HIDDEN),
            unit,
            unit
          );
        }
      }
    }
  }

  renderGameField(
    x: number,
    y: number,
    unit: number,
    field: TetrisFieldTile[][],
    activePiece: ActivePiece | undefined,
    options?: {
      showGrid?: boolean;
      borderCompleteness?: number;
      fieldOpacity?: number;
    }
  ) {
    const opts = options || {};
    const borderCompleteness =
      opts.borderCompleteness == null ? 1 : opts.borderCompleteness;
    const showGrid = opts.showGrid == null ? true : opts.showGrid;
    const fieldOpacity = opts.fieldOpacity == null ? 1 : opts.fieldOpacity;

    this.renderBorder(x, y, unit, borderCompleteness);
    if (showGrid) {
      this.renderGrid(x, y, unit);
    }
    this.ctx.globalAlpha = fieldOpacity;
    this.renderLand(x, y, unit, field);
    if (activePiece) {
      this.renderActivePiece(x, y, unit, activePiece);
      const ghostPiece = moveToGround(activePiece, field);
      this.renderActivePiece(x, y, unit, ghostPiece, true);
    }
    this.ctx.globalAlpha = 1;
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

  renderGameFrame(
    x: number,
    y: number,
    unit: number,
    margin: number,
    state: PlayerState | null
  ) {
    if (state) {
      this.renderHoldSlot(x - unit - margin, y, unit, state.hold, state.held);
      this.renderGameField(
        x + unit * 4,
        y,
        unit,
        state.field,
        state.activePiece
      );
      this.renderBagPreview(
        x + unit * (constants.MATRIX_COLS + 4) + margin,
        y,
        unit,
        state.nextPieces
      );
    } else {
      this.renderGrid(x + unit * 4, y, unit);
    }
  }

  renderSelf(state: PlayerState | null) {
    let unit = 28;
    if (unit * 22 > this.getHeight()) {
      unit = 20;
    }
    const margin = 4;
    const frameWidth = unit * (constants.MATRIX_COLS + 4 + 5) + margin * 2;
    const frameHeight = unit * constants.MATRIX_ROWS_VISIBLE;

    this.renderGameFrame(
      this.getWidth() / 2 - frameWidth / 2,
      this.getHeight() / 2 - frameHeight / 2,
      unit,
      margin,
      state
    );

    return frameWidth;
  }

  renderEnemy(
    x: number,
    y: number,
    unit: number,
    enemyState: PlayerState & EnemyAnimationState
  ) {
    let borderCompleteness = 1;
    let fieldOpacity = 1;
    if (enemyState.animationType === "joining") {
      borderCompleteness = Math.min(enemyState.animationProgress * 2.5, 1);
      fieldOpacity = Math.max((enemyState.animationProgress - 0.4) * 1.67, 0);
    }
    if (enemyState.animationType === "disconnecting") {
      borderCompleteness = Math.min(
        1 - (enemyState.animationProgress - 0.6) * 2.5,
        1
      );
      fieldOpacity = Math.max(1 - enemyState.animationProgress * 1.67, 0);
    }
    this.renderGameField(x, y, unit, enemyState.field, enemyState.activePiece, {
      showGrid: false,
      borderCompleteness,
      fieldOpacity,
    });
  }

  renderEnemies(gapWidth: number) {
    const enemies = new Set<string>();
    for (let cid in this.enemyStates) {
      enemies.add(cid);
    }
    this.enemyGrid.setMaxEnemyWidth(gapWidth * 0.4);
    this.enemyGrid.update(enemies, this.getWidth(), this.getHeight(), gapWidth);

    const [enemyCoords, enemyWidth] = this.enemyGrid.getEnemyCoordinates();
    const unit = enemyWidth / constants.MATRIX_COLS;

    Object.entries(enemyCoords).forEach(([cid, coords]) => {
      const enemyState = this.enemyStates[cid];
      this.renderEnemy(coords[0], coords[1], unit, enemyState);
    });
  }

  renderEverything() {
    this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());

    const selfWidth = this.renderSelf(this.playerState);

    const sideWidth = (this.getWidth() - selfWidth) / 2;
    if (sideWidth > 80 && this.getHeight() > 80) {
      this.renderEnemies(selfWidth);
    }
  }

  updateFromServer(serverState: ServerState, clientID: string) {
    for (let cid in serverState.playerStates) {
      if (cid !== clientID) {
        if (this.enemyStates[cid] == null) {
          this.enemyStates[cid] = {
            ...serverState.playerStates[cid],
            animationType: "joining",
            animationProgress: 0,
            tween: null,
          };
          this.enemyStates[cid].tween = new TWEEN.Tween(this.enemyStates[cid])
            .to({ animationProgress: 1 }, 1001)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
              this.enemyStates[cid].animationType = null;
            })
            .start();
        } else {
          for (let key in serverState.playerStates[cid]) {
            // @ts-ignore
            this.enemyStates[cid][key] = serverState.playerStates[cid][key];
          }
        }
      }
    }

    for (let cid in this.enemyStates) {
      const enemyState = this.enemyStates[cid];
      if (
        enemyState.animationType !== "disconnecting" &&
        serverState.playerStates[cid] == null
      ) {
        enemyState.animationType = "disconnecting";
        enemyState.animationProgress = 0;
        if (enemyState.tween) {
          enemyState.tween.stop();
        }
        enemyState.tween = new TWEEN.Tween(enemyState)
          .to({ animationProgress: 1 }, 1001)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onComplete(() => {
            delete this.enemyStates[cid];
          })
          .start();
      }
    }
  }

  updateFromPrediction(predictedState: PlayerState | null) {
    this.playerState = predictedState;
  }
}
