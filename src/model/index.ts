import * as srs from './srs';
import _ from '../functional';
import produce from 'immer';
import { Controller } from '../keyboard';
import { parseRegion, Shape, shapeNames, shapeCoords } from './util';

const emptyBoard = Object.freeze(
  parseRegion(`
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........
`),
);

const spawn = (): Shape => {
  const name = _.randomFrom(shapeNames);
  return {
    pos: {
      y: -3,
      x: 3,
    },
    rotation: 0,
    name,
  };
};

const makeBoard = (fallingShape: Shape) => {
  const coords = shapeCoords(
    srs.getForm(fallingShape.name, fallingShape.rotation),
    fallingShape.pos,
  );
  return produce(emptyBoard, (draft) => {
    for (const coord of coords) {
      if (coord.y >= 0) {
        draft[coord.y][coord.x] = fallingShape.name;
      }
    }
  });
};

const shiftShape = (increment: number, s: Shape) => {
  return produce(s, (draft) => {
    draft.pos.x += increment;
  });
};

export const makeModel = (controller: Controller) => {
  let fallingShape = spawn();
  const fallDuration = 500;
  let board = emptyBoard;
  let dirty = false;
  controller.whileRotatePressed(() => {
    fallingShape = srs.rotateShape(board, 1, fallingShape);
    dirty = true;
  });

  controller.whileLeftPressed(() => {
    fallingShape = shiftShape(-1, fallingShape);
    dirty = true;
  });

  controller.whileRightPressed(() => {
    fallingShape = shiftShape(1, fallingShape);
    dirty = true;
  });

  const fallInterval = setInterval(() => {
    fallingShape = produce(fallingShape, (draft) => {
      draft.pos.y += 1;
    });
    dirty = true;
  }, fallDuration);

  const updateBoard = () => {
    if (dirty) {
      board = makeBoard(fallingShape);
      dirty = false;
    }
    return board;
  };

  return { updateBoard, initialBoard: board };
};
