import React from "react";

import styled from "styled-components";
import TetrisGameFrame from "../components/TetrisGameFrame";
import { TetrisFieldTile, Mino, ActivePiece } from "../types";

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
        activePiece: { ...state.activePiece, y: state.activePiece.y + 1 }
      };
    case "moveLeft":
      return {
        ...state,
        activePiece: { ...state.activePiece, x: state.activePiece.x - 1 }
      };
    case "moveRight":
      return {
        ...state,
        activePiece: { ...state.activePiece, x: state.activePiece.x + 1 }
      };
    case "rotateClockwise":
      return {
        ...state,
        activePiece: {
          ...state.activePiece,
          orientation: (state.activePiece.orientation + 1) % 4
        }
      };
    case "rotateCounterClockwise":
      return {
        ...state,
        activePiece: {
          ...state.activePiece,
          orientation: (state.activePiece.orientation + 3) % 4
        }
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
