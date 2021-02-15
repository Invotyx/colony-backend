import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TxtResponseCompressor } from './compression.service';

@Injectable()
export class CompressionInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const compressor = TxtResponseCompressor(req, res);
    // return next.handle().pipe(map((v) => compressor(v)));
    return next.handle().pipe(mergeMap((v) => from(compressor(v))));
  }
}
export const CompressJSON = () => UseInterceptors(CompressionInterceptor);
