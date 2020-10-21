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
