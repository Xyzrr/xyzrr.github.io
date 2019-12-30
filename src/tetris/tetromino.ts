import { Mino } from "./types";
import * as _ from "lodash";

const tetromino = {
  z: {
    matrix: [
      [
        ["#", "#", " "],
        [" ", "#", "#"],
        [" ", " ", " "]
      ]
    ]
  },
  s: {
    matrix: [
      [
        [" ", "#", "#"],
        ["#", "#", " "],
        [" ", " ", " "]
      ]
    ]
  },
  j: {
    matrix: [
      [
        ["#", " ", " "],
        ["#", "#", "#"],
        [" ", " ", " "]
      ]
    ]
  },
  l: {
    matrix: [
      [
        [" ", " ", "#"],
        ["#", "#", "#"],
        [" ", " ", " "]
      ]
    ]
  },
  o: {
    matrix: [
      [
        [" ", "#", "#"],
        [" ", "#", "#"],
        [" ", " ", " "]
      ]
    ]
  },
  t: {
    matrix: [
      [
        [" ", "#", " "],
        ["#", "#", "#"],
        [" ", " ", " "]
      ]
    ]
  },
  i: {
    matrix: [
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

for (let type in tetromino) {
  const tet = tetromino[type as Mino];
  for (let i = 0; i < 3; i++) {
    tet.matrix.push(rotateMatrix(tet.matrix[i]));
  }
}

console.log(tetromino);

export default tetromino;
