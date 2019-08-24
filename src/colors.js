export const darkGray = "rgb(50, 50, 50)";
export const gray = "rgb(110, 110, 110)";
export const lightGray = "rgb(213, 213, 213)";
export const veryLightGray = "rgb(224, 224, 224)";
export const green = "rgb(186, 200, 146)";
export const blue = "rgb(130, 202, 218)";
export const red = "rgb(250, 138, 84)";

export const withOpacity = (color, opacity) =>
  color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
