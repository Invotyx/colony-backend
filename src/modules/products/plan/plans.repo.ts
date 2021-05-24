import { EntityRepository, Repository } from 'typeorm';
import { PlansEntity } from './plans.entity';

@EntityRepository(PlansEntity)
export class PlansRepository extends Repository<PlansEntity> {}
