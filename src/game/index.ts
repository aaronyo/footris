// Load application styles
import * as PIXI from 'pixi.js';

import saucerImg from '../../assets/saucer.png';

const VIEWPORT_WIDTH = 320;
const VIEWPORT_HEIGHT = 240;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

export const makeGame = () => {
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container

  const game = new PIXI.Application({
    backgroundColor: 0x000000,
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
    resolution: 1,
  });

  const resizeCanvas = () => {
    game.view.style.width = window.innerWidth + 'px';
    game.view.style.height = (window.innerWidth * 9) / 16 + 'px';
    game.view.style.imageRendering = 'pixelated';
    game.view.style.position = 'absolute';
    game.view.style.top = '0px';
    game.view.style.bottom = '0px';
    game.view.style.margin = 'auto';
  };
  resizeCanvas();

  window.onresize = resizeCanvas;

  game.loader.load(() => {
    const saucerTexture = PIXI.Texture.from(saucerImg);
    const saucerSprite = PIXI.Sprite.from(saucerTexture);
    game.stage.addChild(saucerSprite);

    let counter = 0;
    function play(delta: number) {
      counter += delta;
      saucerSprite.position.x =
        (saucerSprite.position.x + delta) % VIEWPORT_WIDTH;
      saucerSprite.position.y = Math.cos(counter / 15) * 50 + 100;
    }

    game.ticker.add(play);
  });

  return game;
};
