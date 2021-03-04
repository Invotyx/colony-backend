import { nanoid } from 'src/shared/random-keygen';
import {  AfterInsert, BeforeInsert, Column, CreateDateColumn, Entity,  EntitySubscriberInterface,  EventSubscriber,  InsertEvent,  ManyToOne,  PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { ContactsEntity } from './contacts.entity';
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.INFLUENCER_CONTACTS.name })
export class InfluencerContactsEntity {
  @PrimaryColumn({ type: 'int', unsigned: true })
  public userId!: number;

  @PrimaryColumn({ type: 'int', unsigned: true })
  public contactId!: number;

  @ManyToOne(() => UserEntity, (user) => user.influencerContacts)
  public user!: UserEntity;

  @ManyToOne(() => ContactsEntity, (contact) => contact.influencerContacts)
  public contact!: ContactsEntity;
}
