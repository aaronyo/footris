import _ from '../functional';

export type ShapeChar = 'J' | 'L' | 'S' | 'T' | 'Z' | 'I' | 'O';
export type FormChar = ShapeChar | '.';
export type ShapeName = ShapeChar;
export type RotationIndex = 0 | 1 | 2 | 3;

export type Form = ReadonlyArray<ReadonlyArray<FormChar>>;

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

export const parseForm = (text: string): Form => {
  return text
    .trim()
    .split('\n')
    .map((line) => line.split('')) as Form;
};
