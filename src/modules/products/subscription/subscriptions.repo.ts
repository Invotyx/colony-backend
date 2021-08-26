import { EntityRepository, Repository } from 'typeorm';
import { SubscriptionsEntity } from './subscriptions.entity';

@EntityRepository(SubscriptionsEntity)
export class SubscriptionsRepository extends Repository<SubscriptionsEntity> {}
