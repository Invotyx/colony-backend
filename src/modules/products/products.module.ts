import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { PlanModule } from './plan/plan.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [SubscriptionModule, PlanModule, PaymentsModule],
  exports: [SubscriptionModule, PlanModule, PaymentsModule],
})
export class ProductsModule {}
