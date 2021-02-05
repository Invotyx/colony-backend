import { Module } from '@nestjs/common';
import { PermissionsService } from 'src/modules/users/services/permissions.service';
import { UsersModule } from 'src/modules/users/users.module';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { SeederService } from './seeder.service';
import { SEEDS } from './seeds.const';

export const SeederProviders = [SeederService, ...Object.values(SEEDS)];


@Module({
  imports: [MainMysqlModule,UsersModule],
  providers: [SeederService,PermissionsService, ...Object.values(SEEDS)],
  exports: [SeederService, ...Object.values(SEEDS)],
})
export class SeederModule {}

