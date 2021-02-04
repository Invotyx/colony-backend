import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { ImagesEntity } from './images.entity';
import { SectionsEntity } from './sections.entity';

@Entity({ name: TABLES.PAGES.name })
export class PagesEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({length:200,unique: false})
  public title: string;
  
  @Column({length:200,unique: false})
  public subTitle: string;

  @Column({length:250,unique: true})
  public slug: string;

  @OneToMany(type => ImagesEntity, images => images.pages, { eager: false })
  public images: ImagesEntity[];
}
