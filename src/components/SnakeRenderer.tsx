import React from "react";
import styled from "styled-components";
import classNames from "classnames";
import SnakeEnv from "../envs/SnakeEnv";
import * as tf from "@tensorflow/tfjs";
import { green, red } from "../colors";

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

const SnakeRenderer: React.FC = props => {
  const [observation, setObservation] = React.useState(obs);
  const [totalReward, setTotalReward] = React.useState(0);

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function runModel(model: tf.LayersModel) {
    while (true) {
      let done = false;
      let obs = env.reset();
      while (!done) {
        const prediction = model.predict(
          obs.reshape([1, 9, 9, 3])
        ) as tf.Tensor;
        const action = (prediction.argMax(1).arraySync() as number[])[0];
        const { newObservation, reward, done: newDone } = env.step(action);

        const nextRewardPrediction = model.predict(
          newObservation.reshape([1, 9, 9, 3])
        ) as tf.Tensor;
        const targetActionScore =
          reward +
          (done
            ? 0
            : 0.95 * (nextRewardPrediction.max().arraySync() as number));
        setTotalReward(totalReward => totalReward + reward);
        const label = prediction.bufferSync();
        prediction.print();
        label.set(targetActionScore, 0, action);
        label.toTensor().print();
        await model.fit(obs.reshape([1, 9, 9, 3]), label.toTensor(), {
          epochs: 1
        });

        done = newDone;
        obs = newObservation;
        setObservation(newObservation);
        await sleep(300);
      }
    }
  }

  React.useEffect(() => {
    tf.loadLayersModel("/models/snake/model.json").then(model => {
      model.compile({ optimizer: "adam", loss: "meanSquaredError" });
      runModel(model);
    });
  }, []);

  React.useEffect(() => {}, []);

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
