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
import { UserEntity } from '../../users/entities/user.entity';

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
  public cost: number;

  @Column({
    length: 20,
    nullable: false,
  })
  public costType: string;

  @Column({
    length: 100,
    nullable: false,
  })
  public chargeId: string;

  @Column({
    length: 255,
    nullable: true,
  })
  public description: string;

  @Column({ type: 'text', nullable: true })
  public meta: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
