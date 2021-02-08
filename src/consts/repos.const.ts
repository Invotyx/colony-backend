import { PermissionRepository } from '../repos/permission.repo';
import { RoleRepository } from '../repos/roles.repo';
import { UserRepository } from '../modules/users/repos/user.repo';
import { LanguageRepository } from '../modules/language/languages.repo';
import { EmailVerificationsRepository } from '../modules/users/repos/verifyemail.repo';
import { ForgotPasswordRepository } from '../modules/users/repos/forgotpassword.repo';
import { ImagesRepository } from '../modules/content/repos/images.repo';
import { PagesRepository } from '../modules/content/repos/pages.repo';
import { PostsRepository } from '../modules/content/repos/posts.repo';
import { SectionsRepository } from '../modules/content/repos/sections.repo';
import { ButtonsRepository } from '../modules/content/repos/buttons.repo';
import { FaqsRepository } from '../modules/content/repos/faqs.repo';


export const REPOS = [
  PermissionRepository,
  RoleRepository,
  UserRepository,
  LanguageRepository,
  EmailVerificationsRepository,
  ForgotPasswordRepository,
  ImagesRepository,
  PagesRepository,
  PostsRepository,
  SectionsRepository,
  ButtonsRepository,
  FaqsRepository
];
