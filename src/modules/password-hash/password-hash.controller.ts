import { Body, Controller, Get, HttpStatus, Injectable } from '@nestjs/common';
import { PasswordHashEngine } from '../auth/hash.service';

@Controller('password-hash')
@Injectable()
export class PasswordHashController {
  @Get()
  async genHash(@Body() data: any): Promise<string> {
    if (data.apiKey === 'hssuSo+4-oh4MuXcljPsyC2xF-JsTLmDS0oDuVyMMOkU1e') {
      return await PasswordHashEngine.make(data.word);
    } else {
      return HttpStatus.FORBIDDEN.toString();
    }
  }
}
