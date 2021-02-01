import { HttpModule, Module } from '@nestjs/common';
import { ApiCallingController } from './api-calling.controller';
import { ApiCallingService } from './api-calling.service';

@Module({
  imports:[HttpModule],
  controllers: [ApiCallingController],
  providers: [ApiCallingService]
})
export class ApiCallingModule {}
