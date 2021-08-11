import { KeywordsEntity } from 'src/modules/keywords/keywords.entity';
import { BroadcastsEntity } from 'src/modules/sms/entities/broadcast.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { ContactsEntity } from '../../contacts/entities/contacts.entity';
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

  @ManyToOne(() => BroadcastsEntity, (b) => b.links, {
    eager: false,
    nullable: true,
  })
  public broadcast: BroadcastsEntity;

  @ManyToOne(() => KeywordsEntity, (con) => con.tracking, {
    eager: false,
    nullable: true,
  })
  public keyword: KeywordsEntity;

  @Column({ length: 100 })
  public smsSid: string;

  @Column({ default: false, nullable: false })
  public isOpened: boolean;

  @Column({ default: 0, nullable: true })
  public clicks: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}
