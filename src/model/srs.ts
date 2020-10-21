// "Super Rotation Sysetm"
//
// There is a standard way to handle Tetris piece rotation and "wall kicks".
// Here's the spec for that:
//
// https://tetris.wiki/Super_Rotation_System
//
// The magical implementation described at the end is reproduced here.

import {
  parseRegion,
  ShapeName,
  Shape,
  Board,
  Form,
  RotationIndex,
} from './util';

import _ from '../functional';

const rotation0Specs = {
  J: `
.J.
.J.
JJ.
`,

  L: `
.L.
.L.
.LL
`,

  S: `
.SS
SS.
...
`,

  T: `
.T.
TTT
...
`,

  Z: `
ZZ.
.ZZ
...
`,

  O: `
.OO
.OO
...
`,
};

const iRotationsSpec = [
  `
.....
.....
.IIII
.....
.....
`,
  `
.....
..I..
..I..
..I..
..I..
`,
  `
.....
.....
IIII.
.....
.....
`,
  `
..I..
..I..
..I..
..I..
.....
`,
];

//prettier-ignore
const jlstzOffsets = [
  [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
  [[ 0, 0], [+1, 0], [+1,-1], [ 0, 2], [+1, 2]],
  [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
  [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
];

//prettier-ignore
const iOffsets = [
  [[ 0, 0], [-1, 0], [+2, 0], [-1, 0], [+2, 0]],
  [[-1, 0], [ 0, 0], [ 0, 0], [ 0,+1], [ 0,-2]],
  [[-1,+1], [+1,+1], [-2,+1], [+1, 0], [-2, 0]],
  [[ 0,+1], [ 0,+1], [ 0,+1], [ 0,-1], [ 0,+2]],
];

//prettier-ignore
const oOffsets = [
  [[ 0, 0]],
  [[ 0,-1]],
  [[-1,-1]],
  [[-1, 0]],
];

const offsets = {
  J: jlstzOffsets,
  L: jlstzOffsets,
  S: jlstzOffsets,
  T: jlstzOffsets,
  Z: jlstzOffsets,
  I: iOffsets,
  O: oOffsets,
};

// Rotating 2D arrays
// https://stackoverflow.com/a/8664879/1935207
//
export const rotateClockwise = <T extends unknown>(
  arr: ReadonlyArray<ReadonlyArray<T>>,
): T[][] => {
  const transposed = arr[0].map((_, i) => arr.map((row) => row[i]));
  const rotated = transposed.map((row) => row.reverse());
  return rotated;
};

const r0 = _.identity;
const r1 = rotateClockwise;
const r2 = _.pipe(rotateClockwise, rotateClockwise);
const r3 = _.pipe(rotateClockwise, rotateClockwise, rotateClockwise);

const jlstzoRotations = _.mapObjIndexed((spec) => {
  const form = parseRegion(spec);
  return [r0(form), r1(form), r2(form), r3(form)];
}, rotation0Specs);

const rotations = {
  ...jlstzoRotations,
  I: _.map(parseRegion, iRotationsSpec),
};

const getForm = ({
  name,
  rotation,
}: {
  name: ShapeName;
  rotation: RotationIndex;
}) => rotations[name][rotation];

const atWrappedIndex = <T extends unknown>(idx: number, arr: readonly T[]) =>
  arr.slice(idx % arr.length)[0];

const fits = (board: Board, coords: { x: number; y: number }[]) => {
  return _.all(({ x, y }) => x >= 0 && x <= 9 && y <= 20, coords);
};

// Returns an array containing {x,y} coordinates for every tile
// in the shape. This representation is convenient for patching the
// 2D board array, while the input 'Shape' form, having a single coordinae,
// is easier to move and rotate;
const shapeCoords = (shape: Shape) => {
  const coords: { x: number; y: number }[] = [];
  _.forEachIndexed((row, i) => {
    _.forEachIndexed((cell, j) => {
      if (cell !== '.') {
        coords.push({ y: shape.pos.y + i, x: shape.pos.x + j });
      }
    }, row);
  }, getForm(shape));
  return coords;
};

const rotateShape = (board: Board, dir: 1 | -1, shape: Shape) => {
  const B = offsets[shape.name][shape.rotation];
  const A = atWrappedIndex(shape.rotation + dir, offsets[shape.name]);
  const kickTranslations = _.mapIndexed(
    (offA, idx) => [B[idx][0] - offA[0], B[idx][1] - offA[1]],
    A,
  );

  return _.produce(shape, (draft) => {
    const wrap = (shape.rotation + dir) % 4;
    const nextRotation = (wrap >= 0 ? wrap : 3) as RotationIndex;
    for (const k of kickTranslations) {
      const coords = {
        x: shape.pos.x + k[0],
        y: shape.pos.y - k[1],
      };
      if (
        fits(
          board,
          shapeCoords({
            pos: coords,
            name: draft.name,
            rotation: nextRotation,
          }),
        )
      ) {
        draft.rotation = nextRotation;
        draft.pos = coords;
        return;
      }
    }
  });
};

export { rotations, offsets, getForm, rotateShape, shapeCoords };
