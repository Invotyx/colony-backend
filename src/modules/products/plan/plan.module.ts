import { forwardRef, Module } from '@nestjs/common';
import { CityCountryModule } from 'src/services/city-country/city-country.module';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { PlansService } from './plans.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [MainMysqlModule, forwardRef(() => CityCountryModule)],
  controllers: [ProductsController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlanModule {}
