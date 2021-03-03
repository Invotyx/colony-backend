import { Controller, Get, Post, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly service: ContactsService) { }
  
  @Post('')
  async addContact(@Query('phone') phone:string, @Query('user') user:number): Promise<any>{
    return await this.service.addContact(phone, user);
  }
}
