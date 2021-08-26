import { forwardRef, Module } from '@nestjs/common';
import { PaymentHistoryModule } from 'src/modules/payment-history/payment-history.module';
import { UsersModule } from 'src/modules/users/users.module';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [
    MainMysqlModule,
    forwardRef(() => UsersModule),
    forwardRef(() => PaymentHistoryModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentMethodsService],
  exports: [PaymentMethodsService],
})
export class PaymentsModule {}
