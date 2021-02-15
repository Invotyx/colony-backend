import { Injectable } from '@nestjs/common';
import { RoleEntity } from '../../../entities/role.entity';
import { RoleRepository } from '../../../repos/roles.repo';
import { isExist } from '../../../shared/repo.fun';
import { RoleAlreadyExistError } from '../errors/roles.error';

@Injectable()
export class RolesService {
  constructor(public readonly repository: RoleRepository) {}

  async isRoleExists(val: any) {
    return isExist(this.repository, 'role', val);
  }

  async createRole(role: string) {
    try {
      const isAlreadyExist = await this.isRoleExists(role);
      if (isAlreadyExist) {
        throw RoleAlreadyExistError;
      }
      const newRole = await this.repository.save({ role });
      return newRole;
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number): Promise<RoleEntity> {
    return this.repository.findOne(id);
  }

  findAll(): Promise<RoleEntity[]> {
    return this.repository.find();
  }
}
