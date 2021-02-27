import { BadRequestException, Controller, Get, Injectable, Param } from '@nestjs/common';
import { CityCountryService } from './city-country.service';
import { CityRepository } from './repos/city.repo';
import { CountryRepository } from './repos/country.repo';

@Injectable()
@Controller('country')
export class CityCountryController {
  constructor(
    public readonly cityRepo: CityRepository,
    public readonly countryRepo: CountryRepository
  ) { }
  
  @Get()
  async getCountries() {
    try {
      const countries = await this.countryRepo.find();
      return { countries: countries };
    } catch (e) {
      throw e;
    }
  }

  @Get(':id/city')
  async getCities(@Param('id') id: number) {
    try {
      return {
        cities: await this.cityRepo.find(
          { where: { country: id } }
        )
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
