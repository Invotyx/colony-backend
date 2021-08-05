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
import { UserEntity } from '../../users/entities/user.entity';

export enum presetTrigger {
  onBoard = 'onBoard',
  noResponse = 'noResponse',
  welcome = 'welcome',
}

@Entity({ name: TABLES.PRESET_MESSAGES.name })
export class PresetMessagesEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 200 })
  public name: string;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, (user) => user.presetMessages, { eager: false })
  public user: UserEntity;

  @Column({ type: 'text' })
  public body: string;

  @Column({ type: 'text', nullable: true })
  public fixedText: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  public enabled: boolean;

  @Column({ type: 'enum', enum: presetTrigger })
  public trigger: presetTrigger;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
