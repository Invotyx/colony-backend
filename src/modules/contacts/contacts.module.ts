import { forwardRef, Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { PhoneModule } from '../phone/phone.module';
import { SmsModule } from '../sms/sms.module';
import { UsersModule } from '../users/users.module';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  imports: [
    MainMysqlModule,
    forwardRef(() => UsersModule),
    forwardRef(() => SmsModule),
    forwardRef(() => PhoneModule),
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
