import { Module } from '@nestjs/common';
import { ApiCallingService } from 'src/services/api-calling/api-calling.service';
import { CityCountryModule } from 'src/services/city-country/city-country.module';
import { MainMysqlModule } from 'src/shared/main-mysql.module';
import { ApiCallingModule } from '../../services/api-calling/api-calling.module';
import { UsersModule } from '../users/users.module';
import { PhoneController } from './phone.controller';
import { PhoneService } from './phone.service';

@Module({
  imports: [MainMysqlModule, ApiCallingModule, UsersModule, CityCountryModule],
  controllers: [PhoneController],
  providers: [PhoneService, ApiCallingService],
  exports:[PhoneService]
})
export class PhoneModule {}
