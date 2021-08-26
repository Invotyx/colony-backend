import { EntityRepository, Repository } from 'typeorm';
import { SectionsEntity } from '../entities/sections.entity';

@EntityRepository(SectionsEntity)
export class SectionsRepository extends Repository<SectionsEntity> {}
