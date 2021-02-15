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
import { PlansEntity } from './plans.entity';
import { UserEntity } from './user.entity';

enum collection_method {
  charge_automatically = 'charge_automatically',
  send_invoice = 'send_invoice',
}

@Entity({ name: TABLES.SUBSCRIPTIONS.name })
export class SubscriptionsEntity {
  @Column({ length: 100, unique: true, primary: true })
  public id: string;

  @ManyToOne(() => UserEntity, (user) => user.paymentMethod, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  public user: UserEntity;

  @ManyToOne(() => PlansEntity, (plan) => plan.subscription, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'planId' })
  public plan: PlansEntity;

  @Column({
    type: 'enum',
    enum: collection_method,
    default: collection_method.charge_automatically,
  })
  public collection_method: collection_method;

  @Column({ nullable: false, default: false })
  public cancelled: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
