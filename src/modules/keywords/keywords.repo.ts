import { EntityRepository, Repository } from 'typeorm';
import { KeywordsEntity } from './keywords.entity';

@EntityRepository(KeywordsEntity)
export class KeywordsRepository extends Repository<KeywordsEntity> {}
