import { EntityRepository, Repository } from 'typeorm';
import { ConversationsEntity } from '../entities/conversations.entity';

@EntityRepository(ConversationsEntity)
export class ConversationsRepository extends Repository<ConversationsEntity> {}
