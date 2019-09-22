export function argMax(array: number[]) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

export function zero2D(rows: number, cols: number) {
  var array = [],
    row = [];
  while (cols--) row.push(0);
  while (rows--) array.push(row.slice());
  return array;
}

export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function transpose(matrix: number[][]) {
  return matrix[0].map((_, j) => matrix.map(row => row[j]));
}
