import { EntityRepository, Repository } from 'typeorm';
import { PaymentMethodsEntity } from '../entities/payment-methods.entity';

@EntityRepository(PaymentMethodsEntity)
export class PaymentMethodsRepository extends Repository<PaymentMethodsEntity> {}
