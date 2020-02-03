import Renderer, { EnemyGrid } from "./Renderer";

it("enemyGrid.getOptimalDimensions", () => {
  const grid = new EnemyGrid();
  const width = 25;
  const height = width / grid.WIDTH_HEIGHT_RATIO;
  const gutterWidth = width * grid.GUTTER_WIDTH_RATIO;
  expect(
    grid.getOptimalDimensions(
      4,
      width * 2 + gutterWidth * 3,
      height + gutterWidth * 2
    )
  ).toEqual([25, 1, 4]);
  expect(
    grid.getOptimalDimensions(
      7,
      width * 2 + gutterWidth * 3,
      height * 2 + gutterWidth * 3
    )
  ).toEqual([25, 2, 4]);
});
