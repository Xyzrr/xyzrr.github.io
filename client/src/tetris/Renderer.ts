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
    const width = unit * 10;
    const height = unit * 20;
    this.ctx.strokeStyle = "#666";
    this.ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);

    this.ctx.strokeStyle = "#161616";
    for (let i = 0; i < constants.MATRIX_ROWS / 2; i++) {
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
    this.renderHoldSlot(x - unit - 4, y, unit, state.hold, state.held);
    this.renderGameField(x + unit * 4, y, unit, state.field, state.activePiece);
    this.renderBagPreview(x + unit * 14 + 4, y, unit, state.nextPieces);
  }

  renderSelf(state: PlayerState) {
    let unit = 28;
    if (unit * 22 > this.getHeight()) {
      unit = 20;
    }
    const frameWidth = unit * 19 + 8;
    const frameHeight = unit * 20;
    this.renderGameFrame(
      this.getWidth() / 2 - frameWidth / 2,
      this.getHeight() / 2 - frameHeight / 2,
      unit,
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
    this.enemyGrid.update(
      enemies,
      (this.getWidth() - gapWidth) / 2,
      this.getHeight()
    );

    const [enemyCoords, enemyWidth] = this.enemyGrid.getEnemyCoordinates(
      gapWidth,
      this.getWidth(),
      this.getHeight()
    );
    const unit = enemyWidth / 10;

    Object.entries(enemyCoords).forEach(([cid, coords]) => {
      const enemyState = worldState.playerStates[cid];
      this.renderGameField(coords[0], coords[1], unit, enemyState.field);
    });
  }

  renderEverything(
    worldState: ServerState,
    predictedStates: (PlayerState | null)[],
    clientID: string
  ) {
    this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());

    let selfWidth = 0;
    if (worldState.playerStates[clientID] != null) {
      const lastPredictedFrame = predictedStates[predictedStates.length - 1];
      if (lastPredictedFrame != null) {
        selfWidth = this.renderSelf(lastPredictedFrame);
      }
    }

    const sideWidth = (this.getWidth() - selfWidth) / 2;
    if (sideWidth > 80) {
      this.renderEnemies(worldState, clientID, selfWidth);
    }
  }
}

export class EnemyGrid {
  WIDTH_HEIGHT_RATIO = 10 / 20;
  GUTTER_WIDTH_RATIO = 2 / 10;
  grid: (string | null)[][];
  enemies: Set<string>;
  enemyWidth: number;

  constructor() {
    this.grid = [];
    this.enemies = new Set<string>();
    this.enemyWidth = 0;
  }

