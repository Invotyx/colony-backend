import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../consts/tables.const';
import { UserEntity } from '../users/entities/user.entity';
@Entity({ name: TABLES.KEYWORDS.name })
export class KeywordsEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 20, nullable: false })
  public keyword: string;

  @Column({ length: 500, nullable: false })
  public message: string;

  @Column({ default: 0, unsigned: true })
  public usageCount: number;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, (user) => user.keywords, { eager: false })
  public user: UserEntity;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
