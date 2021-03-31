import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { PhonesEntity } from './phone.entity';
import { PlansEntity } from './plans.entity';
import { UserEntity } from './user.entity';

enum collection_method {
  charge_automatically = 'charge_automatically',
  send_invoice = 'send_invoice',
}

@Entity({ name: TABLES.SUBSCRIPTIONS.name })
export class SubscriptionsEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 100, unique: false, nullable: false })
  public stripeId: string;

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

  @Column({ length: 100, nullable: false })
  public stripeSubscriptionItem: string;

  @Column({ nullable: false, length: 20 })
  public paymentType: string;

  @Column({ nullable: false, default: false })
  public cancelled: boolean;

  @Column({ nullable: true })
  public currentStartDate: Date;

  @Column({ nullable: true })
  public currentEndDate: Date;

  @Column({ default: 0, nullable: true, unsigned: true })
  public smsCount: number;

  @ManyToOne(() => PhonesEntity, (phone) => phone.subscription, {
    eager: false,
  })
  public number: PhonesEntity;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
