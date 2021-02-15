import { PermissionsList } from '../../services/access-control/consts/permission.const';
import { Seeder } from '../../decorators/common.decorator';
import { PermissionsService } from '../../modules/users/services/permissions.service';
import { ISeed } from '../seeds.interface';

@Seeder()
export class PermissionSeed implements ISeed {
  constructor(private readonly permissionsService: PermissionsService) {}
  async up() {
    const Permissions = Object.values(PermissionsList); //roles
    const res = await Promise.all(
      Permissions.map((v: any) => this.permissionsService.createPermission(v)),
    );

    return res;
  }
  async down() {
    //
  }
}
