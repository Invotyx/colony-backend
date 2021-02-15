import { EntityRepository, Repository } from 'typeorm';
import { ProductsEntity } from '../../../entities/products.entity';

@EntityRepository(ProductsEntity)
export class ProductsRepository extends Repository<ProductsEntity> {}
