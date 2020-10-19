import * as specs from './specs';
import _ from '../functional';
import produce from 'immer';
import { KeyState } from '../keyboard';
import { rotate } from '../util';

export type ShapeChar = 'S' | 'Z' | 'L' | 'J' | 'T' | 'O' | 'I';
export type BoardChar = ShapeChar | '.';
export type ShapeName = ShapeChar;

export type Form = ReadonlyArray<ReadonlyArray<BoardChar>>;
export type Board = Form;

const parseRegion = (text: string): Board => {
  return text
    .trim()
    .split('\n')
    .map((line) => line.split('')) as Board;
};

interface Shape {
  pos: {
    x: number;
    y: number;
  };
  form: Form;
  name: ShapeName;
}

const spawn = (): Shape => {
  const name = _.randomKey(specs.shapes) as ShapeName;
  const form = parseRegion(specs.shapes[name]) as Form;
  return {
    pos: {
      y: 0 - form.length,
      x: 4,
    },
    form,
    name,
  };
};

const emptyBoard = Object.freeze(parseRegion(specs.emptyBoard));

// Returns an array containing {x,y} coordinates for every tile
// in the shape. This representation is convenient for patching the
// 2D board array, while the input 'Shape' form, having a single coordinae,
// is easier to move and rotate;
const shapeCoords = (fs: Shape) => {
  const coords: { x: number; y: number }[] = [];
  _.forEachIndexed((row, i) => {
    _.forEachIndexed((cell, j) => {
      if (cell !== '.') {
        coords.push({ y: fs.pos.y + i, x: fs.pos.x + j });
      }
    }, row);
  }, fs.form);
  return coords;
};

const makeBoard = (fallingShape: Shape) => {
  const coords = shapeCoords(fallingShape);
  return produce(emptyBoard, (draft) => {
    for (const coord of coords) {
      if (coord.y >= 0) {
        draft[coord.y][coord.x] = fallingShape.name;
      }
    }
  });
};

const rotateShape = (s: Shape) => {
  return produce(s, (draft) => {
    draft.form = rotate(s.form);
  });
};

export const makeModel = (keyState: KeyState) => {
  let fallingShape = spawn();
  const tickDuration = 500;
  let tickElapsed = 0;
  let board = emptyBoard;

  const updateBoard = (deltaMillis: number) => {
    tickElapsed += deltaMillis;
    if (keyState.rotate.isDown) {
      fallingShape = rotateShape(fallingShape);
      board = makeBoard(fallingShape);
    }
    if (tickElapsed / tickDuration > 1) {
      tickElapsed = 0;
      fallingShape = produce(fallingShape, (draft) => {
        draft.pos.y += 1;
      });
      board = makeBoard(fallingShape);
    }
    return board;
  };

  return { updateBoard, initialBoard: board };
};
