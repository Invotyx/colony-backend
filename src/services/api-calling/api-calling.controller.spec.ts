import { Test, TestingModule } from '@nestjs/testing';
import { ApiCallingController } from './api-calling.controller';

describe('ApiCallingController', () => {
  let controller: ApiCallingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiCallingController],
    }).compile();

    controller = module.get<ApiCallingController>(ApiCallingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
