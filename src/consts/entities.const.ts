import { TimezonesEntity } from '../entities/timezones.entity';
import { BlockedContactsEntity } from '../modules/contacts/entities/blocked-contacts.entity';
import { KeywordsEntity } from '../modules/keywords/keywords.entity';
import { ContactsEntity } from '../modules/contacts/entities/contacts.entity';
import { FavoriteContactsEntity } from '../modules/contacts/entities/favorite-contacts.entity';
import { InfluencerContactsEntity } from '../modules/contacts/entities/influencer-contacts.entity';
import { ButtonsEntity } from '../modules/content/entities/buttons.entity';
import { ImagesEntity } from '../modules/content/entities/images.entity';
import { PagesEntity } from '../modules/content/entities/pages.entity';
import { PostsEntity } from '../modules/content/entities/posts.entity';
import { SectionsEntity } from '../modules/content/entities/sections.entity';
import { InfluencerLinksEntity } from '../modules/influencer-links/entities/influencer-links.entity';
import { LanguageEntity } from '../modules/language/entities/language.entity';
import { PaymentDuesEntity } from '../modules/payment-history/entities/due-payments.entity';
import { PhonesEntity } from '../modules/phone/entities/phone.entity';
import { PaymentMethodsEntity } from '../modules/products/payments/payment-methods.entity';
import { PlansEntity } from '../modules/products/plan/plans.entity';
import { SubscriptionsEntity } from '../modules/products/subscription/subscriptions.entity';
import { BroadcastsContactsEntity } from '../modules/sms/entities/broadcast-contacts.entity';
import { BroadcastsEntity } from '../modules/sms/entities/broadcast.entity';
import { ConversationMessagesEntity } from '../modules/sms/entities/conversation-messages.entity';
import { ConversationsEntity } from '../modules/sms/entities/conversations.entity';
import { SMSTemplatesEntity } from '../modules/sms/entities/sms-templates.entity';
import { ForgotPassword } from '../modules/users/entities/forgottenpassword.entity';
import { PermissionEntity } from '../modules/users/entities/permissions.entity';
import { RoleHasPermissionEntity } from '../modules/users/entities/role-has-permissions.entity';
import { RoleEntity } from '../modules/users/entities/role.entity';
import { UserToRoleEntity } from '../modules/users/entities/user-to-role.entity';
import { UserEntity } from '../modules/users/entities/user.entity';
import { UserHasPermissionEntity } from '../modules/users/entities/users-has-permissions.entity';
import { EmailVerifications } from '../modules/users/entities/verifyemail.entity';
import { CityEntity } from '../services/city-country/entities/city.entity';
import { CountryEntity } from '../services/city-country/entities/country.entity';
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
  SubscriptionsEntity,
  PaymentMethodsEntity,
  CityEntity,
  CountryEntity,
  TimezonesEntity,
  ContactsEntity,
  InfluencerContactsEntity,
  InfluencerLinksEntity,
  SMSTemplatesEntity,
  PhonesEntity,
  BroadcastsEntity,
  BroadcastsContactsEntity,
  ConversationsEntity,
  ConversationMessagesEntity,
  PaymentDuesEntity,
  FavoriteContactsEntity,
  BlockedContactsEntity,
  KeywordsEntity,
};

export const Entities: any = Object.values(EntitiesRegister);
Object.entries(EntitiesRegister).forEach(([k, v]) => (JOIN_HELPER[k] = v));
