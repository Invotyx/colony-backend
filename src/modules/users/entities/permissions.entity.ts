import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { TABLES } from '../../../consts/tables.const';

@Entity({ name: TABLES.PERMISSIONS.name })
@Unique(['action', 'subject'])
export class PermissionEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true }) public id: number;
  @Column({ length: 60 }) public action: string;
  @Column({ length: 60 }) public subject: string;
  @Column({ type: 'json' }) public meta: any;
}
