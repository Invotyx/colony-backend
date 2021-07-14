import {
  Body,
  Controller,
  Get,
  Injectable,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TABLES } from 'src/consts/tables.const';
import {
  dataViewer,
  mapColumns,
  paginateQuery,
  PaginatorError,
  PaginatorErrorHandler,
} from 'src/shared/paginator';
import { Like } from 'typeorm';
import { CountryCost } from './country-cost.dto';
import { CityRepository } from './repos/city.repo';
import { CountryRepository } from './repos/country.repo';

@Injectable()
@Controller('country')
@ApiTags('country')
export class CityCountryController {
  constructor(
    public readonly cityRepo: CityRepository,
    public readonly countryRepo: CountryRepository,
  ) {}

  @Get()
  async getCountries() {
    try {
      const countries = await this.countryRepo.find({
        order: { name: 'ASC' },
      });
      return { countries: countries };
    } catch (e) {
      throw e;
    }
  }

  @Put('active')
  async activateCountries(@Body() body: CountryCost) {
    try {
      const c = await this.countryRepo.findOne({ id: body.id });
      c.active = body.active;
      c.phoneCost = body.phoneCost;
      c.smsCost = body.smsCost;
      await this.countryRepo.save(c);
      return {
        message: 'Country updated',
      };
    } catch (e) {
      throw e;
    }
  }

  @Get(':id/city')
  async getCities(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('city') city: string,
  ) {
    try {
      const country = await this.countryRepo.findOne({ where: { id: id } });
      const cities = await this.cityRepo.find({
        where: { country: country, name: Like('%' + city + '%') },
        order: { name: 'ASC' },
        take: limit,
        skip: limit * page - limit,
      });
      return cities;
    } catch (ex) {
      throw ex;
    }
  }

  async getAllCities(data: any) {
    try {
      const citiesTable = TABLES.CITY.name;
      const columnList: any = {
        id: { table: citiesTable, column: 'id' },
        name: { table: citiesTable, column: 'name' },
        countryId: { table: citiesTable, column: 'countryId' },
      };
      const sortList = {
        name: { table: citiesTable, column: 'name' },
      };
      const filterList = {
        id: { table: citiesTable, column: 'id' },
        name: { table: citiesTable, column: 'name' },
        countryId: { table: citiesTable, column: 'countryId' },
      };
      const { filters, configs } = dataViewer({
        data,
        filterList,
        sortList,
        columnList,
      });
      const query = await this.cityRepo
        .createQueryBuilder(TABLES.CITY.name)
        .select()
        .where(filters.sql);

      const paginatedData = await paginateQuery(query, configs, citiesTable);
      if (paginatedData.data.length) {
        paginatedData.data = paginatedData.data.map(
          mapColumns(paginatedData.data[0], columnList),
        );
      }
      return { data: paginatedData.data, meta: paginatedData.meta };
    } catch (error) {
      if (error instanceof PaginatorError) {
        throw PaginatorErrorHandler(error);
      }
      throw error;
    }
  }
}
