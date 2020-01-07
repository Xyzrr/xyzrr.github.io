import Env from "./Env";
import * as tf from "@tensorflow/tfjs";

export default class SnakeEnv implements Env {
  boardSize: number;
  foodReward: number;
  deathReward: number;

  player!: tf.Tensor2D;
  food!: tf.Tensor1D;

  constructor(boardSize = 9, foodReward = 2, deathReward = -1) {
    this.boardSize = boardSize;
    this.foodReward = foodReward;
    this.deathReward = deathReward;

    this.reset();
  }

  playerOnFood() {
    return (
      this.player
        .gather(this.player.shape[0])
        .equal(this.food)
        .sum()
        .bufferSync()
        .get(0) === 2
    );
  }

  playerOutOfBounds() {
    const buffer = this.player.bufferSync();
    const x = buffer.get(this.player.shape[0] - 1, 0);
    const y = buffer.get(this.player.shape[0] - 1, 1);
    const outOfBounds = !(
      0 <= x &&
      x < this.boardSize &&
      0 <= y &&
      y < this.boardSize
    );
    if (outOfBounds) {
      console.log("snake went out of bounds");
    }
    return outOfBounds;
  }

  collidedWithTail() {
    const [tail, head] = tf.split(this.player, [this.player.shape[0] - 1, 1]);
    const collidedWithTail =
      tf
        .sum(tail.equal(head), 1)
        .max()
        .bufferSync()
        .get(0) === 2;
    if (collidedWithTail) {
      console.log("snake collided with tail");
    }
    return collidedWithTail;
  }

  step(action: number) {
    if (action == null) {
      console.log("Error: action was undefined in SnakeEnv!", action);
    }

    const currentPosition = this.player.gather(this.player.shape[0] - 1);

    const actionUpdateMap = [
      tf.tensor1d([0, -1]),
      tf.tensor1d([1, 0]),
      tf.tensor1d([0, 1]),
      tf.tensor1d([-1, 0])
    ];

    const newPosition: tf.Tensor1D = currentPosition.add(
      actionUpdateMap[action]
    );

    this.player = this.player.concat(newPosition.reshape([1, 2]));

    let reward = 0;

    if (this.playerOnFood()) {
      reward = this.foodReward;
      this.randomizeFood();
    } else {
      const [, allButLast] = tf.split(this.player, [
        1,
        this.player.shape[0] - 1
      ]);
      this.player = allButLast;
    }

    let done = false;
    if (this.playerOutOfBounds() || this.collidedWithTail()) {
      done = true;
      reward = this.deathReward;
    }

    if (done) {
      return {
        newObservation: tf.zeros([this.boardSize, this.boardSize, 3]),
        reward,
        done
      };
    }

    return {
      newObservation: this.getObservation(),
      reward,
      done
    };
  }

  getObservation() {
    const foodEntry = this.food.reverse().concat(tf.tensor1d([0]));
    const playerEntries = this.player.reverse(1).concat(
      tf
        .fill([this.player.shape[0] - 1], 2)
        .concat(tf.tensor1d([1]))
        .reshape([this.player.shape[0], 1]),
      1
    );
    const updates = foodEntry.reshape([1, 3]).concat(playerEntries);
    const values = tf
      .tensor1d([1])
      .concat(tf.range(1, this.player.shape[0]))
      .concat(tf.tensor1d([1]));
    return tf.scatterND(updates, values, [this.boardSize, this.boardSize, 3]);
  }

  randomizeFood() {
    while (true) {
      this.food = tf.randomUniform([2], 0, this.boardSize, "int32");
      if (
        tf
          .sum(this.player.equal(this.food), 1)
          .max()
          .bufferSync()
          .get(0) !== 2
      ) {
        break;
      }
    }
  }

  reset() {
    this.player = tf.randomUniform([1, 2], 0, this.boardSize, "int32");
    this.randomizeFood();
    return this.getObservation();
  }
}
