import Color from "color";

export const darkGray = Color.rgb(10, 10, 10);
export const gray = Color.rgb(110, 110, 110);
export const lightGray = Color.rgb(200, 200, 200);
export const veryLightGray = Color.rgb(224, 224, 224);
export const green = Color.rgb(186, 200, 146);
export const darkGreen = Color.rgb(78, 201, 176);
export const blue = Color.rgb(156, 220, 254);
export const darkBlue = Color.rgb(86, 156, 214);
export const red = Color.rgb(250, 138, 84);
export const purple = Color.rgb(197, 134, 192);
export const yellow = Color.rgb(220, 220, 170);
export const brown = Color.rgb(206, 145, 120);

export const bgBrown = Color.rgb(54, 36, 17);
export const bgGreen = Color.rgb(17, 54, 31);

export const QLearningColors = {
  state: purple,
  nextState: darkBlue,
  reward: yellow,
  action: brown,
  nextAction: darkGreen,
  currentQ: bgBrown,
  nextQ: bgGreen
};

export const TetrisColors = {
  green,
  blue,
  red
};
