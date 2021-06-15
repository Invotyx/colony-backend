import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { ContactsEntity } from '../../contacts/entities/contacts.entity';
import { BroadcastsEntity } from './broadcast.entity';

@Entity({ name: TABLES.BROADCASTS_CONTACTS.name })
export class BroadcastsContactsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @ApiHideProperty()
  @ManyToOne(() => BroadcastsEntity, (b) => b.contacts, { eager: false })
  public broadcast: BroadcastsEntity;

  @ApiHideProperty()
  @ManyToOne(() => ContactsEntity, (c) => c.broadcast, { eager: false })
  public contact: ContactsEntity;

  @Column({ length: 100 })
  public smsSid: string;

  @Column({ length: 20 })
  public status: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
