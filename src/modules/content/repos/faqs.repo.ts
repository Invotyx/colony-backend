import { EntityRepository, Repository } from 'typeorm';
import { FaqsEntity } from '../entities/faqs.entity';

@EntityRepository(FaqsEntity)
export class FaqsRepository extends Repository<FaqsEntity> {}
