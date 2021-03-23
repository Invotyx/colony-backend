import { Seeder } from '../../decorators/common.decorator';
import { ISeed } from '../seeds.interface';
import { ProductsService } from '../../modules/products/services/products.service';
import { ProductsDto } from '../../modules/products/dto/product.dto';

@Seeder()
export class AddProductsSeed implements ISeed {
  constructor(private readonly productService: ProductsService) {}
  async up() {
    const products = [];

    const prod = new ProductsDto();
    prod.name = 'Colony Package';
    prod.description = 'Colony service package for phone number and sms bundle';
    prod.type = 'service';
    products.push(prod);
    

    const product2 = new ProductsDto();
    product2.name = 'Colony Add-on';
    product2.description = 'Colony service package for sms bundle';
    product2.type = 'service';
    products.push(product2); 

    products.forEach(async (prod) => {
      await this.productService.createProduct(prod);
    });
  }
  async down() {
    //
  }
}
