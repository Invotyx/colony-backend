import { EntityRepository, Repository } from 'typeorm';
import { PresetMessagesEntity } from '../entities/preset-message.entity';

@EntityRepository(PresetMessagesEntity)
export class PresetMessagesRepository extends Repository<PresetMessagesEntity> {}
