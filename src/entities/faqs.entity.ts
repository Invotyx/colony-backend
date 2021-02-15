import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TABLES } from '../consts/tables.const';

@Entity({ name: TABLES.FAQS.name })
export class FaqsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 300, unique: false })
  public question: string;

  @Column({ type: 'text', nullable: true })
  public answer: string;
}
