import {
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { UserEntity } from '../../users/entities/user.entity';
@Entity({ name: TABLES.DUE_PAYMENTS.name })
export class PaymentDuesEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

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

  @UpdateDateColumn()
  public updatedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;
}
