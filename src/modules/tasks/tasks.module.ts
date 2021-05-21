import { forwardRef, Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { ContactsModule } from '../contacts/contacts.module';
import { PaymentHistoryModule } from '../payment-history/payment-history.module';
import { SmsModule } from '../sms/sms.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MainMysqlModule,
    forwardRef(() => ContactsModule),
    forwardRef(() => SmsModule),
    forwardRef(() => PaymentHistoryModule),
  ],
  providers: [TasksService],
})
export class TasksModule {}
