import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';

@Entity({ name: TABLES.FILE.name })
export class FileEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ type: 'int', unsigned: true })
  public tableId: number;

  @Column({ type: 'int', unsigned: true })
  public itemId: number;

  @Column()
  public name: string;

  @Column({ type: 'text', nullable: true })
  public desc: string;

  @Column()
  public size: number;

  @Column()
  public type: string;

  @Column()
  public path: string;

  @Column({ type: 'json', nullable: true })
  public meta: string;


  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
