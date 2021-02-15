import { TABLES } from 'src/consts/tables.const';
import {
  Entity,
  BaseEntity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity({ name: TABLES.FORGOT_PASSWORD.name })
@Unique(['email'])
export class ForgotPassword extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  newPasswordToken: string;

  @Column()
  email: string;

  @Column('timestamp')
  timestamp: Date;
}
