export const darkGray = "rgb(30, 30, 30)";
export const gray = "rgb(110, 110, 110)";
export const lightGray = "rgb(212, 212, 212)";
export const veryLightGray = "rgb(224, 224, 224)";
export const green = "rgb(186, 200, 146)";
export const darkGreen = "rgb(78, 201, 176)";
export const blue = "rgb(156, 220, 254)";
export const darkBlue = "rgb(86, 156, 214)";
export const red = "rgb(250, 138, 84)";
export const purple = "rgb(197, 134, 192)";
export const yellow = "rgb(220, 220, 170)";
export const brown = "rgb(206, 145, 120)";

export const bgBrown = "rgb(69, 55, 21)";
export const bgGreen = "rgb(21, 69, 55)";

export const toHex = (color: string) =>
  "#" +
  color
    .substring(4, color.length - 1)
    .split(", ")
    .map(s =>
      parseInt(s)
        .toString(16)
        .padStart(2, "0")
    )
    .join("");

export const withOpacity = (color: string, opacity: number) =>
  color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
