import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { PagesEntity } from './pages.entity';
import { SectionsEntity } from './sections.entity';

@Entity({ name: TABLES.IMAGES.name })
export class ImagesEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({ length: 300, unique: true })
  public url: string;

  @Column({ length: 100, nullable: true })
  public title: string;

  @Exclude()
  @ManyToOne(() => PagesEntity, (pages) => pages.images, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'pageId' })
  public page: PagesEntity;

  @Exclude()
  @ManyToOne(() => SectionsEntity, (section) => section.images, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'sectionId' })
  public section: SectionsEntity;

  @Column({ length: 10, unique: false, default: 'center', nullable: true })
  public imagePosition: string;
}
