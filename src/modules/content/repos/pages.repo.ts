import { EntityRepository, Repository } from 'typeorm';
import { PagesEntity } from '../entities/pages.entity';

@EntityRepository(PagesEntity)
export class PagesRepository extends Repository<PagesEntity> {}
