import { Controller } from '@nestjs/common';
import { PaymentHistoryService } from './payment-history.service';

@Controller('payment-history')
export class PaymentHistoryController {
  constructor(private readonly service: PaymentHistoryService) {}
}
