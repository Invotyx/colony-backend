import { EntityRepository, Repository } from 'typeorm';
import { CityEntity } from '../../../entities/city.entity';


@EntityRepository(CityEntity)
export class CityRepository extends Repository<CityEntity> {}
