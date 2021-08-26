import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { UserEntity } from '../../users/entities/user.entity';
import { ContactsEntity } from './contacts.entity';

@Entity({ name: TABLES.FAVORITE_CONTACTS.name })
export class FavoriteContactsEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @PrimaryColumn({ type: 'int', unsigned: true })
  public userId!: number;

  @PrimaryColumn({ type: 'int', unsigned: true })
  public contactId!: number;

  @ManyToOne(() => UserEntity, (user) => user.influencerFavorites)
  public user!: UserEntity;

  @ManyToOne(() => ContactsEntity, (contact) => contact.influencerFavorites)
  public contact!: ContactsEntity;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
