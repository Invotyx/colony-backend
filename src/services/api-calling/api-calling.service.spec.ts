import { Test, TestingModule } from '@nestjs/testing';
import { ApiCallingService } from './api-calling.service';

describe('ApiCallingService', () => {
  let service: ApiCallingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiCallingService],
    }).compile();

    service = module.get<ApiCallingService>(ApiCallingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
