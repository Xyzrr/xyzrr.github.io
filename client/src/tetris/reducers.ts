import { TetrisFieldTile, ActivePiece, Mino } from "./types";
import produce, { Draft } from "immer";
import {
  jsToGoPlayerState,
  goToJSPlayerState,
  clientID,
  playerInputs
} from "./pages/TetrisPage";
import * as _ from "lodash";

export interface TetrisPageState {
  serverState: ServerState;
  predictedStates: PlayerState[];
}

export interface ServerState {
  [clientID: string]: PlayerState;
}

export interface PlayerState {
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

const _tetrisReducer = (state: TetrisPageState, action: TetrisPageAction) => {
  switch (action.type) {
    case "reconcileServerState":
      if (clientID) {
        state.serverState = action.info;
        state.predictedStates = [action.info[clientID]];
      }
      break;
    case "predictState":
      if (
        clientID &&
        state.serverState[clientID] &&
        // @ts-ignore
        typeof updateGame !== "undefined"
      ) {
        // @ts-ignore
        const goResult = updateGame(
          JSON.stringify(
            jsToGoPlayerState(
              state.predictedStates[state.predictedStates.length - 1]
            )
          ),
          JSON.stringify(playerInputs)
        );
        const newPlayerState = goToJSPlayerState(JSON.parse(goResult));
        state.predictedStates.push(newPlayerState);
      }
      break;
    default:
      throw new Error("Invalid action type");
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
