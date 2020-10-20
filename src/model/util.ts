import _ from '../functional';

export type ShapeChar = 'J' | 'L' | 'S' | 'T' | 'Z' | 'I' | 'O';
export type BoardChar = ShapeChar | '.';
export type ShapeName = ShapeChar;
export type RotationIndex = 0 | 1 | 2 | 3;

export type Form = ReadonlyArray<ReadonlyArray<BoardChar>>;
export type Board = Form;

export const shapeNames: readonly ShapeChar[] = [
  'J',
  'L',
  'S',
  'T',
  'Z',
  'I',
  'O',
];

export interface Shape {
  pos: {
    x: number;
    y: number;
  };
  name: ShapeName;
  rotation: RotationIndex;
}

export const parseRegion = (text: string): Board => {
  return text
    .trim()
    .split('\n')
    .map((line) => line.split('')) as Board;
};

// Returns an array containing {x,y} coordinates for every tile
// in the shape. This representation is convenient for patching the
// 2D board array, while the input 'Shape' form, having a single coordinae,
// is easier to move and rotate;
export const shapeCoords = (form: Form, origin: { x: number; y: number }) => {
  const coords: { x: number; y: number }[] = [];
  _.forEachIndexed((row, i) => {
    _.forEachIndexed((cell, j) => {
      if (cell !== '.') {
        coords.push({ y: origin.y + i, x: origin.x + j });
      }
    }, row);
  }, form);
  return coords;
};
