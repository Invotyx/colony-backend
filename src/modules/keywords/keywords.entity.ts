import { ApiHideProperty } from '@nestjs/swagger';
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  getRepository,
  ManyToOne,
  MoreThanOrEqual,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { TABLES } from '../../consts/tables.const';
import { InfluencerLinksTrackingEntity } from '../influencer-links/entities/influencer-links-tracking.entity';
import { UserEntity } from '../users/entities/user.entity';
@Entity({ name: TABLES.KEYWORDS.name })
export class KeywordsEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 20, nullable: false })
  public keyword: string;

  @Column({ length: 500, nullable: false })
  public message: string;

  @Column({ default: 0, unsigned: true })
  public usageCount: number;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity, (user) => user.keywords, { eager: false })
  public user: UserEntity;

  @OneToMany(() => InfluencerLinksTrackingEntity, (track) => track.keyword, {
    eager: false,
  })
  public tracking!: InfluencerLinksTrackingEntity[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  public clicks: number;
  public opens: number;
  public reopened: number;

  @AfterLoad()
  async getLinkTrackingByKeyword() {
    try {
      const clicks = await getRepository(InfluencerLinksTrackingEntity).find({
        select: ['clicks'],
        where: { keyword: this },
      });
      if (clicks && clicks.length == 0) {
        this.clicks = 0;
      } else this.clicks = clicks.reduce((total, obj) => obj.clicks + total, 0);

      this.opens = await getRepository(InfluencerLinksTrackingEntity).count({
        where: { clicks: MoreThanOrEqual(0), keyword: this },
      });
      this.reopened = await getRepository(InfluencerLinksTrackingEntity).count({
        where: { clicks: MoreThanOrEqual(2), keyword: this },
      });
      //console.log(this)
    } catch (e) {
      throw e;
    }
  }
}
