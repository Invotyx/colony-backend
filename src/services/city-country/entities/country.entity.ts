import { Column, Entity, OneToMany } from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { SubscriptionsEntity } from '../../../modules/products/subscription/subscriptions.entity';
import { CityEntity } from './city.entity';

@Entity({ name: TABLES.COUNTRY.name })
export class CountryEntity {
  @Column({ length: 100, unique: true, primary: true })
  public id: string;

  @Column({ length: 300, nullable: false })
  public name: string;

  @Column({ length: 100, nullable: false })
  public code: string;

  @Column({ length: 100, nullable: false })
  public native: string;

  @Column({ default: false, comment: 'Use only with plans.' })
  public active: boolean;

  @Column({ type: 'decimal', nullable: true })
  public smsCost: number;

  @Column({ type: 'decimal', nullable: true })
  public phoneCost: number;

  @Column({ default: 1 })
  public sortOrder: number;

  @OneToMany(() => CityEntity, (c) => c.country, {
    eager: false,
    cascade: true,
  })
  public city!: CityEntity[];

  @OneToMany(() => SubscriptionsEntity, (sub) => sub.country, {
    eager: false,
    cascade: true,
  })
  public subscription!: SubscriptionsEntity[];
}
