import { Injectable } from '@nestjs/common';
import { oneLine } from 'common-tags';
import { TABLES } from '../../consts/tables.const';
import { UserToRoleEntity } from '../../entities/user-to-role.entity';
import { UserHasPermissionEntity } from '../../entities/users-has-permissions.entity';
import { PermissionsService } from '../../modules/users/services/permissions.service';
import { RolesService } from '../../modules/users/services/roles.service';
import { UsersService } from '../../modules/users/services/users.service';
import { ACLBuilder } from './acl-builder';
import { genActiveUser } from './active-user.model';

@Injectable()
export class AccessControlService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService
  ) {}

  public async getUser(userId) {
    const query = await this.usersService.repository
      .createQueryBuilder(TABLES.USERS.name)
      .where('users.id = :userId', { userId })
      .getOne();
    return query;
  }

 
  public async getUserRoles(userId) {
    const query = await this.rolesService.repository
      .createQueryBuilder(TABLES.ROLES.name)
      .innerJoinAndSelect(
        UserToRoleEntity,
        TABLES.USER_ROLE.name,
        oneLine`(${TABLES.USER_ROLE.name}.userId = :userId AND
          ${TABLES.USER_ROLE.name}.roleId = ${TABLES.ROLES.name}.id)`,
        { userId }
      )
      .select([
        '`roles`.`id` as `id`',
        '`roles`.`role` as `name`',
        '`user_role`.`meta` as `user_role_meta`',
      ])
      .getRawMany();
    return query;
  }

  public async getUserPermissions(userId) {
    const query = await this.permissionsService.repository
      .createQueryBuilder(TABLES.PERMISSIONS.name)
      .innerJoinAndSelect(
        UserHasPermissionEntity,
        TABLES.USER_HAS_PERMISSIONS.name,
        oneLine`(${TABLES.USER_HAS_PERMISSIONS.name}.userId = :userId AND
          ${TABLES.USER_HAS_PERMISSIONS.name}.permId = ${TABLES.PERMISSIONS.name}.id)`,
        { userId }
      )
      .getMany();
    return query;
  }

  

  public async buildACL() {
    const userId = 1;
    const [user, perms, roles] = await Promise.all([
      this.getUser(userId),
      this.getUserPermissions(userId),
      this.getUserRoles(userId),
    ]);
    const userDetails = { ...user, perms, roles };

    console.log(
      JSON.stringify(genActiveUser(userDetails), null, 2),
      ACLBuilder.build(genActiveUser(userDetails), 1).rules
    );
  }

  
}
