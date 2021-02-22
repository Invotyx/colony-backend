import accepts from 'accepts';
import { gzip, ZlibOptions } from 'zlib';

//#---------gZip-------------

const compressor = (x: string, y: ZlibOptions) =>
  new Promise((s, f) => gzip(x, y, (p, q) => (p ? f(p) : s(q))));
const compress = (x: string) => compressor(x, { level: 5 } as ZlibOptions);

//#---------Brotli-----------
// const {
//   BROTLI_PARAM_SIZE_HINT,
//   BROTLI_PARAM_MODE,
//   BROTLI_PARAM_QUALITY,
//   BROTLI_MODE_TEXT,
// } = constants;

// const compressor = (x: string, y: BrotliOptions | ZlibOptions) =>
//   new Promise((s, f) => brotliCompress(x, y, (p, q) => (p ? f(p) : s(q))));

// const compress = (x: string) =>
//   compressor(x, {
//     [BROTLI_PARAM_SIZE_HINT]: x.length,
//     [BROTLI_PARAM_MODE]: BROTLI_MODE_TEXT,
//     [BROTLI_PARAM_QUALITY]: 1,
//   } as BrotliOptions | ZlibOptions);

const noopifyResponse = (res: any) => {
  const noop = () => res;
  res.end = noop;
  res.json = noop;
  res.send = noop;
  res.setHeader = noop;
  res.status = noop;
  res.write = noop;
  return res;
};

export const TxtResponseCompressor = (req: any, res: any) => async (
  raw: string,
) => {
  const acceptEncoding = accepts(req).encoding(['gzip']);
  if (acceptEncoding === 'gzip') {
    res.setHeader('Vary', 'Accept-Encoding');
    if (typeof raw === 'object') {
      res.setHeader('Content-Type', 'application/json');
      raw = JSON.stringify(raw);
    }
    res.setHeader('Content-Encoding', 'gzip');
    const data = (await compress(raw)) as Buffer;
    res.setHeader('Content-Length', data.length);
    res.send(data);
    noopifyResponse(res);
  }
  return raw;
};
