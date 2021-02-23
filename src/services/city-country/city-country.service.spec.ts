import { Test, TestingModule } from '@nestjs/testing';
import { CityCountryService } from './city-country.service';

describe('CityCountryService', () => {
  let service: CityCountryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CityCountryService],
    }).compile();

    service = module.get<CityCountryService>(CityCountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
