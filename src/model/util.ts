import _ from '../functional';

export type ShapeChar = 'J' | 'L' | 'S' | 'T' | 'Z' | 'I' | 'O';
export type RegionChar = ShapeChar | '.';
export type ShapeName = ShapeChar;
export type RotationIndex = 0 | 1 | 2 | 3;

export type Region = ReadonlyArray<ReadonlyArray<RegionChar>>;

export const shapeNames: readonly ShapeChar[] = [
  'J',
  'L',
  'S',
  'T',
  'Z',
  'I',
  'O',
];

export type Shape = Readonly<{
  pos: Readonly<{
    x: number;
    y: number;
  }>;
  name: ShapeName;
  rotation: RotationIndex;
}>;

export const parseRegion = (text: string): Region => {
  return text
    .trim()
    .split('\n')
    .map((line) => line.split('')) as Region;
};
