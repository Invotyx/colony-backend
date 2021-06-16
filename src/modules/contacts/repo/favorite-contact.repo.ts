import { EntityRepository, Repository } from 'typeorm';
import { FavoriteContactsEntity } from '../entities/favorite-contacts.entity';

@EntityRepository(FavoriteContactsEntity)
export class FavoriteContactRepository extends Repository<FavoriteContactsEntity> {}
