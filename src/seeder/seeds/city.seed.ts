import { Injectable } from '@nestjs/common';
import { CityCountryService } from '../../services/city-country/city-country.service';
import { Seeder } from '../../decorators/common.decorator';
import { ISeed } from '../seeds.interface';

@Injectable()
@Seeder()
export class CitySeed implements ISeed {
  constructor(private readonly service: CityCountryService) {}
  async up() {
    await this.service.city();
  }
  async down() {
    //
  }
}
