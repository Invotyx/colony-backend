import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JOIN_HELPER } from '../consts/join-helper.const';
import { TABLES } from '../consts/tables.const';
import { PermissionEntity } from './permissions.entity';
import { RoleHasPermissionEntity } from './role-has-permissions.entity';
import { UserToRoleEntity } from './user-to-role.entity';
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.ROLES.name })
export class RoleEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({length:60})
  public role: string;

  @OneToMany((t) => UserToRoleEntity, (role) => role.role)
  public userToRole!: UserToRoleEntity[];

  @ManyToMany((t) => UserEntity, (org) => org.roles)
  public users: UserEntity[];

  @OneToMany('RoleHasPermissionEntity', 'role')
  public roleHasPermissionEntity!: RoleHasPermissionEntity[];

  @ManyToMany('PermissionEntity', 'roles')
  perms: PermissionEntity[];
}
