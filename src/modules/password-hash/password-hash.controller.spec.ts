import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashController } from './password-hash.controller';

describe('PasswordHashController', () => {
  let controller: PasswordHashController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordHashController],
    }).compile();

    controller = module.get<PasswordHashController>(PasswordHashController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
