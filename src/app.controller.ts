import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('app')
  getData() {
    return this.appService.getData();
  }

  @Get('merge-tags')
  getSystemMergeTags() {
    const tags = ['${name}', '${inf_name}', '${link}'];
    return tags;
  }
}
