import React from "react";
import styled from "styled-components";
import classNames from "classnames";
import SnakeEnv from "../envs/SnakeEnv";
import * as tf from "@tensorflow/tfjs";
import { green, red } from "../colors";
import * as _ from "lodash";
import { sleep } from "../util/helpers";

const SnakeRendererDiv = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: -1;
  .row {
    display: flex;
    height: 60px;
  }
  .cell {
    width: 60px;
    height: 100%;
    &.food {
      background: ${red.desaturate(0.3).hex()};
    }
    &.snake,
    &.tail {
      background: ${green.desaturate(0.5).hex()};
    }
  }
  @media (max-width: 768px) {
    width: 100%;
    .row {
      height: ${100 / 9}vw;
    }
    .cell {
      width: ${100 / 9}vw;
    }
  }
`;

const env = new SnakeEnv();
const obs = env.getObservation();

const snakeGlobals = {
  stopRunning: false,
  disableInput: false,
  modelUpdating: false
};

const SnakeRenderer: React.FC = props => {
  const [observation, setObservation] = React.useState(obs);
  const [totalReward, setTotalReward] = React.useState(0);

  async function updateModel(
    model: tf.LayersModel,
    obs: tf.Tensor,
    action: number,
    newObs: tf.Tensor,
    reward: number,
    done: boolean
  ) {
    // This is like a mutex lock, except it gives up if the thread is busy.
    // Also, it doesn't necessarily work; if two threads enter at exactly the
    // same time they may both go through. But it hasn't happened yet afaik.
    if (snakeGlobals.modelUpdating) {
      return;
    }
    snakeGlobals.modelUpdating = true;

    const prediction = model.predict(obs.reshape([1, 9, 9, 3])) as tf.Tensor;
    const nextRewardPrediction = model.predict(
      newObs.reshape([1, 9, 9, 3])
    ) as tf.Tensor;
    const targetActionScore =
      reward +
      (done ? 0 : 0.95 * (nextRewardPrediction.max().arraySync() as number));
    const label = prediction.bufferSync();
    label.set(targetActionScore, 0, action);
    await model.fit(obs.reshape([1, 9, 9, 3]), label.toTensor(), {
      epochs: 1
    });

    snakeGlobals.modelUpdating = false;
  }

  async function runModel(model: tf.LayersModel) {
    for (let i = 0; ; i++) {
      let done = false;
      let obs: tf.Tensor;
      if (i === 0) {
        obs = env.getObservation();
      } else {
        obs = env.reset();
      }
      while (!done) {
        if (snakeGlobals.stopRunning) {
          return;
        }
        const prediction = model.predict(
          obs.reshape([1, 9, 9, 3])
        ) as tf.Tensor;
        const action = (prediction.argMax(1).arraySync() as number[])[0];
        if (action == null) {
          // Sometimes action is undefined for some mysterious reason.
          // I'm hoping this can catch that one day.
          console.log("Error: action was undefined!", action);
          console.log("observation:");
          obs.print();
          console.log("prediction:");
          prediction.print();
          console.log("argmax:");
          console.log(prediction.argMax(1));
        }
        const { newObservation, reward, done: newDone } = env.step(action);
        setObservation(newObservation);
        setTotalReward(totalReward => totalReward + reward);

        await updateModel(model, obs, action, newObservation, reward, done);

        done = newDone;
        obs = newObservation;
        await sleep(300);
      }
    }
  }

  const runModelDebounced = _.debounce((model: tf.LayersModel) => {
    snakeGlobals.stopRunning = false;
    snakeGlobals.disableInput = false;
    runModel(model);
  }, 600);

  React.useEffect(() => {
    tf.loadLayersModel("/models/snake/model.json").then(model => {
      model.compile({ optimizer: "adam", loss: "meanSquaredError" });
      runModel(model);

      // TODO: cleanup this listener. Not sure how to because the listener
      // is a closure that takes in model.
      window.addEventListener("keydown", e => {
        if (snakeGlobals.disableInput) {
          return;
        }
        const obs = env.getObservation();
        const keyToActionMap: { [key: string]: number } = {
          ArrowUp: 0,
          ArrowRight: 1,
          ArrowDown: 2,
          ArrowLeft: 3
        };
        const action = keyToActionMap[e.key];
        const { newObservation, reward, done: newDone } = env.step(action);
        setObservation(newObservation);
        snakeGlobals.stopRunning = true;

        updateModel(model, obs, action, newObservation, reward, newDone);

        if (newDone) {
          snakeGlobals.disableInput = true;
          env.reset();
        }

        runModelDebounced(model);
      });
    });
  }, []);

  const obsArray = observation.arraySync() as number[][][];

  return (
    <SnakeRendererDiv>
      {obsArray.map((row, i) => (
        <div className="row" key={i}>
          {row.map((cell, i) => {
            const food = cell[0] === 1;
            const snake = cell[1] === 1;
            const tail = cell[2] > 0;
            return (
              <div
                key={i}
                className={classNames("cell", {
                  food,
                  snake,
                  tail
                })}
                style={{
                  opacity: food
                    ? 0.3
                    : snake
                    ? 0.4
                    : tail
                    ? 0.1 + (0.3 * (cell[2] - 1)) / (env.player.shape[0] - 1)
                    : 0
                }}
              ></div>
            );
          })}
        </div>
      ))}
    </SnakeRendererDiv>
  );
};

export default SnakeRenderer;
