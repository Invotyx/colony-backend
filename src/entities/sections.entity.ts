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

enum sectionType{
  regular = "regular",
  faqs = "faqs",
  packages = "packages",
  featuredIn = "featuredIn",
  clients = "clients"

}

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

  @Column({ type: "enum", enum: sectionType, default: sectionType.regular })
  public sectionType: sectionType;
  
  @ManyToOne(type=>PagesEntity, pages=>pages.id,{nullable:false})
  @JoinColumn({name:'pagesId'})
  public pages: PagesEntity;

  @OneToMany(type => ImagesEntity, images => images.sections, { eager: true })
  public images!: ImagesEntity[];

}
