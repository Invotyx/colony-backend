import { forwardRef, Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { SmsModule } from '../sms/sms.module';
import { SmsService } from '../sms/sms.service';
import { UsersModule } from '../users/users.module';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  imports: [MainMysqlModule, forwardRef(() => UsersModule),forwardRef(() =>  SmsModule)],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
