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
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.SMS_TEMPLATES.name })
export class SMSTemplatesEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ type: 'text' })
  public body: string;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, (user) => user.smsTemplates, { eager: false })
  public user: UserEntity;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
