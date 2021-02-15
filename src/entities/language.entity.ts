import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TABLES } from '../consts/tables.const';

@Entity({ name: TABLES.LANGUAGE.name })
export class LanguageEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 100, unique: true })
  public title: string;

  @Column({ unique: true, length: 10 })
  public code: string;
}
