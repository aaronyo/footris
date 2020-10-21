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

const pileTop = (well: Form) => {
  return _.range(0, 10).map((x) => {
    const topY = well.map((row) => _.nth(x, row)).findIndex((c) => c !== '.');
    return {
      x,
      y: topY === -1 ? 20 : topY,
    };
  });
};

const shapeHitBottom = (well: Form, fallingShape: Shape) => {
  const topCoords = pileTop(well);
  if (
    srs
      .shapeCoords(fallingShape)
      .some((s) => topCoords.some((t) => s.x === t.x && s.y + 1 === t.y))
  ) {
    return true;
  }
  return false;
};

const makeBoard = () => ({
  well: emptyWell,
  fallingShape: spawn(),
  clearingLines: [],
});

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

  setInterval(() => {
    if (shapeHitBottom(board.well, board.fallingShape)) {
      board.well = landShape(board.fallingShape, board.well);
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
