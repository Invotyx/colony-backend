import { FileEntity } from '../entities/file.entity';
import { PermissionEntity } from '../entities/permissions.entity';
import { RoleHasPermissionEntity } from '../entities/role-has-permissions.entity';
import { RoleEntity } from '../entities/role.entity';
import { TokenEntity } from '../entities/token.entity';
import { UserToRoleEntity } from '../entities/user-to-role.entity';
import { UserEntity } from '../entities/user.entity';
import { UserHasPermissionEntity } from '../entities/users-has-permissions.entity';
import { LanguageEntity } from '../entities/language.entity';
import { EmailVerifications } from '../entities/verifyemail.entity';
import { ForgotPassword } from '../entities/forgottenpassword.entity';

import { JOIN_HELPER } from './join-helper.const';

export const EntitiesRegister = {

  FileEntity,
  PermissionEntity,
  RoleEntity,
  RoleHasPermissionEntity,
  TokenEntity,
  UserEntity,
  UserHasPermissionEntity,
  UserToRoleEntity,
  LanguageEntity,
  EmailVerifications,
  ForgotPassword
  
};

export const Entities = Object.values(EntitiesRegister);
Object.entries(EntitiesRegister).forEach(([k, v]) => (JOIN_HELPER[k] = v));
