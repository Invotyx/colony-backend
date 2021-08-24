import { EntityRepository, Repository } from 'typeorm';
import { PaymentHistoryEntity } from './entities/purchaseHistory.entity';

@EntityRepository(PaymentHistoryEntity)
export class PaymentHistoryRepository extends Repository<PaymentHistoryEntity> {}
