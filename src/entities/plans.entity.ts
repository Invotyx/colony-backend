import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { ProductsEntity } from './products.entity';
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

  @Column({ type: 'enum', enum: interval })
  public interval: interval;

  @Column({ default: false })
  public active: boolean;

  @Column({ length: 100, unique: false })
  public nickname: string;

  @ManyToOne(() => ProductsEntity, (product) => product.plans, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'productId' })
  public product: ProductsEntity;

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
