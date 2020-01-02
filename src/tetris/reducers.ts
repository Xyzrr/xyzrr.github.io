import { TetrisFieldTile, ActivePiece, Mino } from "./types";
import tetrominos from "./tetrominos";
import * as constants from "./constants";
import globals from "./globals";
import { randInt } from "../util/helpers";
import * as _ from "lodash";

const translate = (activePiece: ActivePiece, translation: [number, number]) => {
  const newPosition: [number, number] = [
    activePiece.position[0] + translation[0],
    activePiece.position[1] + translation[1]
  ];
  return {
    ...activePiece,
    position: newPosition
  };
};

const rotate = (activePiece: ActivePiece, rotation: number) => {
  return {
    ...activePiece,
    orientation: (activePiece.orientation + rotation + 4) % 4
  };
};

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
) => activePieceIsColliding(translate(activePiece, [1, 0]), field);

const activePieceIsColliding = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][]
) => {
  const tetromino = tetrominos[activePiece.type];
  const minos = tetromino.minos[activePiece.orientation];

  for (const coord of minos) {
    const row = activePiece.position[0] + coord[0];
    const col = activePiece.position[1] + coord[1];
    if (
      row < 0 ||
      row >= constants.MATRIX_ROWS ||
      col < 0 ||
      col >= constants.MATRIX_COLS ||
      field[row][col] !== "."
    ) {
      return true;
    }
  }
  return false;
};

const moveActivePiece = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][],
  translation: [number, number]
) => {
  let newActivePiece = translate(activePiece, translation);
  if (activePieceIsColliding(newActivePiece, field)) {
    newActivePiece = activePiece;
  }
  // Don't break lock for vertical movements
  startLockingIfOnGround(newActivePiece, field, translation[1] !== 0);
  return newActivePiece;
};

const subtractCoords = (a: [number, number], b: [number, number]) => {
  const result: [number, number] = [a[0] - b[0], a[1] - b[1]];
  return result;
};

const rotateActivePiece = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][],
  dir: number
) => {
  let newActivePiece = activePiece;

  const tetromino = tetrominos[activePiece.type];
  const rotatedPiece = rotate(activePiece, dir);
  const beforeOffsets = tetromino.offsets[activePiece.orientation];
  const afterOffsets = tetromino.offsets[rotatedPiece.orientation];
  for (let i = 0; i < tetromino.offsets[0].length; i++) {
    const testPiece = translate(
      rotatedPiece,
      subtractCoords(beforeOffsets[i], afterOffsets[i])
    );
    if (!activePieceIsColliding(testPiece, field)) {
      newActivePiece = testPiece;
      break;
    }
  }
  startLockingIfOnGround(activePiece, field, true);

  return newActivePiece;
};

const getInitialActivePieceState = (type: Mino) => {
  return {
    type: type,
    position: constants.START_POSITION,
    orientation: 0
  };
};

const popNextActivePiece = () => {
  const choices = ["z", "s", "j", "l", "o", "i", "t"];
  const chosen = choices[randInt(0, choices.length)] as Mino;
  return getInitialActivePieceState(chosen);
};

const checkForClears = (
  activePiece: ActivePiece,
  oldField: TetrisFieldTile[][],
  newField: TetrisFieldTile[][]
) => {
  const tetromino = tetrominos[activePiece.type];
  const minos = tetromino.minos[activePiece.orientation];
  let linesCleared = 0;
  const clearedField = _.cloneDeep(newField);
  for (let i = 0; i < 5; i++) {
    if (
      activePiece.position[0] + i < constants.MATRIX_ROWS &&
      !newField[i + activePiece.position[0]].includes(".")
    ) {
      clearedField.splice(activePiece.position[0] + i, 1);
      clearedField.unshift(_.fill(new Array(constants.MATRIX_COLS), "."));
      linesCleared++;
    }
  }
  let spin = false;
  if (
    linesCleared &&
    activePieceIsColliding(translate(activePiece, [0, -1]), oldField) &&
    activePieceIsColliding(translate(activePiece, [0, 1]), oldField) &&
    activePieceIsColliding(translate(activePiece, [-1, 0]), oldField)
  ) {
    spin = true;
  }
  console.log(
    `Cleared ${linesCleared} lines` +
      (spin ? ` with a ${activePiece.type} spin` : "")
  );
  return clearedField;
};

const lockActivePiece = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][]
) => {
  const tetromino = tetrominos[activePiece.type];
  const minos = tetromino.minos[activePiece.orientation];
  let newField = _.cloneDeep(field);
  for (const coord of minos) {
    newField[activePiece.position[0] + coord[0]][
      activePiece.position[1] + coord[1]
    ] = activePiece.type;
  }
  newField = checkForClears(activePiece, field, newField);
  return newField;
};

export const moveToGround = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][]
) => {
  let testShift = 0;
  while (
    !activePieceIsOnGround(translate(activePiece, [testShift, 0]), field)
  ) {
    testShift++;
  }
  return translate(activePiece, [testShift, 0]);
};

interface TetrisPageState {
  field: TetrisFieldTile[][];
  hold?: Mino;
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
        activePiece: moveActivePiece(state.activePiece, state.field, [1, 0])
      };
    case "moveLeft":
      return {
        ...state,
        activePiece: moveActivePiece(state.activePiece, state.field, [0, -1])
      };
    case "moveRight":
      return {
        ...state,
        activePiece: moveActivePiece(state.activePiece, state.field, [0, 1])
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
    case "hold":
      if (state.hold) {
        return {
          ...state,
          activePiece: getInitialActivePieceState(state.hold),
          hold: state.activePiece.type
        };
      } else {
        return {
          ...state,
          activePiece: popNextActivePiece(),
          hold: state.activePiece.type
        };
      }
    default:
      throw new Error("Invalid action type");
  }
};
