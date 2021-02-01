
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { TABLES } from '../../consts/tables.const';
import { CompressJSON } from '../../services/common/compression/compression.interceptor';
import {
  InValidDataError,
} from '../users/errors/users.error';
import {
  columnListToSelect,
  dataViewer,
  mapColumns,
  paginateQuery,
  PaginatorError,
  PaginatorErrorHandler,
} from '../../shared/paginator';
import { inValidDataRes } from '../../shared/res.fun';
import { LanguageService } from './language.service';
import { LanguageDto } from './language.dto';

// const idToPath = (x, data) => {
//   return `APP/${data.orgId}/${TABLES.USERS.id}/${data.id}/${path}`;
// };
@Controller('Language')
export class LanguageController {
  constructor(
    private readonly languageService: LanguageService
  ) {}
  @Get('')
  @CompressJSON()
  async getAllLanguages(@Body('jData') data) {
    try {
      const LanguageTable = TABLES.LANGUAGE.name;
      const columnList: any = {
        id: { table: LanguageTable, column: 'id' },
        name: { table: LanguageTable, column: 'title' },
        code: { table: LanguageTable, column: 'code' },
      };
      const sortList = {
        title: { table: LanguageTable, column: 'title' },
        code: { table: LanguageTable, column: 'code' },
      };
      const filterList = {
        title: { table: LanguageTable, column: 'title' },
        code: { table: LanguageTable, column: 'code' },
      };
      const { filters, configs } = dataViewer({
        data,
        filterList,
        sortList,
        columnList,
      });
      const query = await this.languageService.repository
        .createQueryBuilder(TABLES.LANGUAGE.name)
        .select(columnListToSelect(columnList))
        .where(filters.sql);

      const paginatedData = await paginateQuery(query, configs, LanguageTable);
      if (paginatedData.data.length) {
        paginatedData.data = paginatedData.data.map(
          mapColumns(paginatedData.data[0], columnList)
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

  //@Auth({ roles: [ROLES.ADMIN] })
  @Get(':id')
  async getLanguage(@Param('id') id: number) {
    try {
      const Language = await this.languageService.repository.findOne(id);
      return { data: Language  };
    } catch (error) {
      if (error instanceof PaginatorError) {
        throw PaginatorErrorHandler(error);
      }
      throw error;
    }
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createLanguage(@Body() Language: LanguageDto,@Res() res:Response) {
    try {
      const newLanguage = await this.languageService.createlanguage(Language);
      return { data : newLanguage };
    } catch (error) {
      if (error instanceof InValidDataError) {
        res.send(HttpStatus.BAD_REQUEST).send(inValidDataRes([error.message]));
      }
      res.send(HttpStatus.BAD_REQUEST).send(error.message);
    }
  }

  //@Auth({ roles: [ROLES.ADMIN] })
  @Post(':id/update')
  @UsePipes(ValidationPipe)
  async updateLanguage(@Body() Language: LanguageDto, @Param('id') id: string,@Res() res:Response) {
    try {
      const updateLanguage = await this.languageService.updatelanguage(id, Language);
      return { data: updateLanguage };
    } catch (error) {
      if (error instanceof InValidDataError) {
        res.send(HttpStatus.BAD_REQUEST).send(inValidDataRes([error.message]));
      }
      res.send(HttpStatus.BAD_REQUEST).send(error.message);
    }
  }
  
}
