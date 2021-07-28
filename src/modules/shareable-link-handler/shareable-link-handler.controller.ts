import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ShareableLinkHandlerService } from './shareable-link-handler.service';

@Controller('s')
export class ShareableLinkHandlerController {
  constructor(private readonly service: ShareableLinkHandlerService) {}

  @Get('o/:id')
  public async linkOpened(@Param('id') id: string, @Res() res: Response) {
    try {
      const link = await this.service.linkOpened(id);
      res.redirect(link);
    } catch (e) {
      throw e;
    }
  }
}
