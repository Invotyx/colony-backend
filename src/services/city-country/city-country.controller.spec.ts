import { Test, TestingModule } from '@nestjs/testing';
import { CityCountryController } from './city-country.controller';

describe('CityCountryController', () => {
  let controller: CityCountryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityCountryController],
    }).compile();

    controller = module.get<CityCountryController>(CityCountryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
