import { Mino } from "./types";
import * as _ from "lodash";

const tetrominos = {
  z: {
    matrices: [
      [
        ["#", "#", " "],
        [" ", "#", "#"],
        [" ", " ", " "]
      ]
    ]
  },
  s: {
    matrices: [
      [
        [" ", "#", "#"],
        ["#", "#", " "],
        [" ", " ", " "]
      ]
    ]
  },
  j: {
    matrices: [
      [
        ["#", " ", " "],
        ["#", "#", "#"],
        [" ", " ", " "]
      ]
    ]
  },
  l: {
    matrices: [
      [
        [" ", " ", "#"],
        ["#", "#", "#"],
        [" ", " ", " "]
      ]
    ]
  },
  o: {
    matrices: [
      [
        [" ", "#", "#"],
        [" ", "#", "#"],
        [" ", " ", " "]
      ]
    ]
  },
  t: {
    matrices: [
      [
        [" ", "#", " "],
        ["#", "#", "#"],
        [" ", " ", " "]
      ]
    ]
  },
  i: {
    matrices: [
      [
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "],
        [" ", "#", "#", "#", "#"],
        [" ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " "]
      ]
    ]
  }
};

const rotateMatrix = (matrix: any[][]) => {
  const result = [];
  for (let i = 0; i < matrix.length; i++) {
    result.push(_.fill(Array(matrix.length), " "));
  }
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      result[j][matrix.length - 1 - i] = matrix[i][j];
    }
  }
  return result;
};

for (let type in tetrominos) {
  const tetromino = tetrominos[type as Mino];
  for (let i = 0; i < 3; i++) {
    tetromino.matrices.push(rotateMatrix(tetromino.matrices[i]));
  }
}

console.log(tetrominos);

export default tetrominos;
