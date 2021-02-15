import { EntityRepository, Repository } from 'typeorm';
import { PlansEntity } from '../../../entities/plans.entity';

@EntityRepository(PlansEntity)
export class PlansRepository extends Repository<PlansEntity> {}
