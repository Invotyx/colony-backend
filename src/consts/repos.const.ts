import { BlockedContactRepository } from '../modules/contacts/repo/blocked-contact.repo';
import { ContactsRepository } from '../modules/contacts/repo/contact.repo';
import { FavoriteContactRepository } from '../modules/contacts/repo/favorite-contact.repo';
import { InfluencerContactRepository } from '../modules/contacts/repo/influencer-contact.repo';
import { ButtonsRepository } from '../modules/content/repos/buttons.repo';
import { FaqsRepository } from '../modules/content/repos/faqs.repo';
import { ImagesRepository } from '../modules/content/repos/images.repo';
import { PagesRepository } from '../modules/content/repos/pages.repo';
import { PostsRepository } from '../modules/content/repos/posts.repo';
import { SectionsRepository } from '../modules/content/repos/sections.repo';
import { InfluencerLinksTrackingRepository } from '../modules/influencer-links/repo/influencer-links-tracking.repo';
import { InfluencerLinksRepository } from '../modules/influencer-links/repo/influencer-links.repo';
import { KeywordsRepository } from '../modules/keywords/keywords.repo';
import { LanguageRepository } from '../modules/language/languages.repo';
import { PaymentDuesRepository } from '../modules/payment-history/due-payment.repo';
import { PaymentHistoryRepository } from '../modules/payment-history/payment-history.repo';
import { PhonesRepository } from '../modules/phone/phone.repo';
import { PaymentMethodsRepository } from '../modules/products/payments/payment-methods.repo';
import { PlansRepository } from '../modules/products/plan/plans.repo';
import { SubscriptionsRepository } from '../modules/products/subscription/subscriptions.repo';
import { BroadcastContactsRepository } from '../modules/sms/repo/broadcast-contact.repo';
import { BroadcastsRepository } from '../modules/sms/repo/broadcast.repo';
import { ConversationsRepository } from '../modules/sms/repo/conversation-messages.repo';
import { ConversationMessagesRepository } from '../modules/sms/repo/conversation.repo';
import { PresetMessagesRepository } from '../modules/sms/repo/sms-presets.repo';
import { SMSTemplatesRepository } from '../modules/sms/repo/sms-templates.repo';
import { ForgotPasswordRepository } from '../modules/users/repos/forgotpassword.repo';
import { UserRepository } from '../modules/users/repos/user.repo';
import { EmailVerificationsRepository } from '../modules/users/repos/verifyemail.repo';
import { GlobalLinksRepository } from '../repos/gloabl-links.repo';
import { PermissionRepository } from '../repos/permission.repo';
import { RoleRepository } from '../repos/roles.repo';
import { CityRepository } from '../services/city-country/repos/city.repo';
import { CountryRepository } from '../services/city-country/repos/country.repo';
import { TimezonesRepository } from '../services/city-country/repos/timezone.repo';

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
  FaqsRepository,
  PlansRepository,
  PaymentMethodsRepository,
  SubscriptionsRepository,
  CityRepository,
  CountryRepository,
  TimezonesRepository,
  InfluencerContactRepository,
  ContactsRepository,
  InfluencerLinksRepository,
  InfluencerLinksTrackingRepository,
  SMSTemplatesRepository,
  PhonesRepository,
  PresetMessagesRepository,
  BroadcastContactsRepository,
  BroadcastsRepository,
  ConversationsRepository,
  ConversationMessagesRepository,
  PaymentHistoryRepository,
  PaymentDuesRepository,
  FavoriteContactRepository,
  BlockedContactRepository,
  KeywordsRepository,
  GlobalLinksRepository,
];
