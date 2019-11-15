import TWEEN from "@tweenjs/tween.js";

import * as colors from "../colors";
import Position from "../util/Position";
import SceneObject from "./SceneObject";

interface Coin {
  position: Position;
  opacity: { val: number };
  fading: boolean;
}

export default class CoinEmitter implements SceneObject {
  coins = new Set<Coin>();
  emit(start: Position, end: Position, delay: number = 0) {
    const coin: Coin = {
      position: start,
      opacity: { val: 0 },
      fading: false
    };
    this.coins.add(coin);
    new TWEEN.Tween(coin.position)
      .delay(delay)
      .to(end, 200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
    new TWEEN.Tween(coin.opacity)
      .delay(delay)
      .to({ val: 0.8 }, 200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  }
  clear() {
    this.coins.forEach(coin => {
      if (!coin.fading) {
        new TWEEN.Tween(coin.opacity)
          .delay(250)
          .to({ val: 0 }, 400)
          .onComplete(() => this.coins.delete(coin))
          .start();
        coin.fading = true;
      }
    });
  }
  render(ctx: CanvasRenderingContext2D) {
    this.coins.forEach(coin => {
      ctx.beginPath();
      ctx.fillStyle = colors.QLearningColors.reward
        .fade(1 - coin.opacity.val)
        .toString();
      ctx.arc(coin.position.x, coin.position.y, 6, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
}
