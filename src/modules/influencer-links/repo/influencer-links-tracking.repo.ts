import { EntityRepository, Repository } from 'typeorm';
import { InfluencerLinksTrackingEntity } from '../entities/influencer-links-tracking.entity';

@EntityRepository(InfluencerLinksTrackingEntity)
export class InfluencerLinksTrackingRepository extends Repository<InfluencerLinksTrackingEntity> {}
