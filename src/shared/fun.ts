export const bTOa = (x) => Buffer.from(x).toString('base64');
export const aTOb = (x) => Buffer.from(x, 'base64').toString('ascii');
