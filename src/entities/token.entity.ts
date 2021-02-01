import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.TOKEN.name })
export class TokenEntity {
  @OneToOne(type=>UserEntity)
  @JoinColumn({name:'userId'})
  @PrimaryColumn({ type: 'int', unsigned: true }) public userId: number;
  @Column({ type: 'int' }) public token: number;
  @UpdateDateColumn() public updatedAt: Date;
}
