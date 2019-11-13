import React from "react";
import styled from "styled-components";
import classNames from "classnames";
import SnakeEnv from "../envs/SnakeEnv";
import * as tf from "@tensorflow/tfjs";

const SnakeRendererDiv = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  .row {
    display: flex;
  }
  .cell {
    width: 60px;
    height: 60px;
    &.food {
      background: red;
    }
    &.snake {
      background: green;
    }
  }
`;

const a = new SnakeEnv();
const obs = a.getObservation();

const SnakeRenderer: React.FC = props => {
  const WORLD_SIZE = 8;
  let foodPosition = [0, 1];
  let snake = [
    [0, 2],
    [0, 3],
    [1, 3],
    [2, 3]
  ];
  const [observation, setObservation] = React.useState(obs);
  const [model, setModel] = React.useState<tf.LayersModel | null>(null);

  React.useEffect(() => {
    tf.loadLayersModel("/models/snake/model.json").then(m => {
      setModel(m);
    });
  }, []);

  React.useEffect(() => {
    setObservation(a.reset());
  }, []);

  window.setTimeout(() => {
    if (model) {
      const prediction = model.predict(
        observation.reshape([1, 9, 9, 3])
      ) as tf.Tensor;

      const action = (prediction.argMax(1).arraySync() as number[])[0];

      console.log("took action", action);
      const { newObservation, reward, done } = a.step(action);
      setObservation(newObservation);
    }
  }, 1000);

  const obsArray = observation.arraySync() as number[][][];

  return (
    <SnakeRendererDiv>
      {obsArray.map(row => (
        <div className="row">
          {row.map(cell => (
            <div
              className={classNames("cell", {
                food: cell[0] === 1,
                snake: cell[1] === 1
              })}
            ></div>
          ))}
        </div>
      ))}
    </SnakeRendererDiv>
  );
};

export default SnakeRenderer;
