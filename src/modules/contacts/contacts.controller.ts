import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/auth.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { GetUser } from '../users/get-user.decorator';
import { ContactDto, ContactFilter } from './contact.dto';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@ApiTags('contacts')
export class ContactsController {
  constructor(private readonly service: ContactsService) {}
  /* 
  @Post('')
  async addContact(
    @Query('phone') phone: string,
    @Query('user') user: number,
  ): Promise<any> {
    return await this.service.addContact(phone, user);
  } */

  @Get('/get-url')
  async getUrlMapper(@Query('phone') phone: string) {
    try {
      return this.service.getUrlMapper(phone);
    } catch (e) {
      throw e;
    }
  }

  @Auth({})
  @Get('filter')
  async filterContactsByAge(
    @GetUser() user: UserEntity,
    @Query() data: ContactFilter,
  ) {
    try {
      return await this.service.filterContacts(user.id, data);
    } catch (e) {
      throw e;
    }
  }

  @Get(':urlId/check')
  async checkContact(@Param('urlId') urlId: string) {
    try {
      return this.service.checkContact(urlId);
    } catch (e) {
      throw e;
    }
  }

  @Put(':urlId')
  async updateContact(@Param('urlId') id: string, @Body() data: ContactDto) {
    try {
      return await this.service.updateContact(id, data);
    } catch (e) {
      throw e;
    }
  }
}
