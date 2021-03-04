import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ContactDto } from './contact.dto';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly service: ContactsService) { }
  
  @Post('')
  async addContact(@Query('phone') phone:string, @Query('user') user:number): Promise<any>{
    return await this.service.addContact(phone, user);
  }

  @Get('/get-url')
  async getUrlMapper(@Query('phone') phone: string) {
    try {
      const con = await this.service.repository.findOne({ where: { phoneNumber: phone } });
      if (con) {
        return { url: con.urlMapper };
      } else {
        return { message: "No such contact exists with this number." };
      }
    } catch (e) {
      throw e;
    }
  }

  @Get('filter/age')
  async filterContactsByAge(@Query('ageFrom') ageFrom: number,@Query('ageTo') ageTo: number,@Query('influencerId')  influencerId: number) {
    try {
      return await this.service.filterContactsByAge(ageFrom, ageTo, influencerId);
    } catch(e) {
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
