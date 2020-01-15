import { Mino } from "./types";
import { red, green, darkBlue, orange, purple, yellow, blue } from "../colors";
import memoize from "memoizee";

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

const tetrominos = [
  {
    color: green,
    minos: [sMinos],
    offsets: jlstzOffsets
  },
  {
    color: red,
    minos: [zMinos],
    offsets: jlstzOffsets
  },
  {
    color: darkBlue,
    minos: [jMinos],
    offsets: jlstzOffsets
  },
  {
    color: orange,
    minos: [lMinos],
    offsets: jlstzOffsets
  },
  {
    color: purple,
    minos: [tMinos],
    offsets: jlstzOffsets
  },
  {
    color: yellow,
    minos: [oMinos],
    offsets: oOffsets
  },
  {
    color: blue,
    minos: [iMinos],
    offsets: iOffsets
  }
];

const rotateCoords = (coords: [number, number][], size: number) => {
  const result: [number, number][] = [];
  for (const coord of coords) {
    result.push([coord[1], size - coord[0] - 1]);
  }
  return result;
};

for (let type = 1; type < 8; type++) {
  const tetromino = tetrominos[type - 1]!;
  for (let i = 0; i < 3; i++) {
    tetromino.minos.push(rotateCoords(tetromino.minos[i], 5));
  }
}

export const getOffsets = (type: Mino, orientation: number) => {
  return tetrominos[type - 1].offsets[orientation];
};

export const getMinos = (type: Mino, orientation: number) => {
  return tetrominos[type - 1].minos[orientation];
};

const _getColor = (type: Mino, alpha: number = 1) => {
  return tetrominos[type - 1].color.alpha(alpha).toString();
};

export const getColor = memoize(_getColor, { length: 2 });
