import { Controller, Get, Injectable } from '@nestjs/common';
import { PhoneService } from './phone.service';

@Injectable()
@Controller('phone')
export class PhoneController {

  constructor(private readonly service: PhoneService) { }
  
  @Get('')
  async searchNumbers() {
    return await this.service.searchPhoneNumbers();
  }
}
