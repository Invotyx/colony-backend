import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { SectionsEntity } from './sections.entity';

@Entity({ name: TABLES.BUTTONS.name })
export class ButtonsEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn({ unsigned: true })
  public id: number;

  @Column({length:60,unique: false})
  public text: string;
  
  @Column({length:300,unique: false, nullable:true})
  public link: string;

  @Column({length:60,unique: false})
  public type: string;

  
  @ManyToOne(type=>SectionsEntity, section => section.buttons,{eager:false,nullable:true})
  @JoinColumn({name:'sectionsId'})
  public sections: SectionsEntity;

}
