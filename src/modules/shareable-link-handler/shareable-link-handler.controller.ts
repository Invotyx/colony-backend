import { Controller, Get, Param, Redirect } from '@nestjs/common';
import { ShareableLinkHandlerService } from './shareable-link-handler.service';

@Controller('s')
export class ShareableLinkHandlerController {
  constructor(private readonly service: ShareableLinkHandlerService) {}

  @Get('o/:id')
  @Redirect()
  public async linkOpened(@Param('id') id: string) {
    try {
      const link = await this.service.linkOpened(id);
      return { url: link };
    } catch (e) {
      throw e;
    }
  }
}
