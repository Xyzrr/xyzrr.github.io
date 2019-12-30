import React from "react";

import styled from "styled-components";
import TetrisGameFrame from "../components/TetrisGameFrame";
import { TetrisFieldTile, Mino, ActivePiece } from "../types";
import tetrominos from "../tetromino";
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
  let newActivePiece: ActivePiece;
  switch (action.type) {
    case "tick":
      newActivePiece = {
        ...state.activePiece,
        y: state.activePiece.y + 1
      };
      if (colliding(newActivePiece, state.field)) {
        return state;
      }
      return {
        ...state,
        activePiece: newActivePiece
      };
    case "moveLeft":
      newActivePiece = {
        ...state.activePiece,
        x: state.activePiece.x - 1
      };
      if (colliding(newActivePiece, state.field)) {
        return state;
      }
      return {
        ...state,
        activePiece: newActivePiece
      };
    case "moveRight":
      newActivePiece = { ...state.activePiece, x: state.activePiece.x + 1 };
      if (colliding(newActivePiece, state.field)) {
        return state;
      }
      return {
        ...state,
        activePiece: newActivePiece
      };
    case "rotateClockwise":
      newActivePiece = {
        ...state.activePiece,
        orientation: (state.activePiece.orientation + 1) % 4
      };
      if (colliding(newActivePiece, state.field)) {
        return state;
      }
      return {
        ...state,
        activePiece: newActivePiece
      };
    case "rotateCounterClockwise":
      newActivePiece = {
        ...state.activePiece,
        orientation: (state.activePiece.orientation + 3) % 4
      };
      if (colliding(newActivePiece, state.field)) {
        return state;
      }
      return {
        ...state,
        activePiece: newActivePiece
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
