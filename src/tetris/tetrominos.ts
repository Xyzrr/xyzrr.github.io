import { Mino } from "./types";
import * as _ from "lodash";

const jlstzOffsets: [number, number][][] = [
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [-2, 0],
    [-2, 1]
  ],
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ],
  [
    [0, 0],
    [0, -1],
    [1, -1],
    [-2, 0],
    [-2, -1]
  ]
];

const oOffsets: [number, number][][] = [
  [[0, 0]],
  [[1, 0]],
  [[1, -1]],
  [[0, -1]]
];

const iOffsets: [number, number][][] = [
  [
    [0, 0],
    [0, -1],
    [0, 2],
    [0, -1],
    [0, 2]
  ],
  [
    [0, -1],
    [0, 0],
    [0, 0],
    [-1, 0],
    [2, 0]
  ],
  [
    [-1, -1],
    [-1, 1],
    [-1, -2],
    [0, 1],
    [0, -2]
  ],
  [
    [-1, 0],
    [-1, 0],
    [-1, 0],
    [1, 0],
    [-2, 0]
  ]
];

const tetrominos = {
  z: {
    minos: [
      [
        [1, 1],
        [1, 2],
        [2, 2],
        [2, 3]
      ]
    ],
    offsets: jlstzOffsets
  },
  s: {
    minos: [
      [
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 2]
      ]
    ],
    offsets: jlstzOffsets
  },
  j: {
    minos: [
      [
        [1, 1],
        [2, 1],
        [2, 2],
        [2, 3]
      ]
    ],
    offsets: jlstzOffsets
  },
  l: {
    minos: [
      [
        [1, 3],
        [2, 1],
        [2, 2],
        [2, 3]
      ]
    ],
    offsets: jlstzOffsets
  },
  o: {
    minos: [
      [
        [1, 2],
        [1, 3],
        [2, 2],
        [2, 3]
      ]
    ],
    offsets: oOffsets
  },
  t: {
    minos: [
      [
        [1, 2],
        [2, 1],
        [2, 2],
        [2, 3]
      ]
    ],
    offsets: jlstzOffsets
  },
  i: {
    minos: [
      [
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4]
      ]
    ],
    offsets: iOffsets
  }
};

const rotateCoords = (coords: number[][], size: number) => {
  const result: number[][] = [];
  for (const coord of coords) {
    result.push([coord[1], size - coord[0] - 1]);
  }
  return result;
};

for (let type in tetrominos) {
  const tetromino = tetrominos[type as Mino];
  for (let i = 0; i < 3; i++) {
    tetromino.minos.push(rotateCoords(tetromino.minos[i], 5));
  }
}

export default tetrominos;
