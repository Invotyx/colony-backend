import { Module } from '@nestjs/common';
import { ApiCallingService } from 'src/services/api-calling/api-calling.service';
import { ApiCallingModule } from '../../services/api-calling/api-calling.module';
import { PhoneController } from './phone.controller';
import { PhoneService } from './phone.service';

@Module({
  imports:[ApiCallingModule],
  controllers: [PhoneController],
  providers: [PhoneService,ApiCallingService]
})
export class PhoneModule {}
