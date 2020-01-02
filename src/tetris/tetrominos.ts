import { Mino } from "./types";
import * as _ from "lodash";
import { red, green, darkBlue, orange, purple, yellow, blue } from "../colors";

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

const zMinos: [number, number][] = [
  [1, 1],
  [1, 2],
  [2, 2],
  [2, 3]
];

const sMinos: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 1],
  [2, 2]
];

const jMinos: [number, number][] = [
  [1, 1],
  [2, 1],
  [2, 2],
  [2, 3]
];

const lMinos: [number, number][] = [
  [1, 3],
  [2, 1],
  [2, 2],
  [2, 3]
];

const tMinos: [number, number][] = [
  [1, 2],
  [2, 1],
  [2, 2],
  [2, 3]
];

const oMinos: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 2],
  [2, 3]
];

const iMinos: [number, number][] = [
  [2, 1],
  [2, 2],
  [2, 3],
  [2, 4]
];

const tetrominos = {
  z: {
    color: red,
    minos: [zMinos],
    offsets: jlstzOffsets
  },
  s: {
    color: green,
    minos: [sMinos],
    offsets: jlstzOffsets
  },
  j: {
    color: darkBlue,
    minos: [jMinos],
    offsets: jlstzOffsets
  },
  l: {
    color: orange,
    minos: [lMinos],
    offsets: jlstzOffsets
  },
  t: {
    color: purple,
    minos: [tMinos],
    offsets: jlstzOffsets
  },
  o: {
    color: yellow,
    minos: [oMinos],
    offsets: oOffsets
  },
  i: {
    color: blue,
    minos: [iMinos],
    offsets: iOffsets
  }
};

const rotateCoords = (coords: [number, number][], size: number) => {
  const result: [number, number][] = [];
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
