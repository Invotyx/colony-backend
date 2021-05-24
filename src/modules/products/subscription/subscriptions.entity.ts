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
import { TABLES } from '../../../consts/tables.const';
import { CountryEntity } from '../../../services/city-country/entities/country.entity';
import { PhonesEntity } from '../../phone/entities/phone.entity';
import { PlansEntity } from '../plan/plans.entity';
import { UserEntity } from '../../users/entities/user.entity';

enum collection_method {
  charge_automatically = 'charge_automatically',
  send_invoice = 'send_invoice',
}

@Entity({ name: TABLES.SUBSCRIPTIONS.name })
export class SubscriptionsEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 100, unique: false, nullable: false })
  public rId: string;

  @ManyToOne(() => UserEntity, (user) => user.subscription, {
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

  @ManyToOne(() => CountryEntity, (country) => country.subscription, {
    eager: false,
    nullable: true,
  })
  public country: CountryEntity;

  @Column({
    type: 'enum',
    enum: collection_method,
    default: collection_method.charge_automatically,
  })
  public collection_method: collection_method;

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
  public phone: PhonesEntity;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
