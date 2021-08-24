import { EntityRepository, Repository } from 'typeorm';
import { ConversationMessagesEntity } from '../entities/conversation-messages.entity';

@EntityRepository(ConversationMessagesEntity)
export class ConversationMessagesRepository extends Repository<ConversationMessagesEntity> {}
