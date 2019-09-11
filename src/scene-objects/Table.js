import NumberObject from "./Number";
import SceneObject from "./SceneObject";
import * as colors from "../colors";

export default class Table extends SceneObject {
  constructor(position, data) {
    super();
    this.position = position;
    this.data = data;
    this.numbersObjects = [];
    for (let i = 0; i < 5; i++) {
      const temp = [];
      for (let j = 0; j < 2; j++) {
        temp.push(new NumberObject(0, 0, this.data[i][j]));
      }
      this.numbersObjects.push(temp);
    }
  }

  updateData(newData) {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        this.numbersObjects[i][j].updateVal(newData[i][j]);
      }
    }
  }

  repositionNumbers() {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        this.numbersObjects[i][j].position = {
          x: this.position.x + 50 + 100 * j,
          y: this.position.y + 45 + 70 * i
        };
      }
    }
  }

  render(ctx) {
    ctx.lineWidth = 1;
    this.repositionNumbers();
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.beginPath();
        ctx.rect(this.position.x + 100 * j, this.position.y + 70 * i, 100, 70);
        ctx.strokeStyle = colors.gray;
        ctx.stroke();
        ctx.fillStyle = colors.blue;
        this.numbersObjects[i][j].render(ctx);
      }
    }
  }
}
