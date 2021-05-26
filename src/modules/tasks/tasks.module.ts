import { forwardRef, Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { ContactsModule } from '../contacts/contacts.module';
import { PaymentHistoryModule } from '../payment-history/payment-history.module';
import { PhoneModule } from '../phone/phone.module';
import { ProductsModule } from '../products/products.module';
import { SmsModule } from '../sms/sms.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MainMysqlModule,
    forwardRef(() => ContactsModule),
    forwardRef(() => SmsModule),
    forwardRef(() => PaymentHistoryModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => PhoneModule),
  ],
  providers: [TasksService],
})
export class TasksModule {}
