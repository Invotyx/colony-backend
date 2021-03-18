import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.PHONES.name })
export class PhonesEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: '20', nullable: false })
  public number: string;

  @Column({ length: 3, nullable: false })
  public country: string;

  @Column({ length: 100, nullable: true })
  public features: string;

  @Column({ length: 50, nullable: true })
  public type: string;

  @Column({ length: 10, nullable: false })
  public status: string;

  @ManyToOne(() => UserEntity, (user) => user.numbers, { eager: false })
  public user: UserEntity;

  @Column()
  public renewalDate: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
