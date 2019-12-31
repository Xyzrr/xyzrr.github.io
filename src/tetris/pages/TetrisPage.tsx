import React from "react";

import styled from "styled-components";
import TetrisGameFrame from "../components/TetrisGameFrame";
import { TetrisFieldTile } from "../types";
import { tetrisReducer } from "../reducers";
import globals from "../globals";
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

const keyDown: {
  [key: string]: { downTime: number; lastTriggered: number };
} = {};

const TetrisPageDiv = styled.div``;

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

  const update = () => {
    const time = Date.now();
    if (time - globals.lastTick >= constants.TICK_DURATION) {
      dispatch({ type: "tick" });
      globals.lastTick += constants.TICK_DURATION;
    }

    const rightKey = keyDown[keyBindings.moveRight];
    if (
      rightKey &&
      time - rightKey.downTime >= constants.DAS &&
      time - rightKey.lastTriggered >= constants.ARR
    ) {
      dispatch({ type: "moveRight" });
      if (rightKey.lastTriggered === rightKey.downTime) {
        rightKey.lastTriggered += constants.DAS;
      } else {
        rightKey.lastTriggered += constants.ARR;
      }
    }

    const leftKey = keyDown[keyBindings.moveLeft];
    if (
      leftKey &&
      time - leftKey.downTime >= constants.DAS &&
      time - leftKey.lastTriggered >= constants.ARR
    ) {
      dispatch({ type: "moveLeft" });
      if (leftKey.lastTriggered === leftKey.downTime) {
        leftKey.lastTriggered += constants.DAS;
      } else {
        leftKey.lastTriggered += constants.ARR;
      }
    }

    if (
      globals.lockStartTime &&
      time - globals.lockStartTime >= constants.LOCK_DELAY
    ) {
      console.log(time, globals.lockStartTime);
      dispatch({ type: "lockActivePiece" });
      globals.lockStartTime = 0;
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
    keyDown[e.keyCode] = { downTime: Date.now(), lastTriggered: Date.now() };
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
