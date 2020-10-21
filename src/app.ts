// Load application styles
import { makeController } from './keyboard';
import { makeModel, Board, BoardChar } from './model';
import * as PIXI from 'pixi.js';

const BOARD_WIDTH = 100;
const BOARD_HEIGHT = 200;
const ASPECT_RATIO = BOARD_HEIGHT / BOARD_WIDTH;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const colors = {
  J: 0xff57cd,
  L: 0xcd57ff,
  S: 0x57cdff,
  T: 0x57ffcd,
  Z: 0x5757cd,
  I: 0x57cdcd,
  O: 0x57cd57,
};

const drawCell = (
  x: number,
  y: number,
  char: BoardChar,
  gfx: PIXI.Graphics,
) => {
  switch (char) {
    case '.':
      gfx.beginFill(0x000000);
      gfx.lineStyle(0, 0x000000, 0, 0);
      break;
    default:
      gfx.beginFill(0xffffff);
      gfx.lineStyle(2, colors[char], 1, 0);
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

  const controller = makeController({
    leftCode: 'ArrowLeft',
    rightCode: 'ArrowRight',
    rotateCode: 'ArrowUp',
    downCode: 'ArrowDown',
  });

  app.loader.load(() => {
    const { initialBoard, updateBoard } = makeModel(controller);
    let gfx = new PIXI.Graphics();
    app.stage.addChild(gfx);
    drawBoard(initialBoard, gfx);

    let lastBoard = initialBoard;
    const update = () => {
      const board = updateBoard();
      if (board !== lastBoard) {
        gfx.clear();
        drawBoard(board, gfx);
        lastBoard = board;
      }
    };

    app.ticker.add(update);
  });

  return app;
};
