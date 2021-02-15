import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  Scope,
} from '@nestjs/common';
import * as LZString from 'lz-string';
import { aTOb } from '../shared/fun';

export const RequestScope = () => Injectable({ scope: Scope.REQUEST }),
  Seeder = RequestScope,
  Factory = RequestScope;

const decrypt = (() => {
  const k1 =
    '8DbsUEPiKyeJGlWk2VrdqT0hYaCS/vHZ+xRmQ9ozAF147fcOpg=MBwX6LINn3u5jt';
  const secret = Object.fromEntries(
    'EPiK47ft=9hlW8Db20pgBwX6UkjYAOLsVINnSFrdmqT/QaCcyeJG513uZ+xRMozvH'
      .split('')
      .map((v, i) => [v, k1[i]]),
  );

  return (enc: string) => {
    enc = enc.replace(/_/g, '/').replace(/-/g, '+');
    return enc
      .split('')
      .map((v) => secret[v])
      .join('');
  };
})();

export const JSONQuery = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req: any = ctx.switchToHttp().getRequest();
    data = data || 'jData';
    const queryItems = Object.keys(req.query);
    try {
      let query = '';
      if (queryItems.includes(data)) {
        query = req.query[data];
      } else if (queryItems.includes(data + '.a')) {
        query = req.query[data + '.a'];
        query = aTOb(query);
      } else if (queryItems.includes(data + '.z')) {
        query = req.query[data + '.z'];
        query = LZString.decompressFromBase64(query.replace(/ /g, '+'));
      } else if (queryItems.includes(data + '.ze')) {
        query = req.query[data + '.ze'];
        query = LZString.decompressFromBase64(decrypt(query));
      }
      return JSON.parse(query);
    } catch (error) {
      console.log(error);
      return {};
    }
  },
);
