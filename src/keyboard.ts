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

const bindKeyToState = (keyCode: string, state: { isDown: boolean }) => {
  bindKey(keyCode, {
    press: () => {
      state.isDown = true;
    },
    release: () => {
      state.isDown = false;
    },
  });
};

export const makeKeyState = ({
  leftCode,
  rightCode,
  rotateCode,
  downCode,
}: {
  leftCode: string;
  rightCode: string;
  rotateCode: string;
  downCode: string;
}) => {
  const state = {
    left: { isDown: false },
    right: { isDown: false },
    rotate: { isDown: false },
    down: { isDown: false },
  };

  bindKeyToState(leftCode, state.left);
  bindKeyToState(rightCode, state.right);
  bindKeyToState(rotateCode, state.rotate);
  bindKeyToState(downCode, state.down);

  return state;
};

export const makeController = ({
  leftCode,
  rightCode,
  rotateCode,
  downCode,
}: {
  leftCode: string;
  rightCode: string;
  rotateCode: string;
  downCode: string;
}) => {
  return {
    whileLeftPressed: whileKeyPressed(200, leftCode),
    whileRightPressed: whileKeyPressed(200, rightCode),
    whileRotatePressed: whileKeyPressed(200, rotateCode),
    whileDownPressed: whileKeyPressed(200, downCode),
  };
};

export type KeyState = ReturnType<typeof makeKeyState>;
export type Controller = ReturnType<typeof makeController>;
