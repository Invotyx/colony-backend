import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TABLES } from '../../../consts/tables.const';
import { CountryEntity } from './country.entity';

@Entity({ name: TABLES.CITY.name })
export class CityEntity {
  @Column({ length: 100, unique: true, primary: true })
  public id: string;

  @Column({ length: 300, nullable: false })
  public name: string;

  @ManyToOne(() => CountryEntity)
  @JoinColumn({ name: 'countryId' })
  public country: CountryEntity;
}
