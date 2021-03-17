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
import { TABLES } from '../consts/tables.const';
import { BroadcastsEntity } from './broadcast.entity';
import { ContactsEntity } from './contacts.entity';

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

  @Column()
  public isSent: boolean;

  @Column({ length: 20 })
  public status: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
