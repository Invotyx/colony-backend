import { forwardRef, Module } from '@nestjs/common';
import { ApiCallingService } from 'src/services/api-calling/api-calling.service';
import { CityCountryModule } from 'src/services/city-country/city-country.module';
import { CityCountryService } from 'src/services/city-country/city-country.service';
import { MailModule } from 'src/services/mail/mail.module';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { InvoiceEmailSender } from '../../mails/users/invoice.mailer';
import { ApiCallingModule } from '../../services/api-calling/api-calling.module';
import { PaymentHistoryModule } from '../payment-history/payment-history.module';
import { PaymentMethodsService } from '../products/payments/payment-methods.service';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { PhoneController } from './phone.controller';
import { PhoneService } from './phone.service';

@Module({
  imports: [
    MainMysqlModule,
    ApiCallingModule,
    MailModule,
    forwardRef(() => UsersModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => CityCountryModule),
    forwardRef(() => PaymentHistoryModule),
  ],
  controllers: [PhoneController],
  providers: [
    PhoneService,
    ApiCallingService,
    PaymentMethodsService,
    CityCountryService,
    InvoiceEmailSender,
  ],
  exports: [PhoneService],
})
export class PhoneModule {}
