import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/users.module';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { FACTORIES } from './factories.const';
import { FactoriesController } from './factories.controller';
import { FactoriesService } from './factories.service';

export const FactoriesProviders = [
  FactoriesService,
  ...Object.values(FACTORIES),
];

@Module({
  imports: [MainMysqlModule, UsersModule],
   controllers: [FactoriesController],
   providers: [...FactoriesProviders],
   exports: [...FactoriesProviders],
 })
 export class FactoryModule {}
