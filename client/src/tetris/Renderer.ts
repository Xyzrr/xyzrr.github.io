import TWEEN from "@tweenjs/tween.js";
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
import { array2D } from "../util/helpers";
import * as _ from "lodash";

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
  enemyGrid: EnemyGrid;

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

  renderGrid(x: number, y: number, unit: number) {
    const width = unit * constants.MATRIX_COLS;
    const height = unit * constants.MATRIX_ROWS_VISIBLE;
    this.ctx.strokeStyle = "#666";
    this.ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);

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

  renderEnemies(worldState: ServerState, clientID: string, gapWidth: number) {
    const enemies = new Set<string>();
    for (let cid in worldState.playerStates) {
      if (cid !== clientID) {
        enemies.add(cid);
      }
    }
    this.enemyGrid.setMaxEnemyWidth(gapWidth * 0.4);
    this.enemyGrid.update(enemies, this.getWidth(), this.getHeight(), gapWidth);

    const [enemyCoords, enemyWidth] = this.enemyGrid.getEnemyCoordinates();
    const unit = enemyWidth / constants.MATRIX_COLS;

    Object.entries(enemyCoords).forEach(([cid, coords]) => {
      const enemyState = worldState.playerStates[cid];
      this.renderGameField(
        coords[0],
        coords[1],
        unit,
        enemyState.field,
        enemyState.activePiece
      );
    });
  }

  renderEverything(
    worldState: ServerState,
    predictedStates: (PlayerState | null)[],
    clientID: string
  ) {
    this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());

    let selfWidth = 0;
    const lastPredictedFrame = predictedStates[predictedStates.length - 1];
    selfWidth = this.renderSelf(lastPredictedFrame);

    const sideWidth = (this.getWidth() - selfWidth) / 2;
    if (sideWidth > 80 && this.getHeight() > 80) {
      this.renderEnemies(worldState, clientID, selfWidth);
    }
  }
}

export class EnemyGrid {
  WIDTH_HEIGHT_RATIO = constants.MATRIX_COLS / constants.MATRIX_ROWS_VISIBLE;
  GUTTER_WIDTH_RATIO = 2 / constants.MATRIX_COLS;
  grid: (string | null)[][] = [];
  enemies = new Set<string>();
  enemyWidth = 0;
  animatedEnemyWidth = 0;
  maxEnemyWidth?: number;
  fullWidth = 0;
  fullHeight = 0;
  gapWidth = 0;
  yOffset = 0;

  setMaxEnemyWidth(max: number) {
    this.maxEnemyWidth = max;
  }

