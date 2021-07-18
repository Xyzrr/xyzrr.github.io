import TWEEN from "@tweenjs/tween.js";
import React, { useRef } from "react";

import styled from "styled-components";
import * as constants from "../constants";
import * as _ from "lodash";
import produce from "immer";
import "../wasm_exec";
import useWindowSize from "../../common/util/useWindowSize";
import { resizeCanvas } from "../../common/util/helpers";
import {
  EverythingState,
  ServerState,
  PlayerState,
  PlayerInput,
} from "../types";
import Renderer from "../Renderer";

const keyBindings = {
  moveLeft: 37,
  moveRight: 39,
  rotateClockwise: 38,
  rotateCounterClockwise: 90,
  softDrop: 40,
  hardDrop: 32,
  hold: 67,
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

export let playerInputs: PlayerInput[] = [];

async function startLocalGameEngine() {
  // @ts-ignore
  const go = new Go();
  console.log("fetching go");
  // @ts-ignore
  let { instance } = await WebAssembly.instantiateStreaming(
    fetch("main.wasm"),
    go.importObject
  );
  console.log("finished fetching");
  await go.run(instance);
  console.log("go program halted");
}

//TODO: fix types
const goToJSState = (s: any) => {
  return produce(s, (draft: any) => {
    for (const clientID of Object.keys(s.playerStates)) {
      draft.playerStates[clientID] = goToJSPlayerState(
        s.playerStates[clientID]
      );
    }
  }) as any;
};

export const goToJSPlayerState = (s: any) => {
  return {
    ...s,
    activePiece: {
      ...s.activePiece,
      position: [s.activePiece.position.row, s.activePiece.position.col],
    },
  } as PlayerState;
};

export const jsToGoPlayerState = (s: PlayerState) => {
  return {
    ...s,
    activePiece: s.activePiece
      ? {
          ...s.activePiece,
          position: {
            row: s.activePiece.position[0],
            col: s.activePiece.position[1],
          },
        }
      : undefined,
  };
};

const reconcileServerState = (
  everything: EverythingState,
  newState: ServerState
) => {
  if (everything.clientID == null) {
    throw new Error("clientID is null when reconciling server state");
  }

  if (newState.playerStates == null) {
    throw new Error(`server state is malformed: ${newState.playerStates}`);
  }
  everything.serverState = newState;

  const newClientState =
    everything.serverState.playerStates[everything.clientID];
  if (newClientState == null) {
    return;
  }

  const time = newClientState.time;

  if ((everything.frameStartTime - time) % 17 !== 0) {
    throw new Error(
      `frameStartTime ${everything.frameStartTime} and server update time ${time} misaligned`
    );
  }

  const replaceIndex =
    everything.predictedStates.length -
    1 -
    (everything.frameStartTime - time) / 17;

  if (replaceIndex < 0) {
    throw new Error(
      `Received server update from before the last update (index ${replaceIndex}); predictedStates is probably too short (length ${everything.predictedStates.length}).`
    );
  }

  if (replaceIndex >= everything.predictedStates.length) {
    console.log(
      `Received server update from the future (index ${replaceIndex}); predictedStates is probably lagging behind (length ${everything.predictedStates.length}). Dropping update.`
    );
    return;
  }

  if (_.isEqual(everything.predictedStates[replaceIndex], newClientState)) {
    console.log(
      `Success: server state matches with client! Slicing predictedStates from index ${replaceIndex} to ${everything.predictedStates.length}`
    );
    everything.predictedStates = everything.predictedStates.slice(replaceIndex);
    everything.inputHistory = everything.inputHistory.slice(replaceIndex);
    return;
  }

  console.log(
    "stringified predicted states",
    JSON.stringify(everything.predictedStates)
  );

  console.log(
    "Server state",
    newClientState,
    "conflicts with client state",
    JSON.parse(JSON.stringify(everything.predictedStates[replaceIndex])),
    ". Reconciling from index",
    replaceIndex,
    "to",
    everything.predictedStates.length
  );

  everything.inputHistory = everything.inputHistory.slice(replaceIndex);
  let predictingTime = time;
  everything.predictedStates = [newClientState];

  for (const inputs of everything.inputHistory) {
    predictingTime += 17;
    const lastPredictedState =
      everything.predictedStates[everything.predictedStates.length - 1];
    if (lastPredictedState == null) {
      throw new Error(`last predicted state was null while reconciling`);
    }

    // @ts-ignore
    if (typeof updateGame == "undefined") {
      console.log(
        "updateGame not ready at first reconciliation, pushing duplicated server state for now"
      );
      everything.predictedStates.push(lastPredictedState);
      continue;
    }

    // @ts-ignore
    const goResult = updateGame(
      JSON.stringify(jsToGoPlayerState(lastPredictedState)),
      JSON.stringify(inputs),
      predictingTime
    );
    const newPlayerState = goToJSPlayerState(JSON.parse(goResult));
    everything.predictedStates.push(newPlayerState);
  }
};

const predictState = (everything: EverythingState, inputs: PlayerInput[]) => {
  const lastPredictedState =
    everything.predictedStates[everything.predictedStates.length - 1];

  // @ts-ignore
  if (lastPredictedState == null || typeof updateGame == "undefined") {
    everything.predictedStates.push(lastPredictedState);
    everything.inputHistory.push(inputs);
    return;
  }

  // @ts-ignore
  const goResult = updateGame(
    JSON.stringify(jsToGoPlayerState(lastPredictedState)),
    JSON.stringify(inputs),
    everything.frameStartTime.toString()
  );
  const newPlayerState = goToJSPlayerState(JSON.parse(goResult));

  console.log("inputs", inputs);
  everything.predictedStates.push(newPlayerState);
  everything.inputHistory.push(inputs);
};

const TetrisPage: React.FC = (props) => {
  const everythingState = useRef<EverythingState>({
    serverState: { playerStates: {} },
    predictedStates: [null],
    inputHistory: [],
    actionIndex: 0,
    clientID: undefined,
    frameStartTime: 0,
    serverTimeOffset: 0,
  });
  const renderer = React.useRef<Renderer | null>(null);
  const windowSize = useWindowSize();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (renderer.current == null && canvasRef.current != null) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        renderer.current = new Renderer(ctx);
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (keyDown[e.keyCode]) {
        return;
      }
      switch (e.keyCode) {
        case keyBindings.moveLeft:
          sendInput(1);
          break;
        case keyBindings.moveRight:
          sendInput(2);
          break;
        case keyBindings.rotateClockwise:
          sendInput(3);
          break;
        case keyBindings.rotateCounterClockwise:
          sendInput(4);
          break;
        case keyBindings.softDrop:
          sendInput(5);
          break;
        case keyBindings.hardDrop:
          sendInput(6);
          break;
        case keyBindings.hold:
          sendInput(7);
          break;
      }
      keyDown[e.keyCode] = { downTime: Date.now(), lastTriggered: Date.now() };
    };

    const onKeyUp = (e: KeyboardEvent) => {
      delete keyDown[e.keyCode];
    };

    startLocalGameEngine();
    const socket = new WebSocket("wss://tetris-io.herokuapp.com/socket");
    // const socket = new WebSocket("ws://34.67.102.3:8080/socket");
    // const socket = new WebSocket("ws://localhost:8080/socket");
    socket.onopen = () => {
      socket.onmessage = (m) => {
        console.log("got message", m);

        let parsedData = JSON.parse(m.data);

        if (parsedData.messageType && parsedData.messageType === "id") {
          console.log("Got client ID", parsedData.id);
          everythingState.current.clientID = parsedData.id;
          everythingState.current.frameStartTime = parsedData.time;
          everythingState.current.serverTimeOffset =
            Date.now() - everythingState.current.frameStartTime;

          window.setTimeout(update, 17);
          window.addEventListener("keydown", onKeyDown);
          window.addEventListener("keyup", onKeyUp);
        } else {
          let { newState } = parsedData;
          newState = goToJSState(newState);
          reconcileServerState(everythingState.current, newState);
          if (renderer.current && everythingState.current.clientID) {
            renderer.current.updateFromServer(
              everythingState.current.serverState,
              everythingState.current.clientID
            );
          }
        }
      };
    };

    const sendInput = (command: number) => {
      const clientPlayerInput = {
        time: everythingState.current.frameStartTime,
        command,
        index: everythingState.current.actionIndex,
      };
      playerInputs.push(clientPlayerInput);
      everythingState.current.actionIndex++;

      const serverPlayerInput = {
        playerID: everythingState.current.clientID,
        ...clientPlayerInput,
      };
      const SIMULATE_POOR_CONNECTION = false;
      if (SIMULATE_POOR_CONNECTION) {
        window.setTimeout(() => {
          socket.send(JSON.stringify(serverPlayerInput));
        }, 500);
      } else {
        socket.send(JSON.stringify(serverPlayerInput));
      }
    };

    const update = () => {
      everythingState.current.frameStartTime += 17;

      predictState(everythingState.current, playerInputs);
      if (renderer.current && everythingState.current.clientID) {
        renderer.current.updateFromPrediction(
          everythingState.current.predictedStates[
            everythingState.current.predictedStates.length - 1
          ]
        );
      }

      playerInputs = [];

      const time = Date.now();

      const rightKey = keyDown[keyBindings.moveRight];
      if (
        rightKey &&
        time - rightKey.downTime >= constants.DAS &&
        time - rightKey.lastTriggered >= constants.ARR
      ) {
        sendInput(2);
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
        sendInput(1);
        if (leftKey.lastTriggered === leftKey.downTime) {
          leftKey.lastTriggered += constants.DAS;
        } else {
          leftKey.lastTriggered += constants.ARR;
        }
      }

      const downKey = keyDown[keyBindings.softDrop];
      if (downKey && time - downKey.lastTriggered >= constants.ARR) {
        sendInput(5);
        downKey.lastTriggered += constants.ARR;
      }

      const msUntilNextUpdate =
        everythingState.current.frameStartTime +
        17 -
        (Date.now() - everythingState.current.serverTimeOffset);
      window.setTimeout(update, msUntilNextUpdate);
    };

    function animate(time: number) {
      requestAnimationFrame(animate);
      TWEEN.update(time);
      if (renderer.current) {
        renderer.current.renderEverything();
      }
    }
    requestAnimationFrame(animate);
  }, []);

  React.useEffect(() => {
    if (windowSize.width && windowSize.height) {
      resizeCanvas(canvasRef, windowSize.width, windowSize.height);
    }
  }, [windowSize]);

  return (
    <TetrisPageDiv>
      <canvas
        style={{
          width: "100%",
          height: "100%",
          background: "black",
        }}
        ref={canvasRef}
      />
    </TetrisPageDiv>
  );
};

export default TetrisPage;
