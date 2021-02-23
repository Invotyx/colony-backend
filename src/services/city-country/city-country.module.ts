import { Module } from '@nestjs/common';
import { MainMysqlModule } from '../../shared/main-mysql.module';
import { CityCountryService } from './city-country.service';
import { CityRepository } from './repos/city.repo';
import { CountryRepository } from './repos/country.repo';
import { TimezonesRepository } from './repos/timezone.repo';

@Module({
  
  imports: [MainMysqlModule],
  providers: [CityCountryService,CityRepository,CountryRepository,TimezonesRepository],
  exports: [CityCountryService]
})
export class CityCountryModule {}
