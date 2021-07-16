import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seed')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Get()
  public async seed(@Query() data: any) {
    try {
      //console.log(data);
      const crop = { klass: data.klass, up: !!Number(data.up) };
      //console.log(crop);
      return this.seederService.sow(crop);
    } catch (error) {
      return new HttpException(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      ).getResponse();
    }
  }
}
