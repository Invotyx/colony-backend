import { classToPlain, Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JOIN_HELPER } from '../consts/join-helper.const';
import { TABLES } from '../consts/tables.const';
import { LanguageEntity } from './language.entity';
import { RoleEntity } from './role.entity';
import { UserToRoleEntity } from './user-to-role.entity';

enum gender {
  male="male",
  female="female"
}


@Entity({ name: TABLES.USERS.name })
export class UserEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({length: 60, nullable:false})
  public firstName: string;

  @Column({length: 60, nullable:true})
  public lastName: string;

  @Column({ unique: true, length: 60, nullable:false })
  public username: string;

  @Column({ unique: true, length: 60, nullable:false })
  public email: string;

  @Column({ unique: true, length: 20, nullable:true })
  public mobile: string;

  @Exclude({ toPlainOnly: true })
  @Column({length: 100})
  public password: string;

  @Column({type:"enum", enum:gender, nullable:true})
  public gender: gender;

  @Column({ nullable: true })
  public age: number;

  @Column({ nullable: true,length:20 })
  public location: string;

  @Column({ nullable: true,length:300 })
  public statusMessage: string;

  

  @Column({ nullable: true })
  public image: string;


  @Column({ default: false })
  public isActive: boolean;

  
  @Column({ default: false })
  public isApproved: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToMany((t) => UserToRoleEntity, (roles) => roles.user)
  public userToRole!: UserToRoleEntity[];

  @ManyToMany((t) => RoleEntity, (roles) => roles.users)
  @JoinTable({
    name: TABLES.USER_ROLE.name,
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  @ManyToOne(type=>LanguageEntity)
  @JoinColumn({name:'languageId'})
  public language:LanguageEntity;



  @Column({ type: 'json',nullable:true })
  public meta: string;



  toJSON() {
    return classToPlain(this);
  }
}
