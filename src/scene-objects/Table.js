import NumberObject from "./Number";
import SceneObject from "./SceneObject";

export default class Table extends SceneObject {
  constructor(data) {
    super();
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

  repositionNumbers(size) {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        this.numbersObjects[i][j].position = {
          x: size.width / 2 - 88 + 100 * j,
          y: 85 + 50 * i
        };
      }
    }
  }

  render(ctx, size) {
    ctx.lineWidth = 1;
    this.repositionNumbers(size);
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.beginPath();
        ctx.rect(size.width / 2 - 100 + 100 * j, 50 + 50 * i, 100, 50);
        ctx.strokeStyle = "gray";
        ctx.stroke();
        ctx.fillStyle = "cyan";
        this.numbersObjects[i][j].updateVals();
        this.numbersObjects[i][j].render(ctx, size);
      }
    }
  }
}
