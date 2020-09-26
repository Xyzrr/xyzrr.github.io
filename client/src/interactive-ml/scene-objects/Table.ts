import * as colors from "../../common/colors";
import Position from "../util/Position";
import NumberObject from "./NumberObject";

export default class Table {
  CELL_WIDTH = 120;
  CELL_HEIGHT = 70;

  numberObjects: NumberObject[][];
  position: Position;
  highlightedCells: any[] = [];

  constructor(position: Position, data: number[][]) {
    this.position = position;
    this.numberObjects = [];
    for (let i = 0; i < data.length; i++) {
      const temp = [];
      for (let j = 0; j < data[0].length; j++) {
        temp.push(new NumberObject(0, 0, data[i][j]));
      }
      this.numberObjects.push(temp);
    }
  }

  updateData(newData: number[][]) {
    for (let i = 0; i < this.numberObjects.length; i++) {
      for (let j = 0; j < this.numberObjects[0].length; j++) {
        this.numberObjects[i][j].updateVal(newData[i][j]);
      }
    }
  }

  highlightCells(cells: any[]) {
    this.highlightedCells = cells;
  }

  repositionNumbers() {
    for (let i = 0; i < this.numberObjects.length; i++) {
      for (let j = 0; j < this.numberObjects[0].length; j++) {
        this.numberObjects[i][j].position = {
          x: this.position.x + this.CELL_WIDTH * (j + 1 / 2),
          y: this.position.y + 45 + this.CELL_HEIGHT * i,
        };
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 1;
    this.repositionNumbers();
    if (this.highlightedCells) {
      this.highlightedCells.forEach((cell) => {
        ctx.beginPath();
        ctx.fillStyle = cell.color;
        ctx.fillRect(
          this.position.x + this.CELL_WIDTH * cell.col,
          this.position.y + this.CELL_HEIGHT * cell.row,
          this.CELL_WIDTH,
          this.CELL_HEIGHT
        );
      });
    }
    for (let i = 0; i < this.numberObjects.length; i++) {
      for (let j = 0; j < this.numberObjects[0].length; j++) {
        ctx.beginPath();
        ctx.rect(
          this.position.x + this.CELL_WIDTH * j,
          this.position.y + this.CELL_HEIGHT * i,
          this.CELL_WIDTH,
          this.CELL_HEIGHT
        );
        ctx.strokeStyle = colors.gray.toString();
        ctx.stroke();
        this.numberObjects[i][j].render(ctx);
      }
    }
  }
}
