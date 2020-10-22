import * as srs from './srs';
import _ from '../functional';
import produce from 'immer';
import { Controller } from '../controller';
import {
  parseRegion,
  Shape,
  shapeNames,
  Region,
  RegionChar,
  ShapeName,
} from './util';

const lookupForm = srs.lookupForm;
export { Shape, Region, RegionChar, ShapeName, lookupForm };

export interface Board {
  well: Region;
  fallingShape: Shape;
  clearingLines: {
    index: number;
    pct: number;
  }[];
  gameOver: boolean;
}

const emptyWell = Object.freeze(
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

const landShape = (fallingShape: Shape, well: Region) => {
  return produce(well, (draft) => {
    srs
      .shapeCoords(fallingShape)
      .filter((coord) => coord.y >= 0 && coord.y <= 19)
      .forEach((coord) => {
        draft[coord.y][coord.x] = fallingShape.name;
      });
  });
};

const shiftShape = (well: Region, increment: number, s: Shape) => {
  const newShape = produce(s, (draft) => {
    draft.pos.x += increment;
  });
  return srs.fits(well, srs.shapeCoords(newShape)) ? newShape : s;
};

const shapeShouldLand = (well: Region, fallingShape: Shape) => {
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

const lowerShape = (board: Board) => {
  if (shapeShouldLand(board.well, board.fallingShape)) {
    board.well = landShape(board.fallingShape, board.well);
    if (isTooHigh(board.fallingShape)) {
      board.gameOver = true;
      return;
    }
    board.fallingShape = spawn();
    return;
  }
  board.fallingShape = produce(board.fallingShape, (draft) => {
    draft.pos.y += 1;
  });
};

export const makeModel = (controller: Controller, speed: number) => {
  const board = makeBoard();

  controller.whileRotateLeftPressed(() => {
    board.fallingShape = srs.rotateShape(board.well, -1, board.fallingShape);
  });

  controller.whileRotateRightPressed(() => {
    board.fallingShape = srs.rotateShape(board.well, 1, board.fallingShape);
  });

  controller.whileLeftPressed(() => {
    board.fallingShape = shiftShape(board.well, -1, board.fallingShape);
  });

  controller.whileRightPressed(() => {
    board.fallingShape = shiftShape(board.well, 1, board.fallingShape);
  });

  const fallHandler = () => {
    lowerShape(board);
    if (board.gameOver) {
      clearInterval(fallingInterval);
    }
  };

  let fallingInterval = setInterval(fallHandler, speed);

  controller.whileDownPressed(() => {
    lowerShape(board);
    clearInterval(fallingInterval);
    fallingInterval = setInterval(fallHandler, speed);
  });

  const getBoard = () => {
    return board;
  };

  return { getBoard };
};
