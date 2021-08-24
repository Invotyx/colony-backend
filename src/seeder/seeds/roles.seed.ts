import { Seeder } from '../../decorators/common.decorator';
import { RolesService } from '../../modules/users/services/roles.service';
import { ROLES } from '../../services/access-control/consts/roles.const';
import { ISeed } from '../seeds.interface';

@Seeder()
export class RolesSeed implements ISeed {
  constructor(private readonly rolesService: RolesService) {}
  async up() {
    const Roles = Object.values(ROLES);
    Roles.forEach(async (role) => {
      try {
        const r = await this.rolesService.findOne({
          where: { role: role },
        });
        if (!r) {
          await this.rolesService.createRole(role);
        }
      } catch (e) {
        ////console.log(e, '===here====');
      }
    });
  }
  async down() {
    //
  }
}
