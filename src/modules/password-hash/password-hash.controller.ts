import { Body, Controller, Get, HttpService, HttpStatus, Injectable, Param, Query } from '@nestjs/common';
import { HttpResponse } from 'aws-sdk/lib/http_response';
import { PasswordHashEngine } from '../auth/hash.service';

@Controller('password-hash')
@Injectable()
export class PasswordHashController {
  @Get()
  async genHash(@Body() data): Promise<string> {
    if (data.apiKey === "hssuSo+4-oh4MuXcljPsyC2xF-JsTLmDS0oDuVyMMOkU1e") {
      return await PasswordHashEngine.make(data.word);
    } else {
      return HttpStatus.FORBIDDEN.toString();
    }
  }
}
