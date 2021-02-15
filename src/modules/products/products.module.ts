import { Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { UsersModule } from '../users/users.module';
import { PaymentsController } from './controllers/payments.controller';
import { ProductsController } from './controllers/products.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { PaymentMethodsService } from './services/payment-methods.service';
import { PlansService } from './services/plans.service';
import { ProductsService } from './services/products.service';
import { SubscriptionsService } from './services/subscriptions.service';

@Module({
  imports: [MainMysqlModule, UsersModule],
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
  ],
  exports: [ProductsService, PlansService],
})
export class ProductsModule {}
