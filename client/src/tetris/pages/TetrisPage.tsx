import React from "react";

import styled from "styled-components";
import TetrisGameFrame from "../components/TetrisGameFrame";
import { TetrisFieldTile } from "../types";
import { tetrisReducer, popNextActivePiece } from "../reducers";
import * as constants from "../constants";
import { unstable_batchedUpdates } from "react-dom";
import * as _ from "lodash";

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

const TetrisPageDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  flex-wrap: wrap;
  background: black;
`;

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
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."]
  ];
  const {
    activePiece: initialActivePiece,
    nextPieces: initialBag
  } = popNextActivePiece([]);
  const [state, dispatch] = React.useReducer(tetrisReducer, {
    field: testField,
    hold: undefined,
    held: false,
    activePiece: initialActivePiece,
    nextPieces: initialBag
  });
  let clientID: string | undefined = undefined;

  React.useEffect(() => {
    // const socket = new WebSocket("ws://34.67.102.3:8080/socket");
    const socket = new WebSocket("ws://localhost:8080/socket");
    socket.onopen = () => {
      socket.onmessage = m => {
        console.log("got message", m);
        const parsedData = JSON.parse(m.data);
        // console.log("parsed data", _.cloneDeep(parsedData));
        if (parsedData.type && parsedData.type === "id") {
          console.log("Got client ID", parsedData.id);
          clientID = parsedData.id;
        } else {
          if (clientID) {
            const charMap = [".", "s", "z", "j", "l", "t", "o", "i"];
            const newState = parsedData[clientID];
            newState.field = newState.field.map((row: any) =>
              row.map((c: any) => charMap[c])
            );
            newState.activePiece.type = charMap[newState.activePiece.pieceType];
            newState.activePiece.position = [
              newState.activePiece.position.row,
              newState.activePiece.position.col
            ];
            newState.nextPieces = newState.nextPieces.map(
              (c: any) => charMap[c]
            );
            // console.log("modified", newState);
            dispatch({
              type: "replaceState",
              info: newState
            });
          }
        }
      };
    };

    const update = () => {
      unstable_batchedUpdates(() => {
        const time = Date.now();

        // dispatch({
        //   type: "tick",
        //   info: { softDrop: keyDown[keyBindings.softDrop] }
        // });

        const rightKey = keyDown[keyBindings.moveRight];
        if (
          rightKey &&
          time - rightKey.downTime >= constants.DAS &&
          time - rightKey.lastTriggered >= constants.ARR
        ) {
          socket.send(
            JSON.stringify({ playerID: clientID, command: 2, time: Date.now() })
          );
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
          socket.send(
            JSON.stringify({ playerID: clientID, command: 1, time: Date.now() })
          );
          if (leftKey.lastTriggered === leftKey.downTime) {
            leftKey.lastTriggered += constants.DAS;
          } else {
            leftKey.lastTriggered += constants.ARR;
          }
        }

        const downKey = keyDown[keyBindings.softDrop];
        if (downKey && time - downKey.lastTriggered >= constants.ARR) {
          socket.send(
            JSON.stringify({ playerID: clientID, command: 5, time: Date.now() })
          );
          downKey.lastTriggered += constants.ARR;
        }
      });

      window.requestAnimationFrame(update);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (keyDown[e.keyCode]) {
        return;
      }
      switch (e.keyCode) {
        case keyBindings.moveLeft:
          socket.send(
            JSON.stringify({ playerID: clientID, command: 1, time: Date.now() })
          );
          break;
        case keyBindings.moveRight:
          socket.send(
            JSON.stringify({ playerID: clientID, command: 2, time: Date.now() })
          );
          break;
        case keyBindings.rotateClockwise:
          socket.send(
            JSON.stringify({ playerID: clientID, command: 3, time: Date.now() })
          );
          break;
        case keyBindings.rotateCounterClockwise:
          socket.send(
            JSON.stringify({ playerID: clientID, command: 4, time: Date.now() })
          );
          break;
        case keyBindings.softDrop:
          socket.send(
            JSON.stringify({ playerID: clientID, command: 5, time: Date.now() })
          );
          break;
        // case keyBindings.hardDrop:
        //   dispatch({ type: "hardDrop" });
        //   break;
        // case keyBindings.hold:
        //   dispatch({ type: "hold" });
        //   break;
      }
      keyDown[e.keyCode] = { downTime: Date.now(), lastTriggered: Date.now() };
    };

    const onKeyUp = (e: KeyboardEvent) => {
      delete keyDown[e.keyCode];
    };

    window.requestAnimationFrame(update);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
  }, []);

  // console.log("state", state);

  return (
    <TetrisPageDiv>
      {new Array(1).fill(0).map((_a, i) => (
        <TetrisGameFrame
          key={i}
          field={state.field}
          activePiece={state.activePiece}
          hold={state.hold}
          nextPieces={state.nextPieces}
          held={state.held}
        ></TetrisGameFrame>
      ))}
    </TetrisPageDiv>
  );
};

export default TetrisPage;
