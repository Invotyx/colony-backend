import { forwardRef, Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { PaymentHistoryModule } from '../payment-history/payment-history.module';
import { PhoneModule } from '../phone/phone.module';
import { SubscriptionModule } from '../products/subscription/subscription.module';
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
    forwardRef(() => PaymentHistoryModule),
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
