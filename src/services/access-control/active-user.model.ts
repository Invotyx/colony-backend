import sift from 'sift';
export class ActiveUser {
  id: number;
  name: string;
  username: string;
  email: string;
  mobile: string;
  gender: string;
  image: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: any[];
  perms: any[];
  meta: any;

  toJSON() {
    return this;
  }

  hasRole(role: string) {
    return this.roles.find((v) => v.name === role);
  }

  hasRoleWithCtx(role: string, ctx: any) {
    const r = this.roles.find((v) => v.name === role);
    return r && sift(r.userRoleMeta.ctx)(ctx);
  }

  hasAnyRole(roles: string[]) {
    return this.roles.some((v) => roles.includes(v.name));
  }
}

export const genActiveUser = (userDetails: any) => {
  const activeUser = new ActiveUser();
  activeUser.id = userDetails.id;
  activeUser.name = userDetails.name;
  activeUser.username = userDetails.username;
  activeUser.email = userDetails.email;
  activeUser.mobile = userDetails.mobile;
  activeUser.gender = userDetails.gender;
  activeUser.image = userDetails.image;
  activeUser.isActive = userDetails.isActive;
  activeUser.createdAt = userDetails.createdAt;
  activeUser.updatedAt = userDetails.updatedAt;
  activeUser.roles = (userDetails.roles || []).map((role: any) => ({
    id: role.id,
    name: role.name,
    userRoleMeta: JSON.parse(role.user_role_meta),
  }));
  activeUser.perms = userDetails.perms;
  activeUser.meta = userDetails.meta;
  return activeUser;
};
