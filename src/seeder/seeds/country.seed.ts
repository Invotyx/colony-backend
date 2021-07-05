import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import path from 'path';
import { CityEntity } from 'src/services/city-country/entities/city.entity';
import { Seeder } from '../../decorators/common.decorator';
import { CityCountryService } from '../../services/city-country/city-country.service';
import { ISeed } from '../seeds.interface';

@Injectable()
@Seeder()
export class CountrySeed implements ISeed {
  constructor(private readonly service: CityCountryService) {}
  async up() {
    const obj = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, 'geo_location.json'), 'utf8'),
    );

    console.log(obj);
    obj.Continents.forEach(async (c) => {
      c.Countries.forEach(async (item) => {
        const id = item.Id;
        const name = item.Name;
        // insert country here;
        const country = await this.service.countryRepo.save({
          id: id,
          code: id,
          name: name,
          native: name,
        });
        for (const city of item.Cities) {
          const [lat, long] = (city.Location as string).split(',');
          const IataCode = city.IataCode;
          const CityName = city.Name;
          //insert city here;
          const _city = new CityEntity();
          _city.country = country;
          _city.lat = +lat;
          _city.long = +long;
          _city.name = CityName;
          _city.id = IataCode;
          await this.service.cityRepo.save(_city);
        }
      });
    });
  }
  async down() {
    //
  }
}
