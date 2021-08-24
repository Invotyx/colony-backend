import { EntityRepository, Repository } from 'typeorm';
import { PaymentMethodsEntity } from './payment-methods.entity';

@EntityRepository(PaymentMethodsEntity)
export class PaymentMethodsRepository extends Repository<PaymentMethodsEntity> {}
