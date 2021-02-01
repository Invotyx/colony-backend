import { Entity, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { PermissionEntity } from './permissions.entity';
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.USER_HAS_PERMISSIONS.name })
export class UserHasPermissionEntity {
  @PrimaryColumn({ type: 'int', unsigned: true }) public userId: number;
  @PrimaryColumn({ type: 'int', unsigned: true }) public permId: number;
  @ManyToOne((t) => PermissionEntity, (perm) => perm.userHasPermissionEntity)
  public perm!: PermissionEntity;
  @ManyToOne((t)=> UserEntity, (user)=>user.userHasPermissionEntity)
  public user!:UserEntity;
}
// action, subject, conditions  roleId
