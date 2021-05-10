import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { UserEntity } from './user.entity';
@Entity({ name: TABLES.DUE_PAYMENTS.name })
export class PaymentDuesEntity {
  @Column({ length: 100, unique: true, primary: true })
  public id: string;

  @ManyToOne(() => UserEntity, (user) => user.paymentMethod, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  public user: UserEntity;

  @Column({
    type: 'decimal',
    default: 0.0,
  })
  public cost: number;

  @Column({
    length: 20,
    nullable: false,
  })
  public costType: string;
}