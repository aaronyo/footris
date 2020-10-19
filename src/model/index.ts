export type BoardChar = 's' | 'z' | 'l' | 'j' | 't' | 'o' | 'i' | '.';

export type Shage = BoardChar[][];
export type Board = BoardChar[][];

interface FallingShape {
  pos: {
    x: number;
    y: number;
  };
  shape: BoardChar[][];
}

const spawn = () => {};

export const buildModel = () => {
  const fallingShape = spawn();
};
