import { EntityRepository, Repository } from 'typeorm';
import { PermissionEntity } from '../entities/permissions.entity';

@EntityRepository(PermissionEntity)
export class PermissionRepository extends Repository<PermissionEntity> {}
