import Color from 'color';

export const darkGray = Color.rgb(30, 30, 30);
export const gray = Color.rgb(110, 110, 110);
export const lightGray = Color.rgb(212, 212, 212);
export const veryLightGray = Color.rgb(224, 224, 224);
export const green = Color.rgb(186, 200, 146);
export const darkGreen = Color.rgb(78, 201, 176);
export const blue = Color.rgb(156, 220, 254);
export const darkBlue = Color.rgb(86, 156, 214);
export const red = Color.rgb(250, 138, 84);
export const purple = Color.rgb(197, 134, 192);
export const yellow = Color.rgb(220, 220, 170);
export const brown = Color.rgb(206, 145, 120);

export const bgBrown = Color.rgb(69, 55, 21);
export const bgGreen = Color.rgb(21, 69, 55);

export const QLearningColors = {
  state: purple,
  nextState: darkBlue,
  reward: yellow,
  action: brown,
  nextAction: darkGreen,
  currentQ: bgBrown,
  nextQ: bgGreen
};
