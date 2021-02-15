import { PermissionEntity } from '../entities/permissions.entity';
import { RoleHasPermissionEntity } from '../entities/role-has-permissions.entity';
import { RoleEntity } from '../entities/role.entity';
import { UserToRoleEntity } from '../entities/user-to-role.entity';
import { UserEntity } from '../entities/user.entity';
import { UserHasPermissionEntity } from '../entities/users-has-permissions.entity';
import { LanguageEntity } from '../entities/language.entity';
import { EmailVerifications } from '../entities/verifyemail.entity';
import { ForgotPassword } from '../entities/forgottenpassword.entity';
import { ImagesEntity } from '../entities/images.entity';
import { PagesEntity } from '../entities/pages.entity';
import { PostsEntity } from '../entities/posts.entity';
import { SectionsEntity } from '../entities/sections.entity';
import { ButtonsEntity } from '../entities/buttons.entity';
import { PlansEntity } from '../entities/plans.entity';
import { ProductsEntity } from '../entities/products.entity';
import { SubscriptionsEntity } from '../entities/subscriptions.entity';
import { PaymentMethodsEntity } from '../entities/payment-methods.entity';
import { JOIN_HELPER } from './join-helper.const';

export const EntitiesRegister: any = {
  PermissionEntity,
  RoleEntity,
  RoleHasPermissionEntity,
  UserEntity,
  UserHasPermissionEntity,
  UserToRoleEntity,
  LanguageEntity,
  EmailVerifications,
  ForgotPassword,
  ImagesEntity,
  PagesEntity,
  PostsEntity,
  SectionsEntity,
  ButtonsEntity,
  PlansEntity,
  ProductsEntity,
  SubscriptionsEntity,
  PaymentMethodsEntity,
};

export const Entities: any = Object.values(EntitiesRegister);
Object.entries(EntitiesRegister).forEach(([k, v]) => (JOIN_HELPER[k] = v));
