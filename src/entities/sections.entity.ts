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
import { ButtonsEntity } from './buttons.entity';
import { PagesEntity } from './pages.entity';

enum sectionType{
  regular = "regular",
  faqs = "faqs",
  packages = "packages",
  featuredIn = "featuredIn",
  banner = "banner"

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
  
  @Column({type:"text",unique: false, nullable:true})
  public content: string;

  @Column({default:true, nullable:false})
  public isActive: boolean;

  @Column({ type: "int",unsigned:true })
  public sortOrder: number;

  @Column({ type: "enum", enum: sectionType, default: sectionType.regular })
  public sectionType: sectionType;
  
  @ManyToOne(type => PagesEntity, pages => pages.id, { nullable: false, eager: false})
  @JoinColumn({name:'pageId'})
  public page: PagesEntity;

  @OneToMany(type => ImagesEntity, images => images.section, { eager: true })
  public images!: ImagesEntity[];

  
  @OneToMany(type => ButtonsEntity, buttons => buttons.section, { eager: true, cascade: true })
  public buttons!: ButtonsEntity[];

}
