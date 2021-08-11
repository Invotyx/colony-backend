import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { UserEntity } from '../../users/entities/user.entity';
import { InfluencerLinksTrackingEntity } from './influencer-links-tracking.entity';

@Entity({ name: TABLES.INFLUENCER_LINKS.name })
export class InfluencerLinksEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 255, nullable: false })
  public title: string;

  @Column({ type: 'text', nullable: false })
  public link: string;

  @Column({ length: 255, nullable: false })
  public urlMapper: string;

  @ManyToOne(() => UserEntity, (user) => user.links, { eager: false })
  public user: UserEntity;

  @OneToMany(
    () => InfluencerLinksTrackingEntity,
    (track) => track.influencerLink,
  )
  public tracking!: InfluencerLinksTrackingEntity[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  @BeforeInsert()
  async setTitle() {
    if (this.title == null) this.title = 'Link ' + this.urlMapper;
  }
}
