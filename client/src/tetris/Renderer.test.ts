import Renderer, { EnemyGrid } from "./Renderer";
import { array2D } from "../util/helpers";

it("enemyGrid.getOptimalDimensions", () => {
  const grid = new EnemyGrid();
  const width = 25;
  const height = width / grid.WIDTH_HEIGHT_RATIO;
  const gutterWidth = width * grid.GUTTER_WIDTH_RATIO;

  grid.gapWidth = 0;

  grid.fullWidth = 4 * width + 6 * gutterWidth;
  grid.fullHeight = height + gutterWidth * 2;
  expect(grid.getOptimalDimensions(4)).toEqual([25, 1, 4]);

  grid.fullWidth = 4 * width + 6 * gutterWidth;
  grid.fullHeight = height * 2 + gutterWidth * 3;
  expect(grid.getOptimalDimensions(7)).toEqual([25, 2, 4]);
});

it("enemyGrid.sidePath left", () => {
  const grid = new EnemyGrid();
  grid.grid = array2D(5, 6, "hey");

  const gen = grid.sidePath("left");
  const path = [];
  for (let coord of gen) {
    path.push(coord);
  }
  expect(path).toEqual([
    [0, 2],
    [0, 1],
    [1, 2],
    [1, 1],
    [0, 0],
    [1, 0],
    [2, 2],
    [2, 1],
    [2, 0],
    [3, 2],
    [3, 1],
    [3, 0],
    [4, 2],
    [4, 1],
    [4, 0]
  ]);
});

it("enemyGrid.sidePath right", () => {
  const grid = new EnemyGrid();
  grid.grid = array2D(5, 6, "hey");

  const gen = grid.sidePath("right");
  const path = [];
  for (let coord of gen) {
    path.push(coord);
  }
  expect(path).toEqual([
    [0, 3],
    [0, 4],
    [1, 3],
    [1, 4],
    [0, 5],
    [1, 5],
    [2, 3],
    [2, 4],
    [2, 5],
    [3, 3],
    [3, 4],
    [3, 5],
    [4, 3],
    [4, 4],
    [4, 5]
  ]);
});

it("enemyGrid.addPath", () => {
  const grid = new EnemyGrid();
  grid.grid = array2D(5, 6, "hey");

  const gen = grid.addPath();
  const path = [];
  for (let coord of gen) {
    path.push(coord);
  }
  expect(path).toEqual([
    [0, 2],
    [0, 3],
    [0, 1],
    [0, 4],
    [1, 2],
    [1, 3],
    [1, 1],
    [1, 4],
    [0, 0],
    [0, 5],
    [1, 0],
    [1, 5],
    [2, 2],
    [2, 3],
    [2, 1],
    [2, 4],
    [2, 0],
    [2, 5],
    [3, 2],
    [3, 3],
    [3, 1],
    [3, 4],
    [3, 0],
    [3, 5],
    [4, 2],
    [4, 3],
    [4, 1],
    [4, 4],
    [4, 0],
    [4, 5]
  ]);
});

it("enemyGrid.addPath 2", () => {
  const grid = new EnemyGrid();
  grid.grid = array2D(1, 2, "hey");

  const gen = grid.addPath();
  const path = [];
  for (let coord of gen) {
    path.push(coord);
  }
  expect(path).toEqual([
    [0, 0],
    [0, 1]
  ]);
});
