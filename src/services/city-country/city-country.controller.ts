import { BadRequestException, Controller, Get, Injectable, Param, Query } from '@nestjs/common';
import { TABLES } from 'src/consts/tables.const';
import { dataViewer, mapColumns, paginateQuery, PaginatorError, PaginatorErrorHandler } from 'src/shared/paginator';
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
  async getCities(@Param('id') id: number,@Query('page') page: number, @Query('limit') limit: number) {
    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 20;
    }
    const data: any = {
      filter: {
        condition: "AND",
        rules: [
          {
            field: 'countryId',
            operator: 'equal',
            value: id
          }
        ],
        valid: true
      },
      config: {
        sort: 'name',
        order: 'ASC',
        page: page,
        limit: limit
      }
    };

    return this.getAllCities(data);
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
        id: { table: citiesTable, column: 'id' },
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
