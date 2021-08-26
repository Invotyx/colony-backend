import { EntityRepository, Repository } from 'typeorm';
import { PhonesEntity } from './entities/phone.entity';

@EntityRepository(PhonesEntity)
export class PhonesRepository extends Repository<PhonesEntity> {}
