import * as srs from './srs';
import { default as _, Mutable } from '../functional';
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

type ClearingInfo = Readonly<{
  lines: number[];
  start: Date;
  end: Date;
}>;

export interface Board {
  well: Region;
  fallingShape: Shape;
  gameOver: boolean;
  clearing: ClearingInfo | null;
}

export interface ClearingBoard extends Board {
  clearing: ClearingInfo;
}

export const emptyWell = Object.freeze(
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

const makeShape = (name: ShapeName): Shape => {
  return {
    pos: {
      y: -3,
      x: 3,
    },
    rotation: 0,
    name,
  };
};

// We rotate through all 7 shapes before repeating a shape,
// which seems to be the Tetris standard.
const makeShapeSpawner = () => {
  let bagIdx = 0;
  let bag = _.shuffle(shapeNames);

  const spawn = () => {
    if (bagIdx >= bag.length) {
      bag = _.shuffle(shapeNames);
      bagIdx = 0;
    }
    const name = bag[bagIdx];
    bagIdx += 1;
    return makeShape(name);
  };

  return {
    spawn,
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

const makeBoard = (fallingShape: Shape): Board => ({
  well: emptyWell,
  fallingShape,
  gameOver: false,
  clearing: null,
});

const isTooHigh = (shape: Shape) =>
  srs.shapeCoords(shape).some(({ y }) => y < 0);

const findCompletedLines = (well: Region): number[] => {
  return well.reduce((completed, line, idx) => {
    if (line.every((c) => c !== '.')) completed.push(idx);
    return completed;
  }, [] as number[]);
};

const checkWell = (board: Board) => {
  if (isTooHigh(board.fallingShape)) {
    board.gameOver = true;
    return;
  }

  const completedLines = findCompletedLines(board.well);
  if (completedLines.length) {
    board.clearing = {
      lines: completedLines,
      start: new Date(),
      end: new Date(new Date().getTime() + 1000),
    };
  }
};

export const clearLines = (well: Region, lineNumbers: number[]): Region => {
  const newWell = _.clone(emptyWell) as Mutable<Region>;
  let idx = 19;
  for (let i = 19; i >= 0; i--) {
    if (lineNumbers.includes(i)) continue;
    newWell[idx] = well[i] as Mutable<RegionChar[]>;
    idx -= 1;
  }
  return newWell;
};

export const makeModel = (controller: Controller, speed: number) => {
  const shapeSpawner = makeShapeSpawner();
  const board = makeBoard(shapeSpawner.spawn());

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

  const lowerShape = () => {
    if (shapeShouldLand(board.well, board.fallingShape)) {
      board.well = landShape(board.fallingShape, board.well);
      checkWell(board);

      if (board.gameOver) {
        clearInterval(fallingTick);
        return;
      }
      if (board.clearing) {
        clearInterval(fallingTick);
        const c = board.clearing;
        setTimeout(() => {
          board.clearing = null;
          board.well = clearLines(board.well, c.lines);
          board.fallingShape = shapeSpawner.spawn();
          fallingTick = setInterval(lowerShape, speed);
        }, c.end.getTime() - c.start.getTime());
        return;
      }

      board.fallingShape = shapeSpawner.spawn();
      return;
    }

    board.fallingShape = produce(board.fallingShape, (draft) => {
      draft.pos.y += 1;
    });
  };

  let fallingTick = setInterval(lowerShape, speed);

  controller.whileDownPressed(() => {
    if (board.clearing) return;
    clearInterval(fallingTick);
    lowerShape();
    if (board.clearing) return;
    fallingTick = setInterval(lowerShape, speed);
  });

  const getBoard = () => {
    return board;
  };

  return { getBoard };
};
