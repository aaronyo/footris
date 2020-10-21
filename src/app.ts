// Load application styles
import { makeController } from './keyboard';
import { makeModel, Shape, Form, FormChar, Board, lookupForm } from './model';
import * as PIXI from 'pixi.js';

const WELL_WIDTH = 100;
const WELL_HEIGHT = 200;
const ASPECT_RATIO = WELL_HEIGHT / WELL_WIDTH;

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

const drawCell = (x: number, y: number, char: FormChar, gfx: PIXI.Graphics) => {
  if (char === '.') return;
  gfx.beginFill(0xffffff);
  gfx.lineStyle(2, colors[char], 1, 0);
  gfx.drawRect(x * 10, y * 10, 9, 9);
};

const drawForm = (
  pos: { x: number; y: number },
  form: Form,
  gfx: PIXI.Graphics,
) => {
  form.forEach((line, y) => {
    line.forEach((char, x) => {
      drawCell(x + pos.x, y + pos.y, char, gfx);
    });
  });
};

let lastWell: Form;
let lastFallingShape: Shape;
const drawBoard = (
  board: Board,
  gfx: { well: PIXI.Graphics; fallingShape: PIXI.Graphics },
) => {
  if (board.well !== lastWell) {
    lastWell = board.well;
    gfx.well.clear();
    drawForm({ x: 0, y: 0 }, board.well, gfx.well);
  }
  if (board.fallingShape !== lastFallingShape) {
    lastFallingShape = board.fallingShape;
    gfx.fallingShape.clear();
    drawForm(
      board.fallingShape.pos,
      lookupForm(board.fallingShape),
      gfx.fallingShape,
    );
  }
};

export const makeApp = () => {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container

  const app = new PIXI.Application({
    backgroundColor: 0x000000,
    width: WELL_WIDTH,
    height: WELL_HEIGHT,
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
    const { getBoard } = makeModel(controller);
    const background = new PIXI.Graphics();
    const gfx = {
      well: new PIXI.Graphics(),
      fallingShape: new PIXI.Graphics(),
    };
    background.beginFill(0x000000);
    background.lineStyle(0, 0x000000, 0, 0);
    background.drawRect(0, 0, WELL_WIDTH, WELL_HEIGHT);

    app.stage.addChild(gfx.well);
    app.stage.addChild(gfx.fallingShape);
    drawBoard(getBoard(), gfx);

    const update = () => {
      drawBoard(getBoard(), gfx);
    };

    app.ticker.add(update);
  });

  return app;
};
