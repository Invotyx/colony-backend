import { EntityRepository, Repository } from 'typeorm';
import { PaymentDuesEntity } from '../../entities/due-payments.entity';

@EntityRepository(PaymentDuesEntity)
export class PaymentDuesRepository extends Repository<PaymentDuesEntity> {}
