import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { ProductsEntity } from './products.entity';
import { UserEntity } from './user.entity';
enum interval{
  "month","year"
}
@Entity({ name: TABLES.PAYMENT_METHODS.name })
export class PaymentMethodsEntity {
  @Column({length:100, unique:true ,primary:true})
  public id: string;

  @Column({length:4,nullable:false})
  public last4_card: string;

  
  @ManyToOne(type=>UserEntity, user => user.paymentMethod,{eager:false,nullable:false})
  @JoinColumn({name:'userId'})
  public user: UserEntity;
  
  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
  
  @DeleteDateColumn()
  public deletedAt: Date;

}
