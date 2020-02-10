import * as _ from "lodash";
import * as constants from "./constants";
import TWEEN from "@tweenjs/tween.js";
import { array2D } from "../util/helpers";

/**
 * Manages positioning enemies on a grid, independent of enemy states.
 * Also controls zooming animation of grid.
 */
export class EnemyGrid {
  WIDTH_HEIGHT_RATIO = constants.MATRIX_COLS / constants.MATRIX_ROWS_VISIBLE;
  GUTTER_WIDTH_RATIO = 2 / constants.MATRIX_COLS;

  // given properties
  enemies = new Set<string>();
  fullWidth = 0;
  fullHeight = 0;
  gapWidth = 0;
  maxEnemyWidth?: number;

  // derived properies
  grid: (string | null)[][] = [];
  enemyWidth = 0;
  animatedEnemyWidth = 0;
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
