import { rotateClockwise } from '../src/model/srs';

describe('Utils Test', () => {
  test('Test if test works... great', () => {
    const initial = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const rotatedClockwise = [
      [7, 4, 1],
      [8, 5, 2],
      [9, 6, 3],
    ];
    expect(rotateClockwise(initial)).toStrictEqual(rotatedClockwise);
  });
});
