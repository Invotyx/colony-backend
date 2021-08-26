import { Module } from '@nestjs/common';
import { InvoiceEmailSender } from '../../mails/users/invoice.mailer';
import { MailModule } from 'src/services/mail/mail.module';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { PaymentsModule } from '../products/payments/payments.module';
import { PlanModule } from '../products/plan/plan.module';
import { ProductsModule } from '../products/products.module';
import { PaymentHistoryController } from './payment-history.controller';
import { PaymentHistoryService } from './payment-history.service';

@Module({
  imports: [
    MainMysqlModule,
    ProductsModule,
    PlanModule,
    PaymentsModule,
    MailModule,
  ],
  controllers: [PaymentHistoryController],
  providers: [PaymentHistoryService, InvoiceEmailSender],
  exports: [PaymentHistoryService],
})
export class PaymentHistoryModule {}
