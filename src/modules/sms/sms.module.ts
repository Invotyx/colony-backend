import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { CityCountryModule } from 'src/services/city-country/city-country.module';
import { CityCountryService } from 'src/services/city-country/city-country.service';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { ContactsModule } from '../contacts/contacts.module';
import { PaymentHistoryModule } from '../payment-history/payment-history.module';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { PhoneModule } from '../phone/phone.module';
import { PhoneService } from '../phone/phone.service';
import { ProductsModule } from '../products/products.module';
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
    forwardRef(() => UsersModule),
    forwardRef(() => ContactsModule),
    forwardRef(() => PhoneModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => PaymentHistoryModule),
    forwardRef(() => CityCountryModule),
  ],
  controllers: [SmsController],
  providers: [
    SmsService,
    InboundSmsProcessor,
    PaymentHistoryService,
    CityCountryService,
    PhoneService,
    BroadcastService,
  ],
  exports: [SmsService],
})
export class SmsModule {}
