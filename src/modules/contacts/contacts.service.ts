import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContactsRepository } from './repo/contact.repo';
import { InfluencerContactRepository } from './repo/influencer-contact.repo';
import { ContactDto } from './contact.dto';
import { UsersService } from '../users/services/users.service';
import { ContactsEntity } from 'src/entities/contacts.entity';
import { UserEntity } from 'src/entities/user.entity';
import { TABLES } from 'src/consts/tables.const';

@Injectable()
export class ContactsService {
  constructor(
    public readonly repository: ContactsRepository,
    public readonly influencerContactRepo: InfluencerContactRepository,
    public readonly users: UsersService
  ) { }
  
  async addContact(phoneNumber: string, userId: number): Promise<any>{
    try {
      const user = await this.users.repository.findOne({ where: { id: userId, isActive: true, isApproved: true } });
      if (user) {
        
        let con = await this.repository.findOne({ where: { phoneNumber: phoneNumber } });
        
        if (!con) {
          let contact = new ContactsEntity();
          contact.phoneNumber = phoneNumber;
          contact.user = [user];
          
          contact = await this.repository.save(await this.repository.create(contact));
          contact.user = null;
          return contact;
        } else {
          const rel = await this.influencerContactRepo.findOne({ where: { contactId: con.id, userId: user.id } });
          if (!rel) {
            con.user.push(user);
            await this.repository.save(con);
          }
          con.user = null;
          return con;
        }
      } else {
        throw new HttpException('Influencer does not exist or has not activated his/her profile yet.', HttpStatus.BAD_REQUEST);
      }
    } catch (ex) {
      throw ex;
    }
  }
}
