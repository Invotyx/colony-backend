import { Module } from '@nestjs/common';
import { InfluencerLinksModule } from '../influencer-links/influencer-links.module';
import { ShareableLinkHandlerController } from './shareable-link-handler.controller';
import { ShareableLinkHandlerService } from './shareable-link-handler.service';

@Module({
  imports:[InfluencerLinksModule],
  controllers: [ShareableLinkHandlerController],
  providers: [ShareableLinkHandlerService]

})
export class ShareableLinkHandlerModule {}
