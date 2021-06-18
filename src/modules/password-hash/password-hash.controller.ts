import { Body, Controller, Get, HttpStatus, Injectable } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PasswordHashEngine } from '../../shared/hash.service';

@Controller('password-hash')
@ApiTags('password-hash')
@Injectable()
export class PasswordHashController {
  @Get()
  async genHash(@Body() data: any): Promise<string> {
    if (data.apiKey === 'hssuSo+4-oh4MuXcljPsyC2xF-JsTLmDS0oDuVyMMOkU1e') {
      return PasswordHashEngine.make(data.word);
    } else {
      return HttpStatus.FORBIDDEN.toString();
    }
  }
}