  setEnemyWidth(width: number, duration = 0) {
    this.enemyWidth = width;
    if (duration === 0) {
      this.animatedEnemyWidth = width;
    } else {
      new TWEEN.Tween(this)
        .to({ animatedEnemyWidth: width }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    }
  }

  /**
   * @param compact Make grid as small as possible; currently unused
   * @returns The enemyWidth, rowCount and colCount that fits
   * all the enemies in the available space such that they're
   * as large as possible.
   */
  getOptimalDimensions(enemyCount: number, compact = false) {
    const sideWidth = this.getSideWidth();

    // try fitting horizontally
    let enemyWidthWide = 0;
    let rowCap = 0;
    let sideCols = 1;
    while (true) {
      enemyWidthWide =
        sideWidth / (sideCols + (sideCols + 1) * this.GUTTER_WIDTH_RATIO);
      const enemyHeight = enemyWidthWide / this.WIDTH_HEIGHT_RATIO;
      const gutterWidth = enemyWidthWide * this.GUTTER_WIDTH_RATIO;
      rowCap = Math.floor(
        (this.fullHeight - gutterWidth) / (enemyHeight + gutterWidth)
      );

      if (rowCap * sideCols >= Math.ceil(enemyCount / 2)) {
        break;
      }

      sideCols++;
    }

    //try fitting vertically
    let enemyHeightTall = 0;
    let colCap = 0;
    let rows = 1;
    while (true) {
      enemyHeightTall =
        this.fullHeight /
        (rows + (rows + 1) * this.WIDTH_HEIGHT_RATIO * this.GUTTER_WIDTH_RATIO);
      const enemyWidth = enemyHeightTall * this.WIDTH_HEIGHT_RATIO;
      const gutterWidth = enemyWidth * this.GUTTER_WIDTH_RATIO;
      colCap = Math.floor(
        (sideWidth - gutterWidth) / (enemyWidth + gutterWidth)
      );

      if (colCap * rows >= Math.ceil(enemyCount / 2)) {
        break;
      }

      rows++;
    }

    let bestEnemyWidth: number;
    let bestRowCount: number;
    let bestColCount: number;

    const enemyWidthTall = enemyHeightTall * this.WIDTH_HEIGHT_RATIO;
    if (enemyWidthTall > enemyWidthWide) {
      bestEnemyWidth = enemyWidthTall;
      bestRowCount = rows;
      if (compact) {
        bestColCount = Math.ceil(enemyCount / rows / 2) * 2;
      } else {
        bestColCount = colCap * 2;
      }
    } else {
      bestEnemyWidth = enemyWidthWide;
      if (compact) {
        bestRowCount = rowCap;
      } else {
        bestRowCount = Math.ceil(enemyCount / (sideCols * 2));
      }
      bestColCount = sideCols * 2;
    }

    if (this.maxEnemyWidth && bestEnemyWidth > this.maxEnemyWidth) {
      bestEnemyWidth = this.maxEnemyWidth;
    }

    return [bestEnemyWidth, bestRowCount, bestColCount];
  }

  /**
   * Adapt to screen resize.
   */
  reshape(newEnemies: Set<string>) {
    console.log("RESHAPING");
    const [enemyWidth, rows, cols] = this.getOptimalDimensions(newEnemies.size);
    this.setEnemyWidth(enemyWidth);
    this.grid = array2D<string | null>(rows, cols, null);
    this.enemies = new Set();
    this.addNewEnemies(newEnemies);
  }

  getGridCapacity() {
    return this.grid.length === 0 ? 0 : this.grid.length * this.grid[0].length;
  }

  /** Grow to accomodate new enemies, anchored at center-top */
  expand(enemyCount: number) {
    console.log("EXPANDING");
    const [enemyWidth, rows, cols] = this.getOptimalDimensions(enemyCount);
    const newGrid = array2D<string | null>(rows, cols, null);
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        const offset = (cols - this.grid[0].length) / 2;
        newGrid[i][j + offset] = this.grid[i][j];
      }
    }
    this.setEnemyWidth(enemyWidth, 1001);
    this.grid = newGrid;
  }

  getGutterWidth() {
    return this.enemyWidth * this.GUTTER_WIDTH_RATIO;
  }

  // not used anymore but may be useful later
  getGridExpectedSideWidth() {
    if (this.grid.length === 0) {
      return 0;
    }

    let cols = this.grid[0].length / 2;
    findEmptyColsLoop: for (let j = 0; j < this.grid[0].length / 2; j++) {
      for (let i = 0; i < this.grid.length; i++) {
        if (
          this.grid[i][j] != null ||
          this.grid[i][this.grid[i].length - 1 - j] != null
        ) {
          break findEmptyColsLoop;
        }
      }
      cols--;
    }

    return this.enemyWidth * cols + this.getGutterWidth() * (cols + 1);
  }

  getGridExpectedHeight() {
    let rows = this.grid.length;
    findEmptyRowsLoop: for (let i = this.grid.length - 1; i > 0; i--) {
      for (let j = 0; j < this.grid[i].length; j++) {
        if (this.grid[i][j] != null) {
          break findEmptyRowsLoop;
        }
      }
      rows--;
    }

    return (
      (this.enemyWidth / this.WIDTH_HEIGHT_RATIO) * rows +
      this.getGutterWidth() * (rows + 1)
    );
  }

  getSideWidth() {
    return (this.fullWidth - this.gapWidth) / 2;
  }

  updateYOffset(duration = 0) {
    const expectedHeight = this.getGridExpectedHeight();
    const yOffset = (this.fullHeight - expectedHeight) / 2;
    if (duration === 0) {
      this.yOffset = yOffset;
    } else {
      new TWEEN.Tween(this)
        .to({ yOffset }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    }
  }

  removeMissingEnemies(newEnemies: Set<string>) {
    for (let i in this.grid) {
      for (let j in this.grid[i]) {
        const enemy = this.grid[i][j];
        if (enemy != null && !newEnemies.has(enemy)) {
          this.grid[i][j] = null;
        }
      }
    }
  }

  addNewEnemies(newEnemies: Set<string>) {
    const gen = this.addPath();
    let coord = gen.next().value as number[];
    console.error("ABC attempting with grid", _.cloneDeep(this.grid));
    console.error("enemies", this.enemies, newEnemies);
    addEnemiesLoop: for (let enemy of newEnemies) {
      if (!this.enemies.has(enemy)) {
        while (this.grid[coord[0]][coord[1]] != null) {
          coord = gen.next().value as number[];
          console.error("ABC coord", coord);
        }
        this.grid[coord[0]][coord[1]] = enemy;
      }
    }
  }

  *sidePath(side: "left" | "right") {
    if (this.grid.length === 0) {
      return;
    }

    let startJ: number;
    if (side === "left") {
      startJ = this.grid[0].length / 2 - 1;
    } else {
      startJ = this.grid[0].length / 2;
    }
    for (let r = 0; r < Math.max(this.grid.length, this.grid[0].length); r++) {
      let endJ: Number;
      if (side === "left") {
        endJ = this.grid[0].length / 2 - 1 - r;
      } else {
        endJ = this.grid[0].length / 2 + r;
      }

      // move vertically
      if (endJ >= 0 && endJ < this.grid[0].length) {
        for (let i = 0; i < r; i++) {
          if (i < this.grid.length) {
            yield [i, endJ];
          }
        }
      }

      // move horizontally
      if (r < this.grid.length) {
        for (
          let j = startJ;
          side === "left" ? j >= endJ : j <= endJ;
          j += side === "left" ? -1 : 1
        ) {
          if (j >= 0 && j < this.grid[0].length) {
            yield [r, j];
          }
        }
      }
    }
  }

  *addPath() {
    const left = this.sidePath("left");
    const right = this.sidePath("right");
    for (const l of left) {
      yield l;
      yield right.next().value;
    }
  }

  /**
   * Adapts the grid to new information.
   */
  update(
    newEnemies: Set<string>,
    fullWidth: number,
    fullHeight: number,
    gapWidth: number
  ) {
    console.log("GRID", this.grid);

    this.gapWidth = gapWidth;

    if (fullWidth !== this.fullWidth || fullHeight !== this.fullHeight) {
      this.fullWidth = fullWidth;
      this.fullHeight = fullHeight;
      this.reshape(newEnemies);
      this.updateYOffset();
      this.enemies = newEnemies;
      return;
    }

    if (_.isEqual(this.enemies, newEnemies)) {
      return;
    }

    this.removeMissingEnemies(newEnemies);

    if (newEnemies.size > this.getGridCapacity()) {
      this.expand(newEnemies.size);
    }

    this.addNewEnemies(newEnemies);

    this.updateYOffset(this.enemies.size === 0 ? 0 : 2000);

    this.enemies = newEnemies;
  }

  getEnemyCoordinates(): [{ [cid: string]: number[] }, number] {
    const enemyCoords: { [cid: string]: number[] } = {};
    const centerX = this.fullWidth / 2;

    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        const enemy = this.grid[i][j];
        if (enemy != null) {
          let x: number;
          if (j >= this.grid[i].length / 2) {
            const colsRight = j - this.grid[i].length / 2;
            x =
              centerX +
              this.gapWidth / 2 +
              colsRight * this.animatedEnemyWidth +
              (colsRight + 1) * this.getGutterWidth();
          } else {
            const colsLeft = this.grid[i].length / 2 - 1 - j;
            x =
              centerX -
              this.gapWidth / 2 -
              (colsLeft + 1) *
                (this.animatedEnemyWidth + this.getGutterWidth());
          }
          const y =
            this.yOffset +
            i * (this.animatedEnemyWidth / this.WIDTH_HEIGHT_RATIO) +
            (i + 1) * this.getGutterWidth();
          enemyCoords[enemy] = [x, y];
        }
      }
    }
    return [enemyCoords, this.animatedEnemyWidth];
  }
}
