import { Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { UsersModule } from '../users/users.module';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';

@Module({
  imports: [MainMysqlModule, UsersModule],
  controllers: [SmsController],
  providers: [SmsService],
})
export class SmsModule {}
