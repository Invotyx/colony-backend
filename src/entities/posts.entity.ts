import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';

@Entity({ name: TABLES.POSTS.name })
export class PostsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({length:200,unique: false})
  public title: string;
  
  @Column({length:200,unique: false, nullable:true})
  public subTitle: string;

  @Column({length:250,unique: true})
  public slug: string;

  @Column({type:"text", nullable:true})
  public content: string;
}
