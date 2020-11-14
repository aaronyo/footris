// I'm not sure it is necessary to check if the key is already down or
// already up... I copied this bindKey logic from somewhere a long time ago...
const bindKey = (
  keyCode: string,
  { press, release }: { press: () => void; release: () => void },
) => {
  let isDown = false;
  let isUp = true;

  const downHandler = (event: KeyboardEvent) => {
    if (event.key === keyCode) {
      if (isUp && press) press();
      isDown = true;
      isUp = false;
      event.preventDefault();
    }
  };

  const upHandler = (event: KeyboardEvent) => {
    if (event.key === keyCode) {
      if (isDown && release) release();
      isDown = false;
      isUp = true;
      event.preventDefault();
    }
  };

  window.addEventListener('keydown', downHandler, false);
  window.addEventListener('keyup', upHandler, false);
};

const whileKeyPressed = (
  keyCode: string,
  firstDelay: number,
  repeatDelay: number,
) => (callback: () => void) => {
  let firstTimer: number;
  let repeatTimer: number;
  bindKey(keyCode, {
    press: () => {
      callback();
      firstTimer = window.setTimeout(() => {
        repeatTimer = window.setInterval(callback, repeatDelay);
      }, firstDelay);
    },
    release: () => {
      window.clearTimeout(firstTimer);
      window.clearInterval(repeatTimer);
    },
  });
};

type KeyArgs = [string, number, number];

export const makeController = ({
  left,
  right,
  rotateLeft,
  rotateRight,
  down,
}: {
  left: KeyArgs;
  right: KeyArgs;
  rotateLeft: KeyArgs;
  rotateRight: KeyArgs;
  down: KeyArgs;
}) => {
  return {
    whileLeftPressed: whileKeyPressed(...left),
    whileRightPressed: whileKeyPressed(...right),
    whileRotateLeftPressed: whileKeyPressed(...rotateLeft),
    whileRotateRightPressed: whileKeyPressed(...rotateRight),
    whileDownPressed: whileKeyPressed(...down),
  };
};

export type Controller = ReturnType<typeof makeController>;
