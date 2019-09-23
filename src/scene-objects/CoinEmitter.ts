import React from 'react';

import TWEEN from '@tweenjs/tween.js';

import * as colors from '../colors';
import Position from '../util/Position';
import SceneObject from './SceneObject';

interface Coin {
  position: Position;
  opacity: { val: number };
}

export default class CoinEmitter implements SceneObject {
  coins = new Set<Coin>();
  emit(start: Position, end: Position) {
    const coin: Coin = {
      position: start,
      opacity: { val: 0 }
    };
    this.coins.add(coin);
    new TWEEN.Tween(coin.position)
      .to(end, 300)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
    new TWEEN.Tween(coin.opacity)
      .to({ val: 0.6 }, 300)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
  }
  clear() {
    console.log("clear");
    this.coins.forEach(coin => {
      console.log("uhg");
      new TWEEN.Tween(coin.opacity)
        .to({ val: 0 }, 400)
        .onComplete(() => this.coins.delete(coin))
        .start();
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
