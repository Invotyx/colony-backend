import { ROLES } from '../../services/access-control/consts/roles.const'
import { Seeder } from '../../decorators/common.decorator';
import { RolesService } from '../../modules/users/services/roles.service';
import { ISeed } from '../seeds.interface';

@Seeder()
export class RolesSeed implements ISeed {
  constructor(private readonly rolesService: RolesService) {}
  async up() {
    
    const Roles = Object.values(ROLES);
    const res = await Promise.all(
      Roles.map((v) => this.rolesService.createRole(v))
    );
    return res;
  }
  async down() {}
}
