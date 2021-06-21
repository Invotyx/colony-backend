import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Seeder } from '../../decorators/common.decorator';
import { CityCountryService } from '../../services/city-country/city-country.service';
import { ISeed } from '../seeds.interface';

@Injectable()
@Seeder()
export class CountrySeed implements ISeed {
  constructor(private readonly service: CityCountryService) {}
  async up() {
    const obj = JSON.parse(fs.readFileSync('geo_location.json', 'utf8'));

    for (const item of obj) {
      const id = item.Id;
      const name = item.Name;
      // insert country here;
      await this.service.countryRepo.save({
        id: id,
        code: id,
        name: name
      })
      for (const city of item.Cities) {
        const [lat, long] = (city.Location as string).split(',');
        const IataCode = city.IataCode;
        const CityName = city.Name;
        //insert city here;
        await this.service.cityRepo.save({
          
        })
      }
    }
  }
  async down() {
    //
  }
}
