import * as R from 'ramda';
export * from 'ramda';
import produce from 'immer';

//export const mapIndexed = R.addIndex(R.map);
export const mapIndexed = R.addIndex(R.map) as <T extends unknown>(
  fn: (v: T, i: number) => void,
  arr: ReadonlyArray<T>,
) => T[];

export const forEachIndexed = R.addIndex(R.forEach) as <T extends unknown>(
  fn: (v: T, i: number) => void,
  arr: ReadonlyArray<T>,
) => void;

//eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

const randomKey = (obj: object) => {
  const keys = Object.keys(obj);
  return keys[(keys.length * Math.random()) << 0];
};

const randomFrom = <T extends unknown>(arr: readonly T[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export default {
  ...R,
  mapIndexed,
  forEachIndexed,
  noop,
  randomKey,
  produce,
  randomFrom,
};
