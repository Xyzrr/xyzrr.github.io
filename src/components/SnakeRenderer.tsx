import React from "react";
import styled from "styled-components";
import classNames from "classnames";
import SnakeEnv from "../envs/SnakeEnv";

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
const obs = a.getObservation().arraySync() as number[][][];

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

  // window.setTimeout(() => {
  //   a.randomizeFood();
  //   setObservation(a.getObservation().arraySync() as number[][][]);
  // }, 1000);

  return (
    <SnakeRendererDiv>
      {observation.map(row => (
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
