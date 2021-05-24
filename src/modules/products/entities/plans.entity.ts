import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { SubscriptionsEntity } from './subscriptions.entity';
enum interval {
  month = 'month',
  year = 'year',
}

@Entity({ name: TABLES.PLANS.name })
export class PlansEntity {
  @Column({ length: 100, unique: true, primary: true })
  public id: string;

  @Column({ type: 'decimal' })
  public amount_decimal: number;

  @Column({ length: 10, default: 'USD', unique: false })
  public currency: string;

  @Column({ type: 'enum', enum: interval, nullable: true })
  public interval: interval;

  @Column({ default: false })
  public active: boolean;

  @Column({ default: 50.0, type: 'decimal' })
  public threshold: number;

  @Column({ length: 100, unique: false })
  public nickname: string;

  @Column({ type: 'decimal', nullable: true })
  public subscriberCost: number;

  @OneToMany(() => SubscriptionsEntity, (sub) => sub.plan, {
    eager: false,
    cascade: true,
  })
  public subscription!: SubscriptionsEntity;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
