import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { BroadcastsContactsEntity } from './broadcast-contacts.entity';
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.BROADCASTS.name })
export class BroadcastsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 200 })
  public name: string;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, (user) => user.broadcasts, { eager: false })
  public user: UserEntity;

  @Column({ type: 'text' })
  public body: string;

  @OneToMany(() => BroadcastsContactsEntity, (bc) => bc.broadcast, {
    eager: false,
    cascade: true,
  })
  public contacts!: BroadcastsContactsEntity[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
