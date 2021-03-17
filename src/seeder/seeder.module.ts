import { Module } from '@nestjs/common';
import { ProductsModule } from 'src/modules/products/products.module';
import { PermissionsService } from 'src/modules/users/services/permissions.service';
import { UsersModule } from 'src/modules/users/users.module';
import { CityCountryModule } from 'src/services/city-country/city-country.module';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { SeederService } from './seeder.service';
import { SEEDS } from './seeds.const';

export const SeederProviders: any = [SeederService, ...Object.values(SEEDS)];

@Module({
  imports: [MainMysqlModule, UsersModule, ProductsModule, CityCountryModule],
  providers: [
    SeederService,
    PermissionsService,
    ...(Object.values(SEEDS) as any),
  ],
  exports: [SeederService, ...(Object.values(SEEDS) as any)],
})
export class SeederModule {}
