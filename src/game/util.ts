// Rotating 2D arrays
// https://stackoverflow.com/a/8664879/1935207
//
export const rotate = <T extends unknown>(arr: T[][]): T[][] => {
  const transposed = arr[0].map((_, i) => arr.map((row) => row[i]));
  const rotated = transposed.map((row) => row.reverse());
  return rotated;
};
