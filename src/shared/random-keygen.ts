import { customRandom } from 'nanoid';

export const nanoid = customRandom(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  10,
  (size) => {
    return new Uint8Array(size).map(() => 256 * Math.random());
  },
);
