import { EntityRepository, Repository } from 'typeorm';
import { TokenEntity } from '../../entities/token.entity';

@EntityRepository(TokenEntity)
export class TokenRepository extends Repository<TokenEntity> {}
