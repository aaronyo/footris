import * as R from 'ramda';
export * from 'ramda';

export const mapIndexed = R.addIndex(R.map);
export const forEachIndexed = <T extends unknown>(
  fn: (v: T, i: number) => void,
  arr: ReadonlyArray<T>,
) => {
  for (let i = 0; i < arr.length; i++) {
    fn(arr[i], i);
  }
};

//eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

const randomKey = (obj: object) => {
  const keys = Object.keys(obj);
  return keys[(keys.length * Math.random()) << 0];
};

export default {
  ...R,
  mapIndexed,
  forEachIndexed,
  noop,
  randomKey,
};
