import { Module } from '@nestjs/common';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { PaymentHistoryController } from './payment-history.controller';
import { PaymentHistoryService } from './payment-history.service';

@Module({
  imports: [MainMysqlModule],
  controllers: [PaymentHistoryController],
  providers: [PaymentHistoryService],
  exports: [PaymentHistoryService],
})
export class PaymentHistoryModule {}
