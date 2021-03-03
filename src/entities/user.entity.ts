import { classToPlain, Exclude } from 'class-transformer';
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
import { TABLES } from '../consts/tables.const';
import { CityEntity } from './city.entity';
import { ContactsEntity } from './contacts.entity';
import { CountryEntity } from './country.entity';
import { InfluencerContactsEntity } from './influencer-contacts.entity';
import { LanguageEntity } from './language.entity';
import { PaymentMethodsEntity } from './payment-methods.entity';
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

  
  @Column({ default: 0, nullable: false })
  public purchasedPhoneCount: number;

  @Column({ default: 0, nullable: false })
  public purchasedSmsCount: number;
  
  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToMany(() => UserToRoleEntity, (roles) => roles.user)
  public userToRole!: UserToRoleEntity[];

  @ManyToMany(() => RoleEntity, (roles) => roles.users,{eager:true})
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

  @Column({ length:100, nullable: false, unique:true })
  public urlId: string;

  @OneToMany(() => PaymentMethodsEntity, (pm) => pm.user, {
    eager: true,
    cascade: false,
  })
  public paymentMethod!: PaymentMethodsEntity[];

  @OneToOne(() => CityEntity,{nullable:true,eager:true})
  @JoinColumn()
  city: CityEntity;

  
  @OneToOne(() => CountryEntity,{nullable:true,eager:true})
  @JoinColumn()
  country: CountryEntity;

  
  @ManyToMany(() => ContactsEntity, (contact) => contact.user)
  public contact!: ContactsEntity[];

  toJSON() {
    return classToPlain(this);
  }
}
