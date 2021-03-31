import { Column, Entity, OneToMany } from 'typeorm';
import { TABLES } from '../consts/tables.const';
import { CityEntity } from './city.entity';
import { PlansEntity } from './plans.entity';

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

  @OneToMany(() => CityEntity, (c) => c.country, {
    eager: false,
    cascade: true,
  })
  public city!: CityEntity[];

  @OneToMany(() => PlansEntity, (plan) => plan.country, {
    eager: false,
    cascade: true,
  })
  public plan!: PlansEntity[];
}
