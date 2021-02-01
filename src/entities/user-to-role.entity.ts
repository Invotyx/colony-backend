import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { RoleEntity } from './role.entity';
import { UserEntity } from './user.entity';

@Entity({ name: TABLES.USER_ROLE.name })
export class UserToRoleEntity {
  @PrimaryColumn({ type: 'int', unsigned: true })
  public userId!: number;

  @PrimaryColumn({ type: 'int', unsigned: true })
  public roleId!: number;

  @Column({ type: 'json', nullable:true }) public meta: any;

  @ManyToOne((t) => UserEntity, (user) => user.userToRole)
  public user!: UserEntity;

  @ManyToOne((t) => RoleEntity, (role) => role.userToRole)
  public role!: RoleEntity;
}
