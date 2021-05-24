import { EntityRepository, Repository } from 'typeorm';
import { InfluencerLinksEntity } from '../entities/influencer-links.entity';

@EntityRepository(InfluencerLinksEntity)
export class InfluencerLinksRepository extends Repository<InfluencerLinksEntity> {}
