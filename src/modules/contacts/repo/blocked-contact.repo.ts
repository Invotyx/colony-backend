import { EntityRepository, Repository } from 'typeorm';
import { BlockedContactsEntity } from '../entities/blocked-contacts.entity';

@EntityRepository(BlockedContactsEntity)
export class BlockedContactRepository extends Repository<BlockedContactsEntity> {}
