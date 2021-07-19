import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { InvoiceEmailSender } from 'src/mails/users/Invoice.mailer';
import { CityCountryModule } from 'src/services/city-country/city-country.module';
import { CityCountryService } from 'src/services/city-country/city-country.service';
import { MailModule } from 'src/services/mail/mail.module';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { ContactsModule } from '../contacts/contacts.module';
import { InfluencerLinksModule } from '../influencer-links/influencer-links.module';
import { InfluencerLinksService } from '../influencer-links/influencer-links.service';
import { KeywordsModule } from '../keywords/keywords.module';
import { PaymentHistoryModule } from '../payment-history/payment-history.module';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { PhoneModule } from '../phone/phone.module';
import { PhoneService } from '../phone/phone.service';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { BroadcastService } from './broadcast.service';
import { OutboundCallbackSmsProcessor } from './outbound-callback.processor';
import { InboundSmsProcessor } from './sms-inbound.processor';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'receive_sms_and_send_welcome',
      },
      {
        name: 'outbound_status_callback',
      },
      {
        name: 'receive_sms_and_send_welcome_dev',
      },
      {
        name: 'outbound_status_callback_dev',
      },
    ),
    MainMysqlModule,
    MailModule,
    forwardRef(() => UsersModule),
    forwardRef(() => ContactsModule),
    forwardRef(() => PhoneModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => PaymentHistoryModule),
    forwardRef(() => CityCountryModule),
    forwardRef(() => InfluencerLinksModule),
    forwardRef(() => KeywordsModule),
  ],
  controllers: [SmsController],
  providers: [
    SmsService,
    InboundSmsProcessor,
    OutboundCallbackSmsProcessor,
    PaymentHistoryService,
    CityCountryService,
    PhoneService,
    BroadcastService,
    InfluencerLinksService,
    InvoiceEmailSender
  ],
  exports: [SmsService, BroadcastService],
})
export class SmsModule {}
