import { ROLES } from '../../services/access-control/consts/roles.const'
import { Seeder } from '../../decorators/common.decorator';
import { RolesService } from '../../modules/users/services/roles.service';
import { ISeed } from '../seeds.interface';
import { UsersService } from 'src/modules/users/services/users.service';
import { UserEntity } from 'src/entities/user.entity';
import { UpdateRole } from 'src/modules/users/users.dto';
import { PasswordHashEngine } from 'src/modules/auth/hash.service';

@Seeder()
export class CreateAdminSeed implements ISeed {
  constructor(
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService
  ) { }
  async up() {    
    const admin = new UserEntity();
    admin.firstName = "System";
    admin.lastName = "Admin";
    admin.mobile = "+123456789";
    admin.password =await PasswordHashEngine.make("P@$$WORD1234");
    admin.username = "admin";
    admin.email = "admin@colony.com";
    admin.isActive = true;
    admin.isApproved = true;
    admin.statusMessage = "I'm system admin";

    const check = await this.usersService.repository.findOne({ where: { username: "admin" } });
    
    if (!check) {
      const saved = await this.usersService.repository.save(admin);
      const role = new UpdateRole();
      role.userId = saved.id;
      role.roleId = [await (await this.rolesService.repository.findOne({ where: { role: 'admin' } })).id];
      const RoleId = role.roleId;
      const allRoles = await this.rolesService.repository
        .createQueryBuilder('s')
        .where(' s.id IN (:...RoleId)', { RoleId })
        .getMany();
      admin.roles = allRoles;
      await this.usersService.repository.save(admin);
    }
    
  }
  async down() {}
}
