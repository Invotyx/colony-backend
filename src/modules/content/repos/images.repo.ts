import { EntityRepository, Repository } from 'typeorm';
import { ImagesEntity } from '../../../entities/images.entity';

@EntityRepository(ImagesEntity)
export class ImagesRepository extends Repository<ImagesEntity> {}
