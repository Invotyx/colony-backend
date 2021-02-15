import { Injectable } from '@nestjs/common';
import { ProductsRepository } from '../repos/products.repo';
import { ProductsDto } from '../dto/product.dto';
import { ProductsEntity } from '../../../entities/products.entity';
import { TABLES } from 'src/consts/tables.const';
import { getConnection } from 'typeorm';
import Stripe from 'stripe';
import { env } from 'process';

@Injectable()
export class ProductsService {
  private stripe: Stripe;
  constructor(public readonly repository: ProductsRepository) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  async getProducts(): Promise<any> {
    try {
      return await this.repository.find();
    } catch (e) {
      throw e;
    }
  }

  async getProduct(id: string): Promise<any> {
    try {
      return await this.repository.findOne({ where: { id: id } });
    } catch (e) {
      throw e;
    }
  }

  async createProduct(product: ProductsDto): Promise<any> {
    try {
      const _prod = await this.checkIfProductExistsInStripe(product.name);
      if (_prod) {
        try {
          const check = await getConnection()
            .createQueryBuilder()
            .select('prod')
            .from(ProductsEntity, 'prod')
            .where('prod.id = :id', { id: _prod.id })
            .getOne();

          if (check && check.id) {
            console.log('product already exists on stripe and database.');
          } else {
            await getConnection()
              .createQueryBuilder()
              .insert()
              .into(TABLES.PRODUCTS.name)
              .values({
                id: _prod.id,
                name: _prod.name,
                description: _prod.description,
                type: _prod.type,
              })
              .execute();
            console.log(
              'product already exists on stripe and saved to database.',
            );
          }
        } catch (e) {
          throw e;
        }
      } else {
        try {
          const createdProduct = await this.stripe.products.create({
            name: product.name,
            description: product.description,
            type: 'service',
          });

          await getConnection()
            .createQueryBuilder()
            .insert()
            .into(TABLES.PRODUCTS.name)
            .values({
              id: createdProduct.id,
              name: createdProduct.name,
              description: createdProduct.description,
              type: createdProduct.type,
            })
            .execute();

          console.log('product created on stripe and saved to database.');
        } catch (e) {
          throw e;
        }
      }
    } catch (e) {
      throw e;
    }
  }

  async checkIfProductExistsInStripe(name: string): Promise<any> {
    try {
      let last_prod_id: any = null;
      let products: any = await this.stripe.products.list({ limit: 100 });

      do {
        if (last_prod_id) {
          products = await this.stripe.products.list({
            limit: 100,
            starting_after: last_prod_id,
          });
        }
        for (const prod of products.data) {
          if (prod.name === name) {
            return prod;
          }
          last_prod_id = prod;
        }
      } while (products.has_more);
      return null;
    } catch (e) {
      throw e;
    }
  }
}
