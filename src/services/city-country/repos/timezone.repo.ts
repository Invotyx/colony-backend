import { EntityRepository, Repository } from 'typeorm';
import { TimezonesEntity } from '../../../entities/timezones.entity';


@EntityRepository(TimezonesEntity)
export class TimezonesRepository extends Repository<TimezonesEntity> {}
