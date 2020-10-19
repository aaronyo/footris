// Load application styles
import { makeKeyState } from './keyboard';
import * as PIXI from 'pixi.js';

const BOARD_WIDTH = 100;
const BOARD_HEIGHT = 200;
const ASPECT_RATIO = BOARD_HEIGHT / BOARD_WIDTH;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const startingBoard = `
...ss.....
..ss......
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
`;

type Board = string[][];

const parseBoard = (text: string): Board => {
  return text
    .trim()
    .split('\n')
    .map((line) => line.split(''));
};

const drawCell = (x: number, y: number, char: string, gfx: PIXI.Graphics) => {
  switch (char) {
    case 's':
      gfx.beginFill(0xffffff);
      gfx.lineStyle(2, 0x57cdff, 1, 0);
      break;
    default:
      gfx.beginFill(0x000000);
      gfx.lineStyle(0, 0x000000, 0, 0);
      break;
  }
  gfx.drawRect(x * 10, y * 10, 9, 9);
};

const drawBoard = (board: Board, gfx: PIXI.Graphics) => {
  board.forEach((line, y) => {
    line.forEach((char, x) => {
      drawCell(x, y, char, gfx);
    });
  });
};

const updateBoard = (board: Board): Board => {
  return ['..........'.split('')].concat(board.slice(0, -1));
};

export const makeApp = () => {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container

  const app = new PIXI.Application({
    backgroundColor: 0x000000,
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    resolution: 1,
  });

  const resizeCanvas = () => {
    app.view.style.width = window.innerHeight / ASPECT_RATIO + 'px';
    app.view.style.height = window.innerHeight + 'px';
    app.view.style.imageRendering = 'pixelated';
    app.view.style.position = 'absolute';
    app.view.style.left = '0px';
    app.view.style.right = '0px';
    app.view.style.margin = 'auto';
  };
  resizeCanvas();

  window.onresize = resizeCanvas;

  const controls = makeKeyState({
    leftCode: 'ArrowLeft',
    rightCode: 'ArrowRight',
    rotateCode: 'ArrowUp',
    downCode: 'ArrowDown',
  });

  app.loader.load(() => {
    let board = parseBoard(startingBoard);
    let gfx = new PIXI.Graphics();
    app.stage.addChild(gfx);
    drawBoard(board, gfx);

    let elapsed = 0;
    let appTicks = 0;
    const update = () => {
      if (controls.left.isDown) console.log('left');
      elapsed += app.ticker.deltaMS;
      if (elapsed / 500 > 1) {
        appTicks += 1;
        elapsed = 0;
        board =
          appTicks % 21 === 0 ? parseBoard(startingBoard) : updateBoard(board);
        gfx.clear();
        drawBoard(board, gfx);
      }
    };

    app.ticker.add(update);
  });

  return app;
};
