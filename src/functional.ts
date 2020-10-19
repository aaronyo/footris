import * as R from 'ramda';
export * from 'ramda';

export const mapIndexed = R.addIndex(R.map);
export const forEachIndexed = R.addIndex(R.forEach);

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
