import * as srs from './srs';
import _ from '../functional';
import produce from 'immer';
import { Controller } from '../keyboard';
import {
  parseForm,
  Shape,
  shapeNames,
  Form,
  FormChar,
  ShapeName,
} from './util';

const lookupForm = srs.lookupForm;
export { Shape, Form, FormChar, ShapeName, lookupForm };

export interface Board {
  well: Form;
  fallingShape: Shape;
  clearingLines: {
    index: number;
    pct: number;
  }[];
  gameOver: boolean;
}

const emptyWell = Object.freeze(
  parseForm(`
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

const landShape = (fallingShape: Shape, well: Form) => {
  return produce(well, (draft) => {
    srs
      .shapeCoords(fallingShape)
      .filter((coord) => coord.y >= 0 && coord.y <= 19)
      .forEach((coord) => {
        draft[coord.y][coord.x] = fallingShape.name;
      });
  });
};

const shiftShape = (well: Form, increment: number, s: Shape) => {
  const newShape = produce(s, (draft) => {
    draft.pos.x += increment;
  });
  return srs.fits(well, srs.shapeCoords(newShape)) ? newShape : s;
};

const shapeShouldLand = (well: Form, fallingShape: Shape) => {
  return srs
    .shapeCoords(fallingShape)
    .some((sc) => sc.y >= -1 && (sc.y === 19 || well[sc.y + 1][sc.x] !== '.'));
};

const makeBoard = (): Board => ({
  well: emptyWell,
  fallingShape: spawn(),
  clearingLines: [],
  gameOver: false,
});

const isTooHigh = (shape: Shape) =>
  srs.shapeCoords(shape).some(({ y }) => y < 0);

export const makeModel = (controller: Controller) => {
  const fallDuration = 100;
  const board = makeBoard();

  controller.whileRotatePressed(() => {
    board.fallingShape = srs.rotateShape(board.well, 1, board.fallingShape);
  });

  controller.whileLeftPressed(() => {
    board.fallingShape = shiftShape(board.well, -1, board.fallingShape);
  });

  controller.whileRightPressed(() => {
    board.fallingShape = shiftShape(board.well, 1, board.fallingShape);
  });

  const fallingInterval = setInterval(() => {
    if (shapeShouldLand(board.well, board.fallingShape)) {
      board.well = landShape(board.fallingShape, board.well);
      if (isTooHigh(board.fallingShape)) {
        board.gameOver = true;
        clearInterval(fallingInterval);
        return;
      }
      board.fallingShape = spawn();
      return;
    }
    board.fallingShape = produce(board.fallingShape, (draft) => {
      draft.pos.y += 1;
    });
  }, fallDuration);

  const getBoard = () => {
    return board;
  };

  return { getBoard };
};
