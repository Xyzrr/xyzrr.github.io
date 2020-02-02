import { TetrisFieldTile, ActivePiece, Mino } from "./types";
import produce, { Draft } from "immer";
import {
  jsToGoPlayerState,
  goToJSPlayerState,
  clientID,
  PlayerInput,
  globals
} from "./pages/TetrisPage";
import * as _ from "lodash";

export interface TetrisPageState {
  serverState: ServerState;
  predictedStates: (PlayerState | null)[];
  inputHistory: PlayerInput[][];
}

export interface ServerState {
  playerStates: { [clientID: string]: PlayerState };
}

export interface PlayerState {
  field: TetrisFieldTile[][];
  hold?: Mino;
  held: boolean;
  activePiece?: ActivePiece;
  nextPieces: Mino[];
  time: number;
}

interface TetrisPageAction {
  type: string;
  info?: any;
}

const _tetrisReducer = (state: TetrisPageState, action: TetrisPageAction) => {
  switch (action.type) {
    case "reconcileServerState":
      console.log(
        "predictedStates",
        state.predictedStates.length,
        state.inputHistory.length
      );
      if (clientID == null) {
        throw "clientID is null when reconciling server state";
      }

      state.serverState = action.info.newState;
      if (state.serverState.playerStates == null) {
        throw `server state is malformed: ${state.serverState}`;
      }

      const newClientState = state.serverState.playerStates[clientID];
      if (newClientState == null) {
        break;
      }

      const actionTime = newClientState.time;

      if ((globals.frameStartTime - actionTime) % 17 !== 0) {
        throw `frameStartTime ${globals.frameStartTime} and server update time ${actionTime} misaligned`;
      }

      const replaceIndex =
        state.predictedStates.length -
        1 -
        (globals.frameStartTime - actionTime) / 17;

      if (replaceIndex < 0) {
        throw `Received server update from before the last update (index ${replaceIndex}); predictedStates is probably too short (length ${state.predictedStates.length}).`;
      }

      if (_.isEqual(state.predictedStates[replaceIndex], newClientState)) {
        console.log("Success: server state matches with client!");
        state.predictedStates = state.predictedStates.slice(replaceIndex);
        state.inputHistory = state.inputHistory.slice(replaceIndex);
        break;
      }

      console.log(
        "Server state",
        newClientState,
        "conflicts with client state",
        JSON.parse(JSON.stringify(state.predictedStates[replaceIndex])),
        ". Reconciling from index",
        replaceIndex,
        "to",
        state.predictedStates.length
      );

      state.inputHistory = state.inputHistory.slice(replaceIndex);
      let predictingTime = actionTime;
      state.predictedStates = [newClientState];
      for (const inputs of state.inputHistory) {
        predictingTime += 17;
        const lastPredictedState =
          state.predictedStates[state.predictedStates.length - 1];
        if (lastPredictedState == null) {
          throw `last predicted state was null while reconciling`;
        }
        // @ts-ignore
        const goResult = updateGame(
          JSON.stringify(jsToGoPlayerState(lastPredictedState)),
          JSON.stringify(inputs),
          predictingTime
        );
        const newPlayerState = goToJSPlayerState(JSON.parse(goResult));
        state.predictedStates.push(newPlayerState);
      }

      break;
    case "predictState":
      const lastPredictedState =
        state.predictedStates[state.predictedStates.length - 1];
      if (lastPredictedState == null) {
        state.predictedStates.push(null);
        state.inputHistory.push(action.info);
        break;
      }

      // @ts-ignore
      if (typeof updateGame == "undefined") {
        throw "updateGame not ready at first predict";
      }
      // @ts-ignore
      const goResult = updateGame(
        JSON.stringify(jsToGoPlayerState(lastPredictedState)),
        JSON.stringify(action.info),
        globals.frameStartTime.toString()
      );
      const newPlayerState = goToJSPlayerState(JSON.parse(goResult));

      console.log("inputs", action.info);
      state.predictedStates.push(newPlayerState);
      state.inputHistory.push(action.info);
      break;
    default:
      throw `Invalid action type`;
  }
};

const immerReducer = <S, A>(
  reducer: (state: Draft<S>, action: A) => void
): ((state: S, action: A) => S) => {
  return (state, action) =>
    produce(state, (draft: Draft<S>) => reducer(draft, action));
};

export const tetrisReducer = immerReducer<TetrisPageState, TetrisPageAction>(
  _tetrisReducer
);
