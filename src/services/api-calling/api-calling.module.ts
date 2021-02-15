import { HttpModule, Module } from '@nestjs/common';
import { ApiCallingService } from './api-calling.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [ApiCallingService],
})
export class ApiCallingModule {}
