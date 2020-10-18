// Load application styles
import * as PIXI from 'pixi.js';

const GAME_PLAY_WIDTH = 320;
const GAME_PLAY_HEIGHT = 240;
const ASPECT_RATIO = GAME_PLAY_HEIGHT / GAME_PLAY_WIDTH;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

export const makeGame = () => {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container

  const game = new PIXI.Application({
    backgroundColor: 0x000000,
    width: GAME_PLAY_WIDTH,
    height: GAME_PLAY_HEIGHT,
    resolution: 1,
  });

  const resizeCanvas = () => {
    game.view.style.width = window.innerWidth + 'px';
    game.view.style.height = window.innerWidth * ASPECT_RATIO + 'px';
    game.view.style.imageRendering = 'pixelated';
    game.view.style.position = 'absolute';
    game.view.style.top = '0px';
    game.view.style.bottom = '0px';
    game.view.style.margin = 'auto';
  };
  resizeCanvas();

  window.onresize = resizeCanvas;

  game.loader.load(() => {
    const gfx = new PIXI.Graphics();
    gfx.beginFill(0xffffff);
    gfx.lineStyle(2, 0x57cdff, 1, 0);
    gfx.drawRect(11, 0, 10, 10);
    gfx.drawRect(22, 0, 10, 10);
    gfx.drawRect(0, 11, 10, 10);
    gfx.drawRect(11, 11, 10, 10);
    game.stage.addChild(gfx);

    let time = 0;
    const update = (deltaTime: number) => {
      time += deltaTime;
      gfx.position.x = (gfx.position.x + deltaTime) % GAME_PLAY_WIDTH;
      gfx.position.y = Math.cos(time / 15) * 50 + 100;
    };

    game.ticker.add(update);
  });

  return game;
};
