import { BadRequestException, Controller, Get, Injectable, Param } from '@nestjs/common';
import { CityCountryService } from './city-country.service';

@Injectable()
@Controller('country')
export class CityCountryController {
  constructor(private readonly service: CityCountryService) { }
  
  @Get('')
  async getCountries() {
    try {
      return { countries: await this.service.countryRepo.find() };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get(':id/city')
  async getCities(@Param('id') id: number) {
    try {
      return {
        cities: await this.service.cityRepo.find(
          { where: { country: id } }
        )
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