  getOptimalDimensions(enemyCount: number, sideWidth: number, height: number) {
    // try fitting horizontally
    let enemyWidthWide = 0;
    let rowCap = 0;
    let sideCols = 1;
    while (true) {
      enemyWidthWide =
        sideWidth / (sideCols + (sideCols + 1) * this.GUTTER_WIDTH_RATIO);
      const enemyHeight = enemyWidthWide / this.WIDTH_HEIGHT_RATIO;
      const gutterWidth = enemyWidthWide * this.GUTTER_WIDTH_RATIO;
      rowCap = Math.floor((height - gutterWidth) / (enemyHeight + gutterWidth));

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
        height /
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

    const enemyWidthTall = enemyHeightTall * this.WIDTH_HEIGHT_RATIO;
    if (enemyWidthWide > enemyWidthTall) {
      return [
        enemyWidthWide,
        Math.ceil(enemyCount / (sideCols * 2)),
        sideCols * 2
      ];
    } else {
      return [enemyWidthTall, rows, Math.ceil(enemyCount / rows)];
    }
  }

  // adapt to screen resize
  reshape(newEnemies: Set<string>, sideWidth: number, height: number) {
    const [enemyWidth, rows, cols] = this.getOptimalDimensions(
      newEnemies.size,
      sideWidth,
      height
    );
    this.enemyWidth = enemyWidth;
    this.grid = array2D<string | null>(rows, cols, null);
    console.log(
      "init grid",
      rows,
      cols,
      array2D<string | null>(rows, cols, null)
    );
    let currentIndex = 0;
    newEnemies.forEach(enemy => {
      this.grid[Math.floor(currentIndex / cols)][currentIndex % cols] = enemy;
      currentIndex++;
    });
  }

  getGridCapacity() {
    return this.grid.length === 0 ? 0 : this.grid.length * this.grid[0].length;
  }

  // grow to accomodate new enemies, anchored at center-top
  expand(enemyCount: number, sideWidth: number, height: number) {
    console.log("EXPANDING");
    const [enemyWidth, rows, cols] = this.getOptimalDimensions(
      enemyCount,
      sideWidth,
      height
    );
    const newGrid = array2D<string | null>(rows, cols, null);
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        const offset = (cols - this.grid[0].length) / 2;
        newGrid[i][j + offset] = this.grid[i][j];
      }
    }
    this.enemyWidth = enemyWidth;
    this.grid = newGrid;
  }

  getGutterWidth() {
    return this.enemyWidth * this.GUTTER_WIDTH_RATIO;
  }

  getGridExpectedSideWidth() {
    if (this.grid.length === 0) {
      return 0;
    }
    const cols = this.grid[0].length / 2;
    return this.enemyWidth * cols + this.getGutterWidth() * (cols + 1);
  }

  getGridExpectedHeight() {
    return (
      (this.enemyWidth / this.WIDTH_HEIGHT_RATIO) * this.grid.length +
      this.getGutterWidth() * (this.grid.length + 1)
    );
  }

  update(newEnemies: Set<string>, sideWidth: number, height: number) {
    console.log("GRID", this.grid, this.enemyWidth);
    console.log("height", height, this.enemyWidth, this.grid.length);
    if (
      this.grid.length > 0 &&
      (sideWidth < this.getGridExpectedSideWidth() ||
        height < this.getGridExpectedHeight())
    ) {
      this.reshape(newEnemies, sideWidth, height);
      return;
    }

    console.log(
      "expected",
      this.getGridExpectedSideWidth(),
      "actual",
      sideWidth
    );

    // remove missing enemies
    for (let i in this.grid) {
      for (let j in this.grid[i]) {
        const enemy = this.grid[i][j];
        if (enemy != null && !newEnemies.has(enemy)) {
          this.grid[i][j] = null;
        }
      }
    }

    if (newEnemies.size > this.getGridCapacity()) {
      this.expand(newEnemies.size, sideWidth, height);
    }

    // add new enemies
    let i = 0;
    let j = 0;
    // @ts-ignore
    addEnemiesLoop: for (let enemy of newEnemies) {
      if (!this.enemies.has(enemy)) {
        this.grid[i][j] = enemy;
        while (this.grid[i][j] != null) {
          j++;
          if (j == this.grid[0].length) {
            j = 0;
            i++;
          }
          if (i === this.grid.length) {
            break addEnemiesLoop;
          }
        }
      }
    }

    this.enemies = newEnemies;
  }

  getEnemyCoordinates(
    gapWidth: number,
    screenWidth: number,
    screenHeight: number
  ): [{ [cid: string]: number[] }, number] {
    const enemyCoords: { [cid: string]: number[] } = {};
    const expectedWidth = 2 * this.getGridExpectedSideWidth() + gapWidth;
    const expectedHeight = this.getGridExpectedHeight();
    const xOffset = (screenWidth - expectedWidth) / 2;
    const yOffset = (screenHeight - expectedHeight) / 2;
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        const enemy = this.grid[i][j];
        if (enemy != null) {
          const x =
            xOffset +
            j * this.enemyWidth +
            (j + 1) * this.getGutterWidth() +
            (j >= this.grid[i].length / 2
              ? gapWidth + this.getGutterWidth()
              : 0);
          const y =
            yOffset +
            i * (this.enemyWidth / this.WIDTH_HEIGHT_RATIO) +
            (i + 1) * this.getGutterWidth();
          enemyCoords[enemy] = [x, y];
        }
      }
    }
    return [enemyCoords, this.enemyWidth];
  }
}
