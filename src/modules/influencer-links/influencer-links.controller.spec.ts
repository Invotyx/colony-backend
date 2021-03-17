import { Test, TestingModule } from '@nestjs/testing';
import { InfluencerLinksController } from './influencer-links.controller';

describe('InfluencerLinksController', () => {
  let controller: InfluencerLinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfluencerLinksController],
    }).compile();

    controller = module.get<InfluencerLinksController>(
      InfluencerLinksController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
