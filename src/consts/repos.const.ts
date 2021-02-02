import { PermissionRepository } from '../repos/permission.repo';
import { RoleRepository } from '../repos/roles.repo';
import { UserRepository } from '../modules/users/repos/user.repo';
import { LanguageRepository } from '../modules/language/languages.repo';
import { EmailVerificationsRepository } from '../modules/users/repos/verifyemail.repo';
import { ForgotPasswordRepository } from '../modules/users/repos/forgotpassword.repo';

export const REPOS = [
  PermissionRepository,
  RoleRepository,
  UserRepository,
  LanguageRepository,
  EmailVerificationsRepository,
  ForgotPasswordRepository
];
