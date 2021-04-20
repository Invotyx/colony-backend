import {
  Column,
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
import { PhonesEntity } from './phone.entity';
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.CONVERSATIONS.name })
export class ConversationsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @ManyToOne(() => PhonesEntity, (phone) => phone.conversations, {
    eager: false,
  })
  public phone: PhonesEntity;

  @ManyToOne(() => ContactsEntity, (contact) => contact.conversations, {
    eager: false,
  })
  public contact: ContactsEntity;

  @ManyToOne(() => UserEntity, (user) => user.conversations, {
    eager: false,
  })
  public user: UserEntity;

  @Column({ default: false })
  public isActive: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
