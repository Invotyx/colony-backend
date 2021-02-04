import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { ImagesEntity } from './images.entity';
import { PagesEntity } from './pages.entity';

@Entity({ name: TABLES.SECTIONS.name })
export class SectionsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({length:200,unique: false})
  public title: string;
  
  @Column({length:200,unique: false, nullable:true})
  public subTitle: string;

  @Column({length:250,unique: false, nullable:true})
  public primaryButton: string;

  @Column({length:250,unique: false, nullable:true})
  public secondaryButton: string;

  @Column({length:10,unique: false, nullable:true})
  public imagePosition: string;
  
  @Column({type:"text",unique: false, nullable:true})
  public content: string;

  @Column({ type: "int",unsigned:true })
  public sortOrder: number;
  
  @ManyToOne(type=>PagesEntity, pages=>pages.id,{eager:false,nullable:false})
  @JoinColumn({name:'pagesId'})
  public pages: PagesEntity;

  @OneToMany(type => ImagesEntity, images => images.sections, { eager: true })
  public images: ImagesEntity[];

}
