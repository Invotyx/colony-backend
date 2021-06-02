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
import { TABLES } from '../../../consts/tables.const';
import { UserEntity } from '../../users/entities/user.entity';
import { BroadcastsContactsEntity } from './broadcast-contacts.entity';

@Entity({ name: TABLES.BROADCASTS.name })
export class BroadcastsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 200 })
  public name: string;

  @Column({ nullable: true })
  public scheduled: Date;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, (user) => user.broadcasts, { eager: false })
  public user: UserEntity;

  @Column({ type: 'text' })
  public body: string;

  @Column({ type: 'text' })
  public filters: string;

  @Column({ length: 20 })
  public status: string;

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
