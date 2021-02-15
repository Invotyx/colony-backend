export const bTOa = (x: any) => Buffer.from(x).toString('base64');
export const aTOb = (x: any) => Buffer.from(x, 'base64').toString('ascii');
