import { EntityRepository, Repository } from 'typeorm';
import { RoleEntity } from '../modules/users/entities/role.entity';

@EntityRepository(RoleEntity)
export class RoleRepository extends Repository<RoleEntity> {}
