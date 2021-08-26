import { EntityRepository, Repository } from 'typeorm';
import { BroadcastsEntity } from '../entities/broadcast.entity';

@EntityRepository(BroadcastsEntity)
export class BroadcastsRepository extends Repository<BroadcastsEntity> {}
