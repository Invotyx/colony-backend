import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContactsRepository } from './repo/contact.repo';
import { InfluencerContactRepository } from './repo/influencer-contact.repo';
import { ContactDto } from './contact.dto';
import { UsersService } from '../users/services/users.service';
import { ContactsEntity } from 'src/entities/contacts.entity';
import { nanoid } from 'src/shared/random-keygen';

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
          const rel = await this.influencerContactRepo.findOne({ where: { contactId: contact.id, userId: user.id } });
          rel.urlMapper = nanoid();
          await this.influencerContactRepo.save(rel);
          contact.user = null;
          return contact;
        } else {
          const rel = await this.influencerContactRepo.findOne({ where: { contactId: con.id, userId: user.id } });
          if (!rel) {
            con.user.push(user);
            await this.repository.save(con);
            const newRel = await this.influencerContactRepo.findOne({ where: { contactId: con.id, userId: user.id } });
            newRel.urlMapper = nanoid();
            await this.influencerContactRepo.save(newRel);
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



  async updateContact(data: ContactDto) {
    let contactDetails: any;
    let flag = 0;
    if (!data.phoneNumber) {
      throw new HttpException('Phone number cannot be empty', HttpStatus.BAD_REQUEST);
    }
    if (data.name) {
      contactDetails.name = data.name;
      flag++;
    }
    if (data.gender) {
      contactDetails.gender = data.gender;
      flag++;
    }
    if (data.dob) {
      contactDetails.dob = data.dob;
      flag++
    }
    if (data.state) {
      contactDetails.state = data.state;
      flag++;
    }
    if (data.timezone) {
      contactDetails.timezone = data.timezone;
      flag++;
    }
    if (data.country) {
      contactDetails.country = data.country;
      flag++;
    }
    if (data.city) {
      contactDetails.city = data.city;
      flag++;
    }

    if (flag >= 7) {
      contactDetails.isComplete = true;
    } else {
      contactDetails.isComplete = false;
    }

    try {

      await this.repository.update({ phoneNumber: data.phoneNumber }, contactDetails);

      return { message: "Contact details updated.", data: contactDetails };
    } catch (e) {
      throw e;
    }

  }
}
