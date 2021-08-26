import { EntityRepository, Repository } from 'typeorm';
import { PermissionEntity } from '../modules/users/entities/permissions.entity';

@EntityRepository(PermissionEntity)
export class PermissionRepository extends Repository<PermissionEntity> {}
