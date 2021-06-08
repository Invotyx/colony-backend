import { customRandom } from 'nanoid';

const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const nanoid = customRandom(str, 10, (size) => {
  return new Uint8Array(size).map(() => 256 * Math.random());
});

export function uniqueId(s = 5) {
  const uid = customRandom(str, s, (size) => {
    return new Uint8Array(size).map(() => 256 * Math.random());
  });

  return uid();
}
