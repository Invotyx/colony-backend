import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactDto, ContactFilter } from './contact.dto';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@ApiTags('contacts')
export class ContactsController {
  constructor(private readonly service: ContactsService) {}

  @Post('')
  async addContact(
    @Query('phone') phone: string,
    @Query('user') user: number,
  ): Promise<any> {
    return await this.service.addContact(phone, user);
  }

  @Get('/get-url')
  async getUrlMapper(@Query('phone') phone: string) {
    try {
      const con = await this.service.repository.findOne({
        where: { phoneNumber: phone },
      });
      if (con) {
        return { url: con.urlMapper };
      } else {
        return { message: 'No such contact exists with this number.' };
      }
    } catch (e) {
      throw e;
    }
  }

  @Get(':infId/filter')
  async filterContactsByAge(
    @Param('infId') infId: number,
    @Query() data: ContactFilter,
  ) {
    try {
      return await this.service.filterContacts(infId, data);
    } catch (e) {
      throw e;
    }
  }

  @Put(':id')
  async updateContact(@Param('id') id: string, @Body() data: ContactDto) {
    try {
      return await this.service.updateContact(id, data);
    } catch (e) {
      throw e;
    }
  }
}
