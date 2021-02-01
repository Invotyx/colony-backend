import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FactoriesService } from './factories.service';

@Controller('factory')
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  @Get('')
  async seed(@Query() data) {
    try {
      const product = {
        klass: data.klass,
        param: data.param ? JSON.parse(data.param) : {},
      };
      return await this.factoriesService.produce(product);
    } catch (error) {
      return new HttpException(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR
      ).getResponse();
    }
  }
}
