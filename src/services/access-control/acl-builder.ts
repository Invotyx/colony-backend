import { Ability, AbilityBuilder } from '@casl/ability';
import { ActiveUser } from './active-user.model';
import { PermissionsList } from './consts/permission.const';
import { ROLES } from './consts/roles.const';

export class ACLBuilder {
  static build(user: ActiveUser, orgId: number) {
    const ability = new AbilityBuilder();
    if (user.hasRole(ROLES.ADMIN)) {
      ability.can(
        PermissionsList.create$Users.action,
        PermissionsList.create$Users.subject,
      );
    } else {
      if (user.hasRoleWithCtx(ROLES.ADMIN, {}))
        //pass context
        ability.can(
          PermissionsList.create$Users.action,
          PermissionsList.create$Users.subject,
          { orgId },
        );
    }

    // ability.can('manage', 'BlogPost', { author: user.id });
    // ability.cannot('delete', 'BlogPost', {
    //   createdAt: { $lt: Date.now() - 24 * 60 * 60 * 1000 },
    // });
    return new Ability(ability.rules as any);
  }
}
