import { Module } from '@nestjs/common';
import { ApiCallingModule } from 'src/services/api-calling/api-calling.module';
import { ApiCallingService } from 'src/services/api-calling/api-calling.service';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { PhoneModule } from '../phone/phone.module';
import { PhoneService } from '../phone/phone.service';
import { UsersModule } from '../users/users.module';
import { PaymentsController } from './controllers/payments.controller';
import { ProductsController } from './controllers/products.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { PaymentMethodsService } from './services/payment-methods.service';
import { PlansService } from './services/plans.service';
import { ProductsService } from './services/products.service';
import { SubscriptionsService } from './services/subscriptions.service';

@Module({
  imports: [MainMysqlModule, UsersModule, PhoneModule, ApiCallingModule],
  controllers: [
    ProductsController,
    PaymentsController,
    SubscriptionsController,
  ],
  providers: [
    ProductsService,
    PlansService,
    PaymentMethodsService,
    SubscriptionsService,
    PhoneService,
    ApiCallingService,
  ],
  exports: [ProductsService, PlansService],
})
export class ProductsModule {}
