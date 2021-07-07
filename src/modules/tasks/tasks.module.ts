import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { ContactsModule } from '../contacts/contacts.module';
import { InfluencerLinksModule } from '../influencer-links/influencer-links.module';
import { PaymentHistoryModule } from '../payment-history/payment-history.module';
import { PhoneModule } from '../phone/phone.module';
import { PlanModule } from '../products/plan/plan.module';
import { ProductsModule } from '../products/products.module';
import { SubscriptionModule } from '../products/subscription/subscription.module';
import { SmsModule } from '../sms/sms.module';
import { OutboundBroadcastSmsProcessor } from './broadcast.processor';
import { ScheduledSmsProcessor } from './sms-scheduled.processor';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'broadcast_q',
      },
      {
        name: 'sms_q',
      },
    ),
    MainMysqlModule,
    forwardRef(() => ContactsModule),
    forwardRef(() => SmsModule),
    forwardRef(() => PaymentHistoryModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => PhoneModule),
    forwardRef(() => PlanModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => InfluencerLinksModule),
  ],
  providers: [
    TasksService,
    OutboundBroadcastSmsProcessor,
    ScheduledSmsProcessor,
  ],
})
export class TasksModule {}
