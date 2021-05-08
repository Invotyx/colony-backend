import { Injectable } from '@nestjs/common';
import { PaymentHistoryRepository } from './payment-history.repo';

@Injectable()
export class PaymentHistoryService {
  constructor(public readonly repository: PaymentHistoryRepository) {}
}
