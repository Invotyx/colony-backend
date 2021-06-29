import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { CityEntity } from '../../../services/city-country/entities/city.entity';
import { CountryEntity } from '../../../services/city-country/entities/country.entity';
import { InfluencerLinksTrackingEntity } from '../../influencer-links/entities/influencer-links-tracking.entity';
import { BroadcastsContactsEntity } from '../../sms/entities/broadcast-contacts.entity';
import { ConversationsEntity } from '../../sms/entities/conversations.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { FavoriteContactsEntity } from './favorite-contacts.entity';
import { InfluencerContactsEntity } from './influencer-contacts.entity';

enum gender {
  male = 'male',
  female = 'female',
  non_binary = 'non_binary',
}

@Entity({ name: TABLES.CONTACTS.name })
export class ContactsEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 100, nullable: true })
  public name: string;

  @Column({ length: 20, nullable: false })
  public phoneNumber: string;

  @Column({ default: false, nullable: false })
  public isComplete: boolean;

  @Column({ type: 'enum', enum: gender, nullable: true })
  public gender: gender;

  @Column({ nullable: true })
  public dob: Date;


  @Column({ nullable: true })
  public profileImage: string;

  @ManyToOne(() => CountryEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'countryId' })
  public country: CountryEntity;

  @ManyToOne(() => CityEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'cityId' })
  public city: CityEntity;

  @Column({ length: 100, nullable: true })
  public state: string;

  @Column({ length: 2, nullable: true })
  public cCode: string;

  @Column({ length: 100, nullable: true })
  public timezone: string;

  @Column({ length: 100, nullable: true, unique: true })
  public urlMapper: string;

  @OneToMany(() => InfluencerContactsEntity, (cToI) => cToI.contact)
  public influencerContacts!: InfluencerContactsEntity[];

  @OneToMany(() => InfluencerLinksTrackingEntity, (track) => track.contact)
  public links!: InfluencerLinksTrackingEntity[];

  @OneToMany(() => FavoriteContactsEntity, (cToI) => cToI.contact)
  public influencerFavorites!: FavoriteContactsEntity[];

  @OneToMany(() => BroadcastsContactsEntity, (b) => b.contact)
  public broadcast!: [];

  @OneToMany(() => ConversationsEntity, (con) => con.contact)
  public conversations!: ConversationsEntity[];

  @ManyToMany(() => UserEntity, (user) => user.contact, { eager: false })
  @JoinTable({
    name: TABLES.INFLUENCER_CONTACTS.name,
    joinColumn: { name: 'contactId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  user: UserEntity[];

  @Column({ length: 200, nullable: true })
  public facebook: string;

  @Column({ length: 200, nullable: true })
  public instagram: string;

  @Column({ length: 200, nullable: true })
  public linkedin: string;

  @Column({ length: 200, nullable: true })
  public twitter: string;

  @ManyToMany(() => UserEntity, (u) => u.favorites)
  public influencers!: UserEntity[];

  @Column({ nullable: true })
  public lat: number;

  @Column({ nullable: true })
  public long: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
