import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { CityEntity } from 'src/services/city-country/entities/city.entity';
import { CountryEntity } from './entities/country.entity';
import { CityRepository } from './repos/city.repo';
import { CountryRepository } from './repos/country.repo';
import { TimezonesRepository } from './repos/timezone.repo';

@Injectable()
export class CityCountryService {
  private baseUrl = 'https://parseapi.back4app.com/classes';
  private headers = {
    'X-Parse-Application-Id': 'mxsebv4KoWIGkRntXwyzg6c6DhKWQuit8Ry9sHja', // This is the fake app's application id
    'X-Parse-Master-Key': 'TpO0j3lG2PmEVMXlKYQACoOXKQrL3lwM0HwR9dbH', // This is the fake app's readonly master key
  };

  constructor(
    public readonly cityRepo: CityRepository,
    public readonly countryRepo: CountryRepository,
    public readonly tzRepo: TimezonesRepository,
  ) {}

  async country() {
    const response = await fetch(
      `${this.baseUrl}/Country?count=1&limit=400&order=name&keys=name,emoji,code,native`,
      {
        headers: this.headers,
      },
    );
    const data = await response.json(); // Here you have the data that you need
    try {
      //call state and city functions

      data.results.forEach(async (datum) => {
        const _country = new CountryEntity();
        _country.name = datum.name;
        _country.native = datum.native;
        _country.code = datum.code;
        _country.id = datum.objectId;
        try {
          await this.countryRepo.save(_country);
        } catch (e) {
          //console.log(e);
          throw e;
        }
      });
    } catch (e) {
      //console.log(e);
      throw e;
    }
  }

  async city() {
    const countries = await this.countryRepo.find();
    countries.forEach(async (country) => {
      const where = encodeURIComponent(
        JSON.stringify({
          country: {
            __type: 'Pointer',
            className: 'Country',
            objectId: country.id,
          },
        }),
      );
      const response = await fetch(
        `${this.baseUrl}/City?count=1&limit=5000&order=name&keys=name,country,cityId&where=${where}`,
        {
          headers: this.headers,
        },
      );
      const data = await response.json(); // Here you have the data that you need

      data.results.forEach(async (datum) => {
        const _city = new CityEntity();
        _city.name = datum.name;
        _city.id = datum.objectId;
        _city.country = country;
        await this.cityRepo.save(_city);
      });
    });
  }
}
