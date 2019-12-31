import { TetrisFieldTile, ActivePiece, Mino } from "./types";
import tetrominos from "./tetrominos";
import * as constants from "./constants";
import globals from "./globals";
import { randInt } from "../util/helpers";
import * as _ from "lodash";

const startLockingIfOnGround = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][],
  breakLock: boolean
) => {
  const onGround = activePieceIsOnGround(activePiece, field);
  if (onGround) {
    if (globals.lockStartTime === 0 || breakLock) {
      globals.lockStartTime = Date.now();
    }
  } else {
    globals.lockStartTime = 0;
  }
};

const activePieceIsOnGround = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][]
) => activePieceIsColliding({ ...activePiece, y: activePiece.y + 1 }, field);

const activePieceIsColliding = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][]
) => {
  const tetromino = tetrominos[activePiece.type];
  const matrix = tetromino.matrices[activePiece.orientation];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      if (matrix[i][j] === "#") {
        const x = activePiece.x + j;
        const y = activePiece.y + i;
        if (
          x < 0 ||
          x >= constants.MATRIX_COLS ||
          y < 0 ||
          y >= constants.MATRIX_ROWS ||
          field[y][x] !== "."
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

const moveActivePiece = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][],
  deltaX: number,
  deltaY: number
) => {
  let newActivePiece = {
    ...activePiece,
    x: activePiece.x + deltaX,
    y: activePiece.y + deltaY
  };
  if (activePieceIsColliding(newActivePiece, field)) {
    newActivePiece = activePiece;
  }
  // Don't break lock for vertical movements
  if (deltaX === 0) {
    startLockingIfOnGround(activePiece, field, false);
  } else {
    startLockingIfOnGround(newActivePiece, field, true);
  }
  return newActivePiece;
};

const rotateActivePiece = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][],
  dir: number
) => {
  let newActivePiece = activePiece;

  const tetromino = tetrominos[activePiece.type];
  const newOrientation = (activePiece.orientation + 4 + dir) % 4;
  const beforeOffsets = tetromino.offsets[activePiece.orientation];
  const afterOffsets = tetromino.offsets[newOrientation];
  for (let i = 0; i < tetromino.offsets[0].length; i++) {
    const testPiece = {
      ...activePiece,
      x: activePiece.x + beforeOffsets[i].x - afterOffsets[i].x,
      y: activePiece.y + beforeOffsets[i].y - afterOffsets[i].y,
      orientation: newOrientation
    };
    if (!activePieceIsColliding(testPiece, field)) {
      newActivePiece = testPiece;
      break;
    }
  }
  startLockingIfOnGround(activePiece, field, true);

  return newActivePiece;
};

const popNextActivePiece = () => {
  const choices = ["z", "s", "j", "l", "o", "i", "t"];
  const chosen = choices[randInt(0, choices.length - 1)] as Mino;
  return {
    type: chosen,
    x: tetrominos[chosen].start.x,
    y: tetrominos[chosen].start.y,
    orientation: 0
  };
};

const lockActivePiece = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][]
) => {
  const tetromino = tetrominos[activePiece.type];
  const matrix = tetromino.matrices[activePiece.orientation];
  const newField = _.cloneDeep(field);
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (matrix[i][j] == "#") {
        newField[activePiece.y + i][activePiece.x + j] = activePiece.type;
      }
    }
  }
  return newField;
};

const moveToGround = (activePiece: ActivePiece, field: TetrisFieldTile[][]) => {
  let testY = activePiece.y;
  while (!activePieceIsOnGround({ ...activePiece, y: testY }, field)) {
    testY++;
  }
  return { ...activePiece, y: testY };
};

interface TetrisPageState {
  field: TetrisFieldTile[][];
  activePiece: ActivePiece;
}

interface TetrisPageAction {
  type: string;
}

export const tetrisReducer: React.Reducer<TetrisPageState, TetrisPageAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "tick":
      return {
        ...state,
        activePiece: moveActivePiece(state.activePiece, state.field, 0, 1)
      };
    case "moveLeft":
      return {
        ...state,
        activePiece: moveActivePiece(state.activePiece, state.field, -1, 0)
      };
    case "moveRight":
      return {
        ...state,
        activePiece: moveActivePiece(state.activePiece, state.field, 1, 0)
      };
    case "rotateClockwise":
      return {
        ...state,
        activePiece: rotateActivePiece(state.activePiece, state.field, 1)
      };
    case "rotateCounterClockwise":
      return {
        ...state,
        activePiece: rotateActivePiece(state.activePiece, state.field, -1)
      };
    case "lockActivePiece":
      return {
        ...state,
        activePiece: popNextActivePiece(),
        field: lockActivePiece(state.activePiece, state.field)
      };
    case "hardDrop":
      const droppedPiece = moveToGround(state.activePiece, state.field);
      return {
        ...state,
        activePiece: popNextActivePiece(),
        field: lockActivePiece(droppedPiece, state.field)
      };
    default:
      throw new Error("Invalid action type");
  }
};
