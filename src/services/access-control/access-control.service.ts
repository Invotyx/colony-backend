import { Injectable } from '@nestjs/common';
import { oneLine } from 'common-tags';
import { UserRepository } from 'src/modules/users/repos/user.repo';
import { PermissionRepository } from 'src/repos/permission.repo';
import { RoleRepository } from 'src/repos/roles.repo';
import { TABLES } from '../../consts/tables.const';
import { UserToRoleEntity } from '../../modules/users/entities/user-to-role.entity';
import { UserHasPermissionEntity } from '../../modules/users/entities/users-has-permissions.entity';
import { PermissionsService } from '../../modules/users/services/permissions.service';
import { UsersService } from '../../modules/users/services/users.service';
import { ACLBuilder } from './acl-builder';
import { genActiveUser } from './active-user.model';

@Injectable()
export class AccessControlService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly permissionRepo: PermissionRepository,
    private readonly usersService: UsersService,
    private readonly rolesRepo: RoleRepository,
    private readonly userRepo: UserRepository,
  ) {}

  public async getUser(userId: any) {
    const query = await this.userRepo
      .createQueryBuilder(TABLES.USERS.name)
      .where('users.id = :userId', { userId })
      .getOne();
    return query;
  }

  public async getUserRoles(userId: any) {
    const query = await this.rolesRepo
      .createQueryBuilder(TABLES.ROLES.name)
      .innerJoinAndSelect(
        UserToRoleEntity,
        TABLES.USER_ROLE.name,
        oneLine`(${TABLES.USER_ROLE.name}.userId = :userId AND
          ${TABLES.USER_ROLE.name}.roleId = ${TABLES.ROLES.name}.id)`,
        { userId },
      )
      .select([
        '`roles`.`id` as `id`',
        '`roles`.`role` as `name`',
        '`user_role`.`meta` as `user_role_meta`',
      ])
      .getRawMany();
    return query;
  }

  public async getUserPermissions(userId: any) {
    const query = await this.permissionRepo
      .createQueryBuilder(TABLES.PERMISSIONS.name)
      .innerJoinAndSelect(
        UserHasPermissionEntity,
        TABLES.USER_HAS_PERMISSIONS.name,
        oneLine`(${TABLES.USER_HAS_PERMISSIONS.name}.userId = :userId AND
          ${TABLES.USER_HAS_PERMISSIONS.name}.permId = ${TABLES.PERMISSIONS.name}.id)`,
        { userId },
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

    //console.log(
    //   JSON.stringify(genActiveUser(userDetails), null, 2),
    //   ACLBuilder.build(genActiveUser(userDetails), 1).rules,
    // );
  }
}
