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
@Entity({ name: TABLES.PAYMENT_METHODS.name })
export class PaymentMethodsEntity {
  @Column({ length: 100, unique: true, primary: true })
  public id: string;

  @Column({ length: 4, nullable: false })
  public last4_card: string;

  @ManyToOne(() => UserEntity, (user) => user.paymentMethod, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  public user: UserEntity;

  @Column({ length: 15, nullable: true })
  public type: string;

  @Column({ length: 15, nullable: false })
  public name: string;

  @Column({ default: false, nullable: false })
  public default: boolean;

  @ApiHideProperty()
  @Column({ length: 50, nullable: true })
  public fingerprint: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
