import { forwardRef, Module } from '@nestjs/common';
import { PaymentHistoryModule } from 'src/modules/payment-history/payment-history.module';
import { PhoneModule } from 'src/modules/phone/phone.module';
import { PhoneService } from 'src/modules/phone/phone.service';
import { UsersModule } from 'src/modules/users/users.module';
import { ApiCallingModule } from 'src/services/api-calling/api-calling.module';
import { ApiCallingService } from 'src/services/api-calling/api-calling.service';
import { CityCountryModule } from 'src/services/city-country/city-country.module';
import { MailModule } from 'src/services/mail/mail.module';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { InvoiceEmailSender } from '../../../mails/users/invoice.mailer';
import { PaymentsModule } from '../payments/payments.module';
import { PlanModule } from '../plan/plan.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [
    MainMysqlModule,
    forwardRef(() => UsersModule),
    forwardRef(() => PhoneModule),
    PlanModule,
    PaymentsModule,
    MailModule,
    forwardRef(() => ApiCallingModule),
    forwardRef(() => CityCountryModule),
    forwardRef(() => PaymentHistoryModule),
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    PhoneService,
    ApiCallingService,
    InvoiceEmailSender,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionModule {}
