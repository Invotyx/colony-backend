import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TABLES } from '../consts/tables.const';

@Entity({ name: TABLES.TIMEZONES.name })
export class TimezonesEntity {
  @Column({ length: 100, unique: true, primary: true })
  public id: string;

  @Column({ length: 300, nullable:false })
  public timezone: string;

  @Column({ nullable: true })
  public utc: number;
}
