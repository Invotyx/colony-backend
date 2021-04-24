import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { ContactsModule } from '../contacts/contacts.module';
import { PhoneModule } from '../phone/phone.module';
import { UsersModule } from '../users/users.module';
import { BroadcastService } from './broadcast.service';
import { InboundSmsProcessor } from './sms-inbound.processor';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'receive_sms_and_send_welcome',
    }),
    MainMysqlModule,
    UsersModule,
    ContactsModule,
    PhoneModule,
  ],
  controllers: [SmsController],
  providers: [SmsService, BroadcastService, InboundSmsProcessor],
})
export class SmsModule {}
