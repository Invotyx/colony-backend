import { Injectable } from '@nestjs/common';
import { PermissionEntity } from '../../../entities/permissions.entity';
import { isExist } from '../../../shared/repo.fun';
import { PermissionRepository } from '../../../repos/permission.repo';
import { RoleRepository } from '../../../repos/roles.repo';
import { PermissionData } from '../../../services/access-control/consts/permission.const';
import { FileMgrService } from '../../../services/file-mgr/file-mgr.service';
import { PermissionAlreadyExistError } from '../errors/permissions.error';

@Injectable()
export class PermissionsService {
  constructor(
    public readonly repository: PermissionRepository,
    private readonly fileMgrService: FileMgrService,
    private readonly roleRepository: RoleRepository
  ) {}

  
  async isPermissionExists(val) {
    const a =await isExist(this.repository, 'subject',val.subject);
    const b =await isExist(this.repository, 'action',val.action); 

    let z = true;
    if(a && b)
    {
      z = true;
    }
    if(!a && !b){
      z = false;
    }
    if(a && !b){
      z = false;
    }
    if(!a && b){
      z = false;
    }
    return z;
  }

  async createPermission(permission: PermissionData) {
    try {
      const isAlreadyExist = await this.isPermissionExists(permission);
      if (isAlreadyExist) {
        throw PermissionAlreadyExistError;
      }
      const newPermission = await this.repository.save(permission);
      return newPermission;
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number): Promise<PermissionEntity> {
    return this.repository.findOne(id);
  }

  findAll(): Promise<PermissionEntity[]> {
    return this.repository.find();
  }
}
