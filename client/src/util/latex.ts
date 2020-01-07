import Color from 'color';

export const colorbox = (color: Color, text: string) =>
  String.raw`\colorbox{${color.hex()}}{$${text}$}`;

export const textcolor = (color: Color, text: string) =>
  String.raw`\textcolor{${color.hex()}}{${text}}`;
