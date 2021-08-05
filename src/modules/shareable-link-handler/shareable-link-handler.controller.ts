import { Controller, Get, Param, Redirect, Res } from '@nestjs/common';
import { Response } from 'express';
import { ShareableLinkHandlerService } from './shareable-link-handler.service';

@Controller('s')
export class ShareableLinkHandlerController {
  constructor(private readonly service: ShareableLinkHandlerService) {}

  @Get('o/:id')
  @Redirect()
  public async linkOpened(@Param('id') id: string, @Res() res: Response) {
    try {
      let link = await this.service.linkOpened(id);
      console.log('link', link);
      if (!link.includes('http')) {
        link = 'https://' + link;
      }
      return { url: link, statusCode: 301 };
    } catch (e) {
      throw e;
    }
  }
}
