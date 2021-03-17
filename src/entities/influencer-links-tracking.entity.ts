import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { ContactsEntity } from './contacts.entity';
import { InfluencerLinksEntity } from './influencer-links.entity';

@Entity({ name: TABLES.INFLUENCER_LINKS_TRACKING.name })
export class InfluencerLinksTrackingEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @ManyToOne(() => InfluencerLinksEntity, (inf) => inf.tracking, {
    eager: false,
    nullable: false,
  })
  public influencerLink: InfluencerLinksEntity;

  @ManyToOne(() => ContactsEntity, (con) => con.links, {
    eager: false,
    nullable: false,
  })
  public contact: ContactsEntity;

  @Column({ default: false, nullable: false })
  public sent: boolean;

  @Column({ default: false, nullable: false })
  public isOpened: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
