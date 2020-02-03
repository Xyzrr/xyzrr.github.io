import Renderer, { EnemyGrid } from "./Renderer";

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
