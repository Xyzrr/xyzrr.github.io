import { TetrisFieldTile, ActivePiece, Mino } from "./types";
import tetrominos from "./tetrominos";
import * as constants from "./constants";
import { randInt } from "../util/helpers";
import * as _ from "lodash";

const addCoords = (a: [number, number], b: [number, number]) => {
  const result: [number, number] = [a[0] + b[0], a[1] + b[1]];
  return result;
};

const subtractCoords = (a: [number, number], b: [number, number]) =>
  addCoords(a, [-b[0], -b[1]]);

const translate = (activePiece: ActivePiece, translation: [number, number]) => {
  return {
    ...activePiece,
    position: addCoords(activePiece.position, translation)
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
  const newActivePiece = { ...activePiece };
  if (onGround) {
    if (activePiece.lockStartTime === 0 || breakLock) {
      newActivePiece.lockStartTime = Date.now();
    }
    newActivePiece.lastFallTime = 0;
  } else {
    newActivePiece.lockStartTime = 0;
    if (activePiece.lastFallTime === 0) {
      newActivePiece.lastFallTime = Date.now();
    }
  }
  return newActivePiece;
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
    const pos = addCoords(activePiece.position, coord);
    if (
      pos[0] < 0 ||
      pos[0] >= constants.MATRIX_ROWS ||
      pos[1] < 0 ||
      pos[1] >= constants.MATRIX_COLS ||
      field[pos[0]][pos[1]] !== "."
    ) {
      return true;
    }
  }
  return false;
};

const attemptMoveActivePiece = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][],
  translation: [number, number]
) => {
  let newActivePiece = translate(activePiece, translation);
  const colliding = activePieceIsColliding(newActivePiece, field);
  if (colliding) {
    newActivePiece = activePiece;
  }
  newActivePiece = startLockingIfOnGround(newActivePiece, field, !colliding);
  return newActivePiece;
};

const attemptRotateActivePiece = (
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
  newActivePiece = startLockingIfOnGround(newActivePiece, field, true);

  return newActivePiece;
};

export const getInitialActivePieceState = (type?: Mino) => {
  if (!type) {
    return undefined;
  }
  return {
    type: type,
    position: constants.START_POSITION,
    orientation: 0,
    lastFallTime: Date.now(),
    lockStartTime: 0
  };
};

export const popNextActivePiece = (nextPieces: Mino[]) => {
  let newNextPieces = _.clone(nextPieces);
  if (newNextPieces.length < 7) {
    newNextPieces = newNextPieces.concat(generateRandomBag());
  }
  const nextPieceType = newNextPieces.shift();
  return {
    activePiece: getInitialActivePieceState(nextPieceType),
    nextPieces: newNextPieces
  };
};

const checkForClears = (
  activePiece: ActivePiece,
  oldField: TetrisFieldTile[][],
  newField: TetrisFieldTile[][]
) => {
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
    const pos = addCoords(activePiece.position, coord);
    newField[pos[0]][pos[1]] = activePiece.type;
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

export const generateRandomBag = () => {
  const bag: Mino[] = ["z", "s", "l", "j", "t", "o", "i"];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};

export const tick = (
  activePiece: ActivePiece,
  field: TetrisFieldTile[][],
  nextPieces: Mino[],
  held: boolean,
  softDrop: boolean
) => {
  let newActivePiece: ActivePiece | undefined = activePiece;
  let newNextPieces = nextPieces;
  let newField = field;
  let newHeld = held;

  const time = Date.now();

  // handle falling
  const dropSpeed = softDrop
    ? constants.SOFT_DROP_SPEED
    : constants.TICK_DURATION;
  if (
    activePiece.lastFallTime &&
    time - activePiece.lastFallTime >= dropSpeed
  ) {
    newActivePiece = {
      ...attemptMoveActivePiece(activePiece, field, [1, 0]),
      lastFallTime: activePiece.lastFallTime + dropSpeed
    };
  }

  // handle locking
  if (
    activePiece.lockStartTime &&
    time - activePiece.lockStartTime >= constants.LOCK_DELAY
  ) {
    const {
      activePiece: poppedActivePiece,
      nextPieces: poppedNextPieces
    } = popNextActivePiece(nextPieces);
    newActivePiece = poppedActivePiece;
    newNextPieces = poppedNextPieces;
    newField = lockActivePiece(activePiece, field);
    newHeld = false;
  }

  return {
    activePiece: newActivePiece,
    field: newField,
    nextPieces: newNextPieces,
    held: newHeld
  };
};

interface TetrisPageState {
  field: TetrisFieldTile[][];
  hold?: Mino;
  held: boolean;
  activePiece?: ActivePiece;
  nextPieces: Mino[];
}

interface TetrisPageAction {
  type: string;
  info?: any;
}

export const tetrisReducer: React.Reducer<TetrisPageState, TetrisPageAction> = (
  state,
  action
) => {
  if (!state.activePiece) {
    return state;
  }
  switch (action.type) {
    case "tick":
      return {
        ...state,
        ...tick(
          state.activePiece,
          state.field,
          state.nextPieces,
          state.held,
          action.info.softDrop
        )
      };
    case "moveLeft":
      return {
        ...state,
        activePiece: attemptMoveActivePiece(state.activePiece, state.field, [
          0,
          -1
        ])
      };
    case "moveRight":
      return {
        ...state,
        activePiece: attemptMoveActivePiece(state.activePiece, state.field, [
          0,
          1
        ])
      };
    case "rotateClockwise":
      return {
        ...state,
        activePiece: attemptRotateActivePiece(state.activePiece, state.field, 1)
      };
    case "rotateCounterClockwise":
      return {
        ...state,
        activePiece: attemptRotateActivePiece(
          state.activePiece,
          state.field,
          -1
        )
      };
    case "hardDrop":
      const droppedPiece = moveToGround(state.activePiece, state.field);
      return {
        ...state,
        ...popNextActivePiece(state.nextPieces),
        field: lockActivePiece(droppedPiece, state.field),
        held: false
      };
    case "hold":
      if (state.held) {
        return state;
      }
      if (state.hold) {
        return {
          ...state,
          activePiece: getInitialActivePieceState(state.hold),
          hold: state.activePiece.type,
          held: true
        };
      } else {
        return {
          ...state,
          ...popNextActivePiece(state.nextPieces),
          hold: state.activePiece.type,
          held: true
        };
      }
    case "replaceState":
      return action.info;
    default:
      throw new Error("Invalid action type");
  }
};
