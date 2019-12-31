import { Mino } from "./types";
import * as _ from "lodash";

const jlstzOffsets = [
  [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ],
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -2 }
  ],
  [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ],
  [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -2 },
    { x: -1, y: -2 }
  ]
];

const tetrominos = {
  z: {
    matrices: [
      [
        ["#", "#", " "],
        [" ", "#", "#"],
        [" ", " ", " "]
      ]
    ],
    offsets: jlstzOffsets,
    start: {
      x: 3,
      y: 19
    }
  },
  s: {
    matrices: [
      [
        [" ", "#", "#"],
        ["#", "#", " "],
        [" ", " ", " "]
      ]
    ],
    offsets: jlstzOffsets,
    start: {
      x: 3,
      y: 19
    }
  },
  j: {
    matrices: [
      [
        ["#", " ", " "],
        ["#", "#", "#"],
        [" ", " ", " "]
      ]
    ],
    offsets: jlstzOffsets,
    start: {
      x: 3,
      y: 19
    }
  },
  l: {
    matrices: [
      [
        [" ", " ", "#"],
        ["#", "#", "#"],
        [" ", " ", " "]
      ]
    ],
    offsets: jlstzOffsets,
    start: {
      x: 3,
      y: 19
    }
  },
  o: {
    matrices: [
      [
        [" ", "#", "#"],
        [" ", "#", "#"],
        [" ", " ", " "]
      ]
    ],
    offsets: [
      [{ x: 0, y: 0 }],
      [{ x: 0, y: 1 }],
      [{ x: -1, y: 1 }],
      [{ x: -1, y: 0 }]
    ],
    start: {
      x: 3,
      y: 19
    }
  },
  t: {
    matrices: [
      [
        [" ", "#", " "],
        ["#", "#", "#"],
        [" ", " ", " "]
      ]
    ],
    offsets: jlstzOffsets,
    start: {
      x: 3,
      y: 19
    }
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
    ],
    offsets: [
      [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 2, y: 0 },
        { x: -1, y: 0 },
        { x: 2, y: 0 }
      ],
      [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 2 }
      ],
      [
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -2, y: -1 },
        { x: 1, y: 0 },
        { x: -2, y: 0 }
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: -1 },
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: 0, y: -2 }
      ]
    ],
    start: {
      x: 2,
      y: 18
    }
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

export default tetrominos;
