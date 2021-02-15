import { EntityRepository, Repository } from 'typeorm';
import { SubscriptionsEntity } from '../../../entities/subscriptions.entity';

@EntityRepository(SubscriptionsEntity)
export class SubscriptionsRepository extends Repository<SubscriptionsEntity> {}
