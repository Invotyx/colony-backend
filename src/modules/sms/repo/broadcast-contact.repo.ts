import { EntityRepository, Repository } from 'typeorm';
import { BroadcastsContactsEntity } from '../entities/broadcast-contacts.entity';

@EntityRepository(BroadcastsContactsEntity)
export class BroadcastContactsRepository extends Repository<BroadcastsContactsEntity> {}
