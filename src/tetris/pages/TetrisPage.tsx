import React from "react";

import styled from "styled-components";
import TetrisGameFrame from "../components/TetrisGameFrame";
import { TetrisFieldTile, Mino, ActivePiece } from "../types";
import tetrominos from "../tetrominos";
import * as constants from "../constants";

const keyBindings = {
  moveLeft: 37,
  moveRight: 39,
  rotateClockwise: 38,
  rotateCounterClockwise: 90,
  softDrop: 40,
  hardDrop: 32,
  hold: 67
};

const globals = {
  lastTick: 0
};

const keyDown: { [key: string]: number } = {};

const TetrisPageDiv = styled.div``;

const colliding = (activePiece: ActivePiece, field: TetrisFieldTile[][]) => {
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
  const newActivePiece = {
    ...activePiece,
    x: activePiece.x + deltaX,
    y: activePiece.y + deltaY
  };
  if (colliding(newActivePiece, field)) {
    return activePiece;
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
    if (!colliding(testPiece, field)) {
      newActivePiece = testPiece;
      break;
    }
  }

  return newActivePiece;
};

interface TetrisPageState {
  field: TetrisFieldTile[][];
  activePiece: ActivePiece;
}

interface TetrisPageAction {
  type: string;
}

const tetrisReducer: React.Reducer<TetrisPageState, TetrisPageAction> = (
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
    default:
      throw new Error("Invalid action type");
  }
};

const TetrisPage: React.FC = () => {
  const testField: TetrisFieldTile[][] = [
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", "s", "s", ".", ".", ".", ".", "."],
    ["z", "z", "s", "s", ".", ".", ".", ".", ".", "."],
    [".", "z", "z", ".", ".", ".", ".", ".", ".", "."]
  ];
  const [state, dispatch] = React.useReducer(tetrisReducer, {
    field: testField,
    activePiece: {
      x: 0,
      y: 21,
      type: "j",
      orientation: 1
    }
  });
  const tickDuration = 200;
  const DAS = 117;
  const ARR = 51;

  const update = () => {
    const time = Date.now();
    if (time - globals.lastTick >= tickDuration) {
      dispatch({ type: "tick" });
      globals.lastTick += tickDuration;
    }
    window.requestAnimationFrame(update);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (keyDown[e.keyCode]) {
      return;
    }
    switch (e.keyCode) {
      case keyBindings.moveLeft:
        dispatch({ type: "moveLeft" });
        break;
      case keyBindings.moveRight:
        dispatch({ type: "moveRight" });
        break;
      case keyBindings.rotateClockwise:
        dispatch({ type: "rotateClockwise" });
        break;
      case keyBindings.rotateCounterClockwise:
        dispatch({ type: "rotateCounterClockwise" });
        break;
    }
    keyDown[e.keyCode] = Date.now();
  };

  const onKeyUp = (e: KeyboardEvent) => {
    delete keyDown[e.keyCode];
  };

  React.useEffect(() => {
    globals.lastTick = Date.now();
    window.requestAnimationFrame(update);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
  }, []);

  return (
    <TetrisPageDiv>
      <TetrisGameFrame
        field={state.field}
        activePiece={state.activePiece}
      ></TetrisGameFrame>
    </TetrisPageDiv>
  );
};

export default TetrisPage;
