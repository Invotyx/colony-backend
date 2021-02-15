import { TABLES } from 'src/consts/tables.const';
import { Entity, Unique, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: TABLES.EMAIL_VERIFICATIONS.name })
@Unique(['email'])
export class EmailVerifications {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  emailToken: string;

  @Column()
  email: string;

  @Column('timestamp')
  timestamp: Date;
}
