import { Test, TestingModule } from '@nestjs/testing';
import { InfluencerLinksService } from './influencer-links.service';

describe('InfluencerLinksService', () => {
  let service: InfluencerLinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InfluencerLinksService],
    }).compile();

    service = module.get<InfluencerLinksService>(InfluencerLinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
