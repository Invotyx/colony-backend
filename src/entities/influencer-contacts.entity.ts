import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { ContactsEntity } from './contacts.entity';
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.INFLUENCER_CONTACTS.name })
export class InfluencerContactsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @PrimaryColumn({ type: 'int', unsigned: true })
  public userId!: number;

  @PrimaryColumn({ type: 'int', unsigned: true })
  public contactId!: number;

  @ManyToOne(() => UserEntity, (user) => user.influencerContacts)
  public user!: UserEntity;

  @ManyToOne(() => ContactsEntity, (contact) => contact.influencerContacts)
  public contact!: ContactsEntity;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
