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
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.PAYMENT_HISTORY.name })
export class PaymentHistoryEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @ManyToOne(() => UserEntity, (user) => user.paymentHistory, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  public user: UserEntity;

  @Column({
    type: 'decimal',
    default: 0.0,
  })
  public smsCost: number;

  @Column({
    type: 'decimal',
    default: 0.0,
  })
  public phoneCost: number;

  @Column({
    type: 'decimal',
    default: 0.0,
  })
  public subscriberCost: number;

  @Column({
    type: 'decimal',
    default: 0.0,
  })
  public packageCost: number;

  @Column({
    default: 0,
  })
  public thresholdSmsCount: number;

  @Column({
    length: 255,
    nullable: true,
  })
  public description: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
