import { EntityRepository, Repository } from 'typeorm';
import { InfluencerContactsEntity } from '../entities/influencer-contacts.entity';

@EntityRepository(InfluencerContactsEntity)
export class InfluencerContactRepository extends Repository<InfluencerContactsEntity> {}
