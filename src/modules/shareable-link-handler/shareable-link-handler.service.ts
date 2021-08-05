import { Injectable } from '@nestjs/common';
import { InfluencerLinksService } from '../influencer-links/influencer-links.service';

@Injectable()
export class ShareableLinkHandlerService {
  constructor(
    private readonly influencerLinksService: InfluencerLinksService,
  ) {}

  public async linkOpened(id: string) {
    try {
      const r = await this.influencerLinksService.linkOpened(id);

      console.log('r', r);
      return r.link;
    } catch (e) {
      console.log('ShareableLinkHandlerService.linkOpened', e);
      throw e;
    }
  }
}
