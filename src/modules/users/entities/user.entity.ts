import { classToPlain, Exclude } from 'class-transformer';
import { ContactsEntity } from 'src/modules/contacts/entities/contacts.entity';
import { InfluencerContactsEntity } from 'src/modules/contacts/entities/influencer-contacts.entity';
import { InfluencerLinksEntity } from 'src/modules/influencer-links/entities/influencer-links.entity';
import { LanguageEntity } from 'src/modules/language/entities/language.entity';
import { PaymentHistoryEntity } from 'src/modules/payment-history/entities/purchaseHistory.entity';
import { PhonesEntity } from 'src/modules/phone/entities/phone.entity';
import { PaymentMethodsEntity } from 'src/modules/products/payments/payment-methods.entity';
import { SubscriptionsEntity } from 'src/modules/products/subscription/subscriptions.entity';
import { BroadcastsEntity } from 'src/modules/sms/entities/broadcast.entity';
import { ConversationsEntity } from 'src/modules/sms/entities/conversations.entity';
import { PresetMessagesEntity } from 'src/modules/sms/entities/preset-message.entity';
import { SMSTemplatesEntity } from 'src/modules/sms/entities/sms-templates.entity';
import { CityEntity } from 'src/services/city-country/entities/city.entity';
import { CountryEntity } from 'src/services/city-country/entities/country.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { RoleEntity } from './role.entity';
import { UserToRoleEntity } from './user-to-role.entity';

enum gender {
  male = 'male',
  female = 'female',
}

@Entity({ name: TABLES.USERS.name })
export class UserEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 60, nullable: false })
  public firstName: string;

  @Column({ length: 60, nullable: true })
  public lastName: string;

  @Column({ unique: true, length: 60, nullable: false })
  public username: string;

  @Column({ unique: true, length: 60, nullable: false })
  public email: string;

  @Column({ unique: true, length: 20, nullable: true })
  public mobile: string;

  @Exclude({ toPlainOnly: true })
  @Column({ length: 100 })
  public password: string;

  @Column({ type: 'enum', enum: gender, nullable: true })
  public gender: gender;

  @Column({ nullable: true })
  public dob: Date;

  @Column({ nullable: true, length: 300 })
  public statusMessage: string;

  @Column({ nullable: true })
  public image: string;

  @Column({ default: false })
  public isActive: boolean;

  @Column({ default: false })
  public isApproved: boolean;

  @Column({ default: 0.0, type: 'decimal' })
  public consumedSmsCost: number;

  @Column({ default: 0.0, type: 'decimal' })
  public consumedSubscriberCost: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToMany(() => UserToRoleEntity, (roles) => roles.user)
  public userToRole!: UserToRoleEntity[];

  @OneToMany(() => PhonesEntity, (phone) => phone.user)
  public numbers!: PhonesEntity[];

  @ManyToMany(() => RoleEntity, (roles) => roles.users, { eager: true })
  @JoinTable({
    name: TABLES.USER_ROLE.name,
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  @OneToMany(() => InfluencerContactsEntity, (cToI) => cToI.user)
  public influencerContacts!: InfluencerContactsEntity[];

  @Column({ length: 100, nullable: false, default: 'Asia/Karachi' })
  public timezone: string;

  @ManyToOne(() => LanguageEntity)
  @JoinColumn({ name: 'languageId' })
  public language: LanguageEntity;

  @Column({ length: 100, nullable: true, unique: true })
  customerId: string;

  @Column({ type: 'json', nullable: true })
  public meta: string;

  @Column({ length: 100, nullable: false, unique: true })
  public urlId: string;

  @OneToMany(() => PaymentMethodsEntity, (pm) => pm.user, {
    eager: true,
    cascade: true,
  })
  public paymentMethod!: PaymentMethodsEntity[];

  @OneToMany(() => SubscriptionsEntity, (sub) => sub.user, {
    eager: true,
    cascade: true,
  })
  public subscription!: SubscriptionsEntity[];

  @OneToMany(() => PaymentHistoryEntity, (ph) => ph.user, {
    eager: false,
    cascade: true,
  })
  public paymentHistory!: PaymentHistoryEntity[];

  @OneToMany(() => InfluencerLinksEntity, (il) => il.user, {
    eager: false,
    cascade: true,
  })
  public links!: InfluencerLinksEntity[];

  @OneToMany(() => SMSTemplatesEntity, (tmp) => tmp.user, {
    eager: false,
    cascade: true,
  })
  public smsTemplates!: SMSTemplatesEntity;

  @OneToMany(() => PresetMessagesEntity, (tmp) => tmp.user, {
    eager: false,
    cascade: true,
  })
  public presetMessages!: PresetMessagesEntity;

  @OneToMany(() => BroadcastsEntity, (tmp) => tmp.user, {
    eager: false,
    cascade: true,
  })
  public broadcasts!: BroadcastsEntity;

  @OneToOne(() => CityEntity, { nullable: true, eager: true })
  @JoinColumn()
  city: CityEntity;

  @OneToOne(() => CountryEntity, { nullable: true, eager: true })
  @JoinColumn()
  country: CountryEntity;

  @ManyToMany(() => ContactsEntity, (contact) => contact.user)
  public contact!: ContactsEntity[];

  @ManyToMany(() => ConversationsEntity, (convo) => convo.user)
  public conversations!: ConversationsEntity[];

  toJSON() {
    return classToPlain(this);
  }
}
