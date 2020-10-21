import * as srs from './srs';
import _ from '../functional';
import produce from 'immer';
import { Controller } from '../keyboard';
import {
  parseRegion,
  Shape,
  shapeNames,
  Board,
  BoardChar,
  ShapeName,
} from './util';

export { Board, BoardChar, ShapeName };

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

const addShape = (fallingShape: Shape, board: Board) => {
  return produce(board, (draft) => {
    srs
      .shapeCoords(fallingShape)
      .filter((coord) => coord.y >= 0 && coord.y <= 19)
      .forEach((coord) => {
        draft[coord.y][coord.x] = fallingShape.name;
      });
  });
};

const shiftShape = (increment: number, s: Shape) => {
  return produce(s, (draft) => {
    draft.pos.x += increment;
  });
};

const pileTop = (board: Board) => {
  return _.range(0, 10).map((x) => {
    const topY = board.map((row) => _.nth(x, row)).findIndex((c) => c !== '.');
    return {
      x,
      y: topY === -1 ? 20 : topY,
    };
  });
};

const shapeHitBottom = (board: Board, fallingShape: Shape) => {
  const topCoords = pileTop(board);
  console.log('pile', topCoords);
  if (
    srs
      .shapeCoords(fallingShape)
      .some((s) => topCoords.some((t) => s.x === t.x && s.y + 1 === t.y))
  ) {
    return true;
  }
  return false;
};

export const makeModel = (controller: Controller) => {
  let fallingShape = spawn();
  const fallDuration = 100;
  let board = emptyBoard;
  let pile = emptyBoard;
  let dirty = false;

  controller.whileRotatePressed(() => {
    fallingShape = srs.rotateShape(pile, 1, fallingShape);
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
    if (shapeHitBottom(pile, fallingShape)) {
      pile = addShape(fallingShape, pile);
      fallingShape = spawn();
      dirty = true;
      return;
    }
    fallingShape = produce(fallingShape, (draft) => {
      draft.pos.y += 1;
    });
    dirty = true;
  }, fallDuration);

  const updateBoard = () => {
    if (dirty) {
      board = addShape(fallingShape, pile);
      dirty = false;
    }
    return board;
  };

  return { updateBoard, initialBoard: board };
};
