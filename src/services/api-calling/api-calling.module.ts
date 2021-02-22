import { HttpModule, Module } from '@nestjs/common';
import { ApiCallingService } from './api-calling.service';

@Module({
  imports: [HttpModule],
  providers: [ApiCallingService],
})
export class ApiCallingModule {}
