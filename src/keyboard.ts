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

const whileKeyPressed = (millis: number, keyCode: string) => (
  callback: () => void,
) => {
  let interval: number;
  bindKey(keyCode, {
    press: () => {
      callback();
      interval = window.setInterval(callback, millis);
    },
    release: () => {
      clearInterval(interval);
    },
  });
};

export const makeController = ({
  leftCode,
  rightCode,
  rotateLeftCode,
  rotateRightCode,
  downCode,
  delayMillis = 200,
}: {
  leftCode: string;
  rightCode: string;
  rotateLeftCode: string;
  rotateRightCode: string;
  downCode: string;
  delayMillis: number;
}) => {
  return {
    whileLeftPressed: whileKeyPressed(delayMillis, leftCode),
    whileRightPressed: whileKeyPressed(delayMillis, rightCode),
    whileRotateLeftPressed: whileKeyPressed(delayMillis, rotateLeftCode),
    whileRotateRightPressed: whileKeyPressed(delayMillis, rotateRightCode),
    whileDownPressed: whileKeyPressed(delayMillis, downCode),
  };
};

export type Controller = ReturnType<typeof makeController>;
