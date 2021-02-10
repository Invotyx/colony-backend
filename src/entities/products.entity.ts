import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { PlansEntity } from './plans.entity';

@Entity({ name: TABLES.PRODUCTS.name })
export class ProductsEntity {
  @Column({length:100, unique:true,primary:true})
  public id: string;

  @Column({length:200,unique: true})
  public name: string;

  @Column({length:10,unique: false, nullable:false})
  public type: string;
  
  @Column({length:300,unique: false})
  public description: string;
  
  @OneToMany(type => PlansEntity, plan => plan.product, { eager: true, cascade: true })
  public plans!: PlansEntity[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
  
  @DeleteDateColumn()
  public deletedAt: Date;

}
